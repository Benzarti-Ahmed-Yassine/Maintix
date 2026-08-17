import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RealtimeService } from '../services/websocket.js';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Technician Overview — current machine status + active alerts
// ---------------------------------------------------------------------------
export async function getTechnicianOverview(req: Request, res: Response) {
  try {
    const machineCode = (req.query.machineCode as string) || undefined;

    const machine = machineCode
      ? await prisma.machine.findFirst({
          where: { OR: [{ code: machineCode }, { id: machineCode }] },
          include: {
            components: true,
            sensors: true,
            alarms: {
              where: { status: 'ACTIVE' },
              orderBy: { timestamp: 'desc' },
              take: 5
            },
            predictions: { orderBy: { timestamp: 'desc' }, take: 1 },
            telemetry: { orderBy: { timestamp: 'desc' }, take: 1 }
          }
        })
      : await prisma.machine.findFirst({
          orderBy: { failureProbability: 'desc' },
          include: {
            components: true,
            sensors: true,
            alarms: {
              where: { status: 'ACTIVE' },
              orderBy: { timestamp: 'desc' },
              take: 5
            },
            predictions: { orderBy: { timestamp: 'desc' }, take: 1 },
            telemetry: { orderBy: { timestamp: 'desc' }, take: 1 }
          }
        });

    if (!machine) {
      return res.json({ machine: null, alerts: [], telemetry: null, predictions: null });
    }

    const latestTelemetry = machine.telemetry[0] || null;
    const latestPrediction = machine.predictions[0] || null;

    return res.json({
      machine: {
        id: machine.id,
        code: machine.code,
        name: machine.name,
        type: machine.type,
        status: machine.status,
        operatingMode: machine.operatingMode,
        manufacturer: machine.manufacturer,
        model: machine.model,
        serialNumber: machine.serialNumber,
        location: machine.location,
        criticality: machine.criticality,
        ratedPower: machine.ratedPower,
        nominalRPM: machine.nominalRPM,
        healthScore: machine.healthScore,
        anomalyScore: machine.anomalyScore,
        failureProbability: machine.failureProbability,
        predictedRulDays: machine.predictedRulDays,
        activeAlertsCount: machine.activeAlertsCount,
        components: machine.components,
        sensors: machine.sensors,
        erpRef: machine.erpRef,
        mesRef: machine.mesRef,
        scadaRef: machine.scadaRef,
        description: machine.description,
      },
      telemetry: latestTelemetry,
      predictions: latestPrediction,
      alerts: machine.alarms
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// All Machines (technician view)
// ---------------------------------------------------------------------------
export async function getTechnicianMachines(req: Request, res: Response) {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { failureProbability: 'desc' },
      include: {
        alarms: {
          where: { status: 'ACTIVE' },
          select: { severity: true, title: true, timestamp: true },
          take: 1
        },
        telemetry: { orderBy: { timestamp: 'desc' }, take: 1 },
        sensors: { select: { id: true, name: true, status: true } },
      }
    });

    return res.json(
      machines.map(m => ({
        id: m.id,
        code: m.code,
        name: m.name,
        type: m.type,
        status: m.status,
        location: m.location,
        criticality: m.criticality,
        healthScore: m.healthScore,
        anomalyScore: m.anomalyScore,
        failureProbability: m.failureProbability,
        predictedRulDays: m.predictedRulDays,
        activeAlertsCount: m.activeAlertsCount,
        sensorsCount: m.sensors.length,
        latestAlert: m.alarms[0] || null,
        latestTelemetry: m.telemetry[0] || null
      }))
    );
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Technician Tasks & Work Orders
// ---------------------------------------------------------------------------
export async function getTechnicianTasks(req: Request, res: Response) {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        machine: { select: { id: true, code: true, name: true, status: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return res.json(workOrders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Machine Alerts (Active & All)
// ---------------------------------------------------------------------------
export async function getMachineAlerts(req: Request, res: Response) {
  try {
    const { machineId } = req.params;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] }
    });

    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    const alarms = await prisma.alarm.findMany({
      where: { machineId: machine.id },
      include: { anomalies: true },
      orderBy: [{ status: 'asc' }, { timestamp: 'desc' }]
    });

    return res.json(alarms);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAllAlerts(req: Request, res: Response) {
  try {
    const alarms = await prisma.alarm.findMany({
      include: { machine: { select: { id: true, code: true, name: true, status: true } }, anomalies: true },
      orderBy: [{ status: 'asc' }, { timestamp: 'desc' }],
    });
    return res.json(alarms);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function acknowledgeAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    const alarm = await prisma.alarm.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: acknowledgedBy || 'Karim Ben Ali (Technician)'
      }
    });

    RealtimeService.getInstance().broadcast('ALERT_UPDATED', alarm);
    return res.json(alarm);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Diagnostics & Prognostics
// ---------------------------------------------------------------------------
export async function getMachinePredictions(req: Request, res: Response) {
  try {
    const { machineId } = req.params;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] }
    });

    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    const predictions = await prisma.prediction.findMany({
      where: { machineId: machine.id },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    const aiRecs = await prisma.aIRecommendation.findMany({
      where: { machineId: machine.id, role: 'TECHNICIAN', status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    return res.json({ predictions, recommendations: aiRecs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Telemetry History
// ---------------------------------------------------------------------------
export async function getMachineTelemetryHistory(req: Request, res: Response) {
  try {
    const { machineId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] }
    });

    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    const telemetry = await prisma.telemetry.findMany({
      where: { machineId: machine.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return res.json(telemetry.reverse());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Spare Parts for Technician
// ---------------------------------------------------------------------------
export async function getTechnicianSpareParts(req: Request, res: Response) {
  try {
    const parts = await prisma.sparePart.findMany({
      orderBy: [{ quantityInStock: 'asc' }]
    });
    return res.json(parts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Procedures & Standard Workflows
// ---------------------------------------------------------------------------
export async function getTechnicianProcedures(req: Request, res: Response) {
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      where: { category: { in: ['PROCEDURE', 'MANUAL', 'STANDARD'] } },
      include: { chunks: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(docs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Maintenance History
// ---------------------------------------------------------------------------
export async function getMachineMaintenanceHistory(req: Request, res: Response) {
  try {
    const { machineId } = req.params;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] }
    });

    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    const [workOrders, plans] = await Promise.all([
      prisma.workOrder.findMany({
        where: { machineId: machine.id },
        include: { assignedTo: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.maintenancePlan.findMany({
        where: { machineId: machine.id },
        orderBy: { scheduledDate: 'desc' }
      })
    ]);

    return res.json({ workOrders, plans });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
