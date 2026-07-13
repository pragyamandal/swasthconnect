/**
 * auth.routes.ts — POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
 * TRD reference: section 4.1
 */
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// POST /api/auth/login
router.post('/login', (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

// PATCH /api/users/language
router.patch('/language', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented' });
});

export default router;
