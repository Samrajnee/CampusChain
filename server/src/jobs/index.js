import { createWorker } from '../lib/queue.js';
import { digestProcessor } from './workers/digest.worker.js';
import { escalationProcessor } from './workers/escalation.worker.js';
import { badgeProcessor } from './workers/badge.worker.js';
import { registerCronJobs } from './schedulers/cron.js';

let started = false;

export async function startJobs() {
  if (started) return; // Guard against double-init in dev hot-reload
  started = true;

  // Start workers — they listen to their queues continuously
  createWorker('digest', digestProcessor);
  createWorker('escalation', escalationProcessor);
  createWorker('badge-check', badgeProcessor);

  console.log('[Jobs] Workers started: digest, escalation, badge-check');

  // Register repeating cron jobs in Redis
  await registerCronJobs();

  console.log('[Jobs] All background jobs initialised');
}