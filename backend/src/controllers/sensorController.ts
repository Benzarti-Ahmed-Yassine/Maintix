import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RealtimeService } from '../services/websocket.js';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Get All Sensors for a Machine (Technician + Maintenance View)
// ---------------------------------------------------------------------------
export async function getMachineSensors(req: Request, res: Response) {
  try {
    const { machineId } = req.params;

    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] },
      include: {
        sensors: {
          include: { component: true, healthRecords: { orderBy: { timestamp: 'desc' }, take: 1 } },
        },
        telemetry: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const latestTelemetry = machine.telemetry[0] || null;

    // Summary calculation
    const totalSensors = machine.sensors.length;
    const online = machine.sensors.filter(s => s.status !== 'OFFLINE').length;
    const offline = machine.sensors.filter(s => s.status === 'OFFLINE').length;
    const warning = machine.sensors.filter(s => s.status === 'WARNING').length;
    const critical = machine.sensors.filter(s => s.status === 'CRITICAL').length;
    const avgSignalQuality = totalSensors > 0
      ? parseFloat((machine.sensors.reduce((s, x) => s + x.signalQuality, 0) / totalSensors).toFixed(1))
      : 99.0;

    // Attach latest live values from telemetry mapping
    const sensorList = machine.sensors.map(s => {
      let liveVal = 0.0;
      if (latestTelemetry) {
        if (s.name.includes('Vibration RMS') || s.type === 'VIBRATION' && s.unit.includes('RMS')) liveVal = latestTelemetry.vibRMS;
        else if (s.name.includes('X-Axis')) liveVal = latestTelemetry.vibX;
        else if (s.name.includes('Y-Axis')) liveVal = latestTelemetry.vibY;
        else if (s.name.includes('Z-Axis')) liveVal = latestTelemetry.vibZ;
        else if (s.name.includes('Bearing Temp') || s.type === 'TEMPERATURE' && s.name.includes('Bearing')) liveVal = latestTelemetry.tempBearing;
        else if (s.name.includes('Motor Surface') || s.name.includes('Motor Temp')) liveVal = latestTelemetry.tempMotor;
        else if (s.name.includes('Gearbox Sump')) liveVal = latestTelemetry.tempGearbox;
        else if (s.type === 'CURRENT') liveVal = latestTelemetry.current;
        else if (s.type === 'VOLTAGE') liveVal = latestTelemetry.voltage;
        else if (s.type === 'POWER') liveVal = latestTelemetry.activePower;
        else if (s.type === 'SPEED') liveVal = latestTelemetry.speedRpm;
        else if (s.type === 'TORQUE') liveVal = latestTelemetry.torque;
        else if (s.type === 'PRESSURE') liveVal = latestTelemetry.airPressure;
        else if (s.type === 'HUMIDITY') liveVal = latestTelemetry.humidity;
        else if (s.type === 'DUST') liveVal = latestTelemetry.dustLevel;
      }

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        type: s.type,
        unit: s.unit,
        value: liveVal,
        warningThreshold: s.warningThreshold,
        criticalThreshold: s.criticalThreshold,
        status: s.status,
        signalQuality: s.signalQuality,
        samplingRateHz: s.samplingRate,
        componentName: s.component?.name || 'Asset Body',
        componentCode: s.component?.code || 'MAIN_ASSET',
        lastSeen: s.lastSeen,
        health: s.healthRecords[0] || null,
      };
    });

    return res.json({
      machineCode: machine.code,
      machineName: machine.name,
      summary: {
        totalSensors,
        online,
        offline,
        warning,
        critical,
        avgSignalQuality,
        samplingRateHz: 1.0,
        latestTelemetryTimestamp: latestTelemetry?.timestamp || new Date(),
      },
      sensors: sensorList,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Get Single Sensor Details with Statistical Summary
// ---------------------------------------------------------------------------
export async function getSensorById(req: Request, res: Response) {
  try {
    const { sensorId } = req.params;

    const sensor = await prisma.sensor.findFirst({
      where: { OR: [{ id: sensorId }, { code: sensorId }] },
      include: {
        machine: true,
        component: true,
        healthRecords: { orderBy: { timestamp: 'desc' }, take: 10 },
      },
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // Fetch recent machine telemetry for statistics
    const telemetry = await prisma.telemetry.findMany({
      where: { machineId: sensor.machineId },
      orderBy: { timestamp: 'desc' },
      take: 60,
    });

    const values: number[] = [];
    telemetry.forEach(t => {
      if (sensor.name.includes('Vibration RMS')) values.push(t.vibRMS);
      else if (sensor.name.includes('Bearing Temp')) values.push(t.tempBearing);
      else if (sensor.name.includes('Motor Temp')) values.push(t.tempMotor);
      else if (sensor.type === 'CURRENT') values.push(t.current);
      else if (sensor.type === 'SPEED') values.push(t.speedRpm);
      else values.push(t.vibRMS);
    });

    const count = values.length || 1;
    const currentVal = values[0] || 0;
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const meanVal = parseFloat((values.reduce((s, v) => s + v, 0) / count).toFixed(2));
    const stdDev = parseFloat(Math.sqrt(values.reduce((s, v) => s + Math.pow(v - meanVal, 2), 0) / count).toFixed(2));

    return res.json({
      sensor: {
        id: sensor.id,
        code: sensor.code,
        name: sensor.name,
        type: sensor.type,
        unit: sensor.unit,
        warningThreshold: sensor.warningThreshold,
        criticalThreshold: sensor.criticalThreshold,
        status: sensor.status,
        signalQuality: sensor.signalQuality,
        manufacturer: sensor.manufacturer,
        model: sensor.model,
        samplingRateHz: sensor.samplingRate,
        firmwareVersion: sensor.firmwareVersion,
        installationDate: sensor.installationDate,
        lastSeen: sensor.lastSeen,
      },
      machine: {
        id: sensor.machine.id,
        code: sensor.machine.code,
        name: sensor.machine.name,
        status: sensor.machine.status,
      },
      component: sensor.component,
      statistics: {
        currentValue: currentVal,
        min: minVal,
        max: maxVal,
        mean: meanVal,
        standardDeviation: stdDev,
        sampleCount: count,
      },
      healthHistory: sensor.healthRecords,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Get Sensor History (Time ranges: 1m, 5m, 15m, 1h, 24h, 7d)
// ---------------------------------------------------------------------------
export async function getSensorHistory(req: Request, res: Response) {
  try {
    const { sensorId } = req.params;
    const range = (req.query.range as string) || '1h';

    const sensor = await prisma.sensor.findFirst({
      where: { OR: [{ id: sensorId }, { code: sensorId }] },
      include: { machine: true },
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    let limit = 30;
    if (range === '1m') limit = 10;
    else if (range === '5m') limit = 15;
    else if (range === '15m') limit = 20;
    else if (range === '1h') limit = 30;
    else if (range === '24h') limit = 60;
    else if (range === '7d') limit = 120;

    const telemetry = await prisma.telemetry.findMany({
      where: { machineId: sensor.machineId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const series = telemetry.reverse().map(t => {
      let val = t.vibRMS;
      if (sensor.name.includes('Bearing Temp')) val = t.tempBearing;
      else if (sensor.name.includes('Motor Temp') || sensor.name.includes('Motor Surface')) val = t.tempMotor;
      else if (sensor.name.includes('Gearbox')) val = t.tempGearbox;
      else if (sensor.type === 'CURRENT') val = t.current;
      else if (sensor.type === 'VOLTAGE') val = t.voltage;
      else if (sensor.type === 'POWER') val = t.activePower;
      else if (sensor.type === 'SPEED') val = t.speedRpm;
      else if (sensor.type === 'TORQUE') val = t.torque;
      else if (sensor.type === 'PRESSURE') val = t.airPressure;
      else if (sensor.type === 'HUMIDITY') val = t.humidity;
      else if (sensor.type === 'DUST') val = t.dustLevel;

      return {
        timestamp: t.timestamp,
        value: val,
        warningThreshold: sensor.warningThreshold,
        criticalThreshold: sensor.criticalThreshold,
        isAnomaly: t.isAnomaly,
      };
    });

    return res.json({
      sensorId: sensor.id,
      sensorName: sensor.name,
      unit: sensor.unit,
      range,
      series,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Sensor Analytics Platform — Maintenance Manager
// ---------------------------------------------------------------------------
export async function getMaintenanceSensorAnalytics(req: Request, res: Response) {
  try {
    const allSensors = await prisma.sensor.findMany({
      include: { machine: { select: { code: true, name: true, status: true } } },
    });

    const machinesWithTelemetry = await prisma.machine.findMany({
      include: {
        telemetry: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    });

    // Top vibration machines
    const topVibrationMachines = machinesWithTelemetry
      .map(m => ({
        machineCode: m.code,
        machineName: m.name,
        vibRMS: m.telemetry[0]?.vibRMS || 1.4,
        status: m.status,
      }))
      .sort((a, b) => b.vibRMS - a.vibRMS);

    // Top temperature machines
    const topTemperatureMachines = machinesWithTelemetry
      .map(m => ({
        machineCode: m.code,
        machineName: m.name,
        tempBearing: m.telemetry[0]?.tempBearing || 42.0,
        status: m.status,
      }))
      .sort((a, b) => b.tempBearing - a.tempBearing);

    // Sensor health breakdown
    const sensorHealthBreakdown = {
      total: allSensors.length,
      healthy: allSensors.filter(s => s.status === 'HEALTHY').length,
      warning: allSensors.filter(s => s.status === 'WARNING').length,
      critical: allSensors.filter(s => s.status === 'CRITICAL').length,
      offline: allSensors.filter(s => s.status === 'OFFLINE').length,
      avgSignalQuality: parseFloat((allSensors.reduce((sum, s) => sum + s.signalQuality, 0) / (allSensors.length || 1)).toFixed(1)),
    };

    // Correlation data points (for multi-sensor charts)
    const correlationData = [
      { name: 'PCL-GMX-001', vibRMS: 11.2, tempBearing: 62.5, current: 4.4, speedRpm: 1450, torque: 19.2 },
      { name: 'TX-1250-A', vibRMS: 11.2, tempBearing: 62.5, current: 4.4, speedRpm: 1450, torque: 19.2 },
      { name: 'TX-0672-B', vibRMS: 3.2, tempBearing: 52.0, current: 5.1, speedRpm: 1400, torque: 21.0 },
      { name: 'TX-0981-C', vibRMS: 2.8, tempBearing: 48.0, current: 4.8, speedRpm: 1420, torque: 18.8 },
      { name: 'TX-1123-D', vibRMS: 7.4, tempBearing: 68.0, current: 6.8, speedRpm: 1100, torque: 24.5 },
      { name: 'TX-0777-E', vibRMS: 0.9, tempBearing: 38.0, current: 3.8, speedRpm: 1500, torque: 17.5 },
    ];

    // Failure candidates (sensors in critical or warning condition)
    const failureCandidates = allSensors
      .filter(s => s.status === 'CRITICAL' || s.status === 'WARNING' || s.signalQuality < 95.0)
      .map(s => ({
        sensorId: s.id,
        sensorCode: s.code,
        sensorName: s.name,
        machineCode: s.machine.code,
        machineName: s.machine.name,
        status: s.status,
        signalQuality: s.signalQuality,
        reason: s.status === 'CRITICAL'
          ? 'Critical threshold breach on primary bearing'
          : s.signalQuality < 95.0
          ? 'Signal degradation & communication jitter'
          : 'Elevated thermal rise warning',
      }));

    return res.json({
      sensorHealthBreakdown,
      topVibrationMachines,
      topTemperatureMachines,
      correlationData,
      failureCandidates,
      allSensors: allSensors.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        type: s.type,
        unit: s.unit,
        machineCode: s.machine.code,
        status: s.status,
        signalQuality: s.signalQuality,
        warningThreshold: s.warningThreshold,
        criticalThreshold: s.criticalThreshold,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Sensor CRUD Operations (Admin)
// ---------------------------------------------------------------------------
export async function createSensor(req: Request, res: Response) {
  try {
    const sensor = await prisma.sensor.create({ data: req.body });
    RealtimeService.getInstance().broadcast('SENSOR_CREATED', sensor);
    return res.status(201).json(sensor);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateSensor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const sensor = await prisma.sensor.update({ where: { id }, data: req.body });
    RealtimeService.getInstance().broadcast('SENSOR_UPDATED', sensor);
    return res.json(sensor);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteSensor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.sensor.delete({ where: { id } });
    RealtimeService.getInstance().broadcast('SENSOR_DELETED', { id });
    return res.json({ message: 'Sensor deleted successfully', id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
