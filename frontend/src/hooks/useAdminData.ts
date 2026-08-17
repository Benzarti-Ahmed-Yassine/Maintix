import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient.js';

export function useAdminDemoStatus() {
  return useQuery({
    queryKey: ['demoStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/demo/status');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useAdminScenarios() {
  return useQuery({
    queryKey: ['demoScenarios'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/demo/scenarios');
      return data;
    },
  });
}

export function useTriggerDemoScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { scenario: string; machineCode?: string }) => {
      const { data } = await apiClient.post('/api/admin/demo/scenario', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useResetDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/admin/demo/reset');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export const useDemoStatus = useAdminDemoStatus;
export const useDemoScenarios = useAdminScenarios;
export const useTriggerScenario = useTriggerDemoScenario;
export const useResetDemo = useResetDemoData;

export function useSeedDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scope?: string) => {
      const { data } = await apiClient.post('/api/admin/demo/seed', { scope: scope || 'FULL' });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useAdminIntegrations() {
  return useQuery({
    queryKey: ['adminIntegrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/integrations');
      return data;
    },
    refetchInterval: 5000,
  });
}

export function useAdminErpStatus() {
  return useQuery({
    queryKey: ['adminErpStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/erp');
      return data;
    },
  });
}

export function useAdminMesStatus() {
  return useQuery({
    queryKey: ['adminMesStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/mes');
      return data;
    },
  });
}

export function useAdminScadaStatus() {
  return useQuery({
    queryKey: ['adminScadaStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/scada');
      return data;
    },
  });
}

export function useAdminFactories() {
  return useQuery({
    queryKey: ['adminFactories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/factories');
      return data;
    },
  });
}

export function useCreateDemoMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/admin/machines/demo');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicianMachines'] });
      queryClient.invalidateQueries({ queryKey: ['demoStatus'] });
    },
  });
}

export function useAdminComponents() {
  return useQuery({
    queryKey: ['adminComponents'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/components');
      return data;
    },
  });
}

export function useAdminRagDocuments() {
  return useQuery({
    queryKey: ['adminRagDocuments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/rag');
      return data;
    },
  });
}

export function useUpdateRagStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/api/admin/rag/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRagDocuments'] });
    },
  });
}

export function useAdminModels() {
  return useQuery({
    queryKey: ['adminModels'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/models');
      return data;
    },
  });
}

export function useRetrainModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { dataset?: string; triggerReason?: string }) => {
      const { data } = await apiClient.post('/api/admin/models/retrain', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminModels'] });
      queryClient.invalidateQueries({ queryKey: ['adminChampionChallenger'] });
    },
  });
}

export function useAdminDrift() {
  return useQuery({
    queryKey: ['adminDrift'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/models/drift');
      return data;
    },
  });
}

export function useAdminChampionChallenger() {
  return useQuery({
    queryKey: ['adminChampionChallenger'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/models/compare');
      return data;
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/reports');
      return data;
    },
  });
}

export function useAdminBiDatasets() {
  return useQuery({
    queryKey: ['adminBiDatasets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/exports/bi-datasets');
      return data;
    },
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/audit');
      return data;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/users');
      return data;
    },
  });
}
