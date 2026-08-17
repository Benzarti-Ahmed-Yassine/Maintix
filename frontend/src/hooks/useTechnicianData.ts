import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient.js';

export function useTechnicianOverview(machineCode?: string) {
  return useQuery({
    queryKey: ['technicianOverview', machineCode],
    queryFn: async () => {
      const url = machineCode ? `/api/technician/overview?machineCode=${machineCode}` : '/api/technician/overview';
      const { data } = await apiClient.get(url);
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useTechnicianMachines() {
  return useQuery({
    queryKey: ['technicianMachines'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/technician/machines');
      return data;
    },
  });
}

export function useMachineById(id: string) {
  return useQuery({
    queryKey: ['machine', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/machines/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 3000,
  });
}

export const useMachine = useMachineById;

export function useMachineSensors(machineId: string) {
  return useQuery({
    queryKey: ['machineSensors', machineId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/machines/${machineId}/sensors`);
      return data;
    },
    enabled: !!machineId,
    refetchInterval: 2000,
  });
}

export function useSensorById(sensorId: string) {
  return useQuery({
    queryKey: ['sensor', sensorId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/sensors/${sensorId}`);
      return data;
    },
    enabled: !!sensorId,
  });
}

export function useSensorHistory(sensorId: string, range: string = '1h') {
  return useQuery({
    queryKey: ['sensorHistory', sensorId, range],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/sensors/${sensorId}/history?range=${range}`);
      return data;
    },
    enabled: !!sensorId,
    refetchInterval: 2000,
  });
}

export function useMachineAlerts(machineId?: string) {
  return useQuery({
    queryKey: ['machineAlerts', machineId],
    queryFn: async () => {
      const url = machineId ? `/api/machines/${machineId}/alerts` : '/api/technician/alerts';
      const { data } = await apiClient.get(url);
      return data;
    },
    refetchInterval: 3000,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ alertId, acknowledgedBy }: { alertId: string; acknowledgedBy?: string }) => {
      const { data } = await apiClient.patch(`/api/alerts/${alertId}/acknowledge`, { acknowledgedBy });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['technicianOverview'] });
    },
  });
}

export function useMachineTelemetryHistory(machineId: string, limit: number = 30) {
  return useQuery({
    queryKey: ['machineTelemetryHistory', machineId, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/machines/${machineId}/telemetry-history?limit=${limit}`);
      return data;
    },
    enabled: !!machineId,
    refetchInterval: 2000,
  });
}

export function useTechnicianTasks() {
  return useQuery({
    queryKey: ['technicianTasks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/technician/tasks');
      return data;
    },
  });
}

export function useTechnicianProcedures() {
  return useQuery({
    queryKey: ['technicianProcedures'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/technician/procedures');
      return data;
    },
  });
}

export function useTechnicianSpareParts() {
  return useQuery({
    queryKey: ['technicianSpareParts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/technician/spare-parts');
      return data;
    },
  });
}

export function useMachineMaintenanceHistory(machineId: string) {
  return useQuery({
    queryKey: ['machineMaintenanceHistory', machineId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/machines/${machineId}/maintenance-history`);
      return data;
    },
    enabled: !!machineId,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data } = await apiClient.post('/api/maintenance/work-orders', orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicianTasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceWorkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceOverview'] });
    },
  });
}
