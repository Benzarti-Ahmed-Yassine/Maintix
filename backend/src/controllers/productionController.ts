import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Production Dashboard Overview
// ---------------------------------------------------------------------------
export async function getProductionOverview(req: Request, res: Response) {
  try {
    const lines = await prisma.productionLine.findMany({
      include: {
        machines: { select: { id: true, code: true, name: true, status: true, healthScore: true } },
        productionOrders: { where: { status: 'IN_PRODUCTION' }, take: 1 }
      }
    });

    if (lines.length === 0) {
      return res.json({
        metrics: { oee: 0, availability: 0, performance: 0, quality: 0, totalOutput: 0, downtimeHours: 0 },
        productionLines: [],
        oeeTrend: [],
        downtimeByCause: [],
        productionVsTarget: [],
        bottleneck: null
      });
    }

    const totalOutput = lines.reduce((sum, l) => sum + l.currentOutput, 0);
    const totalDowntime = lines.reduce((sum, l) => sum + l.downtimeHours, 0);
    const avgOee = lines.reduce((sum, l) => sum + l.oee, 0) / lines.length;
    const avgAvail = lines.reduce((sum, l) => sum + l.availability, 0) / lines.length;
    const avgPerf = lines.reduce((sum, l) => sum + l.performance, 0) / lines.length;
    const avgQual = lines.reduce((sum, l) => sum + l.quality, 0) / lines.length;

    // OEE Trend — last 7 days from DowntimeEvent records
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3_600_000);
    const downtimeEvents = await prisma.downtimeEvent.findMany({
      where: { startTime: { gte: sevenDaysAgo } },
      select: { startTime: true, durationMinutes: true, causeCategory: true, financialImpact: true, lineId: true }
    });

    const oeeTrendByDate: Record<string, { downtimeMin: number; date: string }> = {};
    for (const event of downtimeEvents) {
      const dateKey = event.startTime.toISOString().split('T')[0];
      if (!oeeTrendByDate[dateKey]) {
        oeeTrendByDate[dateKey] = { downtimeMin: 0, date: dateKey };
      }
      oeeTrendByDate[dateKey].downtimeMin += event.durationMinutes;
    }

    const oeeTrend: { date: string; oee: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3_600_000);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const totalMinutes = lines.length * 1440;
      const downtimeMin = oeeTrendByDate[dateKey]?.downtimeMin || 0;
      const availability = Math.max(0, (totalMinutes - downtimeMin) / totalMinutes);
      const dayOee = parseFloat((availability * (avgPerf / 100) * (avgQual / 100) * 100).toFixed(1));
      oeeTrend.push({ date: label, oee: dayOee });
    }

    // Downtime by Cause
    const causeCounts: Record<string, number> = {};
    for (const e of downtimeEvents) {
      causeCounts[e.causeCategory] = (causeCounts[e.causeCategory] || 0) + e.durationMinutes;
    }

    const causeColorMap: Record<string, string> = {
      'MACHINE_FAILURE': '#3b82f6',
      'CHANGEOVER': '#8b5cf6',
      'MATERIAL_SHORTAGE': '#06b6d4',
      'SETUP_ADJUSTMENT': '#f59e0b',
      'OTHER': '#64748b'
    };

    const causeLabelMap: Record<string, string> = {
      'MACHINE_FAILURE': 'Machine Failure',
      'CHANGEOVER': 'Changeover',
      'MATERIAL_SHORTAGE': 'Material Shortage',
      'SETUP_ADJUSTMENT': 'Setup & Adjustment',
      'OTHER': 'Other'
    };

    const totalCauseMin = Object.values(causeCounts).reduce((a, b) => a + b, 0) || 1;
    const downtimeByCause = Object.entries(causeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([cause, minutes]) => ({
        cause: causeLabelMap[cause] || cause,
        percentage: Math.round((minutes / totalCauseMin) * 100),
        color: causeColorMap[cause] || '#64748b'
      }));

    // Production vs Target
    const orders = await prisma.productionOrder.findMany({
      where: { startDate: { gte: sevenDaysAgo } },
      select: { startDate: true, producedQty: true, targetQty: true },
      orderBy: { startDate: 'asc' }
    });

    const pvtByDate: Record<string, { actual: number; target: number }> = {};
    for (const o of orders) {
      const dateKey = o.startDate.toISOString().split('T')[0];
      if (!pvtByDate[dateKey]) pvtByDate[dateKey] = { actual: 0, target: 0 };
      pvtByDate[dateKey].actual += o.producedQty;
      pvtByDate[dateKey].target += o.targetQty;
    }

    const productionVsTarget: { date: string; actual: number; target: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3_600_000);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (pvtByDate[dateKey]) {
        productionVsTarget.push({ date: label, ...pvtByDate[dateKey] });
      } else {
        productionVsTarget.push({
          date: label,
          actual: Math.round(totalOutput / 7),
          target: Math.round(lines.reduce((s, l) => s + l.targetOutput, 0) / 7)
        });
      }
    }

    // Bottleneck Analysis
    const problemLines = lines
      .filter(l => l.status === 'DOWN' || l.status === 'WARNING')
      .sort((a, b) => a.oee - b.oee);

    let bottleneck: any = null;
    if (problemLines.length > 0) {
      const bl = problemLines[0];
      const criticalMachine = bl.machines.find(m => m.status === 'CRITICAL' || m.status === 'DOWN');
      bottleneck = {
        lineCode: bl.lineCode,
        lineName: bl.name,
        oee: bl.oee,
        reason: criticalMachine
          ? `Machine ${criticalMachine.code} - ${criticalMachine.name} (Health: ${criticalMachine.healthScore}%)`
          : `${bl.name} performance constraint`,
        impact: bl.status === 'DOWN' ? 'HIGH' : 'MEDIUM',
        recommendation: bl.status === 'DOWN'
          ? `Critical maintenance required. Reallocate pending orders to Line 3.`
          : `Monitor thermal and vibration thresholds.`
      };
    }

    return res.json({
      metrics: {
        oee: parseFloat(avgOee.toFixed(1)),
        availability: parseFloat(avgAvail.toFixed(1)),
        performance: parseFloat(avgPerf.toFixed(1)),
        quality: parseFloat(avgQual.toFixed(1)),
        totalOutput,
        downtimeHours: parseFloat(totalDowntime.toFixed(1))
      },
      productionLines: lines.map(l => ({
        id: l.id,
        code: l.lineCode,
        name: l.name,
        status: l.status,
        oee: l.oee,
        output: l.currentOutput,
        target: l.targetOutput,
        availability: l.availability,
        performance: l.performance,
        quality: l.quality,
        downtimeHours: l.downtimeHours,
        activeProduct: l.productionOrders[0]?.productCode || 'Standard Denim 180cm',
      })),
      oeeTrend,
      downtimeByCause,
      productionVsTarget,
      bottleneck
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Production Line Details
// ---------------------------------------------------------------------------
export async function getProductionLineById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const line = await prisma.productionLine.findFirst({
      where: { OR: [{ id }, { lineCode: id }] },
      include: {
        machines: { include: { sensors: true } },
        productionOrders: { orderBy: { startDate: 'desc' }, take: 10 },
        downtimeEvents: { orderBy: { startTime: 'desc' }, take: 20 },
        qualityEvents: { orderBy: { timestamp: 'desc' }, take: 10 }
      }
    });

    if (!line) {
      return res.status(404).json({ error: 'Production line not found' });
    }

    return res.json(line);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getProductionLines(req: Request, res: Response) {
  try {
    const lines = await prisma.productionLine.findMany({
      include: {
        machines: { select: { id: true, code: true, name: true, status: true, healthScore: true } }
      },
      orderBy: { oee: 'asc' }
    });
    return res.json(lines);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// OEE Analysis
// ---------------------------------------------------------------------------
export async function getOeeAnalysis(req: Request, res: Response) {
  try {
    const lines = await prisma.productionLine.findMany();

    return res.json({
      lines: lines.map(l => ({
        id: l.id,
        code: l.lineCode,
        name: l.name,
        oee: l.oee,
        availability: l.availability,
        performance: l.performance,
        quality: l.quality,
        status: l.status
      })),
      overall: {
        oee: parseFloat((lines.reduce((s, l) => s + l.oee, 0) / (lines.length || 1)).toFixed(1)),
        availability: parseFloat((lines.reduce((s, l) => s + l.availability, 0) / (lines.length || 1)).toFixed(1)),
        performance: parseFloat((lines.reduce((s, l) => s + l.performance, 0) / (lines.length || 1)).toFixed(1)),
        quality: parseFloat((lines.reduce((s, l) => s + l.quality, 0) / (lines.length || 1)).toFixed(1))
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Performance, Downtime, Quality & Orders
// ---------------------------------------------------------------------------
export async function getProductionPerformance(req: Request, res: Response) {
  try {
    const lines = await prisma.productionLine.findMany({
      include: { productionOrders: { take: 5, orderBy: { startDate: 'desc' } } }
    });

    return res.json({
      lines: lines.map(l => ({
        lineCode: l.lineCode,
        lineName: l.name,
        performancePct: l.performance,
        currentOutput: l.currentOutput,
        targetOutput: l.targetOutput,
        efficiencyRatio: parseFloat(((l.currentOutput / (l.targetOutput || 1)) * 100).toFixed(1)),
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getProductionDowntime(req: Request, res: Response) {
  try {
    const downtimeEvents = await prisma.downtimeEvent.findMany({
      include: { line: true, machine: true },
      orderBy: { startTime: 'desc' },
      take: 50,
    });
    return res.json(downtimeEvents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getProductionQuality(req: Request, res: Response) {
  try {
    const qualityEvents = await prisma.qualityEvent.findMany({
      include: { line: true, machine: true },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    return res.json(qualityEvents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getProductionOrders(req: Request, res: Response) {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: { line: { select: { lineCode: true, name: true, status: true } } },
      orderBy: { startDate: 'desc' }
    });
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
