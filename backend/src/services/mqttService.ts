import mqtt, { MqttClient } from 'mqtt';
import { PrismaClient } from '@prisma/client';
import { RealtimeService } from './websocket.js';
import { DataQualityService } from './dataQuality.js';

const prisma = new PrismaClient();

export class MqttIngestionService {
  private static instance: MqttIngestionService;
  private client: MqttClient | null = null;
  private isConnected = false;
  private messageCount = 0;
  private lastMessageTimestamp: Date | null = null;
  private brokerUrl: string;

  private constructor() {
    this.brokerUrl = process.env.MQTT_BROKER || process.env.MQTT_URL || 'mqtt://localhost:1883';
  }

  public static getInstance(): MqttIngestionService {
    if (!MqttIngestionService.instance) {
      MqttIngestionService.instance = new MqttIngestionService();
    }
    return MqttIngestionService.instance;
  }

  public initialize(): void {
    if (this.client) {
      return;
    }

    const clientId = process.env.MQTT_CLIENT_ID || `maintix_core_${Math.random().toString(16).substring(2, 8)}`;

    console.log(`📡 [MQTT Ingest] Connecting to broker at ${this.brokerUrl} (client: ${clientId})...`);

    try {
      this.client = mqtt.connect(this.brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log(`✅ [MQTT Ingest] Connected successfully to Mosquitto Broker at ${this.brokerUrl}`);

        const topics = [
          'maintix/telemetry',
          'maintix/machines/+/telemetry',
          'maintix/alarms',
          'maintix/data-quality'
        ];

        this.client?.subscribe(topics, (err) => {
          if (err) {
            console.error('❌ [MQTT Ingest] Subscription error:', err.message);
          } else {
            console.log(`📋 [MQTT Ingest] Subscribed to topics: ${topics.join(', ')}`);
          }
        });
      });

      this.client.on('message', (topic, payloadBuffer) => {
        this.handleIncomingMessage(topic, payloadBuffer).catch((err) => {
          console.error(`⚠️ [MQTT Ingest] Error processing message on ${topic}:`, err.message);
        });
      });

      this.client.on('reconnect', () => {
        console.log('🔄 [MQTT Ingest] Reconnecting to broker...');
      });

      this.client.on('offline', () => {
        this.isConnected = false;
        console.warn('⚠️ [MQTT Ingest] Broker is offline. Retrying in background...');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        console.warn(`⚠️ [MQTT Ingest] Broker connection notice: ${err.message}`);
      });
    } catch (err: any) {
      console.warn(`⚠️ [MQTT Ingest] Failed to initialize MQTT client: ${err.message}`);
    }
  }

  private async handleIncomingMessage(topic: string, payloadBuffer: Buffer): Promise<void> {
    const rawString = payloadBuffer.toString();
    let data: any;

    try {
      data = JSON.parse(rawString);
    } catch {
      console.warn(`⚠️ [MQTT Ingest] Invalid JSON on topic ${topic}`);
      return;
    }

    this.messageCount++;
    this.lastMessageTimestamp = new Date();

    // Extract machine identifier from topic (e.g. maintix/machines/TX-1250-A/telemetry) or payload
    let targetCode = data.machineId || data.machine_id || data.machineCode;
    if (!targetCode && topic.includes('/machines/')) {
      const parts = topic.split('/');
      const machineIndex = parts.indexOf('machines') + 1;
      if (machineIndex > 0 && machineIndex < parts.length) {
        targetCode = parts[machineIndex];
      }
    }

    // 1. Data Quality Assessment
    const qualityResult = DataQualityService.getInstance().validateTelemetryPayload(data);

    // 2. Resolve Machine in Database
    let machine = null;
    if (targetCode) {
      machine = await prisma.machine.findFirst({
        where: { OR: [{ code: targetCode }, { id: targetCode }] }
      });
    }

    if (!machine) {
      machine = await prisma.machine.findFirst();
    }

    if (!machine) {
      return;
    }

    // 3. Extract and normalize telemetry values
    const vibRMS = Number(data.vibRMS ?? data.vib_rms ?? data.vibration_rms ?? 1.4);
    const vibPeak = Number(data.vibPeak ?? data.vib_peak ?? data.vibration_peak ?? (vibRMS * 1.5));
    const tempMotor = Number(data.tempMotor ?? data.temp_motor ?? data.temperature_motor ?? 45.0);
    const tempBearing = Number(data.tempBearing ?? data.temp_bearing ?? data.temperature_bearing ?? 42.0);
    const tempGearbox = Number(data.tempGearbox ?? data.temp_gearbox ?? data.temperature_gearbox ?? 40.0);
    const current = Number(data.current ?? 4.2);
    const voltage = Number(data.voltage ?? 400.0);
    const speedRpm = Number(data.speedRpm ?? data.speed_rpm ?? data.rotation_speed ?? 1450.0);
    const activePower = Number(data.activePower ?? data.active_power ?? data.power_active ?? 2.8);

    // Dynamic edge prognostics heuristics
    const vibExcess = Math.max(0.0, vibRMS - 1.4);
    const tempExcess = Math.max(0.0, tempBearing - 42.0);
    const isAnomaly = vibRMS > 4.5 || tempBearing > 58.0 || current > 6.0;
    const anomalyScore = Math.min(0.99, Math.max(0.02, vibExcess * 0.12 + tempExcess * 0.03));
    const healthIndex = isAnomaly ? (vibRMS > 7.0 ? 18.0 : 42.0) : Math.max(80.0, 98.0 - (vibExcess * 5.0));
    const estimatedRulDays = isAnomaly ? (vibRMS > 7.0 ? 5 : 18) : 60;
    const severity = vibRMS > 7.0 ? 'CRITICAL' : vibRMS > 4.5 ? 'HIGH' : tempBearing > 50.0 ? 'MEDIUM' : 'LOW';

    // 4. Persist Telemetry Record
    const saved = await prisma.telemetry.create({
      data: {
        machineId: machine.id,
        timestamp: new Date(),
        vibRMS,
        vibPeak,
        vibX: Number(data.vibX ?? data.vibration_x ?? 0.8),
        vibY: Number(data.vibY ?? data.vibration_y ?? 0.9),
        vibZ: Number(data.vibZ ?? data.vibration_z ?? 0.7),
        tempMotor,
        tempBearing,
        tempGearbox,
        tempAmbient: Number(data.tempAmbient ?? data.temp_ambient ?? 24.0),
        current,
        voltage,
        speedRpm,
        activePower,
        torque: Number(data.torque ?? 18.5),
        airPressure: Number(data.airPressure ?? data.air_pressure ?? 6.2),
        humidity: Number(data.humidity ?? 55.0),
        dustLevel: Number(data.dustLevel ?? data.dust_level ?? 12.0),
        healthIndex,
        anomalyScore,
        isAnomaly,
        anomalyType: isAnomaly ? (vibRMS > 4.5 ? 'Bearing Outer-Race Wear' : 'Thermal Elevation') : 'None',
        severity,
        estimatedRulDays,
        sourceType: 'MQTT'
      }
    });

    // 5. Update Machine Health Status in DB
    await prisma.machine.update({
      where: { id: machine.id },
      data: {
        healthScore: healthIndex,
        anomalyScore,
        status: isAnomaly ? (severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING') : 'HEALTHY',
        predictedRulDays: estimatedRulDays
      }
    });

    // 6. Generate Alert if Threshold Breached
    if (isAnomaly && (severity === 'CRITICAL' || severity === 'HIGH')) {
      const existingAlert = await prisma.alarm.findFirst({
        where: { machineId: machine.id, status: 'ACTIVE' }
      });

      if (!existingAlert) {
        await prisma.alarm.create({
          data: {
            machineId: machine.id,
            code: `ALM-MQTT-${Date.now()}`,
            severity,
            title: `Vibration anomaly breached threshold (${vibRMS.toFixed(1)} mm/s RMS)`,
            description: `Live MQTT telemetry from edge sensor detected ISO Zone D breach on ${machine.name}. Bearing temp: ${tempBearing.toFixed(1)}°C.`,
            status: 'ACTIVE',
            sourceType: 'MQTT'
          }
        });
      }
    }

    // 7. Broadcast via WebSockets to all connected dashboards
    RealtimeService.getInstance().broadcast('LIVE_TELEMETRY', {
      machineCode: machine.code,
      machineName: machine.name,
      timestamp: saved.timestamp,
      vibRMS,
      vibPeak,
      tempBearing,
      tempMotor,
      current,
      speedRpm,
      healthIndex,
      anomalyScore,
      isAnomaly,
      severity,
      estimatedRulDays,
      qualityScore: qualityResult.qualityScore,
      source: 'MQTT'
    });
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      brokerUrl: this.brokerUrl,
      totalMessagesIngested: this.messageCount,
      lastMessageTimestamp: this.lastMessageTimestamp,
      status: this.isConnected ? 'ONLINE' : 'DISCONNECTED'
    };
  }

  public shutdown(): void {
    if (this.client) {
      console.log('🛑 [MQTT Ingest] Closing MQTT connection...');
      this.client.end(true);
      this.client = null;
      this.isConnected = false;
    }
  }
}
