import { api } from './apiClient';

export interface MlRulPrediction {
  machine_id: string;
  model_version: string;
  health_index: number;
  rul_days: number;
  failure_probability: number;
  confidence: number;
  recommendation: string;
  dominant_signals: string[];
}

export interface MlAnomalyPrediction {
  machine_id: string;
  model_version: string;
  anomaly_score: number;
  is_anomaly: boolean;
  confidence: number;
  severity: string;
  anomaly_type: string;
  root_cause: string;
}

export interface MlFailurePrediction {
  machine_id: string;
  model_version: string;
  failure_type: string;
  failure_probability: number;
  confidence: number;
  affected_subsystem: string;
}

export interface MlRiskPrediction {
  machine_id: string;
  risk_score: number;
  risk_level: string;
  risk_reason: string;
  financial_exposure_usd: number;
}

export interface MlPolicyRecommendation {
  machine_id: string;
  recommended_action: string;
  action_code: number;
  expected_cost_usd: number;
  rationale: string;
  safety_advisory: string;
}

export interface MlRagResponse {
  answer: string;
  confidence: number;
  sources: { title: string; snippet: string }[];
  recommendedActions: string[];
  evidence?: string[];
}

export async function fetchRulPrediction(machineId: string): Promise<MlRulPrediction> {
  return api<MlRulPrediction>(`/api/ml/machines/${machineId}/rul`);
}

export async function fetchAnomalyPrediction(machineId: string): Promise<MlAnomalyPrediction> {
  return api<MlAnomalyPrediction>(`/api/ml/machines/${machineId}/anomaly`);
}

export async function fetchFailurePrediction(machineId: string): Promise<MlFailurePrediction> {
  return api<MlFailurePrediction>(`/api/ml/machines/${machineId}/failure`);
}

export async function fetchRiskPrediction(machineId: string): Promise<MlRiskPrediction> {
  return api<MlRiskPrediction>(`/api/ml/machines/${machineId}/risk`);
}

export async function fetchPolicyRecommendation(machineId: string): Promise<MlPolicyRecommendation> {
  return api<MlPolicyRecommendation>(`/api/ml/machines/${machineId}/policy`);
}

export async function fetchMlRagQuery(query: string, role: string, machineCode?: string): Promise<MlRagResponse> {
  return api<MlRagResponse>('/api/ml/rag/query', {
    method: 'POST',
    body: JSON.stringify({ query, role, machineCode })
  });
}