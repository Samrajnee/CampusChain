import prisma from '../../lib/prisma.js';
import { notify } from '../../modules/notifications/notifications.service.js';
import { writeAuditLog } from '../../lib/audit.js';

const ESCALATION_THRESHOLD_HOURS = 72;

export async function escalationProcessor(job) {
  console.log('[Escalation] Checking for stale grievances');

  const threshold = new Date(
    Date.now() - ESCALATION_THRESHOLD_HOURS * 60 * 60 * 1000
  );

  // Find grievances that are stale and not yet escalated
  const staleGrievances = await prisma.grievance.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      deletedAt: null,
      updatedAt: { lte: threshold },
    },
    select: {
      id: true,
      title: true,
      status: true,
      studentId: true,
      isAnonymous: true,
    },
  });

  if (staleGrievances.length === 0) {
    console.log('[Escalation] No stale grievances found');
    return { escalated: 0 };
  }

  console.log(`[Escalation] Escalating ${staleGrievances.length} grievances`);

  let escalated = 0;

  for (const grievance of staleGrievances) {
    try {
      await prisma.$transaction([
        // Update status
        prisma.grievance.update({
          where: { id: grievance.id },
          data: {
            status: 'ESCALATED',
            escalatedAt: new Date(),
          },
        }),
        // Append to grievance log
        prisma.grievanceLog.create({
          data: {
            grievanceId: grievance.id,
            fromStatus: grievance.status,
            toStatus: 'ESCALATED',
            note: `Auto-escalated after ${ESCALATION_THRESHOLD_HOURS} hours without response.`,
            changedBy: null, // system action — no human actor
          },
        }),
      ]);

      // Notify the student (unless anonymous — but we still have their ID)
      await notify({
        userId: grievance.studentId,
        type: 'GRIEVANCE_RESOLVED',
        title: 'Grievance escalated',
        body: `Your grievance "${grievance.title}" has been automatically escalated due to no response within ${ESCALATION_THRESHOLD_HOURS} hours.`,
        refId: grievance.id,
      });

      // Audit log — system action
      await writeAuditLog({
        actorId: null,
        action: 'GRIEVANCE_AUTO_ESCALATED',
        targetId: grievance.id,
        targetType: 'Grievance',
        metadata: {
          fromStatus: grievance.status,
          thresholdHours: ESCALATION_THRESHOLD_HOURS,
        },
        ipAddress: 'system',
      });

      escalated++;
    } catch (err) {
      console.error(
        `[Escalation] Failed for grievance ${grievance.id}:`,
        err.message
      );
    }
  }

  console.log(`[Escalation] Done — escalated ${escalated} grievances`);
  return { escalated };
}