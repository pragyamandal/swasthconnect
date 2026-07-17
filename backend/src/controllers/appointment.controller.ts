import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  scheduledAt: z.string().datetime({ message: 'Invalid ISO datetime' })
});

export const appointmentController = {
  bookAppointment: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'PATIENT') {
        res.status(403).json({ success: false, error: 'Only patients can book appointments' });
        return;
      }

      const result = bookAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, error: 'Validation failed', errors: result.error.flatten().fieldErrors });
        return;
      }

      const { doctorId, scheduledAt } = result.data;
      const scheduledDate = new Date(scheduledAt);

     const doctorUser = await prisma.user.findUnique({ 
  where: { id: doctorId }
});
if (!doctorUser || doctorUser.role !== 'DOCTOR') {
  res.status(404).json({ success: false, error: 'Doctor not found' });
  return;
}

      

      try {
        const appointment = await prisma.appointment.create({
          data: {
            patient_id: req.user.id,
            doctor_id: doctorId,
            scheduled_at: scheduledDate,
            status: 'PENDING'
          }
        });

        res.status(201).json({
          success: true,
          data: {
            appointmentId: appointment.id,
            doctorName: doctorUser.name,
            scheduledAt: appointment.scheduled_at
          }
        });
      } catch (error: any) {
        // P2002 is Prisma's unique constraint violation code
        if (error.code === 'P2002') {
          res.status(409).json({ success: false, error: 'Slot already taken' });
          return;
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getMyAppointments: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const appointments = await prisma.appointment.findMany({
        where: { patient_id: req.user.id },
        include: {
          doctor: {
            select: {
              name: true,
              doctor_profile: {
                select: {
                  specialisation: true,
                  consultation_fee: true
                }
              }
            }
          },
          triage_summary: {
            select: {
              urgency: true,
              chief_complaint: true
            }
          }
        },
        orderBy: {
          scheduled_at: 'asc'
        }
      });

      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};
