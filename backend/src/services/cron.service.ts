/**
 * cron.service.ts
 *
 * node-cron background job — runs nightly at 00:00 IST.
 * Finds COMPLETED appointments from 3 days ago and creates FollowUpRequest rows.
 * TRD reference: section 4.12
 *
 * Import this file once in src/index.ts to activate: import './services/cron.service';
 */

import cron from 'node-cron';
import db from '../lib/db';

// Nightly follow-up job — 00:00 IST
cron.schedule(
  '0 0 * * *',
  async () => {
    console.log('[CRON] Running follow-up job:', new Date().toISOString());
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const appointments = await db.appointment.findMany({
        where: {
          status: 'COMPLETED',
          scheduled_at: {
            gte: new Date(new Date(threeDaysAgo).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(threeDaysAgo).setHours(23, 59, 59, 999)),
          },
          follow_up_request: null,
        },
      });

      for (const appt of appointments) {
        await db.followUpRequest.create({
          data: {
            appointment_id: appt.id,
            sent_at: new Date(),
            doctor_flagged: false,
            seen_by_doctor: false,
          },
        });
      }

      console.log(`[CRON] Created ${appointments.length} follow-up requests`);
    } catch (err) {
      console.error('[CRON] Follow-up job failed:', err);
    }
  },
  { timezone: 'Asia/Kolkata' }
);

console.log('[CRON] Follow-up scheduler registered (00:00 IST daily)');
