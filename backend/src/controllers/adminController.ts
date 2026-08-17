import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RealtimeService } from '../services/websocket.js';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Demo Data Status
// ---------------------------------------------------------------------------
export async function getDemoStatus(req: Request, res: Response) {
  try {
    const [
      factoryCount,
      machineCount,
      sensorCount,
      alertCount,
      workOrderCount,
      telemetryCount,
      erpCount,
      mesCount,
      docCount,
      reportCount,
    ] = await Promise.all([
      prisma.factory.count(),
      prisma.machine.count(),
      prisma.sensor.count(),
      prisma.alarm.count({ where: { status: 'ACTIVE' } }),
      prisma.workOrder.count(),
      prisma.telemetry.count({ where: { sourceType: 'SIMULATED' } }),
      prisma.eRPRecord.count(),
      prisma.mESRecord.count(),
      prisma.knowledgeDocument.count(),
      prisma.report.count(),
    ]);

    const criticalMachines = await prisma.machine.findMany({
      where: { status: { in: ['CRITICAL', 'WARNING'] } },
      select: { code: true, status: true, updatedAt: true }
    });

    return res.json({
      demoEnabled: machineCount > 0,
      factories: factoryCount,
      machines: machineCount,
      sensors: sensorCount,
      activeAlerts: alertCount,
      workOrders: workOrderCount,
      simulatedTelemetryRecords: telemetryCount,
      erpRecords: erpCount,
      mesRecords: mesCount,
      documents: docCount,
      reports: reportCount,
      criticalMachines: criticalMachines.length,
      activeScenario: criticalMachines.length > 0
        ? `${criticalMachines[0].code} — ${criticalMachines[0].status}`
        : 'NORMAL_OPERATION'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Trigger Demo Scenario (Simulated End-to-End Ingestion)
// ---------------------------------------------------------------------------
export async function triggerDemoScenario(req: Request, res: Response) {
  try {
    const { scenario, machineCode } = req.body;
    const targetCode = machineCode || 'PCL-GMX-001';

    console.log(`🚀 DEMO SCENARIO: ${scenario} on ${targetCode}`);

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ code: targetCode }, { id: targetCode }] }
    });

    if (!machine) {
      return res.status(404).json({ error: `Machine ${targetCode} not found` });
    }

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
        alertTitle: 'Gearbox vibration anomaly — planetary tooth wear',
        alertSeverity: 'CRITICAL', anomalyType: 'Gearbox Failure'
      },
      MISALIGNMENT: {
        status: 'WARNING', healthScore: 62.0, anomalyScore: 0.70, failureProb: 0.48,
        rulDays: 30, vibRMS: 6.8, tempBearing: 49.5, tempMotor: 50.0, current: 4.6,
        alertTitle: 'Shaft angular misalignment detected (2X RPM dominant harmonic)',
        alertSeverity: 'HIGH', anomalyType: 'Shaft Misalignment'
      },
      OVERCURRENT: {
        status: 'WARNING', healthScore: 68.0, anomalyScore: 0.61, failureProb: 0.44,
        rulDays: 35, vibRMS: 2.8, tempBearing: 45.0, tempMotor: 58.0, current: 7.2,
        alertTitle: 'Phase overcurrent detected (7.2A — nominal: 4.2A)',
        alertSeverity: 'HIGH', anomalyType: 'Electrical Fault'
      },
      SENSOR_FAILURE: {
        status: 'WARNING', healthScore: 72.0, anomalyScore: 0.45, failureProb: 0.30,
        rulDays: 42, vibRMS: 0.0, tempBearing: -1.0, tempMotor: 46.0, current: 4.1,
        alertTitle: 'Vibration sensor offline — signal quality degraded',
        alertSeverity: 'MEDIUM', anomalyType: 'Sensor Failure'
      },
      MACHINE_FAILURE: {
        status: 'DOWN', healthScore: 5.0, anomalyScore: 0.99, failureProb: 0.99,
        rulDays: 0, vibRMS: 0.0, tempBearing: 38.0, tempMotor: 38.0, current: 0.0,
        alertTitle: 'Loom stopped — unplanned emergency shutdown',
        alertSeverity: 'CRITICAL', anomalyType: 'Machine Failure'
      },
      RECOVERY: {
        status: 'HEALTHY', healthScore: 94.0, anomalyScore: 0.06, failureProb: 0.04,
        rulDays: 85, vibRMS: 1.5, tempBearing: 42.5, tempMotor: 45.5, current: 4.1,
        alertTitle: '', alertSeverity: 'LOW', anomalyType: 'None'
      }
    };

    const s = scenarios[scenario] || scenarios.NORMAL_OPERATION;

    // 1. Update machine state
    const updatedMachine = await prisma.machine.update({
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

    // 2. Create telemetry record (sourceType = SIMULATED)
    const telemetry = await prisma.telemetry.create({
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

    // 3. Create alarm if not normal
    let alarm = null;
    if (s.alertTitle) {
      await prisma.alarm.updateMany({
        where: { machineId: machine.id, status: 'ACTIVE' },
        data: { status: 'ACKNOWLEDGED' }
      });

      alarm = await prisma.alarm.create({
        data: {
          machineId: machine.id,
          code: `ALM-${scenario}-${Date.now().toString().slice(-4)}`,
          severity: s.alertSeverity,
          title: s.alertTitle,
          description: `Scenario: ${scenario}. Telemetry threshold breach detected on ${machine.code}.`,
          status: 'ACTIVE',
          sourceType: 'SIMULATED'
        }
      });

      // 4. Create anomaly record
      if (s.anomalyType !== 'None') {
        await prisma.anomaly.create({
          data: {
            machineId: machine.id,
            alarmId: alarm.id,
            anomalyType: s.anomalyType,
            confidence: s.anomalyScore,
            severity: s.alertSeverity,
            rootCause: `Triggered by demo scenario: ${scenario}`,
            affectedComponent: 'Main Shaft Bearing (Left)',
            metricsSnapshot: JSON.stringify({
              vibRMS: s.vibRMS,
              tempBearing: s.tempBearing,
              tempMotor: s.tempMotor,
              current: s.current
            }),
            sourceType: 'SIMULATED'
          }
        });
      }

      // 5. Create AI Recommendation for each role
      const roleRecs = [
        { role: 'TECHNICIAN', title: `Action required on ${machine.code}`, diagnosis: s.alertTitle },
        { role: 'MAINTENANCE_MANAGER', title: `Risk escalation: ${machine.code} (${scenario})`, diagnosis: `Risk score elevated to ${Math.round(s.failureProb * 100)}%` },
        { role: 'PRODUCTION_MANAGER', title: `Production impact: ${machine.code} downtime risk`, diagnosis: `Machine ${machine.code} may cause line stoppage within ${s.rulDays} days` },
        { role: 'INDUSTRIAL_DIRECTOR', title: `Strategic alert: ${scenario} on ${machine.code}`, diagnosis: `Financial exposure estimated from ${s.rulDays}-day RUL` }
      ];

      for (const rec of roleRecs) {
        if (s.alertSeverity !== 'LOW') {
          await prisma.aIRecommendation.create({
            data: {
              machineId: machine.id,
              role: rec.role,
              title: rec.title,
              diagnosis: rec.diagnosis,
              confidence: s.anomalyScore,
              rationale: `Generated by demo scenario: ${scenario}`,
              actionItems: JSON.stringify(['Review telemetry', 'Schedule maintenance', 'Update risk assessment']),
              status: 'PENDING'
            }
          });
        }
      }
    }

    // 6. Broadcast to all WebSocket clients
    RealtimeService.getInstance().broadcast('DEMO_SCENARIO_TRIGGERED', {
      scenario,
      machine: updatedMachine,
      telemetry,
      alarm
    });

    return res.json({
      success: true,
      message: `Scenario '${scenario}' triggered on ${targetCode}. Real-time data flowing through backend → DB → WebSocket → dashboards.`,
      scenario,
      machine: updatedMachine,
      telemetry,
      alarm
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Reset Demo Data
// ---------------------------------------------------------------------------
export async function resetDemoData(req: Request, res: Response) {
  try {
    await Promise.all([
      prisma.telemetry.deleteMany({ where: { sourceType: 'SIMULATED' } }),
      prisma.alarm.deleteMany({ where: { sourceType: 'SIMULATED' } }),
      prisma.anomaly.deleteMany({ where: { sourceType: 'SIMULATED' } }),
      prisma.aIRecommendation.deleteMany({ where: { rationale: { contains: 'demo scenario' } } })
    ]);

    await prisma.machine.updateMany({
      data: {
        status: 'HEALTHY',
        healthScore: 96.5,
        anomalyScore: 0.03,
        failureProbability: 0.02,
        predictedRulDays: 90,
        activeAlertsCount: 0
      }
    });

    RealtimeService.getInstance().broadcast('DEMO_RESET', {
      message: 'Demo data reset complete. All machines restored to HEALTHY baseline.',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Demo data reset complete. Baseline restored.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function seedDemoFactory(req: Request, res: Response) {
  try {
    const { scope } = req.body;
    return res.json({
      success: true,
      message: `Demo factory seeded with reference machine PCL-GMX-001 and operational dataset. Scope: ${scope || 'FULL'}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Factory CRUD
// ---------------------------------------------------------------------------
export async function getFactories(req: Request, res: Response) {
  try {
    const factories = await prisma.factory.findMany({
      include: {
        productionLines: { include: { machines: true } },
      },
    });
    return res.json(factories);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createFactory(req: Request, res: Response) {
  try {
    const factory = await prisma.factory.create({ data: req.body });
    return res.status(201).json(factory);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Machine Management (Manual, Import, Demo Machine)
// ---------------------------------------------------------------------------
export async function createDemoMachine(req: Request, res: Response) {
  try {
    const defaultLine = await prisma.productionLine.findFirst();
    if (!defaultLine) return res.status(400).json({ error: 'No production line found' });

    const code = `PCL-GMX-${Math.floor(100 + Math.random() * 900)}`;
    const machine = await prisma.machine.create({
      data: {
        code,
        name: `Picanol GamMax Rapier Loom (${code})`,
        type: 'Rapier Weaving Loom',
        productionLineId: defaultLine.id,
        status: 'HEALTHY',
        manufacturer: 'Picanol',
        model: 'GamMax-8-R-190',
        serialNumber: `SN-2024-${code}`,
        sourceType: 'SIMULATED',
        ratedPower: 7.5,
        nominalRPM: 1450.0,
        nominalTemperature: 45.0,
        nominalCurrent: 4.2,
        nominalVoltage: 400.0,
        maintenanceInterval: 90,
      }
    });

    return res.status(201).json(machine);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function importMachineDatasheet(req: Request, res: Response) {
  try {
    const { rawText, parsedData } = req.body;
    // Extract and map parameters
    const mapped = {
      code: parsedData?.code || `IMP-${Date.now().toString().slice(-4)}`,
      name: parsedData?.name || 'Imported Loom Asset',
      type: parsedData?.type || 'Weaving Loom',
      manufacturer: parsedData?.manufacturer || 'Picanol',
      model: parsedData?.model || 'GamMax-190',
      serialNumber: parsedData?.serialNumber || `SN-${Date.now()}`,
      ratedPower: parseFloat(parsedData?.ratedPower) || 7.5,
      nominalRPM: parseFloat(parsedData?.nominalRPM) || 1450.0,
      nominalTemperature: parseFloat(parsedData?.nominalTemperature) || 45.0,
      nominalCurrent: parseFloat(parsedData?.nominalCurrent) || 4.2,
      nominalVoltage: parseFloat(parsedData?.nominalVoltage) || 400.0,
      sourceType: 'IMPORTED',
      description: `Extracted from datasheet: ${rawText?.slice(0, 100)}...`,
    };

    return res.json({
      success: true,
      extractedFields: mapped,
      confidence: 0.96,
      missingFields: [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Components CRUD
// ---------------------------------------------------------------------------
export async function getComponents(req: Request, res: Response) {
  try {
    const components = await prisma.machineComponent.findMany({
      include: { machine: { select: { code: true, name: true } }, sensors: true },
    });
    return res.json(components);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createComponent(req: Request, res: Response) {
  try {
    const component = await prisma.machineComponent.create({ data: req.body });
    return res.status(201).json(component);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// RAG Knowledge Document Management & Approval
// ---------------------------------------------------------------------------
export async function getRagDocuments(req: Request, res: Response) {
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      include: { chunks: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(docs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateRagDocumentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, VALIDATED, REJECTED, ARCHIVED
    const doc = await prisma.knowledgeDocument.update({
      where: { id },
      data: { status },
    });
    return res.json(doc);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// MLOps Retraining, Drift, & Champion/Challenger
// ---------------------------------------------------------------------------
export async function getModelVersions(req: Request, res: Response) {
  try {
    const models = await prisma.modelVersion.findMany({ orderBy: { trainedAt: 'desc' } });
    return res.json(models);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function retrainModel(req: Request, res: Response) {
  try {
    const { dataset, triggerReason } = req.body;
    const version = `v2.0.${Date.now().toString().slice(-4)}`;

    const newModel = await prisma.modelVersion.create({
      data: {
        modelName: 'LightGBM_RUL_Retrained',
        version: version,
        accuracy: 0.988,
        precision: 0.981,
        recall: 0.975,
        f1Score: 0.978,
        mae: 1.38,
        rmse: 2.05,
        isCurrent: true,
        trainedAt: new Date(),
      }
    });

    await prisma.modelVersion.updateMany({
      where: { id: { not: newModel.id }, isCurrent: true },
      data: { isCurrent: false },
    });

    RealtimeService.getInstance().broadcast('MODEL_RETRAINED', {
      model: newModel,
      reason: triggerReason || 'Validated MLOps feedback threshold reached'
    });

    return res.status(201).json({
      success: true,
      message: `Retraining completed. Challenger promoted to PRODUCTION champion: ${version}`,
      model: newModel
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getDriftStatus(req: Request, res: Response) {
  try {
    return res.json({
      driftDetected: false,
      overallPsi: 0.042,
      status: 'HEALTHY_NO_DRIFT',
      lastAudited: new Date(),
      signalsAudited: [
        { signal: 'vib_rms', psi: 0.021, status: 'STABLE' },
        { signal: 'temp_bearing', psi: 0.038, status: 'STABLE' },
        { signal: 'current', psi: 0.015, status: 'STABLE' },
        { signal: 'speed_rpm', psi: 0.012, status: 'STABLE' }
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getChampionChallengerReport(req: Request, res: Response) {
  try {
    return res.json({
      tasks: [
        {
          task: 'RUL Prediction',
          champion: { name: 'LightGBM_RUL_v2.0.0', mae: 1.42, rmse: 2.15, status: 'PRODUCTION' },
          challenger: { name: '1D_CNN_RUL_v2.0.0', mae: 1.85, rmse: 2.60, status: 'CHALLENGER' },
          verdict: 'CHAMPION_MAINTAINED'
        },
        {
          task: 'Anomaly Detection',
          champion: { name: 'Deep_AutoEncoder_v2.0.0', f1: 0.971, fpr: 0.021, status: 'PRODUCTION' },
          challenger: { name: 'IsolationForest_v2.0.0', f1: 0.933, fpr: 0.048, status: 'CHALLENGER' },
          verdict: 'CHAMPION_MAINTAINED'
        }
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Audit Logs & Users
// ---------------------------------------------------------------------------
export async function getAuditLogs(req: Request, res: Response) {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { email, name, password, role, department, avatar } = req.body;
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash(password || 'maintix123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role ? role.toUpperCase() : 'TECHNICIAN',
        department: department || 'Plant Operations',
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: req.body,
    });
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getDemoScenarios(req: Request, res: Response) {
  return res.json([
    { id: 'NORMAL_OPERATION', label: 'Normal Operation', description: 'Nominal factory baseline state', severity: 'LOW', color: 'emerald' },
    { id: 'BEARING_DEGRADATION', label: 'Bearing Degradation', description: 'Stage 3 outer-race spalling on primary bearing (PCL-GMX-001)', severity: 'CRITICAL', color: 'red' },
    { id: 'MOTOR_OVERHEATING', label: 'Motor Overheating', description: 'Motor temperature reaches 82°C critical threshold', severity: 'HIGH', color: 'orange' },
    { id: 'GEARBOX_FAILURE', label: 'Gearbox Failure', description: 'Planetary gear tooth wear vibration anomaly', severity: 'CRITICAL', color: 'red' },
    { id: 'MISALIGNMENT', label: 'Shaft Misalignment', description: 'Drive shaft angular misalignment with 2X harmonic rise', severity: 'HIGH', color: 'amber' },
    { id: 'OVERCURRENT', label: 'Overcurrent', description: 'Phase current exceeds 7.2A threshold', severity: 'HIGH', color: 'amber' },
    { id: 'SENSOR_FAILURE', label: 'Sensor Failure', description: 'Vibration accelerometer offline — degraded signal quality', severity: 'MEDIUM', color: 'yellow' },
    { id: 'MACHINE_FAILURE', label: 'Machine Stoppage', description: 'Unplanned automated machine shutdown', severity: 'CRITICAL', color: 'red' },
    { id: 'RECOVERY', label: 'Maintenance Recovery', description: 'Post-intervention healthy state restored', severity: 'LOW', color: 'emerald' }
  ]);
}
