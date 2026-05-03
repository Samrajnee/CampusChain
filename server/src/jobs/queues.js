console.log('REDIS URL:', process.env.UPSTASH_REDIS_URL)
import { createQueue } from '../lib/queue.js';

// One queue per concern — keeps job types cleanly separated
export const digestQueue     = createQueue('digest');
export const escalationQueue = createQueue('escalation');
export const badgeQueue      = createQueue('badge-check');