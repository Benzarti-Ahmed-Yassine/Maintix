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

// Ingest real sensor telemetry from ESP32 / Gateway
export async function ingestTelemetry(req: Request, res: Response) {
  try {
    const machineCode = req.params.machineId || req.body.machineId || req.body.machine_id || req.body.machineCode || 'TX-1250-A';
    
    let machine = await prisma.machine.findFirst({
      where: { OR: [{ code: machineCode }, { id: machineCode }] }
    });

    if (!machine) {
      // Find the first default machine
      machine = await prisma.machine.findFirst();
      if (!machine) {
        return res.status(404).json({ error: 'No machine available to attach telemetry' });
      }
    }

    const t = req.body;
    const vibRMS = Number(t.vibRMS ?? t.vib_rms ?? t.vibration_rms ?? 1.4);
    const vibPeak = Number(t.vibPeak ?? t.vib_peak ?? t.vibration_peak ?? (vibRMS * 1.5));
    const tempMotor = Number(t.tempMotor ?? t.temp_motor ?? t.temperature_motor ?? 45.0);
    const tempBearing = Number(t.tempBearing ?? t.temp_bearing ?? t.temperature_bearing ?? 42.0);
    const tempGearbox = Number(t.tempGearbox ?? t.temp_gearbox ?? t.temperature_gearbox ?? 40.0);
    const current = Number(t.current ?? 4.2);
    const voltage = Number(t.voltage ?? 400.0);
    const speedRpm = Number(t.speedRpm ?? t.speed_rpm ?? t.rotation_speed ?? 1450.0);
    const activePower = Number(t.activePower ?? t.active_power ?? t.power_active ?? 2.8);

    const saved = await prisma.telemetry.create({
      data: {
        machineId: machine.id,
        timestamp: new Date(),
        vibRMS,
        vibPeak,
        vibX: Number(t.vibX ?? t.vibration_x ?? 0.8),
        vibY: Number(t.vibY ?? t.vibration_y ?? 0.9),
        vibZ: Number(t.vibZ ?? t.vibration_z ?? 0.7),
        tempMotor,
        tempBearing,
        tempGearbox,
        tempAmbient: Number(t.tempAmbient ?? t.temp_ambient ?? 24.0),
        current,
        voltage,
        speedRpm,
        activePower,
        torque: Number(t.torque ?? 18.5),
        airPressure: Number(t.airPressure ?? t.air_pressure ?? 6.2),
        humidity: Number(t.humidity ?? 55.0),
        dustLevel: Number(t.dustLevel ?? t.dust_level ?? 12.0)
      }
    });

    // Broadcast live telemetry via WebSocket to all dashboards
    RealtimeService.getInstance().broadcast('LIVE_TELEMETRY', {
      machineCode: machine.code,
      timestamp: saved.timestamp,
      vibRMS,
      vibPeak,
      tempBearing,
      tempMotor,
      current,
      speedRpm,
      healthIndex: vibRMS > 4.5 ? 22.0 : 96.5,
      anomalyScore: vibRMS > 4.5 ? 0.92 : 0.03,
      isAnomaly: vibRMS > 4.5,
      severity: vibRMS > 4.5 ? 'CRITICAL' : 'LOW',
      estimatedRulDays: vibRMS > 4.5 ? 18 : 60
    });

    return res.status(201).json({
      success: true,
      message: 'Telemetry ingested successfully',
      record: saved
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

