import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RealtimeService } from '../services/websocket.js';

const prisma = new PrismaClient();

// Get all machines
export async function getMachines(req: Request, res: Response) {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        productionLine: true,
        components: true,
        sensors: true,
        alarms: { where: { status: 'ACTIVE' } }
      },
      orderBy: { failureProbability: 'desc' }
    });
    return res.json(machines);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Get single machine by code or ID
export async function getMachineById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id }, { code: id }] },
      include: {
        productionLine: true,
        components: { include: { sensors: true } },
        sensors: true,
        telemetry: { orderBy: { timestamp: 'desc' }, take: 30 },
        alarms: { orderBy: { timestamp: 'desc' }, take: 10 },
        anomalies: { orderBy: { timestamp: 'desc' }, take: 5 },
        maintenancePlans: true,
        workOrders: { include: { assignedTo: true } },
        aiRecommendations: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json(machine);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Create machine
export async function createMachine(req: Request, res: Response) {
  try {
    const machine = await prisma.machine.create({
      data: req.body,
    });
    return res.status(201).json(machine);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Update machine
export async function updateMachine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const machine = await prisma.machine.update({
      where: { id },
      data: req.body,
    });
    RealtimeService.getInstance().broadcast('MACHINE_UPDATED', machine);
    return res.json(machine);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Delete machine
export async function deleteMachine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.machine.delete({ where: { id } });
    return res.json({ message: 'Machine deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Get telemetry history for machine
export async function getMachineTelemetry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id }, { code: id }] }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const telemetry = await prisma.telemetry.findMany({
      where: { machineId: machine.id },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return res.json(telemetry.reverse());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
