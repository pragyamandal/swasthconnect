/**
 * rating.routes.ts — POST /api/ratings, GET /api/doctors/:id/rating
 * TRD reference: section 4.11
 */
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// POST /api/ratings (patient submits rating after COMPLETED appointment)
router.post('/', authMiddleware, requireRole('PATIENT'), (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

export default router;
