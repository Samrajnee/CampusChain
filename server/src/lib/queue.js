import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

// Single Redis connection for all BullMQ queues
const connection = new IORedis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  tls: {}, // required for Upstash (rediss:// protocol)
});

connection.on('error', (err) => {
  console.error('[Queue] Redis connection error:', err.message);
});

connection.on('connect', () => {
  console.log('[Queue] Redis connected');
});

export function createQueue(name, opts = {}) {
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
      ...opts,
    },
  });
}

export function createWorker(name, processor, opts = {}) {
  const worker = new Worker(name, processor, {
    connection,
    concurrency: 2,
    ...opts,
  });

  worker.on('completed', (job) => {
    console.log(`[Worker:${name}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker:${name}] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export { connection };