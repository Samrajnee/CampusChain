import prisma from '../../lib/prisma.js';
import { notify } from '../../modules/notifications/notifications.service.js';
import { writeAuditLog } from '../../lib/audit.js';

/**
 * Badge unlock rule format (stored as JSON in badge.unlockRule):
 * { "type": "XP_THRESHOLD", "value": 100 }
 * { "type": "XP_THRESHOLD", "value": 500 }
 * { "type": "XP_THRESHOLD", "value": 1000 }
 *
 * Only XP_THRESHOLD rules are evaluated here.
 * Other rule types (VOTE_COUNT, EVENT_COUNT, etc.) can be
 * added as additional cases in evaluateRule().
 */

function evaluateRule(rule, stats) {
  if (!rule || !rule.type) return false;

  switch (rule.type) {
    case 'XP_THRESHOLD':
      return stats.xpTotal >= rule.value;

    case 'VOTE_COUNT':
      return stats.voteCount >= rule.value;

    case 'EVENT_COUNT':
      return stats.eventCount >= rule.value;

    case 'CLUB_COUNT':
      return stats.clubCount >= rule.value;

    case 'PROPOSAL_COUNT':
      return stats.proposalCount >= rule.value;

    default:
      return false;
  }
}

export async function badgeProcessor(job) {
  const { userId } = job.data;

  if (!userId) {
    console.warn('[Badge] Job missing userId, skipping');
    return { awarded: 0 };
  }

  // Fetch student's current stats
  const [studentDetail, existingBadgeIds, allAutoIssueBadges] = await Promise.all([
    prisma.studentDetail.findUnique({
      where: { userId },
      select: { xpTotal: true },
    }),
    // IDs of badges the student already holds
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    }).then((rows) => new Set(rows.map((r) => r.badgeId))),
    // All badges that have an unlock rule defined
    prisma.badge.findMany({
      where: {
        unlockRule: { not: null },
      },
      select: {
        id: true,
        name: true,
        xpReward: true,
        unlockRule: true,
      },
    }),
  ]);

  if (!studentDetail) {
    console.warn(`[Badge] No student detail for user ${userId}`);
    return { awarded: 0 };
  }

  // We may need richer stats for non-XP rules — fetch lazily
  let richStats = null;

  async function getStats() {
    if (richStats) return richStats;

    const [voteCount, eventCount, clubCount, proposalCount] = await Promise.all([
      prisma.vote.count({ where: { voterId: userId } }),
      prisma.attendance.count({ where: { studentId: userId } }),
      prisma.clubMember.count({ where: { userId } }),
      prisma.proposal.count({ where: { authorId: userId, deletedAt: null } }),
    ]);

    richStats = {
      xpTotal: studentDetail.xpTotal,
      voteCount,
      eventCount,
      clubCount,
      proposalCount,
    };
    return richStats;
  }

  let awarded = 0;

  for (const badge of allAutoIssueBadges) {
    // Skip badges already held
    if (existingBadgeIds.has(badge.id)) continue;

    const rule = badge.unlockRule;

    // For XP_THRESHOLD we don't need the DB round-trip for rich stats
    const stats =
      rule.type === 'XP_THRESHOLD'
        ? { xpTotal: studentDetail.xpTotal }
        : await getStats();

    if (!evaluateRule(rule, stats)) continue;

    // Student qualifies — award the badge in a transaction
    try {
      await prisma.$transaction([
        prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            awardedBy: null, // system awarded
          },
        }),
        prisma.xPLedger.create({
          data: {
            userId,
            amount: badge.xpReward,
            eventType: 'BADGE_EARNED',
            description: `Auto-awarded badge: ${badge.name}`,
            refId: badge.id,
          },
        }),
        prisma.studentDetail.update({
          where: { userId },
          data: { xpTotal: { increment: badge.xpReward } },
        }),
      ]);

      // Notify the student
      await notify({
        userId,
        type: 'BADGE_EARNED',
        title: 'Badge earned',
        body: `You earned the "${badge.name}" badge and ${badge.xpReward} XP.`,
        refId: badge.id,
      });

      await writeAuditLog({
        actorId: null,
        action: 'BADGE_AUTO_AWARDED',
        targetId: badge.id,
        targetType: 'Badge',
        metadata: { userId, badgeName: badge.name, rule },
        ipAddress: 'system',
      });

      // Update local set so cascading badge checks within the same job
      // don't try to re-award the same badge
      existingBadgeIds.add(badge.id);
      // Also update xpTotal locally for the next iteration's XP_THRESHOLD check
      studentDetail.xpTotal += badge.xpReward;

      awarded++;
      console.log(`[Badge] Awarded "${badge.name}" to user ${userId}`);
    } catch (err) {
      console.error(
        `[Badge] Failed to award badge ${badge.id} to ${userId}:`,
        err.message
      );
    }
  }

  return { awarded };
}