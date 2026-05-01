import prisma from './prisma.js';
import { badgeQueue } from '../jobs/queues.js';

/**
 * Credit XP to a student.
 * Always use this instead of writing the transaction manually.
 *
 * @param {object} opts
 * @param {string}  opts.userId
 * @param {number}  opts.amount
 * @param {string}  opts.eventType  — XPEventType enum value
 * @param {string}  opts.description
 * @param {string}  [opts.refId]
 * @param {object}  [opts.tx]       — pass a Prisma tx client to run inside an existing transaction
 */
export async function creditXP({ userId, amount, eventType, description, refId = null, tx }) {
  const db = tx ?? prisma;

  await Promise.all([
    db.xPLedger.create({
      data: { userId, amount, eventType, description, refId },
    }),
    db.studentDetail.update({
      where: { userId },
      data: { xpTotal: { increment: amount } },
    }),
  ]);

  // Enqueue badge check outside any transaction — fire and forget
  if (!tx) {
    await badgeQueue.add(
      'check-badges',
      { userId },
      {
        // Deduplicate: if a badge check for this user is already
        // queued and waiting, don't add another one
        jobId: `badge-check:${userId}:${Date.now()}`,
        delay: 1000, // slight delay so XP write is committed first
      }
    ).catch((err) => {
      console.error('[XP] Failed to enqueue badge check:', err.message);
    });
  }
}