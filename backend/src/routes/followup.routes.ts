/**
 * followup.routes.ts
 * POST /api/followup/:appointmentId/respond
 * GET  /api/followup/pending   (patient)
 * GET  /api/followup/flags     (doctor)
 * POST /api/followup/trigger   (dev/demo only — manual cron trigger)
 * TRD reference: section 4.12
 */
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/followup/pending (patient's pending follow-ups)
router.get('/pending', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/followup/flags (doctor's flagged follow-ups — patients who reported WORSE)
router.get('/flags', authMiddleware, requireRole('DOCTOR'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// POST /api/followup/:appointmentId/respond
router.post('/:appointmentId/respond', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// POST /api/followup/trigger — manual cron trigger for testing/demos
// WARNING: disable or protect this in production
router.post('/trigger', (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

export default router;
