import prisma from '../../lib/prisma.js';
import { writeAuditLog } from '../../lib/audit.js';
import { notify } from '../notifications/notifications.service.js';

// ── Get all skills for a user ─────────────────────────────────────────────────

export async function getUserSkills(userId) {
  const skills = await prisma.skill.findMany({
    include: {
      endorsements: {
        where: { endorsedId: userId },
        include: {
          endorser: {
            select: {
              id: true,
              profile: { select: { firstName: true, lastName: true } },
              role: true,
            },
          },
        },
      },
    },
    where: {
      endorsements: {
        some: { endorsedId: userId },
      },
    },
  });

  return skills.map((skill) => ({
    id:             skill.id,
    name:           skill.name,
    endorsements:   skill.endorsements,
    endorsementCount: skill.endorsements.length,
  }));
}

// ── Get skills the current user added (own profile) ───────────────────────────

export async function getMySkills(userId) {
  // Skills are discovered from endorsements the user received
  // PLUS skills they explicitly added via addSkill
  const [received, added] = await Promise.all([
    prisma.skillEndorsement.findMany({
      where: { endorsedId: userId },
      include: { skill: true },
      distinct: ['skillId'],
    }),
    prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    }).catch(() => []), // graceful fallback if table doesn't exist yet
  ]);

  const skillMap = new Map();

  for (const e of received) {
    if (!skillMap.has(e.skillId)) {
      skillMap.set(e.skillId, { id: e.skillId, name: e.skill.name, endorsementCount: 0, endorsements: [] });
    }
  }

  for (const a of added) {
    if (!skillMap.has(a.skillId)) {
      skillMap.set(a.skillId, { id: a.skillId, name: a.skill.name, endorsementCount: 0, endorsements: [] });
    }
  }

  // Count endorsements for each
  const skillIds = [...skillMap.keys()];
  const counts = await prisma.skillEndorsement.groupBy({
    by: ['skillId'],
    where: { endorsedId: userId, skillId: { in: skillIds } },
    _count: { id: true },
  });

  for (const c of counts) {
    const s = skillMap.get(c.skillId);
    if (s) s.endorsementCount = c._count.id;
  }

  return [...skillMap.values()].sort((a, b) => b.endorsementCount - a.endorsementCount);
}

// ── Add a skill to own profile ────────────────────────────────────────────────

export async function addSkill({ userId, name }) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) {
    throw Object.assign(new Error('Skill name must be at least 2 characters'), { status: 400 });
  }
  if (trimmed.length > 60) {
    throw Object.assign(new Error('Skill name too long'), { status: 400 });
  }

  // Find or create the skill globally
  const skill = await prisma.skill.upsert({
    where: { name: trimmed },
    create: { name: trimmed },
    update: {},
  });

  // Check if user already has this skill
  const existing = await prisma.userSkill.findFirst({
    where: { userId, skillId: skill.id },
  }).catch(() => null);

  if (existing) {
    throw Object.assign(new Error('You already have this skill'), { status: 409 });
  }

  // Add to user's skill list
  await prisma.userSkill.create({
    data: { userId, skillId: skill.id },
  }).catch(async () => {
    // If userSkill table doesn't exist, self-endorse as fallback
    await prisma.skillEndorsement.create({
      data: {
        skillId:    skill.id,
        endorserId: userId,
        endorsedId: userId,
        note:       'Added by user',
      },
    });
  });

  return skill;
}

// ── Remove a skill from own profile ──────────────────────────────────────────

export async function removeSkill({ userId, skillId }) {
  await prisma.userSkill.deleteMany({
    where: { userId, skillId },
  }).catch(() => {});

  // Also remove self-endorsement if it was a fallback
  await prisma.skillEndorsement.deleteMany({
    where: {
      skillId,
      endorsedId: userId,
      endorserId: userId,
    },
  });
}

// ── Endorse a skill ───────────────────────────────────────────────────────────

export async function endorseSkill({ endorserId, endorsedId, skillId, note, ipAddress }) {
  if (endorserId === endorsedId) {
    throw Object.assign(new Error('You cannot endorse your own skills'), { status: 400 });
  }

  // Check endorsed user exists
  const endorsedUser = await prisma.user.findUnique({
    where: { id: endorsedId },
    select: { id: true, profile: { select: { firstName: true } } },
  });
  if (!endorsedUser) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  // Check skill exists
  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) {
    throw Object.assign(new Error('Skill not found'), { status: 404 });
  }

  // One endorsement per endorser per skill per user
  const existing = await prisma.skillEndorsement.findFirst({
    where: { endorserId, endorsedId, skillId },
  });
  if (existing) {
    throw Object.assign(new Error('You have already endorsed this skill'), { status: 409 });
  }

  const endorsement = await prisma.skillEndorsement.create({
    data: {
      skillId,
      endorserId,
      endorsedId,
      note: note?.trim() || null,
    },
    include: {
      endorser: {
        select: {
          id: true,
          role: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  // Notify the endorsed user
  const endorserName = endorsement.endorser.profile?.firstName
    ? `${endorsement.endorser.profile.firstName} ${endorsement.endorser.profile.lastName}`
    : 'Someone';

  await notify({
    userId: endorsedId,
    type:   'PEER_ENDORSED',
    title:  'New skill endorsement',
    body:   `${endorserName} endorsed your "${skill.name}" skill.`,
    refId:  endorsement.id,
  });

  await writeAuditLog({
    actorId:    endorserId,
    action:     'SKILL_ENDORSED',
    targetId:   endorsedId,
    targetType: 'User',
    metadata:   { skillId, skillName: skill.name },
    ipAddress,
  });

  return endorsement;
}

// ── Remove an endorsement ─────────────────────────────────────────────────────

export async function removeEndorsement({ endorserId, skillId, endorsedId }) {
  await prisma.skillEndorsement.deleteMany({
    where: { endorserId, skillId, endorsedId },
  });
}

// ── Search skills (autocomplete) ──────────────────────────────────────────────

export async function searchSkills(query) {
  if (!query || query.length < 1) return [];

  return prisma.skill.findMany({
    where: { name: { contains: query, mode: 'insensitive' } },
    take: 8,
    orderBy: { name: 'asc' },
  });
}