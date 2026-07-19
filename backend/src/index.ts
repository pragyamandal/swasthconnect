import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports — to be implemented
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { authController } from './controllers/auth.controller';
import doctorRouter from './routes/doctor.routes';
// import doctorRoutes from './routes/doctor.routes';
import appointmentRoutes from './routes/appointment.routes';
import triageRoutes from './routes/triage.routes';
// import consultationRoutes from './routes/consultation.routes';
// import ratingRoutes from './routes/rating.routes';
// import followUpRoutes from './routes/followup.routes';
// import waitingRoomRoutes from './routes/waitingRoom.routes';

// Background jobs — to be implemented
// import './services/cron.service';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API routes (uncomment as features are built) ────────────────────────────
app.use('/api/auth', authRoutes);
app.patch('/api/users/language', authMiddleware, authController.updateLanguage);
app.use('/api/doctors', doctorRouter);
// app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/triage', triageRoutes);
// app.use('/api/consultations', consultationRoutes);
// app.use('/api/ratings', ratingRoutes);
// app.use('/api/followup', followUpRoutes);
// app.use('/api/waiting-room', waitingRoomRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[SERVER] SwasthConnect API running on http://localhost:${PORT}`);
});

export default app;
