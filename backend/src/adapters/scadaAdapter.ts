import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SCADATagMapping {
  nodeId: string;
  tagName: string;
  machineCode: string;
  metric: string;
  unit: string;
  pollingIntervalMs: number;
}

export class SCADAAdapter {
  private static instance: SCADAAdapter;
  private mappings: SCADATagMapping[] = [
    { nodeId: 'ns=2;s=PCL-GMX-001.VibrationRMS', tagName: 'PLC_PCLGMX001_VIB_RMS', machineCode: 'PCL-GMX-001', metric: 'vibRMS', unit: 'mm/s', pollingIntervalMs: 1000 },
    { nodeId: 'ns=2;s=PCL-GMX-001.TempBearingLeft', tagName: 'PLC_PCLGMX001_TMP_BRG', machineCode: 'PCL-GMX-001', metric: 'tempBearing', unit: '°C', pollingIntervalMs: 1000 },
    { nodeId: 'ns=2;s=PCL-GMX-001.MotorCurrent', tagName: 'PLC_PCLGMX001_CURR', machineCode: 'PCL-GMX-001', metric: 'current', unit: 'A', pollingIntervalMs: 1000 },
    { nodeId: 'ns=2;s=PCL-GMX-001.ShaftRPM', tagName: 'PLC_PCLGMX001_RPM', machineCode: 'PCL-GMX-001', metric: 'speedRpm', unit: 'RPM', pollingIntervalMs: 1000 },
    { nodeId: 'ns=2;s=TX-1250-A.VibrationRMS', tagName: 'PLC_TX1250A_VIB_RMS', machineCode: 'TX-1250-A', metric: 'vibRMS', unit: 'mm/s', pollingIntervalMs: 1000 },
    { nodeId: 'ns=2;s=TX-1250-A.TempBearingLeft', tagName: 'PLC_TX1250A_TMP_BRG', machineCode: 'TX-1250-A', metric: 'tempBearing', unit: '°C', pollingIntervalMs: 1000 },
  ];

  public static getInstance(): SCADAAdapter {
    if (!SCADAAdapter.instance) {
      SCADAAdapter.instance = new SCADAAdapter();
    }
    return SCADAAdapter.instance;
  }

  getMappings(): SCADATagMapping[] {
    return this.mappings;
  }

  async getTagValues() {
    const scadaRecords = await prisma.sCADARecord.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
    return scadaRecords;
  }

  async updateTagValue(tagName: string, value: number, quality: string = 'GOOD') {
    return await prisma.sCADARecord.upsert({
      where: { tagId: tagName },
      update: { currentVal: value, quality, timestamp: new Date() },
      create: { tagId: tagName, tagName, currentVal: value, quality, timestamp: new Date() },
    });
  }
}

export class OPCUAAdapter {
  private static instance: OPCUAAdapter;

  public static getInstance(): OPCUAAdapter {
    if (!OPCUAAdapter.instance) {
      OPCUAAdapter.instance = new OPCUAAdapter();
    }
    return OPCUAAdapter.instance;
  }

  getStatus() {
    return {
      endpoint: 'opc.tcp://localhost:4840/maintix/opcua',
      serverName: 'Kepware OPC-UA Industrial Gateway',
      securityMode: 'SignAndEncrypt',
      securityPolicy: 'Basic256Sha256',
      activeSessions: 4,
      monitoredNodesCount: 48,
      status: 'CONNECTED',
      latencyMs: 4,
      lastSync: new Date(),
    };
  }
}

export class MQTTAdapter {
  private static instance: MQTTAdapter;

  public static getInstance(): MQTTAdapter {
    if (!MQTTAdapter.instance) {
      MQTTAdapter.instance = new MQTTAdapter();
    }
    return MQTTAdapter.instance;
  }

  getTopics() {
    return [
      'maintix/machines/{machineId}/telemetry',
      'maintix/machines/{machineId}/status',
      'maintix/machines/{machineId}/alerts',
      'maintix/machines/{machineId}/health',
      'maintix/machines/{machineId}/commands',
    ];
  }

  getStatus() {
    return {
      brokerUrl: 'mqtt://localhost:1883',
      wsBrokerUrl: 'ws://localhost:9001',
      clientId: 'maintix-edge-backend-01',
      connectedClients: 8,
      messagesIngestedPerSec: 12.4,
      status: 'LIVE',
      latencyMs: 2,
    };
  }
}
