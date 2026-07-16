/**
 * doctor.routes.ts — GET /api/doctors, GET /api/doctors/:id, PUT /api/doctors/profile, PUT /api/doctors/availability
 * POST /api/doctors/match (symptom → specialisation via Gemini)
 * TRD reference: sections 4.4, 4.11
 */
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { doctorController } from '../controllers/doctor.controller';

const router = Router();

// GET /api/doctors?specialisation=Cardiologist
router.get('/', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// POST /api/doctors/match (Gemini symptom → specialisation)
router.post('/match', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/doctors/:id
router.get('/:id', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/doctors/:id/rating
router.get('/:id/rating', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// PUT /api/doctors/profile
router.put('/profile', authMiddleware, requireRole('DOCTOR'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/doctors/availability
router.get('/doctors/availability', authMiddleware, requireRole('DOCTOR'), doctorController.getAvailability);

// PUT /api/doctors/availability
router.put('/doctors/availability', authMiddleware, requireRole('DOCTOR'), doctorController.saveAvailability);

export default router;
