/**
 * triage.routes.ts — POST /api/triage, GET /api/triage/:appointmentId
 * TRD reference: section 4.6
 */
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// POST /api/triage (patient submits triage → Gemini Flash generates summary)
router.post('/', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/triage/:appointmentId
router.get('/:appointmentId', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

export default router;
