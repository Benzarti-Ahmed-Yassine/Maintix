import { Request, Response } from 'express';
import { MockERPAdapter } from '../adapters/erpAdapter.js';
import { MockMESAdapter } from '../adapters/mesAdapter.js';
import { SCADAAdapter, OPCUAAdapter, MQTTAdapter } from '../adapters/scadaAdapter.js';
import { DataQualityService } from '../services/dataQuality.js';

const erpAdapter = MockERPAdapter.getInstance();
const mesAdapter = MockMESAdapter.getInstance();
const scadaAdapter = SCADAAdapter.getInstance();
const opcuaAdapter = OPCUAAdapter.getInstance();
const mqttAdapter = MQTTAdapter.getInstance();
const dataQualityService = DataQualityService.getInstance();

export async function getIntegrationsOverview(req: Request, res: Response) {
  try {
    const dataQuality = await dataQualityService.getPlantDataQualityReport();
    const opcua = opcuaAdapter.getStatus();
    const mqtt = mqttAdapter.getStatus();

    return res.json({
      erp: {
        name: 'SAP PM / S4HANA Industrial ERP',
        status: 'CONNECTED',
        endpoint: 'https://sap-gateway.maintix.internal/sap/opu/odata/sap/PM_API',
        latencyMs: 14,
        lastSync: new Date(),
        mode: 'SIMULATED / DEMO',
      },
      mes: {
        name: 'Siemens Opcenter MES',
        status: 'CONNECTED',
        endpoint: 'https://mes-opcenter.maintix.internal/api/v2/production',
        latencyMs: 8,
        lastSync: new Date(),
        mode: 'SIMULATED / DEMO',
      },
      scada: {
        name: 'Schneider Wonderware / FactoryTalk SCADA',
        status: 'LIVE',
        endpoint: 'modbus.tcp://192.168.10.50:502',
        tagMappingsCount: scadaAdapter.getMappings().length,
        latencyMs: 3,
        mode: 'SIMULATED / DEMO',
      },
      opcua,
      mqtt,
      dataQuality,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getErpStatus(req: Request, res: Response) {
  try {
    const [costSummary, purchaseOrders, inventory, suppliers] = await Promise.all([
      erpAdapter.getMaintenanceCost(30),
      erpAdapter.getPurchaseOrders(),
      erpAdapter.getInventory(),
      erpAdapter.getSuppliers(),
    ]);

    return res.json({
      status: 'CONNECTED',
      system: 'SAP PM Module (Asset Management & Spare Parts Inventory)',
      mode: 'SIMULATED / DEMO',
      costSummary,
      purchaseOrders,
      inventory,
      suppliers,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getMesStatus(req: Request, res: Response) {
  try {
    const [oeeOverall, orders, downtime, quality] = await Promise.all([
      mesAdapter.getOEE(),
      mesAdapter.getProductionOrders(),
      mesAdapter.getDowntime(7),
      mesAdapter.getQuality(),
    ]);

    return res.json({
      status: 'CONNECTED',
      system: 'Siemens Opcenter MES (Plant Floor Execution & OEE)',
      mode: 'SIMULATED / DEMO',
      oeeOverall,
      orders,
      downtime,
      quality,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getScadaStatus(req: Request, res: Response) {
  try {
    const mappings = scadaAdapter.getMappings();
    const tagValues = await scadaAdapter.getTagValues();

    return res.json({
      status: 'CONNECTED',
      system: 'Plant Floor SCADA & PLC Tag Server',
      mode: 'SIMULATED / DEMO',
      mappings,
      tagValues,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOpcuaStatus(req: Request, res: Response) {
  try {
    return res.json(opcuaAdapter.getStatus());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
