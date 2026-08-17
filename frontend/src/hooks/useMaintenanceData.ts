import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient.js';

export function useMaintenanceOverview() {
  return useQuery({
    queryKey: ['maintenanceOverview'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/maintenance/overview');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useMaintenanceRisk() {
  return useQuery({
    queryKey: ['maintenanceRisk'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/maintenance/risks');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useMaintenancePlans() {
  return useQuery({
    queryKey: ['maintenancePlans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/maintenance/plans');
      return data;
    },
  });
}

export function useCreateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planData: any) => {
      const { data } = await apiClient.post('/api/maintenance/plans', planData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceOverview'] });
    },
  });
}

export function useWorkOrders() {
  return useQuery({
    queryKey: ['maintenanceWorkOrders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/maintenance/work-orders');
      return data;
    },
  });
}

export const useMaintenanceWorkOrders = useWorkOrders;

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data } = await apiClient.post('/api/maintenance/work-orders', orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceWorkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceOverview'] });
      queryClient.invalidateQueries({ queryKey: ['technicianTasks'] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/maintenance/work-orders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceWorkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['technicianTasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceOverview'] });
    },
  });
}

export function useMaintenanceSensors() {
  return useQuery({
    queryKey: ['maintenanceSensorAnalytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/maintenance/sensors');
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useTechniciansTeam() {
  return useQuery({
    queryKey: ['maintenanceTechnicians'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/maintenance/technicians');
      return data;
    },
  });
}

export function useSpareParts() {
  return useQuery({
    queryKey: ['maintenanceSpareParts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/maintenance/spare-parts');
      return data;
    },
  });
}
