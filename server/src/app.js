import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { verifyToken } from './lib/jwt.js';
import { sendError } from './lib/apiResponse.js';
import errorHandler from './middleware/errorHandler.js';
import { startJobs } from './jobs/index.js';

// Module routes
import authRoutes from './modules/identity/auth.routes.js';
import identityRoutes from './modules/identity/identity.routes.js';
import electionsRoutes from './modules/governance/elections.routes.js';
import governanceRoutes from './modules/governance/governance.routes.js';
import campusOpsRoutes from './modules/campus-ops/campus-ops.routes.js';
import announcementsRoutes from './modules/announcements/announcements.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import mentorshipRoutes from './modules/mentorship/mentorship.routes.js';
import resumeRoutes from './modules/resume/resume.routes.js';

// Notification IO injector
import { injectIO } from './modules/notifications/notifications.service.js';

const app = express();
const httpServer = createServer(app);

// ── Socket.IO setup ───────────────────────────────────────────────────────────

const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Socket.IO auth middleware — validate JWT on connect
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));

  const payload = verifyToken(token);
  if (!payload) return next(new Error('Invalid token'));

  socket.userId = payload.id;
  next();
});

// Join personal room on connect
io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);

  socket.on('disconnect', () => {
    socket.leave(`user:${socket.userId}`);
  });
});

// Inject IO into notification service so notify() can push in real time
injectIO(io);

// ── Express middleware ────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionsRoutes);
app.use('/api', governanceRoutes);
app.use('/api', campusOpsRoutes);
app.use('/api', identityRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/resume', resumeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CampusChain API is running' });
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`CampusChain server running on port ${PORT}`);
  await startJobs();
});


export default app;

// DEV ONLY — manual job trigger for testing. Remove before production.
if (process.env.NODE_ENV === 'development') {
  app.post('/api/dev/trigger-digest', async (req, res) => {
    const { digestQueue } = await import('./jobs/queues.js');
    await digestQueue.add('weekly-digest', {}, { jobId: `manual-${Date.now()}` });
    res.json({ success: true, message: 'Digest job queued' });
  });

  app.post('/api/dev/trigger-escalation', async (req, res) => {
    const { escalationQueue } = await import('./jobs/queues.js');
    await escalationQueue.add('escalation-check', {}, { jobId: `manual-${Date.now()}` });
    res.json({ success: true, message: 'Escalation job queued' });
  });

  app.post('/api/dev/trigger-badge/:userId', async (req, res) => {
    const { badgeQueue } = await import('./jobs/queues.js');
    await badgeQueue.add('check-badges', { userId: req.params.userId }, { jobId: `manual-${Date.now()}` });
    res.json({ success: true, message: 'Badge check queued' });
  });

  app.post('/api/dev/test-email', async (req, res) => {
  const { sendEmail } = await import('./lib/mailer.js');
  const { welcomeEmail } = await import('./lib/emails/templates.js');
  await sendEmail({
    to: req.body.to || process.env.SMTP_USER,
    subject: 'CampusChain test email',
    html: welcomeEmail({ firstName: 'Test User', email: req.body.to || process.env.SMTP_USER }),
  });
  res.json({ success: true, message: 'Test email sent — check your inbox or Mailtrap' });
});
}