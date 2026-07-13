/**
 * sse.store.ts
 *
 * In-memory store for active SSE client connections.
 * TRD reference: section 4.7
 *
 * Key: appointmentId | Value: Express Response object
 *
 * Sufficient for portfolio scale (50+ concurrent connections per TRD NFR).
 * No Redis required.
 */

import { Response } from 'express';
import { SSEEventType } from '@swasthconnect/shared';

export const sseClients = new Map<string, Response>();

/**
 * Push an SSE event to a specific appointment's connected client.
 */
export const sendSSEEvent = (
  appointmentId: string,
  event: SSEEventType,
  data: unknown
): boolean => {
  const client = sseClients.get(appointmentId);
  if (!client) return false;

  client.write(`event: ${event}\n`);
  client.write(`data: ${JSON.stringify(data)}\n\n`);
  return true;
};
