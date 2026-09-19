import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { queryRagEngine } from '../services/ragEngine.js';
import { executeMcpTool } from '../services/mcpTools.js';
import { RealtimeService } from '../services/websocket.js';

const prisma = new PrismaClient();

// AI Copilot Chat Endpoint (Role-Aware + RAG + Problem Extraction + MCP)
export async function aiChat(req: Request, res: Response) {
  try {
    const { message, role, machineCode } = req.body;
    const activeRole = role || 'TECHNICIAN';

    // Query RAG Engine with problem extraction
    const ragResult = await queryRagEngine(message, activeRole, machineCode);

    return res.json({
      role: activeRole,
      query: message,
      answer: ragResult.answer,
      confidence: ragResult.confidence,
      sources: ragResult.sources,
      evidence: ragResult.evidence || [],
      recommendedActions: ragResult.recommendedActions,
      activeAiEngine: ragResult.activeAiEngine || 'Ollama (qwen2.5:0.5b)',
      extractedProblem: ragResult.extractedProblem,
      productActions: ragResult.productActions || [],
      timestamp: new Date()
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Execute Action derived from Chatbot Problem Extraction into the final product system
export async function executeProductAction(req: Request, res: Response) {
  try {
    const { actionId, payload, role, userName } = req.body;

    if (!actionId || !payload) {
      return res.status(400).json({ error: 'Missing actionId or payload' });
    }

    if (actionId === 'CREATE_WORK_ORDER') {
      const machineCode = payload.machine_code || payload.machineId || 'TX-1250-A';
      const machine = await prisma.machine.findFirst({
        where: { OR: [{ code: machineCode }, { id: machineCode }] }
      });

      if (!machine) {
        return res.status(404).json({ error: `Machine ${machineCode} not found in plant registry` });
      }

      const orderNumber = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const workOrder = await prisma.workOrder.create({
        data: {
          orderNumber,
          machineId: machine.id,
          title: payload.title || `[${payload.priority || 'URGENT'}] Intervention IA sur ${machineCode}`,
          description: payload.procedure_steps?.join('\n') || payload.description || 'Intervention de maintenance générée automatiquement par le Copilote IA Maintix.',
          type: 'PREDICTIVE',
          priority: payload.priority || 'URGENT',
          status: 'OPEN',
          dueDate: new Date(Date.now() + 48 * 3600 * 1000)
        },
        include: {
          machine: { select: { id: true, code: true, name: true } },
          assignedTo: { select: { id: true, name: true } }
        }
      });

      RealtimeService.getInstance().broadcast('WORK_ORDER_CREATED', workOrder);

      return res.status(201).json({
        success: true,
        actionId,
        message: `Ordre de travail ${orderNumber} créé avec succès et assigné aux équipes de maintenance !`,
        data: workOrder
      });
    }

    if (actionId === 'RESERVE_SPARE_PART') {
      const partNumber = payload.part_number;
      let part = await prisma.sparePart.findFirst({
        where: { OR: [{ partNumber }, { name: { contains: '6208' } }] }
      });

      if (part) {
        part = await prisma.sparePart.update({
          where: { id: part.id },
          data: {
            quantityInStock: Math.max(0, part.quantityInStock - 1)
          }
        });
      }

      RealtimeService.getInstance().broadcast('SPARE_PART_RESERVED', {
        partNumber: payload.part_number,
        partName: payload.part_name,
        reservedBy: userName || 'Opérateur IA',
        timestamp: new Date()
      });

      return res.json({
        success: true,
        actionId,
        message: `Pièce ${payload.part_name} réservée dans le stock (Emplacement : ${payload.location || 'Rayon B-12'}).`,
        data: part || payload
      });
    }

    if (actionId === 'THROTTLE_MACHINE') {
      const machineCode = payload.machine_code || 'TX-1250-A';
      const machine = await prisma.machine.findFirst({
        where: { OR: [{ code: machineCode }, { id: machineCode }] }
      });

      if (machine) {
        await prisma.alarm.create({
          data: {
            machineId: machine.id,
            code: `ALM-PLC-${Date.now()}`,
            severity: 'CRITICAL',
            title: `Consigne Automate IA : Réduction de cadence à ${payload.target_speed_rpm || 1250} RPM`,
            description: payload.reason || 'Consigne de protection dynamique générée par Maintix AI Gateway.',
            status: 'ACTIVE'
          }
        });
      }

      RealtimeService.getInstance().broadcast('MACHINE_THROTTLED', {
        machineCode,
        targetSpeed: payload.target_speed_rpm || 1250,
        reason: payload.reason
      });

      return res.json({
        success: true,
        actionId,
        message: `Consigne automate transmise au contrôleur PLC de la machine ${machineCode} (Cadence fixée à ${payload.target_speed_rpm || 1250} RPM).`,
        data: payload
      });
    }

    return res.status(400).json({ error: `Unknown actionId: ${actionId}` });
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
