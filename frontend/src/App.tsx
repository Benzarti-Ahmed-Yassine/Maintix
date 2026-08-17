import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useStore.js';
import { queryClient } from './api/queryClient.js';
import { Sidebar } from './components/Sidebar.js';
import { TopHeader } from './components/TopHeader.js';
import { AICopilotDrawer } from './components/AICopilotDrawer.js';
import { DemoSwitcherBar } from './components/DemoSwitcherBar.js';

// General Pages
import { RoleSelectionPage } from './pages/RoleSelectionPage.js';

// Technician Pages
import { TechnicianOverview } from './pages/technician/TechnicianOverview.js';
import { MachineInspectionPage } from './pages/technician/MachineInspectionPage.js';
import { TechnicianSensorsPage } from './pages/technician/TechnicianSensorsPage.js';
import { SensorDetailPage } from './pages/technician/SensorDetailPage.js';
import { TechnicianDiagnosticsPage } from './pages/technician/TechnicianDiagnosticsPage.js';
import { WorkOrdersPage } from './pages/technician/WorkOrdersPage.js';
import { AlertsPage } from './pages/technician/AlertsPage.js';
import { TechnicianProceduresPage } from './pages/technician/TechnicianProceduresPage.js';
import { TechnicianSparePartsPage } from './pages/technician/TechnicianSparePartsPage.js';
import { TechnicianHistoryPage } from './pages/technician/TechnicianHistoryPage.js';

// Maintenance Manager Pages
import { MaintenanceOverview } from './pages/maintenance/MaintenanceOverview.js';
import { MaintenanceSensorsPage } from './pages/maintenance/MaintenanceSensorsPage.js';
import { RiskAnalysisPage } from './pages/maintenance/RiskAnalysisPage.js';
import { MaintenancePlansPage } from './pages/maintenance/MaintenancePlansPage.js';
import { TechniciansPage } from './pages/maintenance/TechniciansPage.js';
import { MaintenanceHistoryPage } from './pages/maintenance/MaintenanceHistoryPage.js';

// Production Manager Pages
import { ProductionOverview } from './pages/production/ProductionOverview.js';
import { ProductionLineDetailsPage } from './pages/production/ProductionLineDetailsPage.js';
import { OeeAnalysisPage } from './pages/production/OeeAnalysisPage.js';
import { ProductionPerformancePage } from './pages/production/ProductionPerformancePage.js';
import { ProductionDowntimePage } from './pages/production/ProductionDowntimePage.js';
import { ProductionQualityPage } from './pages/production/ProductionQualityPage.js';
import { ProductionOrdersPage } from './pages/production/ProductionOrdersPage.js';
import { ProductionHistoryPage } from './pages/production/ProductionHistoryPage.js';

// Industrial Director Pages
import { DirectorOverview } from './pages/director/DirectorOverview.js';
import { DirectorKpisPage } from './pages/director/DirectorKpisPage.js';
import { FinancialRoiPage } from './pages/director/FinancialRoiPage.js';
import { DirectorOperationsPage } from './pages/director/DirectorOperationsPage.js';
import { DirectorSystemsPage } from './pages/director/DirectorSystemsPage.js';
import { DirectorHistoryPage } from './pages/director/DirectorHistoryPage.js';
import { DirectorCsvExportPage } from './pages/director/DirectorCsvExportPage.js';

// Admin Pages
import { AdminControlPanel } from './pages/admin/AdminControlPanel.js';
import { DemoControlCenter } from './pages/admin/DemoControlCenter.js';
import { AdminMachinesPage } from './pages/admin/AdminMachinesPage.js';
import { AdminComponentsPage } from './pages/admin/AdminComponentsPage.js';
import { AdminIntegrationsPage } from './pages/admin/AdminIntegrationsPage.js';
import { AdminRagPage } from './pages/admin/AdminRagPage.js';
import { AdminBiExportsPage } from './pages/admin/AdminBiExportsPage.js';
import { AdminDatasetsPage } from './pages/admin/AdminDatasetsPage.js';
import { AdminAuditPage } from './pages/admin/AdminAuditPage.js';

