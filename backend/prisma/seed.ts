import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Comprehensive MAINTIX Industrial Database Seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bIDataset.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reportSnapshot.deleteMany();
  await prisma.aIFeedback.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.qualityEvent.deleteMany();
  await prisma.downtimeEvent.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.maintenancePlan.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.anomaly.deleteMany();
  await prisma.alarm.deleteMany();
  await prisma.telemetry.deleteMany();
  await prisma.sensorHealth.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.machineComponent.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.productionLine.deleteMany();
  await prisma.factory.deleteMany();
  await prisma.knowledgeChunk.deleteMany();
  await prisma.knowledgeDocument.deleteMany();
  await prisma.modelVersion.deleteMany();
  await prisma.dataQualityRecord.deleteMany();
  await prisma.eRPRecord.deleteMany();
  await prisma.mESRecord.deleteMany();
  await prisma.sCADARecord.deleteMany();
  await prisma.user.deleteMany();

  // 2. Demo Users
  const passwordHash = await bcrypt.hash('maintix123', 10);

  const techUser = await prisma.user.create({
    data: {
      email: 'technician@maintix.io',
      passwordHash,
      name: 'Karim Ben Ali',
      role: 'TECHNICIAN',
      department: 'Field Diagnostics & Mechatronics',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
  });

  const maintMgr = await prisma.user.create({
    data: {
      email: 'maintenance@maintix.io',
      passwordHash,
      name: 'Sarah Mansour',
      role: 'MAINTENANCE_MANAGER',
      department: 'Reliability & Plant Maintenance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
  });

  const prodMgr = await prisma.user.create({
    data: {
      email: 'production@maintix.io',
      passwordHash,
      name: 'Youssef Trabelsi',
      role: 'PRODUCTION_MANAGER',
      department: 'Textile Production Line 4',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
  });

  const directorUser = await prisma.user.create({
    data: {
      email: 'director@maintix.io',
      passwordHash,
      name: 'Dr. Amine Rekik',
      role: 'INDUSTRIAL_DIRECTOR',
      department: 'Executive Operations & Strategy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@maintix.io',
      passwordHash,
      name: 'System Administrator',
      role: 'ADMIN',
      department: 'OT/IT Platform Engineering',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    },
  });

  console.log('✅ Created 5 standard demo users');

  // 3. Factory & Production Lines
  const factory = await prisma.factory.create({
    data: {
      code: 'FACTORY-TN-01',
      name: 'Tunisian Textile Demo Factory',
      location: 'Monastir Industrial Park, Zone Industrielle BP 42',
      country: 'Tunisia',
      timezone: 'UTC+1',
      status: 'OPERATIONAL',
    },
  });

  const line1 = await prisma.productionLine.create({
    data: {
      factoryId: factory.id,
      lineCode: 'Line 1',
      name: 'Spinning & Yarn Prep Line 1',
      status: 'RUNNING',
      oee: 84.3,
      availability: 92.1,
      performance: 89.4,
      quality: 96.2,
      currentOutput: 28500,
      targetOutput: 30000,
      downtimeHours: 2.1,
    },
  });

  const line2 = await prisma.productionLine.create({
    data: {
      factoryId: factory.id,
      lineCode: 'Line 2',
      name: 'Weaving Line 2 - Heavy Canvas',
      status: 'WARNING',
      oee: 74.1,
      availability: 84.5,
      performance: 82.0,
      quality: 92.5,
      currentOutput: 22100,
      targetOutput: 26000,
      downtimeHours: 4.8,
    },
  });

  const line3 = await prisma.productionLine.create({
    data: {
      factoryId: factory.id,
      lineCode: 'Line 3',
      name: 'Weaving Line 3 - Lightweight Jacquard',
      status: 'RUNNING',
      oee: 88.9,
      availability: 94.2,
      performance: 92.5,
      quality: 97.8,
      currentOutput: 31200,
      targetOutput: 32000,
      downtimeHours: 1.2,
    },
  });

  const line4 = await prisma.productionLine.create({
    data: {
      factoryId: factory.id,
      lineCode: 'Line 4',
      name: 'Weaving Line 4 - Premium Denim',
      status: 'DOWN',
      oee: 45.2,
      availability: 58.0,
      performance: 71.2,
      quality: 89.4,
      currentOutput: 14800,
      targetOutput: 28000,
      downtimeHours: 12.4,
    },
  });

  const line5 = await prisma.productionLine.create({
    data: {
      factoryId: factory.id,
      lineCode: 'Line 5',
      name: 'Dyeing & Finishing Line 5',
      status: 'RUNNING',
      oee: 81.5,
      availability: 89.8,
      performance: 86.2,
      quality: 95.1,
      currentOutput: 28830,
      targetOutput: 34000,
      downtimeHours: 3.5,
    },
  });

  console.log('✅ Created Factory & 5 Production Lines');

  // 4. Primary Reference Machine: PCL-GMX-001 (Picanol GamMax-8-R-190)
  const machineRef = await prisma.machine.create({
    data: {
      code: 'PCL-GMX-001',
      name: 'Picanol GamMax-8-R-190 Rapier Loom #01',
      type: 'Rapier Weaving Loom',
      factoryId: factory.id,
      productionLineId: line4.id,
      location: 'Bay 4 - Loom Cell 01',
      criticality: 'CRITICAL',
      status: 'CRITICAL',
      operatingMode: 'AUTOMATIC',
      manufacturer: 'Picanol',
      model: 'GamMax-8-R-190',
      serialNumber: 'SN-2024-PCLGMX001',
      installationDate: new Date('2024-01-15'),
      ratedPower: 7.5,
      nominalRPM: 1450.0,
      nominalTemperature: 45.0,
      nominalCurrent: 4.2,
      nominalVoltage: 400.0,
      maintenanceInterval: 90,
      sourceType: 'SIMULATED',
      description: 'Primary reference textile rapier weaving loom equipped with continuous vibration and thermal monitoring.',
      healthScore: 22.0,
      anomalyScore: 0.92,
      failureProbability: 0.88,
      predictedRulDays: 18,
      activeAlertsCount: 3,
      erpRef: 'SAP-PM-EQ-10042',
      mesRef: 'MES-L4-PCLGMX001',
      scadaRef: 'SCADA-PLC-04-01',
    },
  });

  // Alias machine TX-1250-A for backward-compatibility with UI references
  const machineA = await prisma.machine.create({
    data: {
      code: 'TX-1250-A',
      name: 'Picanol OptiMax-i 1250 High-Speed Loom A12',
      type: 'Air-Jet Weaving Loom',
      factoryId: factory.id,
      productionLineId: line4.id,
      location: 'Bay 4 - Loom Cell 02',
      criticality: 'CRITICAL',
      status: 'CRITICAL',
      operatingMode: 'AUTOMATIC',
      manufacturer: 'Picanol OptiMax-i',
      model: 'OptiMax-i 1250',
      serialNumber: 'SN-2024-TX1250A',
      healthScore: 22.0,
      anomalyScore: 0.92,
      failureProbability: 0.88,
      predictedRulDays: 18,
      activeAlertsCount: 3,
      erpRef: 'SAP-PM-EQ-10043',
      mesRef: 'MES-L4-TX1250A',
      scadaRef: 'SCADA-PLC-04-02',
    },
  });

  const machineB = await prisma.machine.create({
    data: {
      code: 'TX-0672-B',
      name: 'Rieter G38 Ring Spinning Frame B06',
      type: 'Ring Spinning Frame',
      factoryId: factory.id,
      productionLineId: line2.id,
      location: 'Bay 2 - Spinning Section 1',
      criticality: 'HIGH',
      status: 'WARNING',
      operatingMode: 'AUTOMATIC',
      manufacturer: 'Rieter',
      model: 'G38 SpinFrame',
      serialNumber: 'SN-2023-TX0672B',
      healthScore: 58.0,
      anomalyScore: 0.78,
      failureProbability: 0.65,
      predictedRulDays: 25,
      activeAlertsCount: 2,
      erpRef: 'SAP-PM-EQ-10044',
      mesRef: 'MES-L2-TX0672B',
      scadaRef: 'SCADA-PLC-02-01',
    },
  });

  const machineC = await prisma.machine.create({
    data: {
      code: 'TX-0981-C',
      name: 'Itema R9500 Rapier Loom C09',
      type: 'Rapier Loom',
      factoryId: factory.id,
      productionLineId: line2.id,
      location: 'Bay 2 - Weaving Section 2',
      criticality: 'MEDIUM',
      status: 'WARNING',
      operatingMode: 'AUTOMATIC',
      manufacturer: 'Itema',
      model: 'R9500 Rapier',
      serialNumber: 'SN-2023-TX0981C',
      healthScore: 68.0,
      anomalyScore: 0.65,
      failureProbability: 0.42,
      predictedRulDays: 35,
      activeAlertsCount: 1,
      erpRef: 'SAP-PM-EQ-10045',
      mesRef: 'MES-L2-TX0981C',
      scadaRef: 'SCADA-PLC-02-02',
    },
  });

  const machineD = await prisma.machine.create({
    data: {
      code: 'TX-1123-D',
      name: 'Bruckner Stenter Heat Setting Frame D11',
      type: 'Finishing Stenter',
      factoryId: factory.id,
      productionLineId: line4.id,
      location: 'Bay 4 - Finishing Section',
      criticality: 'HIGH',
      status: 'CRITICAL',
      operatingMode: 'MAINTENANCE',
      manufacturer: 'Bruckner',
      model: 'Power-Frame Stenter',
      serialNumber: 'SN-2022-TX1123D',
      healthScore: 35.0,
      anomalyScore: 0.85,
      failureProbability: 0.82,
      predictedRulDays: 12,
      activeAlertsCount: 2,
      erpRef: 'SAP-PM-EQ-10046',
      mesRef: 'MES-L4-TX1123D',
      scadaRef: 'SCADA-PLC-04-03',
    },
  });

  const machineE = await prisma.machine.create({
    data: {
      code: 'TX-0777-E',
      name: 'Muratec Process Winder E07',
      type: 'Automated Winder',
      factoryId: factory.id,
      productionLineId: line1.id,
      location: 'Bay 1 - Winding Section',
      criticality: 'LOW',
      status: 'HEALTHY',
      operatingMode: 'AUTOMATIC',
      manufacturer: 'Muratec',
      model: 'Process Winder 21C',
      serialNumber: 'SN-2024-TX0777E',
      healthScore: 96.5,
      anomalyScore: 0.03,
      failureProbability: 0.02,
      predictedRulDays: 90,
      activeAlertsCount: 0,
      erpRef: 'SAP-PM-EQ-10047',
      mesRef: 'MES-L1-TX0777E',
      scadaRef: 'SCADA-PLC-01-01',
    },
  });

  console.log('✅ Created 6 Machines (Reference PCL-GMX-001 + Fleet)');

  // 5. Components for PCL-GMX-001 and TX-1250-A
  const loomMachines = [machineRef, machineA];

  for (const m of loomMachines) {
    const compMotor = await prisma.machineComponent.create({
      data: {
        machineId: m.id,
        code: `COMP-MOTOR-${m.code}`,
        name: 'Main AC Servo Drive Motor',
        type: 'Motor',
        manufacturer: 'Siemens Simotics',
        model: '1FK7083-5AF71',
        status: 'HEALTHY',
        health: 94.0,
        healthIndex: 94.0,
        riskScore: 0.08,
        rul: 164,
        vibrationRms: 1.8,
        temperature: 48.5,
        position3D: JSON.stringify({ x: -1.4, y: 0.9, z: 0.3 }),
        dxfReference: 'DXF-LAYER-MOTOR',
      },
    });

    const compBearingL = await prisma.machineComponent.create({
      data: {
        machineId: m.id,
        code: `COMP-BEARING-L-${m.code}`,
        name: 'Main Drive Shaft Bearing (Left)',
        type: 'Bearing',
        manufacturer: 'SKF Industrial',
        model: '6208-2RS / C3 High Precision',
        status: 'CRITICAL',
        health: 18.0,
        healthIndex: 18.0,
        riskScore: 0.92,
        rul: 18,
        vibrationRms: 11.2,
        temperature: 62.5,
        position3D: JSON.stringify({ x: -0.8, y: 0.6, z: 0.2 }),
        dxfReference: 'DXF-LAYER-BEARING-L',
      },
    });

    const compGearbox = await prisma.machineComponent.create({
      data: {
        machineId: m.id,
        code: `COMP-GEARBOX-${m.code}`,
        name: 'Planetary Gearbox Assembly',
        type: 'Gearbox',
        manufacturer: 'Wittenstein Alpha',
        model: 'LP+ 120-M01',
        status: 'WARNING',
        health: 72.0,
        healthIndex: 72.0,
        riskScore: 0.35,
        rul: 92,
        vibrationRms: 3.4,
        temperature: 52.0,
        position3D: JSON.stringify({ x: 0.2, y: 0.7, z: -0.2 }),
        dxfReference: 'DXF-LAYER-GEARBOX',
      },
    });

    const compRollers = await prisma.machineComponent.create({
      data: {
        machineId: m.id,
        code: `COMP-ROLLERS-${m.code}`,
        name: 'Warp Tension Control Rollers',
        type: 'Roller',
        manufacturer: 'Picanol Genuine',
        model: 'WARP-TENS-190',
        status: 'HEALTHY',
        health: 96.0,
        healthIndex: 96.0,
        riskScore: 0.04,
        rul: 240,
        vibrationRms: 0.9,
        temperature: 36.0,
        position3D: JSON.stringify({ x: 1.1, y: 0.4, z: 0.5 }),
        dxfReference: 'DXF-LAYER-ROLLERS',
      },
    });

    // 6. Comprehensive Sensors for Loom
    const sensorsData = [
      { code: 'SENS-VIB-01', name: 'Triaxial Vibration RMS (Left Bearing)', type: 'VIBRATION', unit: 'mm/s RMS', warningThreshold: 4.5, criticalThreshold: 7.1, status: 'CRITICAL', componentId: compBearingL.id, signalQuality: 99.8 },
      { code: 'SENS-VIB-X', name: 'Vibration X-Axis (Left Bearing)', type: 'VIBRATION', unit: 'mm/s', warningThreshold: 3.5, criticalThreshold: 6.0, status: 'CRITICAL', componentId: compBearingL.id, signalQuality: 99.5 },
      { code: 'SENS-VIB-Y', name: 'Vibration Y-Axis (Left Bearing)', type: 'VIBRATION', unit: 'mm/s', warningThreshold: 3.5, criticalThreshold: 6.0, status: 'CRITICAL', componentId: compBearingL.id, signalQuality: 99.2 },
      { code: 'SENS-VIB-Z', name: 'Vibration Z-Axis (Left Bearing)', type: 'VIBRATION', unit: 'mm/s', warningThreshold: 3.5, criticalThreshold: 6.0, status: 'CRITICAL', componentId: compBearingL.id, signalQuality: 99.4 },
      { code: 'SENS-TMP-01', name: 'Bearing Temperature (Left Side)', type: 'TEMPERATURE', unit: '°C', warningThreshold: 55.0, criticalThreshold: 70.0, status: 'CRITICAL', componentId: compBearingL.id, signalQuality: 99.9 },
      { code: 'SENS-TMP-02', name: 'Motor Surface Temperature', type: 'TEMPERATURE', unit: '°C', warningThreshold: 70.0, criticalThreshold: 85.0, status: 'HEALTHY', componentId: compMotor.id, signalQuality: 99.7 },
      { code: 'SENS-TMP-03', name: 'Gearbox Sump Temperature', type: 'TEMPERATURE', unit: '°C', warningThreshold: 60.0, criticalThreshold: 75.0, status: 'WARNING', componentId: compGearbox.id, signalQuality: 99.6 },
      { code: 'SENS-ELE-01', name: 'Motor Current Draw', type: 'CURRENT', unit: 'A', warningThreshold: 5.5, criticalThreshold: 7.0, status: 'HEALTHY', componentId: compMotor.id, signalQuality: 99.8 },
      { code: 'SENS-ELE-02', name: 'Main Line Voltage', type: 'VOLTAGE', unit: 'V', warningThreshold: 380.0, criticalThreshold: 430.0, status: 'HEALTHY', componentId: compMotor.id, signalQuality: 100.0 },
      { code: 'SENS-ELE-03', name: 'Active Power Consumption', type: 'POWER', unit: 'kW', warningThreshold: 6.5, criticalThreshold: 8.0, status: 'HEALTHY', componentId: compMotor.id, signalQuality: 99.5 },
      { code: 'SENS-SPD-01', name: 'Main Shaft Speed (RPM)', type: 'SPEED', unit: 'RPM', warningThreshold: 1200.0, criticalThreshold: 1600.0, status: 'HEALTHY', componentId: compMotor.id, signalQuality: 99.8 },
      { code: 'SENS-TRQ-01', name: 'Drive Torque', type: 'TORQUE', unit: 'Nm', warningThreshold: 22.0, criticalThreshold: 28.0, status: 'HEALTHY', componentId: compMotor.id, signalQuality: 99.1 },
      { code: 'SENS-ENV-01', name: 'Pneumatic Air Pressure', type: 'PRESSURE', unit: 'bar', warningThreshold: 5.5, criticalThreshold: 7.5, status: 'HEALTHY', componentId: compRollers.id, signalQuality: 99.4 },
      { code: 'SENS-ENV-02', name: 'Weave Room Humidity', type: 'HUMIDITY', unit: '%', warningThreshold: 45.0, criticalThreshold: 75.0, status: 'HEALTHY', componentId: null, signalQuality: 99.0 },
      { code: 'SENS-ENV-03', name: 'Lint & Dust Level', type: 'DUST', unit: 'ppm', warningThreshold: 25.0, criticalThreshold: 50.0, status: 'HEALTHY', componentId: null, signalQuality: 98.5 },
    ];

    for (const s of sensorsData) {
      const sensor = await prisma.sensor.create({
        data: {
          machineId: m.id,
          componentId: s.componentId,
          code: s.code,
          name: s.name,
          type: s.type,
          unit: s.unit,
          warningThreshold: s.warningThreshold,
          criticalThreshold: s.criticalThreshold,
          status: s.status,
          signalQuality: s.signalQuality,
          sourceType: 'SIMULATED',
        },
      });

      // Add sensor health record
      await prisma.sensorHealth.create({
        data: {
          sensorId: sensor.id,
          signalQuality: s.signalQuality,
          communicationHealth: 99.2,
          dataCompleteness: 100.0,
          noiseLevel: 0.02,
          signalDrift: 0.01,
          samplingQuality: 99.8,
          status: s.status === 'CRITICAL' ? 'WARNING' : 'HEALTHY',
        },
      });
    }

    // 7. Telemetry History (Last 12 hours progressing towards Stage 3 bearing degradation)
    for (let i = 1; i <= 12; i++) {
      const progress = i / 12;
      const isDegraded = progress > 0.4;
      const vibRmsVal = parseFloat((1.4 + progress * 9.8).toFixed(2));
      const tempBearingVal = parseFloat((42.0 + progress * 20.5).toFixed(1));

      await prisma.telemetry.create({
        data: {
          machineId: m.id,
          timestamp: new Date(Date.now() - (13 - i) * 3600 * 1000),
          tempMotor: parseFloat((45.0 + progress * 3.5).toFixed(1)),
          tempBearing: tempBearingVal,
          tempGearbox: parseFloat((40.0 + progress * 12.0).toFixed(1)),
          tempAmbient: 24.5,
          vibX: parseFloat((vibRmsVal * 0.75).toFixed(2)),
          vibY: parseFloat((vibRmsVal * 0.82).toFixed(2)),
          vibZ: parseFloat((vibRmsVal * 0.55).toFixed(2)),
          vibRMS: vibRmsVal,
          vibPeak: parseFloat((vibRmsVal * 1.5).toFixed(2)),
          crestFactor: parseFloat((1.5 + progress * 1.3).toFixed(2)),
          kurtosis: parseFloat((3.0 + progress * 2.2).toFixed(2)),
          skewness: parseFloat((0.1 + progress * 0.35).toFixed(2)),
          domFreq: 240.0,
          voltage: 400.0,
          current: parseFloat((4.0 + progress * 0.4).toFixed(2)),
          activePower: 2.9,
          reactivePower: 0.4,
          apparentPower: 2.93,
          powerFactor: 0.96,
          speedRpm: 1450.0,
          torque: 19.2,
          airPressure: 6.2,
          humidity: 55.0,
          dustLevel: 14.0,
          prodSpeed: 680.0,
          cycleTime: 0.088,
          healthIndex: parseFloat((96.5 - progress * 74.5).toFixed(1)),
          anomalyScore: parseFloat((0.03 + progress * 0.89).toFixed(2)),
          isAnomaly: isDegraded,
          anomalyType: isDegraded ? 'Bearing Degradation' : 'None',
          severity: progress > 0.7 ? 'CRITICAL' : progress > 0.4 ? 'HIGH' : 'LOW',
          estimatedRulDays: Math.round(90 - progress * 72),
          sourceType: 'SIMULATED',
        },
      });
    }

    // 8. Alarms & Anomalies
    const alarm1 = await prisma.alarm.create({
      data: {
        machineId: m.id,
        code: `ALM-VIB-${m.code}-01`,
        severity: 'CRITICAL',
        title: 'Abnormal vibration detected (Left Bearing — Stage 3 wear)',
        description: 'Vibration RMS on Left Main Bearing exceeded 11.2 mm/s (ISO 10816-3 Zone D breach: 4.5 mm/s)',
        status: 'ACTIVE',
        sourceType: 'SIMULATED',
      },
    });

    await prisma.alarm.create({
      data: {
        machineId: m.id,
        code: `ALM-TMP-${m.code}-02`,
        severity: 'HIGH',
        title: 'Bearing temperature threshold exceeded',
        description: 'Left Bearing temperature rose to 62.5°C (Operating limit: 55.0°C)',
        status: 'ACTIVE',
        sourceType: 'SIMULATED',
      },
    });

    await prisma.alarm.create({
      data: {
        machineId: m.id,
        code: `ALM-KURT-${m.code}-03`,
        severity: 'MEDIUM',
        title: 'Elevated kurtosis & crest factor on drive shaft',
        description: 'Signal impulsiveness indicates impending outer-race surface spalling.',
        status: 'ACTIVE',
        sourceType: 'SIMULATED',
      },
    });

    await prisma.anomaly.create({
      data: {
        machineId: m.id,
        alarmId: alarm1.id,
        anomalyType: 'Bearing Degradation (Outer Race Spalling)',
        confidence: 0.92,
        severity: 'CRITICAL',
        rootCause: 'Sub-surface micro-cracking and lubrication film breakdown on Left Drive Bearing.',
        affectedComponent: 'Main Shaft Bearing (Left)',
        metricsSnapshot: JSON.stringify({ vibRMS: 11.2, tempBearing: 62.5, current: 4.4, speedRpm: 1450, kurtosis: 4.9 }),
        sourceType: 'SIMULATED',
      },
    });

    // 9. Prediction Record
    await prisma.prediction.create({
      data: {
        machineId: m.id,
        modelVersion: 'v2.0.0',
        anomalyScore: 0.92,
        healthIndex: 22.0,
        failureProbability: 0.88,
        predictedRUL: 18,
        rulLowerBound: 14,
        rulUpperBound: 22,
        failureType: 'BEARING_WEAR',
        severity: 'CRITICAL',
        confidence: 0.94,
      },
    });
  }

  console.log('✅ Created Components, Sensors, Telemetry History, Alarms, and Predictions for Looms');

  // 10. ERP Suppliers, Spare Parts & Purchase Orders
  const supplierSKF = await prisma.supplier.create({
    data: {
      code: 'SUP-SKF-01',
      name: 'SKF Industrial Bearings & Motion',
      contactEmail: 'orders@skf-industrial.tn',
      contactPhone: '+216 71 889 000',
      leadTimeDays: 3,
      reliabilityRating: 99.2,
    },
  });

  const supplierSiemens = await prisma.supplier.create({
    data: {
      code: 'SUP-SIE-02',
      name: 'Siemens Industrial Automation',
      contactEmail: 'drives@siemens.com',
      contactPhone: '+216 71 900 123',
      leadTimeDays: 7,
      reliabilityRating: 98.4,
    },
  });

  const partBearing = await prisma.sparePart.create({
    data: {
      partNumber: 'SP-BRG-6208-SKF',
      name: 'SKF High-Precision Deep Groove Ball Bearing 6208-2RS / C3',
      category: 'Bearings',
      machineType: 'Rapier Weaving Loom',
      quantityInStock: 8,
      minThreshold: 3,
      unitCost: 45.00,
      supplierId: supplierSKF.id,
      supplier: 'SKF Industrial Bearings & Motion',
      location: 'Warehouse Shelf B-12',
      reorderQuantity: 20,
    },
  });

  const partMotor = await prisma.sparePart.create({
    data: {
      partNumber: 'SP-MTR-75KW-SIE',
      name: 'Siemens 7.5kW AC Servo Motor Drive Assembly',
      category: 'Motors',
      machineType: 'Rapier Weaving Loom',
      quantityInStock: 2,
      minThreshold: 1,
      unitCost: 1850.00,
      supplierId: supplierSiemens.id,
      supplier: 'Siemens Industrial Automation',
      location: 'Warehouse Bay Heavy-04',
      reorderQuantity: 2,
    },
  });

  const partGearbox = await prisma.sparePart.create({
    data: {
      partNumber: 'SP-GBX-LP120',
      name: 'Planetary Gearbox Reducer 1:5 Ratio',
      category: 'Gearboxes',
      machineType: 'Rapier Weaving Loom',
      quantityInStock: 4,
      minThreshold: 2,
      unitCost: 620.00,
      supplierId: supplierSKF.id,
      supplier: 'Wittenstein Motion',
      location: 'Warehouse Shelf C-08',
      reorderQuantity: 5,
    },
  });

  const partGrease = await prisma.sparePart.create({
    data: {
      partNumber: 'SP-LUB-LGMT3',
      name: 'SKF LGMT 3 General Purpose Industrial Grease 1kg',
      category: 'Lubricants',
      machineType: 'All Machines',
      quantityInStock: 24,
      minThreshold: 6,
      unitCost: 28.50,
      supplierId: supplierSKF.id,
      supplier: 'SKF Industrial Bearings & Motion',
      location: 'Chemical Locker L-02',
      reorderQuantity: 30,
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-0042',
      supplierId: supplierSKF.id,
      sparePartId: partBearing.id,
      quantity: 20,
      unitPrice: 45.00,
      totalAmount: 900.00,
      status: 'APPROVED',
      orderDate: new Date(),
      expectedDelivery: new Date(Date.now() + 3 * 86400000),
    },
  });

  console.log('✅ Created ERP Suppliers, Spare Parts & Purchase Orders');

  // 11. Maintenance Plans & Work Orders
  await prisma.maintenancePlan.createMany({
    data: [
      { machineId: machineRef.id, title: 'Left Bearing Replacement & Laser Alignment', type: 'PREDICTIVE', scheduledDate: new Date(Date.now() + 86400000 * 2), durationHours: 2.5, priority: 'CRITICAL', status: 'SCHEDULED', assignedTechnician: 'Karim Ben Ali' },
      { machineId: machineA.id, title: 'Bearing Replacement & Shaft Realignment', type: 'PREDICTIVE', scheduledDate: new Date(Date.now() + 86400000 * 2), durationHours: 2.5, priority: 'CRITICAL', status: 'SCHEDULED', assignedTechnician: 'Karim Ben Ali' },
      { machineId: machineB.id, title: 'Motor Stator Inspection & Thermal Scan', type: 'PREDICTIVE', scheduledDate: new Date(Date.now() + 86400000 * 4), durationHours: 2.0, priority: 'HIGH', status: 'PLANNED', assignedTechnician: 'Karim Ben Ali' },
      { machineId: machineC.id, title: 'Rapier Belt Tension Calibration', type: 'PREVENTIVE', scheduledDate: new Date(Date.now() + 86400000 * 6), durationHours: 1.5, priority: 'MEDIUM', status: 'PLANNED', assignedTechnician: 'Karim Ben Ali' },
      { machineId: machineD.id, title: 'Stenter Oven Heat Exchanger Cleaning', type: 'PREVENTIVE', scheduledDate: new Date(Date.now() + 86400000 * 7), durationHours: 3.0, priority: 'HIGH', status: 'PLANNED', assignedTechnician: 'Karim Ben Ali' },
    ],
  });

  await prisma.workOrder.create({
    data: {
      orderNumber: 'WO-2026-0891',
      machineId: machineRef.id,
      title: 'Urgent Left Main Shaft Bearing Replacement (SP-BRG-6208-SKF)',
      description: 'Replace degraded left bearing showing 11.2 mm/s RMS vibration. Re-grease with SKF LGMT 3 and verify shaft radial runout <= 0.02 mm.',
      type: 'PREDICTIVE',
      priority: 'URGENT',
      status: 'OPEN',
      createdById: techUser.id,
      assignedToId: techUser.id,
      dueDate: new Date(Date.now() + 86400000 * 2),
      sparePartsUsed: JSON.stringify([{ partNumber: 'SP-BRG-6208-SKF', quantity: 1, unitCost: 45.00 }, { partNumber: 'SP-LUB-LGMT3', quantity: 1, unitCost: 28.50 }]),
      laborCost: 120.00,
      partsCost: 73.50,
      totalCost: 193.50,
      checklistJson: JSON.stringify([
        { step: 1, task: 'Lockout/Tagout (LOTO) electrical feed at breaker Bay-4', done: true },
        { step: 2, task: 'Disassemble outer drive protective casing', done: true },
        { step: 3, task: 'Extract worn SKF 6208-2RS bearing using hydraulic puller', done: false },
        { step: 4, task: 'Clean shaft housing with solvent and inspect journal for pitting', done: false },
        { step: 5, task: 'Heat new bearing with induction heater to 110°C and mount on shaft', done: false },
        { step: 6, task: 'Apply 15g SKF LGMT 3 high-temp grease', done: false },
        { step: 7, task: 'Verify shaft radial runout with dial test indicator (<= 0.02 mm)', done: false },
        { step: 8, task: 'Perform 10-minute test run and verify vibration RMS <= 1.5 mm/s', done: false }
      ]),
    },
  });

  console.log('✅ Created Maintenance Plans & Work Orders with Checklists');

  // 12. MES Production Orders, Downtime Events, Quality Events
  await prisma.productionOrder.create({
    data: {
      orderNumber: 'PO-MES-00152',
      lineId: line4.id,
      productCode: 'Organic Cotton Denim Fabric 180cm',
      targetQty: 50000,
      producedQty: 38400,
      status: 'IN_PRODUCTION',
      startDate: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.productionOrder.create({
    data: {
      orderNumber: 'PO-MES-00153',
      lineId: line2.id,
      productCode: 'Heavy Industrial Duck Canvas #10',
      targetQty: 35000,
      producedQty: 22100,
      status: 'IN_PRODUCTION',
      startDate: new Date(Date.now() - 2 * 86400000),
    },
  });

  await prisma.downtimeEvent.create({
    data: {
      lineId: line4.id,
      machineId: machineRef.id,
      startTime: new Date(Date.now() - 4 * 3600 * 1000),
      endTime: new Date(Date.now() - 1.5 * 3600 * 1000),
      durationMinutes: 150,
      causeCategory: 'MACHINE_FAILURE',
      rootCause: 'Bearing degradation vibration spike on PCL-GMX-001 causing automated emergency stop',
      financialImpact: 4200.00,
      sourceType: 'SIMULATED',
    },
  });

  await prisma.qualityEvent.create({
    data: {
      lineId: line4.id,
      machineId: machineRef.id,
      timestamp: new Date(),
      totalInspected: 12000,
      defectCount: 142,
      defectType: 'Weft Tension Inconsistency (Bearing Flaw Correlation)',
      scrapCost: 850.00,
      sourceType: 'SIMULATED',
    },
  });

  console.log('✅ Created MES Production Orders, Downtime & Quality Events');

  // 13. AI Recommendations for each role
  await prisma.aIRecommendation.create({
    data: {
      machineId: machineRef.id,
      role: 'TECHNICIAN',
      title: 'Bearing Replacement Required on PCL-GMX-001',
      diagnosis: 'Stage 3 Outer-Race Spalling detected on Left Main Shaft Bearing. Vibration RMS at 11.2 mm/s (critical limit: 4.5 mm/s).',
      confidence: 0.94,
      rationale: 'Telemetry indicates exponential vibration growth correlated with 62.5°C thermal rise. Historical failure pattern matches Picanol GamMax service bulletin TB-2023-04.',
      actionItems: JSON.stringify([
        'Replace Left Bearing with SKF 6208-2RS / C3 (Stock: 8 available in Shelf B-12)',
        'Check shaft radial runout with dial gauge (tolerance: <= 0.02 mm)',
        'Apply 15g SKF LGMT 3 high-temp grease upon reassembly',
        'Execute Work Order WO-2026-0891 checklist'
      ]),
      evidenceJson: JSON.stringify([
        'Vibration RMS: 11.2 mm/s (ISO Zone D breach)',
        'Bearing Temperature: 62.5°C (Threshold: 55.0°C)',
        'Kurtosis: 4.9 (Impulsive impact signals)',
        'Estimated RUL: 18 days'
      ]),
      sourcesJson: JSON.stringify([
        { title: 'Picanol GamMax-8-R-190 Maintenance Manual Section 4.2', snippet: 'Vibration velocity over 4.5 mm/s RMS indicates bearing outer race spalling.' },
        { title: 'SKF Bearing Installation & Lubrication Guide ISO 10816-3', snippet: 'Radial runout must remain under 0.02mm to prevent accelerated wear.' }
      ]),
      status: 'PENDING',
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      machineId: machineRef.id,
      role: 'MAINTENANCE_MANAGER',
      title: 'Fleet Risk Escalation: PCL-GMX-001 #1 Priority',
      diagnosis: 'Asset carries 92% failure risk ranking. Remaining Useful Life estimated at 18 days.',
      confidence: 0.95,
      rationale: 'Unplanned stoppage would halt Weaving Line 4 causing $24,650 in cumulative secondary damage and downtime costs.',
      actionItems: JSON.stringify([
        'Approve 2.5-hour scheduled maintenance window on Line 4',
        'Reserve 1x SKF 6208-2RS bearing from ERP inventory',
        'Assign Senior Technician Karim Ben Ali'
      ]),
      status: 'PENDING',
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      machineId: machineRef.id,
      role: 'PRODUCTION_MANAGER',
      title: 'Line 4 OEE Impact & Bottleneck Mitigation',
      diagnosis: 'Line 4 OEE dropped to 45.2% due to PCL-GMX-001 downtime. Estimated production loss: 105 meters/hour.',
      confidence: 0.93,
      rationale: 'Reallocating 30% weave volume to Line 3 maintains customer shipment deadline PO-MES-00152.',
      actionItems: JSON.stringify([
        'Approve planned maintenance window between shift changeovers (14:00 - 16:30)',
        'Shift 1,500m denim weaving schedule to Line 3'
      ]),
      status: 'PENDING',
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      machineId: machineRef.id,
      role: 'INDUSTRIAL_DIRECTOR',
      title: 'Executive Financial ROI & Avoided Cost Analysis',
      diagnosis: 'Proactive intervention on PCL-GMX-001 saves $24,650 in avoided catastrophic damage and production loss.',
      confidence: 0.97,
      rationale: 'Predictive decision intelligence delivers 312% annualized ROI on plant asset reliability.',
      actionItems: JSON.stringify([
        'Validate predictive maintenance strategy',
        'Review quarterly spare parts procurement budget'
      ]),
      status: 'PENDING',
    },
  });

  console.log('✅ Created Role-Aware AI Recommendations');

  // 14. Validated RAG Documents & Chunks
  const docManual = await prisma.knowledgeDocument.create({
    data: {
      title: 'Picanol GamMax-8-R-190 Rapier Loom Technical Manual',
      category: 'MANUAL',
      status: 'VALIDATED',
      version: '3.2',
      uploadedBy: 'System Administrator',
      content: `Picanol GamMax-8-R-190 Technical Specification & Maintenance Handbook.
Nominal Loom Speed: 680 picks/min. Main Drive: 7.5kW AC Servo with planetary gearbox reducer.
Main shaft supported by dual precision ball bearings (SKF 6208-2RS / C3).
Vibration thresholds according to ISO 10816-3 Class II:
- Zone A (Good): < 1.4 mm/s RMS
- Zone B (Acceptable): 1.4 - 2.8 mm/s RMS
- Zone C (Warning): 2.8 - 4.5 mm/s RMS
- Zone D (Critical / Danger): > 4.5 mm/s RMS.
When vibration exceeds 4.5 mm/s RMS with bearing temp > 55°C, immediate bearing replacement is mandatory to prevent motor stator damage.`,
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        documentId: docManual.id,
        chunkIndex: 0,
        content: 'Picanol GamMax-8-R-190 ISO 10816-3 Vibration Limits: Zone A < 1.4 mm/s, Zone B 1.4-2.8 mm/s, Zone C 2.8-4.5 mm/s, Zone D > 4.5 mm/s RMS. Exceeding Zone D signals critical bearing spalling.',
        metadata: JSON.stringify({ category: 'Vibration', section: '4.1' }),
      },
      {
        documentId: docManual.id,
        chunkIndex: 1,
        content: 'Bearing Replacement Procedure: Use SKF 6208-2RS / C3 bearing. Inductively heat to 110°C before fitting. Apply 15g SKF LGMT 3 grease. Verify dial indicator radial runout is <= 0.02 mm.',
        metadata: JSON.stringify({ category: 'Procedures', section: '4.2' }),
      },
    ],
  });

  const docProc = await prisma.knowledgeDocument.create({
    data: {
      title: 'Standard Operating Procedure: Main Drive Bearing Overhaul (PROC-BRG-01)',
      category: 'PROCEDURE',
      status: 'VALIDATED',
      version: '2.0',
      uploadedBy: 'Sarah Mansour',
      content: `SOP PROC-BRG-01: Main Drive Bearing Overhaul for Rapier Looms.
Safety: Apply LOTO lockout on 400V 3-phase feeder.
Required Tools: Induction bearing heater, hydraulic puller, torque wrench (45 Nm), dial indicator test gauge.
Consumables: 1x SKF 6208-2RS bearing, 15g SKF LGMT 3 high-temp grease, lint-free cleaning cloths.`,
    },
  });

  await prisma.knowledgeChunk.create({
    data: {
      documentId: docProc.id,
      chunkIndex: 0,
      content: 'PROC-BRG-01 Safety & Tools: Lockout 400V breaker. Tools: Induction heater, hydraulic puller, dial indicator. Verify torque to 45 Nm.',
      metadata: JSON.stringify({ category: 'Safety & Tools' }),
    },
  });

  console.log('✅ Created Validated Knowledge Documents & RAG Chunks');

  // 15. MLOps Model Version Registry
  await prisma.modelVersion.createMany({
    data: [
      {
        modelName: 'LightGBM_RUL_Champion',
        version: 'v2.0.0',
        taskType: 'RUL_PREDICTION',
        status: 'PRODUCTION',
        accuracy: 0.988,
        precision: 0.982,
        recall: 0.976,
        f1Score: 0.979,
        mae: 1.42,
        rmse: 2.15,
        isCurrent: true,
        datasetVersion: 'gold_phm_v2',
        parametersJson: JSON.stringify({ n_estimators: 300, learning_rate: 0.05, max_depth: 7, num_leaves: 63 }),
      },
      {
        modelName: 'Deep_AutoEncoder_Anomaly',
        version: 'v2.0.0',
        taskType: 'ANOMALY_DETECTION',
        status: 'PRODUCTION',
        accuracy: 0.984,
        precision: 0.975,
        recall: 0.968,
        f1Score: 0.971,
        mae: 0.04,
        rmse: 0.08,
        isCurrent: true,
        datasetVersion: 'gold_anomaly_v2',
        parametersJson: JSON.stringify({ hidden_dims: [64, 32, 16, 32, 64], epochs: 100, batch_size: 256 }),
      },
      {
        modelName: 'LightGBM_Failure_MultiClass',
        version: 'v2.0.0',
        taskType: 'FAILURE_CLASSIFICATION',
        status: 'PRODUCTION',
        accuracy: 0.978,
        precision: 0.972,
        recall: 0.965,
        f1Score: 0.968,
        mae: 0.05,
        rmse: 0.12,
        isCurrent: true,
        datasetVersion: 'gold_failure_v2',
        parametersJson: JSON.stringify({ n_estimators: 200, learning_rate: 0.05, max_depth: 6, class_weight: 'balanced' }),
      },
      {
        modelName: 'Safe_Offline_RL_Policy',
        version: 'v1.0.0',
        taskType: 'RL_POLICY',
        status: 'PRODUCTION',
        accuracy: 0.964,
        precision: 0.958,
        recall: 0.952,
        f1Score: 0.955,
        mae: 0.15,
        rmse: 0.32,
        isCurrent: true,
        datasetVersion: 'gold_rl_v1',
        parametersJson: JSON.stringify({ algorithm: 'behavior_cloning', discount_factor: 0.99, episodes: 1000 }),
      },
    ],
  });

  console.log('✅ Created MLOps Model Version Registry');

  // 16. BI Datasets & Report Snapshots
  const biDatasetsList = [
    { datasetCode: 'machines', tableName: 'dim_machine', description: 'Machine dimensional catalog with industrial specifications, nominal metrics, and line associations' },
    { datasetCode: 'sensor_readings', tableName: 'fact_sensor_reading', description: 'High-frequency synchronized sensor time-series telemetry' },
    { datasetCode: 'anomalies', tableName: 'fact_anomaly', description: 'Detected anomalies with root causes, confidence scores, and affected components' },
    { datasetCode: 'rul_predictions', tableName: 'fact_prediction', description: 'Remaining Useful Life (RUL) predictions and lower/upper bounds' },
    { datasetCode: 'maintenance_events', tableName: 'fact_maintenance', description: 'Preventive and predictive maintenance plans and history' },
    { datasetCode: 'work_orders', tableName: 'fact_work_order', description: 'CMMS maintenance work orders, labor/parts costs, and checklist execution' },
    { datasetCode: 'production_events', tableName: 'fact_production', description: 'MES production orders, output rates, and actual vs target metrics' },
    { datasetCode: 'downtime_events', tableName: 'fact_downtime', description: 'Unplanned downtime incidents, cause categories, and financial loss' },
    { datasetCode: 'oee', tableName: 'fact_oee', description: 'Overall Equipment Effectiveness (Availability, Performance, Quality) time-series' },
    { datasetCode: 'quality_events', tableName: 'fact_quality', description: 'Quality inspection flaws, scrap counts, and defect costs' },
    { datasetCode: 'financial_impact', tableName: 'fact_financial_impact', description: 'Avoided catastrophic failure savings, maintenance expenses, and ROI metrics' },
    { datasetCode: 'ai_predictions', tableName: 'fact_ai_prediction', description: 'AI copilot diagnostic reasoning, grounded evidence, and confidence scores' },
    { datasetCode: 'ai_feedback', tableName: 'fact_ai_feedback', description: 'Human engineer validation decisions and feedback for MLOps retraining' },
  ];

  for (const ds of biDatasetsList) {
    await prisma.bIDataset.create({
      data: {
        datasetCode: ds.datasetCode,
        tableName: ds.tableName,
        description: ds.description,
        schemaType: ds.tableName.startsWith('dim') ? 'DIMENSION' : 'FACT',
        recordCount: 150,
        checksum: `SHA256-${Date.now().toString(16)}-${ds.datasetCode}`,
      },
    });
  }

  const snapshot = await prisma.reportSnapshot.create({
    data: {
      snapshotCode: 'SNAP-2026-08-15-001',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      recordCount: 1420,
      dataSnapshot: JSON.stringify({
        factory: 'FACTORY-TN-01',
        totalMachines: 6,
        activeCriticalAlerts: 3,
        avgOee: 78.6,
        avoidedCostSavings: 24650.00,
      }),
    },
  });

  await prisma.report.create({
    data: {
      reportNumber: 'REP-2026-08-001',
      reportType: 'MACHINE_HEALTH',
      title: 'PCL-GMX-001 Health & Prognostics Diagnostic Report',
      factoryId: factory.id,
      productionLineId: line4.id,
      machineId: machineRef.id,
      periodStart: new Date(Date.now() - 7 * 86400000),
      periodEnd: new Date(),
      generatedBy: 'Karim Ben Ali',
      snapshotId: snapshot.id,
      fileLocation: '/exports/reports/REP-2026-08-001.pdf',
      summaryDataJson: JSON.stringify({
        healthScore: 22.0,
        rulDays: 18,
        dominantVibrationRMS: 11.2,
        recommendedAction: 'Replace Left Bearing SP-BRG-6208-SKF',
      }),
    },
  });

  // 17. Data Quality Baseline Record
  await prisma.dataQualityRecord.create({
    data: {
      datasetName: 'plant_telemetry_stream',
      totalRecords: 86400,
      missingPercent: 0.02,
      duplicatePercent: 0.00,
      invalidPercent: 0.01,
      stalePercent: 0.00,
      qualityScore: 99.7,
      status: 'EXCELLENT',
    },
  });

  // 18. System Notifications & Audit Log
  await prisma.notification.create({
    data: {
      userId: techUser.id,
      role: 'TECHNICIAN',
      severity: 'CRITICAL',
      title: 'Critical Alarm: PCL-GMX-001 Left Bearing',
      message: 'Vibration RMS reached 11.2 mm/s (Limit: 4.5 mm/s). Immediate inspection required.',
      linkUrl: '/technician/machines/PCL-GMX-001/sensors',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZED',
      entity: 'Factory',
      entityId: factory.id,
      details: 'MAINTIX Industrial Decision Intelligence platform successfully initialized with reference demo loom PCL-GMX-001.',
    },
  });

  console.log('✅ Created BI Datasets, Report Snapshot, Data Quality Record, Notifications & Audit Log');
  console.log('🎉 MAINTIX Database Seeding Complete! Platform is fully initialized.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
