import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 MAINTIX DEMO RESET: Cleaning SIMULATED records only...');

  const [deletedTelemetry, deletedAlarms, deletedAnomalies, deletedDowntime] = await Promise.all([
    prisma.telemetry.deleteMany({ where: { sourceType: 'SIMULATED' } }),
    prisma.alarm.deleteMany({ where: { sourceType: 'SIMULATED' } }),
    prisma.anomaly.deleteMany({ where: { sourceType: 'SIMULATED' } }),
    prisma.downtimeEvent.deleteMany({ where: { sourceType: 'SIMULATED' } })
  ]);

  // Clean demo-generated recommendations
  await prisma.aIRecommendation.deleteMany({
    where: { rationale: { contains: 'demo scenario' } }
  });

  // Restore machines to nominal healthy state
  await prisma.machine.updateMany({
    data: {
      status: 'HEALTHY',
      healthScore: 98.5,
      anomalyScore: 0.02,
      failureProbability: 0.01,
      predictedRulDays: 60,
      activeAlertsCount: 0
    }
  });

  console.log(`✅ Demo reset complete!`);
  console.log(`- Deleted ${deletedTelemetry.count} simulated telemetry records`);
  console.log(`- Deleted ${deletedAlarms.count} simulated alarms`);
  console.log(`- Deleted ${deletedAnomalies.count} simulated anomalies`);
  console.log(`- Deleted ${deletedDowntime.count} simulated downtime events`);
  console.log(`- Restored all machines to nominal HEALTHY baseline.`);
}

main()
  .catch((e) => {
    console.error('❌ Demo Reset Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
