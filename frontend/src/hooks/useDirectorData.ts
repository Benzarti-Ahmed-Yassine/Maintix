import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient.js';

export function useDirectorOverview() {
  return useQuery({
    queryKey: ['directorOverview'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/overview');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useDirectorKPIs() {
  return useQuery({
    queryKey: ['directorKPIs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/kpis');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useDirectorRisk() {
  return useQuery({
    queryKey: ['directorRisk'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/risk');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useDirectorFinancialImpact() {
  return useQuery({
    queryKey: ['directorFinancialImpact'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/financial-impact');
      return data;
    },
  });
}

export function useDirectorAiInsights() {
  return useQuery({
    queryKey: ['directorAiInsights'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/ai-insights');
      return data;
    },
  });
}

export function useDirectorOperations() {
  return useQuery({
    queryKey: ['directorOperations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/operations');
      return data;
    },
  });
}

export function useDirectorSystems() {
  return useQuery({
    queryKey: ['directorSystems'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/systems');
      return data;
    },
  });
}

export function useDirectorAlerts() {
  return useQuery({
    queryKey: ['directorAlerts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/director/alerts');
      return data;
    },
  });
}
