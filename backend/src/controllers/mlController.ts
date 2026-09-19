import { Request, Response } from 'express';
import {
  buildTelemetryPayload,
  predictRul,
  predictAnomaly,
  predictFailure,
  predictRisk,
  getPolicyRecommendation,
  queryMlRag,
  TelemetryPayload
} from '../services/mlService.js';

function extractTelemetryOverrides(req: Request): Partial<TelemetryPayload> {
  const src = req.method === 'POST' ? req.body : req.query;
  if (!src) return {};

  const parseNum = (val: any) => (val !== undefined && val !== null && !isNaN(Number(val)) ? Number(val) : undefined);

  return {
    temp_motor: parseNum(src.temp_motor ?? src.tempMotor),
    temp_bearing: parseNum(src.temp_bearing ?? src.tempBearing),
    temp_gearbox: parseNum(src.temp_gearbox ?? src.tempGearbox),
    vib_rms: parseNum(src.vib_rms ?? src.vibRMS ?? src.vibRms),
    vib_peak: parseNum(src.vib_peak ?? src.vibPeak),
    current: parseNum(src.current),
    voltage: parseNum(src.voltage),
    speed_rpm: parseNum(src.speed_rpm ?? src.speedRpm),
    active_power: parseNum(src.active_power ?? src.activePower)
  };
}

// RUL Prediction
export async function getRulPrediction(req: Request, res: Response) {
  try {
    const { machineId } = req.params;
    const overrides = extractTelemetryOverrides(req);
    const payload = await buildTelemetryPayload(machineId || 'TX-1250-A', overrides);
    const result = await predictRul(payload);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Anomaly Detection
export async function getAnomalyPrediction(req: Request, res: Response) {
  try {
    const { machineId } = req.params;
    const overrides = extractTelemetryOverrides(req);
    const payload = await buildTelemetryPayload(machineId || 'TX-1250-A', overrides);
    const result = await predictAnomaly(payload);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Failure Classification
export async function getFailurePrediction(req: Request, res: Response) {
  try {
    const { machineId } = req.params;
    const overrides = extractTelemetryOverrides(req);
    const payload = await buildTelemetryPayload(machineId || 'TX-1250-A', overrides);
    const result = await predictFailure(payload);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Risk Assessment
export async function getRiskPrediction(req: Request, res: Response) {
  try {
    const { machineId } = req.params;
    const overrides = extractTelemetryOverrides(req);
    const payload = await buildTelemetryPayload(machineId || 'TX-1250-A', overrides);
    const result = await predictRisk(payload);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// RL Policy Recommendation
export async function getPolicyRecommendationHandler(req: Request, res: Response) {
  try {
    const { machineId } = req.params;
    const overrides = extractTelemetryOverrides(req);
    const payload = await buildTelemetryPayload(machineId || 'TX-1250-A', overrides);
    const result = await getPolicyRecommendation(payload);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Full Pipeline Combined Inference
export async function getFullMlInference(req: Request, res: Response) {
  try {
    const { machineId } = req.params;
    const overrides = extractTelemetryOverrides(req);
    const payload = await buildTelemetryPayload(machineId || 'TX-1250-A', overrides);

    const [rul, anomaly, failure, risk, policy] = await Promise.all([
      predictRul(payload),
      predictAnomaly(payload),
      predictFailure(payload),
      predictRisk(payload),
      getPolicyRecommendation(payload)
    ]);

    return res.json({
      inputs: payload,
      rul,
      anomaly,
      failure,
      risk,
      policy,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ML RAG Query (Copilot)
export async function getMlRagQuery(req: Request, res: Response) {
  try {
    const { query, role, machineCode, liveTelemetry } = req.body;
    const result = await queryMlRag(query, role || 'TECHNICIAN', machineCode, liveTelemetry);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}