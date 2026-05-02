import prisma from '../../lib/prisma.js';
import { notify } from '../../modules/notifications/notifications.service.js';
import { sendEmail } from '../../lib/mailer.js';
import { weeklyDigestEmail } from '../../lib/emails/templates.js';

/**
 * Processor function for the weekly digest job.
 * Receives no job data — it scans the whole platform itself.
 */
export async function digestProcessor(job) {
  console.log('[Digest] Starting weekly digest run');

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Fetch all active students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', isActive: true },
    select: {
      id: true,
      studentDetail: {
        select: { department: true, year: true, xpTotal: true },
      },
    },
  });

  console.log(`[Digest] Processing ${students.length} students`);

  // Fetch platform-wide data once — cheaper than per-student queries
  const [upcomingEvents, openElections, recentAnnouncements] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: { in: ['UPCOMING', 'ONGOING'] },
        startsAt: { lte: weekAhead },
        deletedAt: null,
      },
      select: { id: true, title: true, startsAt: true },
      orderBy: { startsAt: 'asc' },
      take: 5,
    }),
    prisma.election.findMany({
      where: { status: 'OPEN' },
      select: { id: true, title: true, endsAt: true },
      take: 3,
    }),
    prisma.announcement.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: weekAgo },
      },
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  let notified = 0;

  for (const student of students) {
    try {
      // XP gained this week from ledger
      const xpThisWeek = await prisma.xPLedger.aggregate({
        where: {
          userId: student.id,
          createdAt: { gte: weekAgo },
        },
        _sum: { amount: true },
      });

      const xpGained = xpThisWeek._sum.amount ?? 0;

      // Build summary body
      const lines = [];

      if (upcomingEvents.length > 0) {
        lines.push(
          `${upcomingEvents.length} upcoming event${upcomingEvents.length > 1 ? 's' : ''}: ${upcomingEvents
            .slice(0, 2)
            .map((e) => e.title)
            .join(', ')}${upcomingEvents.length > 2 ? ' and more' : ''}.`
        );
      }

      if (openElections.length > 0) {
        lines.push(
          `${openElections.length} election${openElections.length > 1 ? 's' : ''} open for voting.`
        );
      }

      if (recentAnnouncements.length > 0) {
        lines.push(
          `${recentAnnouncements.length} new announcement${recentAnnouncements.length > 1 ? 's' : ''} this week.`
        );
      }

      if (xpGained > 0) {
        lines.push(`You earned ${xpGained} XP this week.`);
      }

      // Only send if there is something to report
      if (lines.length === 0) continue;

      await notify({
        userId: student.id,
        type: 'CUSTOM',
        title: 'Your weekly campus summary',
        body: lines.join(' '),
        refId: null,
      });

      notified++;
    } catch (err) {
      // Per-student failure must not stop the whole run
      console.error(`[Digest] Failed for student ${student.id}:`, err.message);
    }

    // Also send digest email
const studentUser = await prisma.user.findUnique({
  where: { id: student.id },
  select: { email: true, profile: { select: { firstName: true } } },
});
if (studentUser) {
  sendEmail({
    to: studentUser.email,
    subject: 'Your weekly CampusChain summary',
    html: weeklyDigestEmail({
      firstName: studentUser.profile?.firstName ?? 'there',
      xpGained,
      upcomingEvents,
      openElections,
      recentAnnouncements,
    }),
  });
}
  }

  console.log(`[Digest] Done — notified ${notified} students`);
  return { notified };
}