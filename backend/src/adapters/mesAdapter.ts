import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MESProductionStatus {
  lineCode: string;
  lineName: string;
  status: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  currentOutput: number;
  targetOutput: number;
  activeOrder: any;
  machines: any[];
}

export class MockMESAdapter {
  private static instance: MockMESAdapter;

  public static getInstance(): MockMESAdapter {
    if (!MockMESAdapter.instance) {
      MockMESAdapter.instance = new MockMESAdapter();
    }
    return MockMESAdapter.instance;
  }

  async getProductionStatus(lineCode: string): Promise<MESProductionStatus | null> {
    const line = await prisma.productionLine.findFirst({
      where: { OR: [{ lineCode }, { id: lineCode }] },
      include: {
        machines: { select: { id: true, code: true, name: true, status: true, healthScore: true } },
        productionOrders: { where: { status: 'IN_PRODUCTION' }, take: 1 },
      },
    });

    if (!line) return null;

    return {
      lineCode: line.lineCode,
      lineName: line.name,
      status: line.status,
      oee: line.oee,
      availability: line.availability,
      performance: line.performance,
      quality: line.quality,
      currentOutput: line.currentOutput,
      targetOutput: line.targetOutput,
      activeOrder: line.productionOrders[0] || null,
      machines: line.machines,
    };
  }

  async getProductionOrders() {
    return await prisma.productionOrder.findMany({
      include: { line: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async getMachineState(machineCode: string) {
    const machine = await prisma.machine.findFirst({
      where: { OR: [{ code: machineCode }, { id: machineCode }] },
      include: { productionLine: true },
    });

    if (!machine) return null;

    return {
      machineCode: machine.code,
      name: machine.name,
      mesRef: machine.mesRef || `MES-${machine.code}`,
      status: machine.status,
      operatingMode: machine.operatingMode,
      productionLine: machine.productionLine.name,
      healthScore: machine.healthScore,
      anomalyScore: machine.anomalyScore,
    };
  }

  async getOEE(lineCode?: string) {
    if (lineCode) {
      const line = await prisma.productionLine.findFirst({
        where: { OR: [{ lineCode }, { id: lineCode }] },
      });
      return line ? { oee: line.oee, availability: line.availability, performance: line.performance, quality: line.quality } : null;
    }

    const lines = await prisma.productionLine.findMany();
    const count = lines.length || 1;
    return {
      overallOEE: parseFloat((lines.reduce((s, l) => s + l.oee, 0) / count).toFixed(1)),
      availability: parseFloat((lines.reduce((s, l) => s + l.availability, 0) / count).toFixed(1)),
      performance: parseFloat((lines.reduce((s, l) => s + l.performance, 0) / count).toFixed(1)),
      quality: parseFloat((lines.reduce((s, l) => s + l.quality, 0) / count).toFixed(1)),
      lines: lines.map(l => ({ lineCode: l.lineCode, name: l.name, oee: l.oee, status: l.status })),
    };
  }

  async getDowntime(timeframeDays: number = 7) {
    const sinceDate = new Date(Date.now() - timeframeDays * 24 * 3600 * 1000);
    return await prisma.downtimeEvent.findMany({
      where: { startTime: { gte: sinceDate } },
      include: { line: true, machine: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async getProductionImpact(machineCode: string) {
    const machine = await prisma.machine.findFirst({
      where: { OR: [{ code: machineCode }, { id: machineCode }] },
      include: { productionLine: true },
    });

    if (!machine) return null;

    // Standard weaving rate: 42 meters/minute
    const weaveRateMetersPerMin = 42.0;
    const estimatedDowntimeHours = machine.status === 'CRITICAL' ? 2.5 : machine.status === 'WARNING' ? 1.0 : 0.0;
    const productionLossMeters = Math.round(estimatedDowntimeHours * 60 * (weaveRateMetersPerMin / 24)); // Normalized per loom
    const financialCostLoss = Math.round(estimatedDowntimeHours * 1680.0); // 1680 EUR per hour downtime cost

    return {
      machineCode: machine.code,
      lineCode: machine.productionLine.lineCode,
      lineName: machine.productionLine.name,
      nominalSpeedPpm: 680,
      potentialDowntimeHours: estimatedDowntimeHours,
      estimatedProductionLossMeters: productionLossMeters,
      financialCostLossEur: financialCostLoss,
      impactSeverity: machine.status === 'CRITICAL' ? 'HIGH' : machine.status === 'WARNING' ? 'MEDIUM' : 'LOW',
    };
  }

  async getQuality() {
    return await prisma.qualityEvent.findMany({
      include: { line: true, machine: true },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
  }
}
