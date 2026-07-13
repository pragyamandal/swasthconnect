/**
 * consultation.routes.ts
 * POST /api/consultations, GET /api/consultations/:appointmentId,
 * GET /api/consultations/my, POST /api/prescriptions/generate
 * TRD reference: section 4.9
 */
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// POST /api/consultations (doctor saves notes)
router.post('/', authMiddleware, requireRole('DOCTOR'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/consultations/my (patient history)
router.get('/my', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/consultations/:appointmentId
router.get('/:appointmentId', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// POST /api/prescriptions/generate (pdfkit → Cloudinary)
router.post('/prescriptions/generate', authMiddleware, requireRole('DOCTOR'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

export default router;
