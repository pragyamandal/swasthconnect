import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';

const triageSchema = z.object({
  appointmentId: z.string(),
  chiefComplaint: z.string(),
  duration: z.string(),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  existingConditions: z.array(z.string()),
  currentMedications: z.string().optional(),
  additionalNotes: z.string().optional(),
  inputLanguage: z.string()
});

export const triageController = {
  submitTriage: async (req: Request, res: Response) => {
    try {
      const parsedBody = triageSchema.parse(req.body);
      const {
        appointmentId,
        chiefComplaint,
        duration,
        severity,
        existingConditions,
        currentMedications,
        additionalNotes,
        inputLanguage
      } = parsedBody;

      // 1. Verify the appointment exists and belongs to req.user.id
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }

      if (appointment.patient_id !== req.user?.id) {
        return res.status(403).json({ success: false, error: 'Unauthorised to triage this appointment' });
      }

      // 2. Verify appointment status is PENDING
      if (appointment.status !== 'PENDING') {
        return res.status(400).json({ success: false, error: 'Appointment is not in PENDING state' });
      }

      // 3. Store the original patient text as a combined string
      const combinedText = `Chief complaint: ${chiefComplaint}
Duration: ${duration}
Severity: ${severity}
Existing conditions: ${existingConditions.join(', ')}
Current medications: ${currentMedications || 'None'}
Additional notes: ${additionalNotes || 'None'}`;

      // 4. Call the AI API
      const aiApiUrl = process.env.AI_API_URL;
      const aiApiKey = process.env.AI_API_KEY;

      if (!aiApiUrl || !aiApiKey) {
        return res.status(500).json({ success: false, error: 'AI API configuration is missing' });
      }

      const systemPrompt = `You are a medical pre-consultation assistant.
The patient input may be in any Indian language.
Translate if needed.
Generate a structured clinical summary in English.

Patient input:
- Chief complaint: ${chiefComplaint}
- Duration: ${duration}
- Severity: ${severity}
- Existing conditions: ${existingConditions.join(', ')}
- Current medications: ${currentMedications || 'None'}
- Additional notes: ${additionalNotes || 'None'}
- Input language: ${inputLanguage}

Respond ONLY with this JSON:
{
  "chiefComplaint": "string",
  "duration": "string",
  "severity": "string",
  "urgency": "ROUTINE" | "PRIORITY" | "EMERGENCY",
  "clinicalSummary": "string",
  "flaggedSymptoms": ["string"],
  "recommendedActions": "string"
}

Urgency rules:
EMERGENCY: chest pain, difficulty breathing, loss of consciousness, severe bleeding, stroke, anaphylaxis
PRIORITY: high fever, severe pain, worsening chronic condition
ROUTINE: all other presentations`;

      let aiSummaryText = '';
      let urgency: 'ROUTINE' | 'PRIORITY' | 'EMERGENCY' = 'ROUTINE';
      let parsedAiResponse = null;

      try {
        const response = await fetch(aiApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiApiKey}`
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-70b-instruct',
            messages: [{ role: 'user', content: systemPrompt }],
            temperature: 0.3,
            max_tokens: 800,
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as any;
        const content = data.choices[0].message.content;
        aiSummaryText = content;
        
        // 5. Parse the AI JSON response
        let jsonStr = content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        } else {
            const genericMatch = content.match(/```\n([\s\S]*?)\n```/);
            if (genericMatch) {
                jsonStr = genericMatch[1];
            }
        }
        
        parsedAiResponse = JSON.parse(jsonStr);
        urgency = parsedAiResponse.urgency;
        if (!['ROUTINE', 'PRIORITY', 'EMERGENCY'].includes(urgency)) {
           urgency = 'ROUTINE';
        }

      } catch (error) {
        console.error('Failed to parse AI response or call API:', error);
        // Fallback to defaults already set
      }

      // 6 & 7. Create TriageSummary in DB
      let originalLanguage = inputLanguage.toLowerCase();
      // Enforce enum constraints. The Prisma schema expects: en, hi, kn, ta, te, bn
      if (!['en', 'hi', 'kn', 'ta', 'te', 'bn'].includes(originalLanguage)) {
         originalLanguage = 'en'; // default fallback
      }

      const triageSummary = await db.triageSummary.create({
        data: {
          appointment_id: appointmentId,
          raw_symptoms: req.body,
          original_patient_text: combinedText,
          original_input_language: originalLanguage as any, // Cast to any to bypass TS error or use enum
          ai_summary: parsedAiResponse ? parsedAiResponse.clinicalSummary : aiSummaryText,
          chief_complaint: parsedAiResponse ? parsedAiResponse.chiefComplaint : chiefComplaint,
          duration: parsedAiResponse ? parsedAiResponse.duration : duration,
          severity: parsedAiResponse ? parsedAiResponse.severity : severity,
          urgency: urgency
        }
      });

      // 8. Update appointment status to TRIAGED
      await db.appointment.update({
        where: { id: appointmentId },
        data: { status: 'TRIAGED' }
      });

      // 9. Return success
      return res.json({ success: true, data: triageSummary });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      console.error('[triageController.submitTriage] Error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getTriageByAppointment: async (req: Request, res: Response) => {
    try {
      const { appointmentId } = req.params;

      // 1. Find triage summary
      const triageSummary = await db.triageSummary.findUnique({
        where: { appointment_id: appointmentId }
      });

      if (!triageSummary) {
        return res.status(404).json({ success: false, error: 'Triage summary not found' });
      }

      // 2. Verify requesting user is patient or doctor of that appointment
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }

      if (appointment.patient_id !== req.user?.id && appointment.doctor_id !== req.user?.id) {
        return res.status(403).json({ success: false, error: 'Unauthorised to view this triage' });
      }

      // 4. Return data
      return res.json({ success: true, data: triageSummary });
    } catch (error) {
      console.error('[triageController.getTriageByAppointment] Error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};
