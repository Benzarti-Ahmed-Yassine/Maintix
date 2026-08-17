import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class ReportEngine {
  private static instance: ReportEngine;

  public static getInstance(): ReportEngine {
    if (!ReportEngine.instance) {
      ReportEngine.instance = new ReportEngine();
    }
    return ReportEngine.instance;
  }

  async generateReport(params: {
    reportType: string;
    title: string;
    machineCode?: string;
    lineCode?: string;
    periodDays?: number;
    generatedBy?: string;
  }) {
    const periodDays = params.periodDays || 7;
    const periodEnd = new Date();
    const periodStart = new Date(Date.now() - periodDays * 24 * 3600 * 1000);

    const machine = params.machineCode
      ? await prisma.machine.findFirst({ where: { OR: [{ code: params.machineCode }, { id: params.machineCode }] } })
      : null;

    const line = params.lineCode
      ? await prisma.productionLine.findFirst({ where: { OR: [{ lineCode: params.lineCode }, { id: params.lineCode }] } })
      : null;

    // Fetch snapshot data
    const [telemetry, alarms, workOrders, downtimeEvents] = await Promise.all([
      machine ? prisma.telemetry.findMany({ where: { machineId: machine.id }, take: 100 }) : [],
      prisma.alarm.findMany({ take: 50, orderBy: { timestamp: 'desc' } }),
      prisma.workOrder.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.downtimeEvent.findMany({ take: 50, orderBy: { startTime: 'desc' } }),
    ]);

    const snapshotPayload = {
      timestamp: new Date().toISOString(),
      machine: machine ? { code: machine.code, name: machine.name, status: machine.status, healthScore: machine.healthScore } : null,
      line: line ? { code: line.lineCode, oee: line.oee } : null,
      telemetrySampleCount: telemetry.length,
      activeAlarmsCount: alarms.length,
      workOrdersCount: workOrders.length,
      downtimeMinutes: downtimeEvents.reduce((s, e) => s + e.durationMinutes, 0),
    };

    const snapshotJson = JSON.stringify(snapshotPayload);
    const checksum = crypto.createHash('sha256').update(snapshotJson).digest('hex');
    const snapshotCode = `SNAP-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`;

    const snapshot = await prisma.reportSnapshot.create({
      data: {
        snapshotCode,
        checksum,
        recordCount: telemetry.length + alarms.length + workOrders.length,
        dataSnapshot: snapshotJson,
      },
    });

    const reportNumber = `REP-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Date.now().toString().slice(-4)}`;

    const report = await prisma.report.create({
      data: {
        reportNumber,
        reportType: params.reportType,
        title: params.title,
        machineId: machine?.id || null,
        productionLineId: line?.id || null,
        periodStart,
        periodEnd,
        generatedBy: params.generatedBy || 'Karim Ben Ali',
        snapshotId: snapshot.id,
        status: 'COMPLETED',
        summaryDataJson: JSON.stringify({
          periodDays,
          machineCode: machine?.code,
          healthScore: machine?.healthScore,
          rulDays: machine?.predictedRulDays,
          status: machine?.status,
        }),
      },
      include: { snapshot: true, machine: true, productionLine: true },
    });

    return report;
  }

  async getReports() {
    return await prisma.report.findMany({
      include: { snapshot: true, machine: true, productionLine: true },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getReportById(reportId: string) {
    return await prisma.report.findFirst({
      where: { OR: [{ id: reportId }, { reportNumber: reportId }] },
      include: { snapshot: true, machine: true, productionLine: true },
    });
  }

  async getSnapshotById(snapshotId: string) {
    return await prisma.reportSnapshot.findFirst({
      where: { OR: [{ id: snapshotId }, { snapshotCode: snapshotId }] },
    });
  }
}
