const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const badges = [
    { name: "First Steps",    description: "Earned your first 50 XP",  unlockRule: { type: "XP_THRESHOLD", value: 50   } },
    { name: "Rising Star",    description: "Reached 200 XP",           unlockRule: { type: "XP_THRESHOLD", value: 200  } },
    { name: "Campus Active",  description: "Reached 500 XP",           unlockRule: { type: "XP_THRESHOLD", value: 500  } },
    { name: "Power User",     description: "Reached 1000 XP",          unlockRule: { type: "XP_THRESHOLD", value: 1000 } },
    { name: "Voter",          description: "Cast your first vote",      unlockRule: { type: "VOTE_COUNT",    value: 1   } },
    { name: "Engaged Voter",  description: "Voted in 5 elections",      unlockRule: { type: "VOTE_COUNT",    value: 5   } },
    { name: "Event Goer",     description: "Attended your first event", unlockRule: { type: "EVENT_COUNT",   value: 1   } },
    { name: "Club Member",    description: "Joined your first club",    unlockRule: { type: "CLUB_JOIN",     value: 1   } },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  console.log("Badges seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());