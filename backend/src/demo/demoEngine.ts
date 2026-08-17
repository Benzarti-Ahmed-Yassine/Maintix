import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scenarios: Record<string, {
  status: string; healthScore: number; anomalyScore: number;
  failureProb: number; rulDays: number; vibRMS: number;
  tempBearing: number; tempMotor: number; current: number;
  alertTitle: string; alertSeverity: string; anomalyType: string;
}> = {
  NORMAL_OPERATION: {
    status: 'HEALTHY', healthScore: 96.5, anomalyScore: 0.03, failureProb: 0.02,
    rulDays: 90, vibRMS: 1.4, tempBearing: 42.0, tempMotor: 45.0, current: 4.0,
    alertTitle: '', alertSeverity: 'LOW', anomalyType: 'None'
  },
  BEARING_DEGRADATION: {
    status: 'CRITICAL', healthScore: 22.0, anomalyScore: 0.92, failureProb: 0.88,
    rulDays: 18, vibRMS: 11.2, tempBearing: 62.5, tempMotor: 51.0, current: 4.4,
    alertTitle: 'Abnormal vibration detected (Left Bearing — Stage 3 wear)',
    alertSeverity: 'CRITICAL', anomalyType: 'Bearing Degradation (Outer Race Failure)'
  },
  MOTOR_OVERHEATING: {
    status: 'WARNING', healthScore: 54.0, anomalyScore: 0.74, failureProb: 0.55,
    rulDays: 25, vibRMS: 3.2, tempBearing: 48.0, tempMotor: 82.0, current: 5.8,
    alertTitle: 'Motor thermal threshold exceeded (82°C — Critical zone)',
    alertSeverity: 'HIGH', anomalyType: 'Motor Overheating'
  },
  GEARBOX_FAILURE: {
    status: 'CRITICAL', healthScore: 31.0, anomalyScore: 0.88, failureProb: 0.79,
    rulDays: 12, vibRMS: 9.1, tempBearing: 58.0, tempMotor: 54.0, current: 5.2,
    alertTitle: 'Gearbox vibration anomaly — tooth wear detected',
    alertSeverity: 'CRITICAL', anomalyType: 'Gearbox Failure'
  },
  VIBRATION_ANOMALY: {
    status: 'WARNING', healthScore: 64.0, anomalyScore: 0.72, failureProb: 0.52,
    rulDays: 28, vibRMS: 8.5, tempBearing: 49.0, tempMotor: 48.5, current: 4.6,
    alertTitle: 'High peak vibration on drive shaft (8.5 mm/s RMS)',
    alertSeverity: 'HIGH', anomalyType: 'Vibration Anomaly'
  },
  OVERCURRENT: {
    status: 'WARNING', healthScore: 68.0, anomalyScore: 0.61, failureProb: 0.44,
    rulDays: 35, vibRMS: 2.8, tempBearing: 45.0, tempMotor: 58.0, current: 7.2,
    alertTitle: 'Phase overcurrent detected (7.2A — threshold: 6.0A)',
    alertSeverity: 'HIGH', anomalyType: 'Electrical Fault'
  },
  SENSOR_FAILURE: {
    status: 'WARNING', healthScore: 72.0, anomalyScore: 0.45, failureProb: 0.30,
    rulDays: 42, vibRMS: 0.0, tempBearing: -1.0, tempMotor: 46.0, current: 4.1,
    alertTitle: 'Vibration sensor offline — data quality POOR',
    alertSeverity: 'MEDIUM', anomalyType: 'Sensor Failure'
  },
  MACHINE_FAILURE: {
    status: 'DOWN', healthScore: 5.0, anomalyScore: 0.99, failureProb: 0.99,
    rulDays: 0, vibRMS: 0.0, tempBearing: 38.0, tempMotor: 38.0, current: 0.0,
    alertTitle: 'Machine stopped — unplanned shutdown',
    alertSeverity: 'CRITICAL', anomalyType: 'Machine Failure'
  },
  MAINTENANCE_RECOVERY: {
    status: 'HEALTHY', healthScore: 91.0, anomalyScore: 0.08, failureProb: 0.06,
    rulDays: 75, vibRMS: 1.6, tempBearing: 43.0, tempMotor: 46.0, current: 4.1,
    alertTitle: '', alertSeverity: 'LOW', anomalyType: 'None'
  }
};

async function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scenario';
  const param = args[1] || 'BEARING_DEGRADATION';
  const targetMachine = args[2] || 'TX-1250-A';

  console.log(`🏭 MAINTIX DEMO ENGINE: Command = ${command}, Param = ${param}, Target = ${targetMachine}`);

  const machine = await prisma.machine.findFirst({ where: { code: targetMachine } });
  if (!machine) {
    console.error(`❌ Machine ${targetMachine} not found in database.`);
    process.exit(1);
  }

  const s = scenarios[param] || scenarios.BEARING_DEGRADATION;

  await prisma.machine.update({
    where: { id: machine.id },
    data: {
      status: s.status,
      healthScore: s.healthScore,
      anomalyScore: s.anomalyScore,
      failureProbability: s.failureProb,
      predictedRulDays: s.rulDays,
      activeAlertsCount: s.alertSeverity === 'CRITICAL' ? 3 : s.alertSeverity === 'HIGH' ? 1 : 0
    }
  });

  await prisma.telemetry.create({
    data: {
      machineId: machine.id,
      vibRMS: s.vibRMS,
      vibX: s.vibRMS * 0.75,
      vibY: s.vibRMS * 0.82,
      vibZ: s.vibRMS * 0.55,
      tempBearing: s.tempBearing,
      tempMotor: s.tempMotor,
      current: s.current,
      healthIndex: s.healthScore,
      anomalyScore: s.anomalyScore,
      isAnomaly: s.anomalyScore > 0.45,
      anomalyType: s.anomalyType,
      severity: s.alertSeverity,
      estimatedRulDays: s.rulDays,
      sourceType: 'SIMULATED'
    }
  });

  if (s.alertTitle) {
    await prisma.alarm.create({
      data: {
        machineId: machine.id,
        code: `ALM-${param}-${Date.now()}`,
        severity: s.alertSeverity as any,
        title: s.alertTitle,
        description: `Scenario: ${param}. Triggered via Demo CLI.`,
        status: 'ACTIVE',
        sourceType: 'SIMULATED'
      }
    });
  }

  console.log(`✅ Scenario '${param}' applied to machine ${targetMachine}`);
  console.log(`- Status: ${s.status}`);
  console.log(`- Health Score: ${s.healthScore}% | Anomaly Score: ${s.anomalyScore} | RUL: ${s.rulDays} days`);
  console.log(`- Vibration RMS: ${s.vibRMS} mm/s | Temp Bearing: ${s.tempBearing}°C`);
}

runCLI()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
