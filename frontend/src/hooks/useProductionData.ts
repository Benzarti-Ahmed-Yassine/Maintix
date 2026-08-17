import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient.js';

export function useProductionOverview() {
  return useQuery({
    queryKey: ['productionOverview'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/production/overview');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useProductionLines() {
  return useQuery({
    queryKey: ['productionLines'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/production/lines');
      return data;
    },
  });
}

export function useProductionLineById(id: string) {
  return useQuery({
    queryKey: ['productionLine', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/production/lines/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 3000,
  });
}

export const useProductionLine = useProductionLineById;

export function useOeeAnalysis() {
  return useQuery({
    queryKey: ['oeeAnalysis'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/production/oee');
      return data;
    },
  });
}

export function useProductionPerformance() {
  return useQuery({
    queryKey: ['productionPerformance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/production/performance');
      return data;
    },
  });
}

export function useProductionDowntime() {
  return useQuery({
    queryKey: ['productionDowntime'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/production/downtime');
      return data;
    },
  });
}

export function useProductionQuality() {
  return useQuery({
    queryKey: ['productionQuality'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/production/quality');
      return data;
    },
  });
}

export function useProductionOrders() {
  return useQuery({
    queryKey: ['productionOrders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/production/orders');
      return data;
    },
  });
}
