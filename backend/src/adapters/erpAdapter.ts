import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ERPAsset {
  assetId: string;
  code: string;
  name: string;
  costCenter: string;
  purchaseValue: number;
  bookValue: number;
  depreciationYears: number;
  status: string;
}

export interface ERPSparePartStock {
  partNumber: string;
  name: string;
  stock: number;
  minimumStock: number;
  unitCost: number;
  supplier: string;
  reorderQuantity: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL';
}

export class MockERPAdapter {
  private static instance: MockERPAdapter;

  public static getInstance(): MockERPAdapter {
    if (!MockERPAdapter.instance) {
      MockERPAdapter.instance = new MockERPAdapter();
    }
    return MockERPAdapter.instance;
  }

  async getAsset(machineCode: string): Promise<ERPAsset | null> {
    const machine = await prisma.machine.findFirst({
      where: { OR: [{ code: machineCode }, { id: machineCode }] },
    });

    if (!machine) return null;

    return {
      assetId: machine.erpRef || `SAP-EQ-${machine.code}`,
      code: machine.code,
      name: machine.name,
      costCenter: 'CC-TEXTILE-WEAVING-04',
      purchaseValue: 285000.0,
      bookValue: 194500.0,
      depreciationYears: 10,
      status: machine.status,
    };
  }

  async getSparePart(partNumber: string) {
    return await prisma.sparePart.findFirst({
      where: { OR: [{ partNumber }, { id: partNumber }] },
      include: { supplierRel: true },
    });
  }

  async getSparePartStock(partNumber: string): Promise<ERPSparePartStock | null> {
    const part = await prisma.sparePart.findFirst({
      where: { OR: [{ partNumber }, { id: partNumber }, { name: { contains: partNumber } }] },
      include: { supplierRel: true },
    });

    if (!part) return null;

    const status = part.quantityInStock <= 3
      ? 'CRITICAL'
      : part.quantityInStock <= part.minThreshold
      ? 'LOW_STOCK'
      : 'IN_STOCK';

    return {
      partNumber: part.partNumber,
      name: part.name,
      stock: part.quantityInStock,
      minimumStock: part.minThreshold,
      unitCost: part.unitCost,
      supplier: part.supplierRel?.name || part.supplier,
      reorderQuantity: part.reorderQuantity,
      status,
    };
  }

  async getPurchaseOrders() {
    return await prisma.purchaseOrder.findMany({
      include: { supplier: true, sparePart: true },
      orderBy: { orderDate: 'desc' },
    });
  }

  async getMaintenanceCost(timeframeDays: number = 30) {
    const sinceDate = new Date(Date.now() - timeframeDays * 24 * 3600 * 1000);
    const workOrders = await prisma.workOrder.findMany({
      where: { createdAt: { gte: sinceDate } },
      select: { totalCost: true, laborCost: true, partsCost: true, status: true },
    });

    const totalCost = workOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0);
    const laborCost = workOrders.reduce((sum, o) => sum + (o.laborCost || 0), 0);
    const partsCost = workOrders.reduce((sum, o) => sum + (o.partsCost || 0), 0);

    return {
      timeframeDays,
      workOrdersCount: workOrders.length,
      totalMaintenanceCost: parseFloat(totalCost.toFixed(2)),
      laborCost: parseFloat(laborCost.toFixed(2)),
      partsCost: parseFloat(partsCost.toFixed(2)),
      currency: 'EUR',
    };
  }

  async getInventory(category?: string) {
    return await prisma.sparePart.findMany({
      where: category ? { category } : undefined,
      include: { supplierRel: true },
      orderBy: { quantityInStock: 'asc' },
    });
  }

  async getSuppliers() {
    return await prisma.supplier.findMany({
      include: { spareParts: true, purchaseOrders: true },
    });
  }
}
