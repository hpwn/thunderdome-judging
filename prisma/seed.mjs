import { Prisma, PrismaClient, JudgeCategory, ScoreCategory, RunStatus, HeatStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.event.findFirst({
    where: { name: 'NAFSA Demo Event' }
  });

  if (existing) {
    console.log('Seed data already present, skipping.');
    return;
  }

  const event = await prisma.event.create({
    data: {
      name: 'NAFSA Demo Event',
      startDate: new Date('2024-09-21T17:00:00.000Z'),
      venue: 'The Armory, Brooklyn',
      config: {
        scoring: {
          runs: 2,
          format: 'best-of',
          categories: ['technicality', 'aesthetics', 'composition']
        }
      },
      divisions: {
        create: [
          {
            name: 'Pro Division',
            order: 1,
            heats: {
              create: [
                {
                  name: 'Finals Heat',
                  order: 1,
                  status: HeatStatus.SCHEDULED
                }
              ]
            }
          },
          {
            name: 'Amateur Division',
            order: 2
          }
        ]
      },
      judges: {
        create: [
          { name: 'Holden Hall', category: JudgeCategory.TECHNICALITY },
          { name: 'Mike Richter', category: JudgeCategory.AESTHETICS },
          { name: 'Natasha Wu', category: JudgeCategory.COMPOSITION }
        ]
      }
    },
    include: {
      divisions: {
        include: { heats: true }
      },
      judges: true
    }
  });

  const proDivision = event.divisions[0];
  const finalsHeat = proDivision.heats[0];

  const skaters = await prisma.$transaction([
    prisma.skater.create({
      data: {
        divisionId: proDivision.id,
        firstName: 'Alex',
        lastName: 'Lopez',
        sponsor: 'BoardWorks',
        order: 1
      }
    }),
    prisma.skater.create({
      data: {
        divisionId: proDivision.id,
        firstName: 'Jamie',
        lastName: 'Nguyen',
        sponsor: 'Skyline Wheels',
        order: 2
      }
    })
  ]);

  const [alex, jamie] = skaters;

  const runs = await prisma.$transaction([
    prisma.run.create({
      data: {
        heatId: finalsHeat.id,
        skaterId: alex.id,
        runNumber: 1,
        status: RunStatus.COMPLETED
      }
    }),
    prisma.run.create({
      data: {
        heatId: finalsHeat.id,
        skaterId: jamie.id,
        runNumber: 1,
        status: RunStatus.COMPLETED
      }
    })
  ]);

  const [alexRun, jamieRun] = runs;

  const [techJudge, aestJudge, compJudge] = event.judges;

  await prisma.score.createMany({
    data: [
      {
        runId: alexRun.id,
        judgeId: techJudge.id,
        category: ScoreCategory.TECHNICALITY,
        value: new Prisma.Decimal('38.5'),
        clientUuid: 'seed-alex-tech'
      },
      {
        runId: alexRun.id,
        judgeId: aestJudge.id,
        category: ScoreCategory.AESTHETICS,
        value: new Prisma.Decimal('27.4'),
        clientUuid: 'seed-alex-aest'
      },
      {
        runId: alexRun.id,
        judgeId: compJudge.id,
        category: ScoreCategory.COMPOSITION,
        value: new Prisma.Decimal('33.1'),
        clientUuid: 'seed-alex-comp'
      },
      {
        runId: jamieRun.id,
        judgeId: techJudge.id,
        category: ScoreCategory.TECHNICALITY,
        value: new Prisma.Decimal('41.2'),
        clientUuid: 'seed-jamie-tech'
      },
      {
        runId: jamieRun.id,
        judgeId: aestJudge.id,
        category: ScoreCategory.AESTHETICS,
        value: new Prisma.Decimal('29.6'),
        clientUuid: 'seed-jamie-aest'
      },
      {
        runId: jamieRun.id,
        judgeId: compJudge.id,
        category: ScoreCategory.COMPOSITION,
        value: new Prisma.Decimal('34.8'),
        clientUuid: 'seed-jamie-comp'
      }
    ]
  });

  await prisma.placement.createMany({
    data: [
      {
        divisionId: proDivision.id,
        skaterId: jamie.id,
        bestRunId: jamieRun.id,
        rank: 1,
        total: new Prisma.Decimal('105.6'),
        tiebreak: {
          categoryOrder: ['COMPOSITION', 'AESTHETICS', 'TECHNICALITY']
        }
      },
      {
        divisionId: proDivision.id,
        skaterId: alex.id,
        bestRunId: alexRun.id,
        rank: 2,
        total: new Prisma.Decimal('99.0'),
        tiebreak: {
          categoryOrder: ['COMPOSITION', 'AESTHETICS', 'TECHNICALITY']
        }
      }
    ]
  });

  await prisma.auditLog.create({
    data: {
      eventId: event.id,
      actor: 'seed-script',
      action: 'seed',
      entity: 'event',
      entityId: event.id,
      data: {
        message: 'Demo event seeded'
      }
    }
  });

  console.log('Seed data created for NAFSA Demo Event.');
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
