import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@swasthconnect/shared';

// Extend Express Request to carry the decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Validates the Bearer token on every protected route.
 * Applied to all /api/* routes except /api/auth/*.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorised — no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};

/**
 * Role guard — use after authMiddleware.
 * Example: router.get('/queue', authMiddleware, requireRole('DOCTOR'), handler)
 */
export const requireRole =
  (role: 'PATIENT' | 'DOCTOR') =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ success: false, error: 'Forbidden — insufficient role' });
      return;
    }
    next();
  };
