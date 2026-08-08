import { api } from './apiClient';

export interface DashboardMetric {
  title: string;
  value: string;
  description: string;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: string;
  timestamp: string;
}

export interface TechnicianTask {
  id: string;
  title: string;
  asset: string;
  due: string;
  status: 'Assigned' | 'In progress' | 'Review' | 'Complete';
  priority: 'Low' | 'Medium' | 'High';
}

export interface MaintenanceOverview {
  backlog: number;
  scheduledJobs: number;
  availability: number;
  assetRisk: number;
}

export interface ProductionMetric {
  label: string;
  value: string;
  unit: string;
  delta: string;
}

export interface ReportSummary {
  id: string;
  name: string;
  team: string;
  published: string;
  status: 'Ready' | 'Pending' | 'Scheduled';
}

export interface SystemStatus {
  id: string;
  name: string;
  connector: string;
  status: 'Healthy' | 'Warning' | 'Offline';
  latency: string;
}

export interface NotificationItem {
  id: string;
  category: string;
  message: string;
  time: string;
  status: 'Unread' | 'Read';
}

export interface AiResponse {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface AiSuggestion {
  id: string;
  label: string;
}

export async function fetchDashboardOverview() {
  return api<{ topMetrics: DashboardMetric[]; oeeLabels: string[]; oeeValues: number[]; backlogLabels: string[]; backlogValues: number[]; activeAlerts: AlertItem[] }>('/dashboard/overview');
}

export async function fetchTechnicianTasks(): Promise<TechnicianTask[]> {
  return api<TechnicianTask[]>('/technician/tasks');
}

export async function fetchMaintenanceOverview(): Promise<MaintenanceOverview> {
  return api<MaintenanceOverview>('/maintenance/overview');
}

export async function fetchProductionMetrics(): Promise<ProductionMetric[]> {
  return api<ProductionMetric[]>('/production/metrics');
}

export async function fetchDirectorKpis() {
  return {
    revenue: '$8.9M',
    utilization: '91%',
    downtime: '2.8%',
    riskScore: 'Low'
  };
}

export async function fetchConnectedSystems(): Promise<SystemStatus[]> {
  return api<SystemStatus[]>('/integrations/systems');
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return api<NotificationItem[]>('/notifications');
}

export async function fetchReportsSummary(): Promise<ReportSummary[]> {
  return api<ReportSummary[]>('/reports');
}

export async function fetchAiSuggestions(): Promise<AiSuggestion[]> {
  return api<AiSuggestion[]>('/ai/suggestions');
}

export async function fetchAiReply(question: string): Promise<AiResponse> {
  return api<AiResponse>('/ai/reply', {
    method: 'POST',
    body: JSON.stringify({ question })
  });
}
