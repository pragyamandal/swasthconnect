/**
 * appointment.routes.ts
 * POST /api/appointments, GET /api/appointments/my, GET /api/appointments/queue, PATCH /api/appointments/:id/status
 * TRD reference: section 4.5
 */
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// POST /api/appointments (patient books)
router.post('/', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/appointments/my (patient's appointments)
router.get('/my', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/appointments/queue (doctor's queue sorted by urgency)
router.get('/queue', authMiddleware, requireRole('DOCTOR'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// PATCH /api/appointments/:id/status (admit, complete, cancel)
router.patch('/:id/status', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

export default router;
