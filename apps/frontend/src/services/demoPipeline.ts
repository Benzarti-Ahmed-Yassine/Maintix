import { useAuthStore } from '@/contexts/authStore';

export type DemoRole = 'technician' | 'maintenance' | 'production' | 'director';

export interface DemoFeatureLink {
  label: string;
  path: string;
  description: string;
}

export interface DemoSnapshot {
  role: DemoRole;
  status: 'connected' | 'syncing';
  generatedAt: string;
  summary: string;
  highlights: string[];
  metrics: Array<{ label: string; value: string; delta?: string; accent: string }>;
  alerts: Array<{ title: string; severity: 'critical' | 'high' | 'medium' | 'low'; detail: string }>;
  connectedSystems: Array<{ name: string; status: 'Online' | 'Degraded' | 'Offline' }>;
  featureLinks: DemoFeatureLink[];
  machine?: { name: string; status: string; health: string };
  line?: { name: string; status: string; oee: string };
}

const roleMap: Record<DemoRole, DemoSnapshot> = {
  technician: {
    role: 'technician',
    status: 'connected',
    generatedAt: 'Just now',
    summary: 'Live vibration and thermal telemetry is streaming through the demo pipeline.',
    highlights: ['Bearing wear trending upward', 'Left-side vibration above threshold', 'Work-order recommendations queued'],
    metrics: [
      { label: 'Vibration', value: '11.8 mm/s', delta: '+0.6', accent: '#ef4444' },
      { label: 'Temp', value: '63.2 °C', delta: '+1.1', accent: '#f97316' },
      { label: 'RUL', value: '18 days', delta: '78%', accent: '#00B7FF' },
      { label: 'Uptime', value: '97.4%', delta: '+1.2%', accent: '#22c55e' },
    ],
    alerts: [
      { title: 'Bearing left-side drift', severity: 'critical', detail: 'Condition-based alert generated from simulated sensor history.' },
      { title: 'Thermal envelope warning', severity: 'high', detail: 'Temperature is trending toward the maintenance threshold.' },
    ],
    connectedSystems: [
      { name: 'SAP PM', status: 'Online' },
      { name: 'MES', status: 'Online' },
      { name: 'CMMS', status: 'Degraded' },
      { name: 'MQTT', status: 'Online' },
    ],
    featureLinks: [
      { label: 'AI Copilot', path: '/app/copilot', description: 'Ask the assistant for root cause and actions' },
      { label: 'Digital Twin', path: '/app/digital-twin', description: 'Inspect the live machine state' },
      { label: 'Connected Systems', path: '/app/connected-systems', description: 'Open the integration map' },
      { label: 'Knowledge Base', path: '/app/knowledge-base', description: 'Review procedures and playbooks' },
    ],
    machine: { name: 'TX-1250-A', status: 'Critical', health: 'Needs intervention' },
  },
  maintenance: {
    role: 'maintenance',
    status: 'connected',
    generatedAt: 'Just now',
    summary: 'The maintenance plan and asset risk view are synchronized with the demo feed.',
    highlights: ['7 critical assets flagged', 'MTTR improving week over week', 'Three preventive jobs confirmed'],
    metrics: [
      { label: 'Critical Assets', value: '7', delta: '+2', accent: '#ef4444' },
      { label: 'MTBF', value: '256 h', delta: '+9 h', accent: '#00B7FF' },
      { label: 'Planned Jobs', value: '12', delta: '+3', accent: '#eab308' },
      { label: 'Availability', value: '95.8%', delta: '+1.6%', accent: '#22c55e' },
    ],
    alerts: [
      { title: 'Bearing swap backlog', severity: 'high', detail: 'Work order queue is building on the highest-risk asset.' },
      { title: 'Spare-part lead time', severity: 'medium', detail: 'Critical bearing stock is now under 48 hours.' },
    ],
    connectedSystems: [
      { name: 'SAP PM', status: 'Online' },
      { name: 'CMMS', status: 'Online' },
      { name: 'SCADA', status: 'Online' },
      { name: 'Inventory', status: 'Degraded' },
    ],
    featureLinks: [
      { label: 'Maintenance Plan', path: '/app/maintenance', description: 'Open the full maintenance planner' },
      { label: 'Reports', path: '/app/reports', description: 'Review fleet and reliability reports' },
      { label: 'Connected Systems', path: '/app/connected-systems', description: 'Inspect the integration network' },
      { label: 'Notifications', path: '/app/notifications', description: 'Review alert stream and escalations' },
    ],
  },
  production: {
    role: 'production',
    status: 'connected',
    generatedAt: 'Just now',
    summary: 'Production performance is being streamed from the plant-level demo pipeline.',
    highlights: ['Line 4 recovery is underway', 'OEE is steady despite changeover losses', 'Output target nearly achieved'],
    metrics: [
      { label: 'OEE', value: '78.6%', delta: '+2.1%', accent: '#00B7FF' },
      { label: 'Availability', value: '89.1%', delta: '+1.8%', accent: '#22c55e' },
      { label: 'Downtime', value: '12.4 h', delta: '-0.8 h', accent: '#f97316' },
      { label: 'Output', value: '125,430', delta: '+4.2%', accent: '#a78bfa' },
    ],
    alerts: [
      { title: 'Line 4 recovery', severity: 'high', detail: 'The blocked line is now in maintenance and rebalancing mode.' },
      { title: 'Changeover loss', severity: 'medium', detail: 'A setup delay is reducing throughput on Line 3.' },
    ],
    connectedSystems: [
      { name: 'MES', status: 'Online' },
      { name: 'SCADA', status: 'Online' },
      { name: 'Quality', status: 'Online' },
      { name: 'ERP', status: 'Degraded' },
    ],
    featureLinks: [
      { label: 'Production Lines', path: '/app/production', description: 'Open the full production overview' },
      { label: 'Reports', path: '/app/reports', description: 'Inspect daily performance reports' },
      { label: 'AI Copilot', path: '/app/copilot', description: 'Review recommendations for the shop floor' },
      { label: 'Connected Systems', path: '/app/connected-systems', description: 'Check the live plant integrations' },
    ],
    line: { name: 'Line 4', status: 'Recovering', oee: '74%' },
  },
  director: {
    role: 'director',
    status: 'connected',
    generatedAt: 'Just now',
    summary: 'The executive view is connected to the same industrial narrative as the plant teams.',
    highlights: ['Enterprise OEE trending upward', 'Savings target ahead of plan', 'Risk profile remains low'],
    metrics: [
      { label: 'ROI', value: '312%', delta: '+28%', accent: '#a78bfa' },
      { label: 'Risk', value: 'Low', delta: 'Stable', accent: '#22c55e' },
      { label: 'Downtime Cost', value: '$13.2K', delta: '-7%', accent: '#ef4444' },
      { label: 'AI Score', value: '92/100', delta: '+3', accent: '#00B7FF' },
    ],
    alerts: [
      { title: 'Budget efficiency', severity: 'medium', detail: 'Maintenance spend is outperforming the quarterly forecast.' },
      { title: 'Executive insight ready', severity: 'low', detail: 'The AI assistant has prepared a cross-site recommendation summary.' },
    ],
    connectedSystems: [
      { name: 'ERP', status: 'Online' },
      { name: 'BI', status: 'Online' },
      { name: 'MES', status: 'Online' },
      { name: 'Finance', status: 'Online' },
    ],
    featureLinks: [
      { label: 'Director Overview', path: '/app/director', description: 'Open the executive dashboard' },
      { label: 'Reports', path: '/app/reports', description: 'Inspect board-ready summaries' },
      { label: 'Knowledge Base', path: '/app/knowledge-base', description: 'Review governance docs and playbooks' },
      { label: 'Notifications', path: '/app/notifications', description: 'Track enterprise escalations' },
    ],
  },
};

export async function runDemoPipeline(role: DemoRole): Promise<DemoSnapshot> {
  const template = roleMap[role] ?? roleMap.technician;
  await new Promise((resolve) => setTimeout(resolve, 220));
  return {
    ...template,
    status: 'connected',
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export function useActiveRole(): DemoRole {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;
  if (role === 'maintenance' || role === 'production' || role === 'director') {
    return role;
  }
  return 'technician';
}
