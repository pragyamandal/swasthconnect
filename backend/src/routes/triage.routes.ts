/**
 * triage.routes.ts — POST /api/triage, GET /api/triage/:appointmentId
 * TRD reference: section 4.6
 */
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { triageController } from '../controllers/triage.controller';

const router = Router();

// POST /api/triage (patient submits triage → Gemini Flash generates summary)
router.post('/', authMiddleware, requireRole('PATIENT'), triageController.submitTriage);

// GET /api/triage/:appointmentId
router.get('/:appointmentId', authMiddleware, triageController.getTriageByAppointment);

export default router;
