/**
 * auth.routes.ts — POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
 * TRD reference: section 4.1
 */
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { authController } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me
router.get('/me', authMiddleware, authController.me);

// PATCH /api/users/language (also mapped locally in auth router for consistency)
router.patch('/language', authMiddleware, authController.updateLanguage);

export default router;
