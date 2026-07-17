import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Invalid time format'),
  endTime: z.string().regex(timeRegex, 'Invalid time format'),
}).refine(data => data.startTime < data.endTime, {
  message: 'End time must be after start time'
});
const saveAvailabilitySchema = z.object({
  slots: z.array(slotSchema).min(1, 'At least one slot required')
});

const matchSchema = z.object({
  symptoms: z.string().min(3, 'Symptoms must be at least 3 characters')
});

export const doctorController = {
  matchSpecialisation: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = matchSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, error: 'Validation failed', errors: result.error.flatten().fieldErrors });
        return;
      }

      const { symptoms } = result.data;
      
      const systemPrompt = `A patient describes their symptoms as: ${symptoms}. Recommend the single most appropriate medical specialisation from this list: General Physician, Cardiologist, Dermatologist, Orthopaedist, Neurologist, Gynaecologist, Paediatrician, Psychiatrist, ENT Specialist, Ophthalmologist. Respond ONLY with a JSON object: { "specialisation": "string", "reason": "string" }`;

      try {
        const aiResponse = await fetch(process.env.AI_API_URL as string, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AI_API_KEY}`
          },
          body: JSON.stringify({
            model: "meta/llama-3.1-70b-instruct",
            temperature: 0.2,
            top_p: 0.7,
            max_tokens: 200,
            stream: false,
            prompt: systemPrompt,
            messages: [{ role: 'user', content: systemPrompt }],
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        const dataText = await aiResponse.text();
        
        let parsedData = null;
        try {
          // Attempt to extract JSON if wrapped in markdown or other text
          let cleanText = dataText;
          const jsonMatch = dataText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) {
            cleanText = jsonMatch[1];
          } else {
             const jsonMatch2 = dataText.match(/(\{[\s\S]*\})/);
             if (jsonMatch2) {
                 cleanText = jsonMatch2[1];
             }
          }
          parsedData = JSON.parse(cleanText);
          
          // If the parsed object isn't the direct response, check for wrapper structures
          if (!parsedData.specialisation) {
             if (parsedData.choices?.[0]?.message?.content) {
                 parsedData = JSON.parse(parsedData.choices[0].message.content);
             } else if (parsedData.candidates?.[0]?.content?.parts?.[0]?.text) {
                 parsedData = JSON.parse(parsedData.candidates[0].content.parts[0].text);
             } else if (parsedData.response) {
                 parsedData = JSON.parse(parsedData.response);
             } else if (parsedData.reply) {
                 parsedData = JSON.parse(parsedData.reply);
             }
          }
        } catch (e) {
          // Parsing failed, handled by the fallback below
        }

        if (parsedData && parsedData.specialisation && parsedData.reason) {
          res.status(200).json({ success: true, data: { specialisation: parsedData.specialisation, reason: parsedData.reason } });
        } else {
          // Fallback
          res.status(200).json({ 
            success: true, 
            data: { 
              specialisation: 'General Physician', 
              reason: 'Could not determine specialisation — showing all doctors' 
            } 
          });
        }
      } catch (error) {
        // Fallback on network error
        res.status(200).json({ 
          success: true, 
          data: { 
            specialisation: 'General Physician', 
            reason: 'Could not determine specialisation — showing all doctors' 
          } 
        });
      }
    } catch (error: any) {
      console.error('Error in matchSpecialisation:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  listDoctors: async (req: Request, res: Response): Promise<void> => {
    try {
      const { specialisation } = req.query;
      const whereClause: any = {};
      
      if (specialisation && typeof specialisation === 'string') {
        whereClause.specialisation = specialisation;
      }
      
      const doctorProfiles = await prisma.doctorProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              doctor_ratings: true,
            }
          },
          availability_slots: true
        }
      });

      const now = new Date();

      const doctorsWithStats = doctorProfiles.map(doctor => {
        const ratings = doctor.user.doctor_ratings || [];
        const total_ratings = ratings.length;
        
        let avg_overall = null, avg_clarity = null, avg_time = null, avg_prescription = null;
        
        if (total_ratings > 0) {
          avg_overall = ratings.reduce((sum, r) => sum + r.overall, 0) / total_ratings;
          avg_clarity = ratings.reduce((sum, r) => sum + r.clarity, 0) / total_ratings;
          avg_time = ratings.reduce((sum, r) => sum + r.time_given, 0) / total_ratings;
          avg_prescription = ratings.reduce((sum, r) => sum + r.prescription_quality, 0) / total_ratings;
        }

        let next_available_slot: string | null = null;
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
          const dayOfWeek = checkDate.getDay();
          
          const daySlots = doctor.availability_slots
            .filter(slot => slot.day_of_week === dayOfWeek)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
            
          let validSlot = null;
          if (i === 0) {
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
            validSlot = daySlots.find(s => s.start_time > currentTimeStr);
          } else {
            validSlot = daySlots[0];
          }
          
          if (validSlot) {
            const [hours, minutes] = validSlot.start_time.split(':').map(Number);
            const slotDate = new Date(checkDate);
            slotDate.setHours(hours, minutes, 0, 0);
            next_available_slot = slotDate.toISOString();
            break;
          }
        }

        return {
          id: doctor.user.id,
          doctorProfileId: doctor.id,
          name: doctor.user.name,
          specialisation: doctor.specialisation,
          experience_years: doctor.experience_years,
          consultation_fee: doctor.consultation_fee,
          bio: doctor.bio,
          license_number: doctor.license_number,
          avg_overall,
          avg_clarity,
          avg_time,
          avg_prescription,
          total_ratings,
          next_available_slot,
          availability_slots: doctor.availability_slots.map(slot => ({
            id: slot.id,
            dayOfWeek: slot.day_of_week,
            startTime: slot.start_time,
            endTime: slot.end_time
          }))
        };
      });

      // Sort by avg_overall descending, nulls last
      doctorsWithStats.sort((a, b) => {
        if (a.avg_overall === null && b.avg_overall !== null) return 1;
        if (a.avg_overall !== null && b.avg_overall === null) return -1;
        if (a.avg_overall !== null && b.avg_overall !== null) {
          return b.avg_overall - a.avg_overall;
        }
        return 0;
      });

      res.status(200).json({
        success: true,
        data: doctorsWithStats
      });
    } catch (error: any) {
      console.error('Error listing doctors:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getDoctorById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const doctor = await prisma.doctorProfile.findFirst({
        where: { user_id: req.params.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              doctor_ratings: true,
            }
          },
          availability_slots: true
        }
      });

      if (!doctor) {
        res.status(404).json({ success: false, error: 'Doctor not found' });
        return;
      }

      const now = new Date();
      const ratings = doctor.user.doctor_ratings || [];
      const total_ratings = ratings.length;
      
      let avg_overall = null, avg_clarity = null, avg_time = null, avg_prescription = null;
      
      if (total_ratings > 0) {
        avg_overall = ratings.reduce((sum, r) => sum + r.overall, 0) / total_ratings;
        avg_clarity = ratings.reduce((sum, r) => sum + r.clarity, 0) / total_ratings;
        avg_time = ratings.reduce((sum, r) => sum + r.time_given, 0) / total_ratings;
        avg_prescription = ratings.reduce((sum, r) => sum + r.prescription_quality, 0) / total_ratings;
      }

      let next_available_slot: string | null = null;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = checkDate.getDay();
        
        const daySlots = doctor.availability_slots
          .filter(slot => slot.day_of_week === dayOfWeek)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));
          
        let validSlot = null;
        if (i === 0) {
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
          validSlot = daySlots.find(s => s.start_time > currentTimeStr);
        } else {
          validSlot = daySlots[0];
        }
        
        if (validSlot) {
          const [hours, minutes] = validSlot.start_time.split(':').map(Number);
          const slotDate = new Date(checkDate);
          slotDate.setHours(hours, minutes, 0, 0);
          next_available_slot = slotDate.toISOString();
          break;
        }
      }

      const doctorWithStats = {
        id: doctor.user.id,
        doctorProfileId: doctor.id,
        name: doctor.user.name,
        specialisation: doctor.specialisation,
        experience_years: doctor.experience_years,
        consultation_fee: doctor.consultation_fee,
        bio: doctor.bio,
        license_number: doctor.license_number,
        avg_overall,
        avg_clarity,
        avg_time,
        avg_prescription,
        total_ratings,
        next_available_slot,
        availability_slots: doctor.availability_slots.map(slot => ({
          id: slot.id,
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time
        }))
      };

      res.status(200).json({
        success: true,
        data: doctorWithStats
      });
    } catch (error: any) {
      console.error('Error getting doctor by id:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  saveAvailability: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = saveAvailabilitySchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: result.error.flatten().fieldErrors,
        });
        return;
      }

      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, error: 'Unauthorised' });
        return;
      }

      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { user_id: req.user.id }
      });

      if (!doctorProfile) {
        res.status(404).json({ success: false, error: 'Doctor profile not found' });
        return;
      }

      const slots = result.data.slots;

      // Delete existing slots
      await prisma.availabilitySlot.deleteMany({
        where: { doctor_id: doctorProfile.id }
      });

      // Insert new slots
      await prisma.availabilitySlot.createMany({
        data: slots.map(slot => ({
          doctor_id: doctorProfile.id,
          day_of_week: slot.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
        }))
      });

      // Update onboarding status
      await prisma.doctorProfile.update({
        where: { id: doctorProfile.id },
        data: { onboardingDone: true }
      });

      const responseSlots = slots.map(slot => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

      res.status(200).json({
        success: true,
        data: { slots: responseSlots, onboardingDone: true }
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getAvailability: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, error: 'Unauthorised' });
        return;
      }

      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { user_id: req.user.id }
      });

      if (!doctorProfile) {
        res.status(404).json({ success: false, error: 'Doctor profile not found' });
        return;
      }

      const slots = await prisma.availabilitySlot.findMany({
        where: { doctor_id: doctorProfile.id }
      });

      const responseSlots = slots.map(slot => ({
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time
      }));

      res.status(200).json({
        success: true,
        data: { 
          slots: responseSlots, 
          onboardingDone: doctorProfile.onboardingDone 
        }
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};
