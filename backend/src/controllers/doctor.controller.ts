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

export const doctorController = {
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
