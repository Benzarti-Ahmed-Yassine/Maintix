import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RealtimeService } from '../services/websocket.js';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Maintenance Dashboard Overview
// ---------------------------------------------------------------------------
export async function getMaintenanceOverview(req: Request, res: Response) {
  try {
    const totalMachines = await prisma.machine.count();
    const criticalAlerts = await prisma.alarm.count({ where: { severity: 'CRITICAL', status: 'ACTIVE' } });
    const highRiskCount = await prisma.machine.count({ where: { failureProbability: { gte: 0.50 } } });
    const plannedTasksCount = await prisma.maintenancePlan.count({ where: { status: { in: ['PLANNED', 'SCHEDULED'] } } });

    // MTBF & MTTR
    const completedOrders = await prisma.workOrder.findMany({
      where: { status: 'COMPLETED', completedAt: { not: null } },
      orderBy: { completedAt: 'asc' },
      select: { createdAt: true, completedAt: true, totalCost: true }
    });

    let mtbfHours: number | null = 168; // standard nominal baseline
    let mttrHours: number | null = 2.4;

    if (completedOrders.length >= 2) {
      const totalRepairMs = completedOrders.reduce((sum, o) => sum + (o.completedAt!.getTime() - o.createdAt.getTime()), 0);
      mttrHours = parseFloat((totalRepairMs / completedOrders.length / 3_600_000).toFixed(1));

      let totalIntervalMs = 0;
      for (let i = 1; i < completedOrders.length; i++) {
        const gap = completedOrders[i].createdAt.getTime() - completedOrders[i - 1].completedAt!.getTime();
        if (gap > 0) totalIntervalMs += gap;
      }
      const intervals = completedOrders.length - 1;
      if (intervals > 0) {
        mtbfHours = parseFloat((totalIntervalMs / intervals / 3_600_000).toFixed(0));
      }
    }

    // Risk Ranking
    const riskRanking = await prisma.machine.findMany({
      orderBy: { failureProbability: 'desc' },
      take: 10,
      include: {
        productionLine: { select: { name: true, lineCode: true } },
        components: { where: { status: 'CRITICAL' }, take: 1 }
      }
    });

    // Downtime Trend (Last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3_600_000);
    const downtimeEvents = await prisma.downtimeEvent.findMany({
      where: { startTime: { gte: sevenDaysAgo } },
      select: { startTime: true, durationMinutes: true }
    });

    const downtimeByDate: Record<string, number> = {};
    for (const event of downtimeEvents) {
      const dateKey = event.startTime.toISOString().split('T')[0];
      downtimeByDate[dateKey] = (downtimeByDate[dateKey] || 0) + (event.durationMinutes / 60);
    }

    const downtimeTrend = Object.entries(downtimeByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, hours]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: parseFloat(hours.toFixed(1))
      }));

    // Failure causes from anomalies
    const anomalies = await prisma.anomaly.findMany({ select: { anomalyType: true } });
    const causeCounts: Record<string, number> = {};
    for (const a of anomalies) {
      const type = a.anomalyType || 'Other';
      const key = type.toLowerCase().includes('bearing') ? 'Bearing Wear'
        : type.toLowerCase().includes('overhe') || type.toLowerCase().includes('thermal') ? 'Overheating'
        : type.toLowerCase().includes('misalign') ? 'Misalignment'
        : type.toLowerCase().includes('vibrat') ? 'Vibration Anomaly'
        : type.toLowerCase().includes('current') || type.toLowerCase().includes('electric') ? 'Electrical Fault'
        : 'Other';
      causeCounts[key] = (causeCounts[key] || 0) + 1;
    }

    const totalAnomalies = Object.values(causeCounts).reduce((a, b) => a + b, 0) || 1;
    const colorMap: Record<string, string> = {
      'Bearing Wear': '#3b82f6',
      'Misalignment': '#a855f7',
      'Overheating': '#f97316',
      'Vibration Anomaly': '#eab308',
      'Electrical Fault': '#06b6d4',
      'Other': '#10b981'
    };

    const failureCauses = Object.entries(causeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalAnomalies) * 100),
        color: colorMap[name] || '#64748b'
      }));

    const maintenancePlans = await prisma.maintenancePlan.findMany({
      include: { machine: { select: { code: true, name: true } } },
      orderBy: { scheduledDate: 'asc' },
      take: 20
    });

    const workOrders = await prisma.workOrder.findMany({
      include: {
        machine: { select: { code: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const spareParts = await prisma.sparePart.findMany({
      orderBy: { quantityInStock: 'asc' },
      take: 20
    });

    return res.json({
      metrics: {
        totalMachines,
        criticalAlerts,
        highRiskCount,
        plannedTasksCount,
        mtbfHours,
        mttrHours
      },
      riskRanking: riskRanking.map((m, idx) => ({
        rank: idx + 1,
        machineId: m.code,
        machineName: m.name,
        lineName: m.productionLine.name,
        riskScore: Math.round(m.failureProbability * 100),
        rulDays: m.predictedRulDays,
        status: m.status,
        criticalComponent: m.components[0]?.name || 'Main Shaft Bearing',
        activeAlerts: m.activeAlertsCount
      })),
      maintenancePlans: maintenancePlans.map(p => ({
        id: p.id,
        machineCode: p.machine.code,
        machineName: p.machine.name,
        title: p.title,
        type: p.type,
        scheduledDate: p.scheduledDate,
        durationHours: p.durationHours,
        priority: p.priority,
        status: p.status,
        assignedTechnician: p.assignedTechnician
      })),
      workOrders,
      spareParts,
      downtimeTrend,
      failureCauses
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Work Order CRUD
// ---------------------------------------------------------------------------
export async function getWorkOrders(req: Request, res: Response) {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        machine: { select: { id: true, code: true, name: true, status: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(workOrders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createWorkOrder(req: Request, res: Response) {
  try {
    const { machineId, title, description, priority, assignedToId, type, dueDate } = req.body;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const orderNumber = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        orderNumber,
        machineId: machine.id,
        title,
        description: description || title,
        type: type || 'PREDICTIVE',
        priority: priority || 'HIGH',
        status: 'OPEN',
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        machine: { select: { id: true, code: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    RealtimeService.getInstance().broadcast('WORK_ORDER_CREATED', workOrder);
    return res.status(201).json(workOrder);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateWorkOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.status === 'COMPLETED' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        machine: { select: { id: true, code: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    RealtimeService.getInstance().broadcast('WORK_ORDER_UPDATED', workOrder);
    return res.json(workOrder);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Maintenance Plans
// ---------------------------------------------------------------------------
export async function getMaintenancePlans(req: Request, res: Response) {
  try {
    const plans = await prisma.maintenancePlan.findMany({
      include: { machine: { select: { code: true, name: true, status: true } } },
      orderBy: { scheduledDate: 'asc' }
    });
    return res.json(plans);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createMaintenancePlan(req: Request, res: Response) {
  try {
    const { machineId, title, type, scheduledDate, durationHours, priority, assignedTechnician } = req.body;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const plan = await prisma.maintenancePlan.create({
      data: {
        machineId: machine.id,
        title,
        type: type || 'PREVENTIVE',
        scheduledDate: new Date(scheduledDate),
        durationHours: durationHours || 2.0,
        priority: priority || 'MEDIUM',
        status: 'PLANNED',
        assignedTechnician: assignedTechnician || 'Karim Ben Ali'
      },
      include: { machine: { select: { code: true, name: true } } }
    });

    RealtimeService.getInstance().broadcast('MAINTENANCE_PLAN_CREATED', plan);
    return res.status(201).json(plan);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Risk Analysis
// ---------------------------------------------------------------------------
export async function getMaintenanceRisk(req: Request, res: Response) {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { failureProbability: 'desc' },
      include: {
        alarms: { where: { status: 'ACTIVE' }, select: { severity: true, title: true, timestamp: true } },
        predictions: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });

    return res.json(
      machines.map((m, idx) => ({
        rank: idx + 1,
        machineId: m.code,
        machineName: m.name,
        riskScore: Math.round(m.failureProbability * 100),
        healthScore: m.healthScore,
        rulDays: m.predictedRulDays,
        status: m.status,
        activeAlerts: m.alarms.length,
        topAlert: m.alarms[0]?.title || null,
        latestPrediction: m.predictions[0] || null
      }))
    );
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Technicians Team List
// ---------------------------------------------------------------------------
export async function getTechnicians(req: Request, res: Response) {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      include: {
        workOrdersAssigned: {
          include: { machine: { select: { code: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return res.json(
      technicians.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        department: t.department,
        avatar: t.avatar,
        activeTasksCount: t.workOrdersAssigned.filter(w => w.status !== 'COMPLETED').length,
        completedTasksCount: t.workOrdersAssigned.filter(w => w.status === 'COMPLETED').length,
        currentAssignments: t.workOrdersAssigned,
      }))
    );
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Spare Parts
// ---------------------------------------------------------------------------
export async function getSpareParts(req: Request, res: Response) {
  try {
    const parts = await prisma.sparePart.findMany({
      include: { supplierRel: true },
      orderBy: { quantityInStock: 'asc' }
    });
    return res.json(parts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
