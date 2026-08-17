import { PrismaClient } from '@prisma/client';
import { MockERPAdapter } from '../adapters/erpAdapter.js';
import { MockMESAdapter } from '../adapters/mesAdapter.js';

const prisma = new PrismaClient();
const erpAdapter = MockERPAdapter.getInstance();
const mesAdapter = MockMESAdapter.getInstance();

export const mcpToolDefinitions = [
  {
    name: 'getMachine',
    description: 'Retrieve detailed machine entity metadata, specification, and operating status',
    parameters: { machineCode: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getSensors',
    description: 'Get list of sensors mounted on machine with live status and thresholds',
    parameters: { machineCode: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'ADMIN']
  },
  {
    name: 'getSensorHistory',
    description: 'Get historical time-series telemetry for a specific sensor',
    parameters: { sensorId: 'string', range: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'ADMIN']
  },
  {
    name: 'getTelemetry',
    description: 'Get recent high-frequency sensor telemetry (vibration, temperature, electrical, speed)',
    parameters: { machineCode: 'string', limit: 'number' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getMachineHistory',
    description: 'Get historical timeline of alerts, interventions, and downtime events for machine',
    parameters: { machineCode: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'ADMIN']
  },
  {
    name: 'getAlerts',
    description: 'Retrieve active unacknowledged anomalies and alarms across plant assets',
    parameters: { severity: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getRisk',
    description: 'Retrieve multi-factor plant asset risk rankings, failure probabilities, and RUL scores',
    parameters: {},
    allowedRoles: ['MAINTENANCE_MANAGER', 'PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getRUL',
    description: 'Get latest Remaining Useful Life (RUL in days) and health index for machine',
    parameters: { machineCode: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getMaintenanceHistory',
    description: 'Retrieve past completed work orders, root causes, and parts replaced',
    parameters: { machineCode: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'ADMIN']
  },
  {
    name: 'getWorkOrders',
    description: 'Retrieve open and in-progress CMMS maintenance work orders',
    parameters: { status: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'ADMIN']
  },
  {
    name: 'getProductionImpact',
    description: 'Calculate hourly and cumulative downtime financial impact for production lines',
    parameters: { machineCode: 'string' },
    allowedRoles: ['PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getOEE',
    description: 'Get OEE metrics (Availability, Performance, Quality) for plant lines',
    parameters: { lineCode: 'string' },
    allowedRoles: ['PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getSparePartStock',
    description: 'Check warehouse spare parts stock levels, shelf locations, and reorder thresholds via ERP',
    parameters: { partNumber: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'ADMIN']
  },
  {
    name: 'getERPStatus',
    description: 'Query SAP PM ERP for asset capitalization, maintenance cost, and purchase orders',
    parameters: { machineCode: 'string' },
    allowedRoles: ['MAINTENANCE_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'getMESStatus',
    description: 'Query Siemens Opcenter MES for real-time production orders and line dispatching',
    parameters: { lineCode: 'string' },
    allowedRoles: ['PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'searchKnowledge',
    description: 'Search validated industrial manuals, ISO standards, and troubleshooting guides in RAG vector store',
    parameters: { query: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'PRODUCTION_MANAGER', 'INDUSTRIAL_DIRECTOR', 'ADMIN']
  },
  {
    name: 'createWorkOrder',
    description: 'Create a new maintenance work order with parts reservation in CMMS',
    parameters: { machineCode: 'string', title: 'string', priority: 'string', description: 'string' },
    allowedRoles: ['TECHNICIAN', 'MAINTENANCE_MANAGER', 'ADMIN']
  }
];

export async function executeMcpTool(toolName: string, args: any, userRole: string = 'TECHNICIAN'): Promise<any> {
  loggerToolCall(toolName, args, userRole);

  const def = mcpToolDefinitions.find(t => t.name === toolName);
  if (def && !def.allowedRoles.includes(userRole.toUpperCase())) {
    throw new Error(`Access Denied: Role '${userRole}' is not authorized to execute tool '${toolName}'`);
  }

  const targetCode = args?.machineCode || 'PCL-GMX-001';

  switch (toolName) {
    case 'getMachine': {
      return await prisma.machine.findFirst({
        where: { OR: [{ code: targetCode }, { id: targetCode }] },
        include: { components: true, sensors: true, productionLine: true }
      });
    }

    case 'getSensors': {
      const m = await prisma.machine.findFirst({ where: { OR: [{ code: targetCode }, { id: targetCode }] } });
      if (!m) return [];
      return await prisma.sensor.findMany({
        where: { machineId: m.id },
        include: { component: true }
      });
    }

    case 'getSensorHistory': {
      const sensorId = args?.sensorId;
      return await prisma.sensorReading.findMany({
        where: { sensorId },
        orderBy: { timestamp: 'desc' },
        take: 30
      });
    }

    case 'getTelemetry': {
      const m = await prisma.machine.findFirst({ where: { OR: [{ code: targetCode }, { id: targetCode }] } });
      if (!m) return [];
      return await prisma.telemetry.findMany({
        where: { machineId: m.id },
        orderBy: { timestamp: 'desc' },
        take: args?.limit || 10
      });
    }

    case 'getMachineHistory': {
      const m = await prisma.machine.findFirst({ where: { OR: [{ code: targetCode }, { id: targetCode }] } });
      if (!m) return [];
      const [alarms, workOrders, downtime] = await Promise.all([
        prisma.alarm.findMany({ where: { machineId: m.id }, take: 5, orderBy: { timestamp: 'desc' } }),
        prisma.workOrder.findMany({ where: { machineId: m.id }, take: 5, orderBy: { createdAt: 'desc' } }),
        prisma.downtimeEvent.findMany({ where: { machineId: m.id }, take: 5, orderBy: { startTime: 'desc' } }),
      ]);
      return { alarms, workOrders, downtime };
    }

    case 'getAlerts': {
      const whereClause: any = { status: 'ACTIVE' };
      if (args?.severity) whereClause.severity = args.severity.toUpperCase();
      return await prisma.alarm.findMany({
        where: whereClause,
        include: { machine: true },
        orderBy: { timestamp: 'desc' },
        take: 15
      });
    }

    case 'getRisk': {
      return await prisma.machine.findMany({
        orderBy: { failureProbability: 'desc' },
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          healthScore: true,
          anomalyScore: true,
          failureProbability: true,
          predictedRulDays: true,
          productionLine: { select: { name: true, lineCode: true } }
        }
      });
    }

    case 'getRUL': {
      const m = await prisma.machine.findFirst({
        where: { OR: [{ code: targetCode }, { id: targetCode }] },
        select: { code: true, name: true, healthScore: true, predictedRulDays: true, failureProbability: true }
      });
      return m || { code: targetCode, predictedRulDays: 60, healthScore: 98.0 };
    }

    case 'getMaintenanceHistory':
    case 'getWorkOrders': {
      const status = args?.status ? args.status.toUpperCase() : undefined;
      return await prisma.workOrder.findMany({
        where: status ? { status } : undefined,
        include: { machine: true, assignedTo: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    case 'getProductionImpact': {
      return await mesAdapter.getProductionImpact(targetCode);
    }

    case 'getOEE': {
      return await mesAdapter.getOEE(args?.lineCode);
    }

    case 'getSparePartStock': {
      return await erpAdapter.getSparePartStock(args?.partNumber || 'SP-BRG-6208-SKF');
    }

    case 'getERPStatus': {
      const asset = await erpAdapter.getAsset(targetCode);
      const cost = await erpAdapter.getMaintenanceCost(30);
      return { asset, cost };
    }

    case 'getMESStatus': {
      return await mesAdapter.getProductionStatus(args?.lineCode || 'Line 4');
    }

    case 'searchKnowledge': {
      const q = args?.query || '';
      return await prisma.knowledgeChunk.findMany({
        where: q ? { content: { contains: q } } : undefined,
        include: { document: true },
        take: 5
      });
    }

    case 'createWorkOrder': {
      const m = await prisma.machine.findFirst({ where: { OR: [{ code: targetCode }, { id: targetCode }] } });
      if (!m) throw new Error(`Machine ${targetCode} not found.`);
      const wo = await prisma.workOrder.create({
        data: {
          orderNumber: `WO-${Date.now().toString().slice(-6)}`,
          machineId: m.id,
          title: args?.title || 'Corrective Maintenance Order',
          description: args?.description || 'Auto-generated by MAINTIX AI Copilot',
          priority: args?.priority || 'HIGH',
          status: 'OPEN'
        }
      });
      return wo;
    }

    default:
      throw new Error(`Unknown MCP Tool: ${toolName}`);
  }
}

function loggerToolCall(name: string, args: any, role: string) {
  console.log(`🛠️ [MCP Tool Call] Executing: ${name} (Invoked by Role: ${role})`, args);
}
