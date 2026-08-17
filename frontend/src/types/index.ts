export type RoleType =
  | 'TECHNICIAN'
  | 'MAINTENANCE_MANAGER'
  | 'PRODUCTION_MANAGER'
  | 'INDUSTRIAL_DIRECTOR'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  department?: string;
  avatar?: string;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: string;
  location?: string;
  criticality?: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DOWN';
  operatingMode?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  healthScore: number;
  anomalyScore: number;
  failureProbability: number;
  predictedRulDays: number;
  activeAlertsCount: number;
  ratedPower?: number;
  nominalRPM?: number;
  components?: MachineComponent[];
  sensors?: Sensor[];
  description?: string;
}

export interface MachineComponent {
  id: string;
  machineId: string;
  code: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  status: string;
  health: number;
  healthIndex?: number;
  riskScore?: number;
  rul?: number;
  vibrationRms: number;
  temperature: number;
  position3D?: string;
  dxfReference?: string;
  sensors?: Sensor[];
}

export interface Sensor {
  id: string;
  code?: string;
  name: string;
  type: string;
  unit: string;
  value?: number;
  warningThreshold: number;
  criticalThreshold: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  signalQuality: number;
  samplingRateHz?: number;
  componentName?: string;
  componentCode?: string;
  machineCode?: string;
  lastSeen?: string;
}

export interface TelemetrySnapshot {
  machineCode: string;
  timestamp: string;
  vibRMS: number;
  vibX?: number;
  vibY?: number;
  vibZ?: number;
  tempBearing: number;
  tempMotor: number;
  current: number;
  speedRpm: number;
  healthIndex: number;
  anomalyScore: number;
  isAnomaly: boolean;
  severity: string;
  estimatedRulDays: number;
}

export type Telemetry = TelemetrySnapshot;

export interface Alarm {
  id: string;
  code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  timestamp: string;
  machine?: { id: string; code: string; name: string; status: string };
  anomalies?: any[];
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  dueDate?: string;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  checklistJson?: string;
  machine: { id?: string; code: string; name: string; status?: string };
  assignedTo?: { id: string; name: string; email?: string };
}

export interface MaintenancePlan {
  id: string;
  machineCode: string;
  machineName: string;
  title: string;
  type: string;
  scheduledDate: string;
  durationHours: number;
  priority: string;
  status: string;
  assignedTechnician?: string;
}

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  machineType: string;
  quantityInStock: number;
  minThreshold: number;
  unitCost: number;
  supplier: string;
  location: string;
}

export interface ProductionLine {
  id: string;
  code: string;
  name: string;
  status: 'RUNNING' | 'WARNING' | 'DOWN';
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  output: number;
  target: number;
  downtimeHours: number;
  activeProduct?: string;
}

export type ActionCategory =
  | 'DIAGNOSTIC'
  | 'MAINTENANCE'
  | 'PRODUCTION'
  | 'STRATEGY'
  | 'COPILOT'
  | 'EXPORT'
  | 'SECURITY'
  | 'SYSTEM';

export interface HistoryAction {
  id: string;
  timestamp: string;
  role: RoleType;
  userName: string;
  action: string;
  category: ActionCategory;
  details: string;
  machineCode?: string;
  status?: 'SUCCESS' | 'WARNING' | 'INFO' | 'CRITICAL';
  metadata?: Record<string, any>;
}

