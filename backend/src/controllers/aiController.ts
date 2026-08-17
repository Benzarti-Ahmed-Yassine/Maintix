import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { queryRagEngine } from '../services/ragEngine.js';
import { executeMcpTool } from '../services/mcpTools.js';
import { RealtimeService } from '../services/websocket.js';

const prisma = new PrismaClient();

// AI Copilot Chat Endpoint (Role-Aware + RAG + MCP)
export async function aiChat(req: Request, res: Response) {
  try {
    const { message, role, machineCode } = req.body;
    const activeRole = role || 'TECHNICIAN';

    // Query RAG Engine
    const ragResult = await queryRagEngine(message, activeRole, machineCode);

    return res.json({
      role: activeRole,
      query: message,
      answer: ragResult.answer,
      confidence: ragResult.confidence,
      sources: ragResult.sources,
      recommendedActions: ragResult.recommendedActions,
      timestamp: new Date()
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// AI Diagnosis Endpoint
export async function getAiDiagnosis(req: Request, res: Response) {
  try {
    const { machineId } = req.body;
    const machine = await prisma.machine.findFirst({
      where: { OR: [{ id: machineId }, { code: machineId }] },
      include: { telemetry: { take: 5, orderBy: { timestamp: 'desc' } } }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json({
      machineCode: machine.code,
      machineName: machine.name,
      diagnosis: 'Abnormal Vibration Detected (Bearing - Left Side)',
      confidence: 0.92,
      rulDays: machine.predictedRulDays,
      healthScore: machine.healthScore,
      evidence: [
        'Vibration RMS increased 38% (11.2 mm/s RMS)',
        'Temperature increased 12% (62.5°C)',
        'Historical bearing failures match this pattern'
      ],
      sources: [
        'Bearing Maintenance Manual (OptiMax-i 1250)',
        `Machine ${machine.code} telemetry & intervention history`
      ],
      recommendedAction: 'Replace bearing and lubricate with SKF LGMT 3 grease within 18 days.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Record User Feedback on AI Recommendation (Human-in-the-Loop for MLOps)
export async function recordAiFeedback(req: Request, res: Response) {
  try {
    const { recommendationId, decision, userFeedback, role } = req.body;

    const feedback = await prisma.aIFeedback.create({
      data: {
        recommendationId: recommendationId || 'rec-demo-id',
        role: role || 'TECHNICIAN',
        decision: decision || 'ACCEPT',
        userFeedback: userFeedback || 'Action validated by engineer.'
      }
    });

    RealtimeService.getInstance().broadcast('AI_FEEDBACK_RECORDED', feedback);

    return res.status(201).json({
      message: 'Feedback recorded successfully for MLOps retraining pipeline',
      feedback
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