export const App: React.FC = () => {
  const { setActiveRole, updateLiveTelemetry, setLiveConnected, setAiDrawerOpen } = useAppStore();
  const location = useLocation();

  // Sync activeRole based on current URL path if directly navigated
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/role-selection') {
      return;
    }
    if (path.startsWith('/technician')) setActiveRole('TECHNICIAN');
    else if (path.startsWith('/maintenance')) setActiveRole('MAINTENANCE_MANAGER');
    else if (path.startsWith('/production')) setActiveRole('PRODUCTION_MANAGER');
    else if (path.startsWith('/director')) setActiveRole('INDUSTRIAL_DIRECTOR');
    else if (path.startsWith('/admin')) setActiveRole('ADMIN');
  }, [location.pathname]);

  // Connect to backend WebSocket for live telemetry streaming and cache invalidations
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port === '5173' ? '4000' : window.location.port;
        const wsUrl = `${protocol}//${host}:${port}/ws`;

        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setLiveConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            useAppStore.getState().setLastBroadcastMessage(data);

            if (data.type === 'LIVE_TELEMETRY' && data.payload) {
              updateLiveTelemetry({
                machineCode: data.payload.machineCode || 'PCL-GMX-001',
                timestamp: data.payload.timestamp,
                vibRMS: data.payload.vibRMS,
                tempBearing: data.payload.tempBearing,
                tempMotor: data.payload.tempMotor,
                current: data.payload.current,
                speedRpm: data.payload.speedRpm,
                healthIndex: data.payload.healthIndex || 22.0,
                anomalyScore: data.payload.anomalyScore || (data.payload.vibRMS > 4.5 ? 0.92 : 0.05),
                isAnomaly: data.payload.isAnomaly !== undefined ? data.payload.isAnomaly : data.payload.vibRMS > 4.5,
                severity: data.payload.severity || (data.payload.vibRMS > 4.5 ? 'CRITICAL' : 'LOW'),
                estimatedRulDays: data.payload.estimatedRulDays || (data.payload.vibRMS > 4.5 ? 18 : 60)
              });
              // Invalidate machine-specific telemetry query
              queryClient.invalidateQueries({ queryKey: ['machineTelemetryHistory', data.payload.machineCode] });
            } else if (data.type === 'DEMO_SCENARIO_TRIGGERED' && data.payload) {
              if (data.payload.telemetry) {
                updateLiveTelemetry({
                  machineCode: data.payload.machine?.code || 'PCL-GMX-001',
                  timestamp: data.payload.telemetry.timestamp || new Date().toISOString(),
                  vibRMS: data.payload.telemetry.vibRMS,
                  tempBearing: data.payload.telemetry.tempBearing,
                  tempMotor: data.payload.telemetry.tempMotor || 48.5,
                  current: data.payload.telemetry.current || 4.2,
                  speedRpm: data.payload.telemetry.speedRpm || 1450,
                  healthIndex: data.payload.machine?.healthScore || 22.0,
                  anomalyScore: data.payload.machine?.anomalyScore || 0.92,
                  isAnomaly: (data.payload.machine?.anomalyScore || 0) > 0.45,
                  severity: data.payload.machine?.status || 'CRITICAL',
                  estimatedRulDays: data.payload.machine?.predictedRulDays || 18
                });
              }
              // Invalidate all role queries so four operational views synchronize immediately
              queryClient.invalidateQueries({ queryKey: ['technicianOverview'] });
              queryClient.invalidateQueries({ queryKey: ['technicianMachines'] });
              queryClient.invalidateQueries({ queryKey: ['machine'] });
              queryClient.invalidateQueries({ queryKey: ['machineSensors'] });
              queryClient.invalidateQueries({ queryKey: ['machineAlerts'] });
              queryClient.invalidateQueries({ queryKey: ['machineTelemetryHistory'] });
              queryClient.invalidateQueries({ queryKey: ['maintenanceOverview'] });
              queryClient.invalidateQueries({ queryKey: ['maintenanceRisk'] });
              queryClient.invalidateQueries({ queryKey: ['maintenanceSensorAnalytics'] });
              queryClient.invalidateQueries({ queryKey: ['productionOverview'] });
              queryClient.invalidateQueries({ queryKey: ['directorOverview'] });
              queryClient.invalidateQueries({ queryKey: ['directorKPIs'] });
              queryClient.invalidateQueries({ queryKey: ['directorRisk'] });
              queryClient.invalidateQueries({ queryKey: ['demoStatus'] });
              useAppStore.getState().triggerRefresh();
            } else if (data.type === 'DEMO_RESET') {
              queryClient.invalidateQueries();
              useAppStore.getState().triggerRefresh();
            } else if (data.type === 'WORK_ORDER_CREATED' || data.type === 'WORK_ORDER_UPDATED' || data.type === 'MACHINE_UPDATED') {
              queryClient.invalidateQueries({ queryKey: ['technicianTasks'] });
              queryClient.invalidateQueries({ queryKey: ['maintenanceWorkOrders'] });
              queryClient.invalidateQueries({ queryKey: ['maintenanceOverview'] });
              queryClient.invalidateQueries({ queryKey: ['technicianOverview'] });
              useAppStore.getState().triggerRefresh();
            }
          } catch (e) {
            // ignore parse error
          }
        };

        socket.onclose = () => {
          setLiveConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setLiveConnected(false);
        };
      } catch (e) {
        setLiveConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, []);

  const isRoleSelection = location.pathname === '/' || location.pathname === '/role-selection';

  if (isRoleSelection) {
    return <RoleSelectionPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader />

        <main className="flex-1 bg-[#0b0f19] pb-16">
          <Routes>
            {/* Role Selection */}
            <Route path="/role-selection" element={<RoleSelectionPage />} />

            {/* Technician Routes */}
            <Route path="/technician/overview" element={<TechnicianOverview />} />
            <Route path="/technician/machines" element={<MachineInspectionPage />} />
            <Route path="/technician/machines/:id" element={<MachineInspectionPage />} />
            <Route path="/technician/machines/:machineId/sensors" element={<TechnicianSensorsPage />} />
            <Route path="/technician/sensors/:sensorId" element={<SensorDetailPage />} />
            <Route path="/technician/diagnostics" element={<TechnicianDiagnosticsPage />} />
            <Route path="/technician/alerts" element={<AlertsPage />} />
            <Route path="/technician/alerts/:id" element={<AlertsPage />} />
            <Route path="/technician/work-orders" element={<WorkOrdersPage />} />
            <Route path="/technician/procedures" element={<TechnicianProceduresPage />} />
            <Route path="/technician/spare-parts" element={<TechnicianSparePartsPage />} />
            <Route path="/technician/history" element={<TechnicianHistoryPage />} />
            <Route path="/technician/ai" element={<TechnicianOverview />} />

            {/* Maintenance Manager Routes */}
            <Route path="/maintenance/overview" element={<MaintenanceOverview />} />
            <Route path="/maintenance/machines" element={<MachineInspectionPage />} />
            <Route path="/maintenance/machines/:id" element={<MachineInspectionPage />} />
            <Route path="/maintenance/machines/:machineId/sensors" element={<TechnicianSensorsPage />} />
            <Route path="/maintenance/sensors" element={<MaintenanceSensorsPage />} />
            <Route path="/maintenance/risks" element={<RiskAnalysisPage />} />
            <Route path="/maintenance/plans" element={<MaintenancePlansPage />} />
            <Route path="/maintenance/work-orders" element={<WorkOrdersPage />} />
            <Route path="/maintenance/technicians" element={<TechniciansPage />} />
            <Route path="/maintenance/spare-parts" element={<TechnicianSparePartsPage />} />
            <Route path="/maintenance/history" element={<MaintenanceHistoryPage />} />
            <Route path="/maintenance/ai" element={<MaintenanceOverview />} />

            {/* Production Manager Routes */}
            <Route path="/production/overview" element={<ProductionOverview />} />
            <Route path="/production/lines" element={<ProductionLineDetailsPage />} />
            <Route path="/production/lines/:id" element={<ProductionLineDetailsPage />} />
            <Route path="/production/oee" element={<OeeAnalysisPage />} />
            <Route path="/production/performance" element={<ProductionPerformancePage />} />
            <Route path="/production/downtime" element={<ProductionDowntimePage />} />
            <Route path="/production/quality" element={<ProductionQualityPage />} />
            <Route path="/production/orders" element={<ProductionOrdersPage />} />
            <Route path="/production/history" element={<ProductionHistoryPage />} />
            <Route path="/production/ai" element={<ProductionOverview />} />

            {/* Industrial Director Routes */}
            <Route path="/director/overview" element={<DirectorOverview />} />
            <Route path="/director/kpis" element={<DirectorKpisPage />} />
            <Route path="/director/analytics" element={<FinancialRoiPage />} />
            <Route path="/director/risk" element={<RiskAnalysisPage />} />
            <Route path="/director/operations" element={<DirectorOperationsPage />} />
            <Route path="/director/systems" element={<DirectorSystemsPage />} />
            <Route path="/director/exports" element={<DirectorCsvExportPage />} />
            <Route path="/director/history" element={<DirectorHistoryPage />} />
            <Route path="/director/ai-insights" element={<DirectorOverview />} />
            <Route path="/director/ai" element={<DirectorOverview />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminControlPanel />} />
            <Route path="/admin/overview" element={<AdminControlPanel />} />
            <Route path="/admin/demo" element={<DemoControlCenter />} />
            <Route path="/admin/machines" element={<AdminMachinesPage />} />
            <Route path="/admin/components" element={<AdminComponentsPage />} />
            <Route path="/admin/integrations" element={<AdminIntegrationsPage />} />
            <Route path="/admin/erp" element={<AdminIntegrationsPage />} />
            <Route path="/admin/mes" element={<AdminIntegrationsPage />} />
            <Route path="/admin/scada" element={<AdminIntegrationsPage />} />
            <Route path="/admin/opcua" element={<AdminIntegrationsPage />} />
            <Route path="/admin/rag" element={<AdminRagPage />} />
            <Route path="/admin/models" element={<AdminControlPanel />} />
            <Route path="/admin/mlops" element={<AdminControlPanel />} />
            <Route path="/admin/bi-datasets" element={<AdminBiExportsPage />} />
            <Route path="/admin/exports" element={<AdminBiExportsPage />} />
            <Route path="/admin/datasets" element={<AdminDatasetsPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/role-selection" replace />} />
          </Routes>
        </main>
      </div>

      {/* AI Copilot Slide-over Drawer */}
      <AICopilotDrawer />

      {/* Floating Demo Control Switcher Bar for Jury */}
      <DemoSwitcherBar />
    </div>
  );
};
