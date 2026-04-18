import prisma from './prisma.js'

export const writeAuditLog = async ({ actorId, action, targetId, targetType, metadata, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: { actorId, action, targetId, targetType, metadata, ipAddress },
    })
  } catch (err) {
    // Audit logging should never crash the main flow
    console.error('Audit log failed:', err.message)
  }
}