/**
 * waitingRoom.routes.ts
 * GET /api/waiting-room/stream   — SSE endpoint
 * POST /api/room/create
 * GET  /api/room/:appointmentId
 * TRD reference: section 4.7
 */
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { sseClients, sendSSEEvent } from '../lib/sse.store';

const router = Router();

/**
 * SSE stream endpoint.
 * Client must send: GET /api/waiting-room/stream?appointmentId=xxx
 * with Authorization: Bearer <token> header.
 */
router.get('/stream', authMiddleware, (req, res) => {
  const { appointmentId } = req.query as { appointmentId: string };

  if (!appointmentId) {
    res.status(400).json({ success: false, error: 'appointmentId query param required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Register client
  sseClients.set(appointmentId, res);

  // Heartbeat every 30s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(appointmentId);
  });
});

export { sendSSEEvent };
export default router;
