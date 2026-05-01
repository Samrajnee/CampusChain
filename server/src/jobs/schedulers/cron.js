import { digestQueue } from '../queues.js';
import { escalationQueue } from '../queues.js';

/**
 * Register all repeating cron jobs.
 * BullMQ stores these in Redis — safe to call on every startup
 * because addBulk with { jobId } is idempotent.
 */
export async function registerCronJobs() {
  // Weekly digest — every Monday at 08:00
  await digestQueue.add(
    'weekly-digest',
    {},
    {
      jobId: 'weekly-digest-cron', // stable ID prevents duplicates on restart
      repeat: {
        pattern: '0 8 * * 1', // cron: min hour dow
        tz: 'Asia/Kolkata',
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  // Grievance escalation check — every hour
  await escalationQueue.add(
    'escalation-check',
    {},
    {
      jobId: 'escalation-check-cron',
      repeat: {
        pattern: '0 * * * *', // every hour on the hour
        tz: 'Asia/Kolkata',
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  console.log('[Cron] Weekly digest scheduled: every Monday 08:00 IST');
  console.log('[Cron] Escalation check scheduled: every hour');
}