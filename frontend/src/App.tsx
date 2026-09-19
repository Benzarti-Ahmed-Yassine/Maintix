import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useStore.js';
import { queryClient } from './api/queryClient.js';
import { Sidebar } from './components/Sidebar.js';
import { TopHeader } from './components/TopHeader.js';
import { AICopilotDrawer } from './components/AICopilotDrawer.js';

// Dedicated AI Copilot page — stays at the /ai URL and opens the drawer
const CopilotPage: React.FC<{ title?: string }> = ({ title = 'Copilote IA RAG' }) => {
  const { setCopilotOpen } = useAppStore();
  useEffect(() => {
    setCopilotOpen(true);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 select-none">
      <div className="relative">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 opacity-20 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-2xl shadow-emerald-900/20 border border-emerald-500/30">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
            <circle cx="7.5" cy="14.5" r=".5" fill="currentColor"/>
            <circle cx="16.5" cy="14.5" r=".5" fill="currentColor"/>
          </svg>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-slate-900 tracking-wide">{title}</h2>
        <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
          Le Copilote IA s'exécute en mode production directe, synchronisé avec la télémétrie capteurs et la base de connaissances RAG.
        </p>
      </div>
      <button
        onClick={() => setCopilotOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Ouvrir le Copilote IA
      </button>
    </div>
  );
};

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
import { AdminMachinesPage } from './pages/admin/AdminMachinesPage.js';
import { AdminComponentsPage } from './pages/admin/AdminComponentsPage.js';
import { AdminIntegrationsPage } from './pages/admin/AdminIntegrationsPage.js';
import { AdminRagPage } from './pages/admin/AdminRagPage.js';
import { AdminBiExportsPage } from './pages/admin/AdminBiExportsPage.js';
import { AdminDatasetsPage } from './pages/admin/AdminDatasetsPage.js';
import { AdminAuditPage } from './pages/admin/AdminAuditPage.js';

// Machine Learning Intelligence & Prognostics Center
import { MlIntelligencePage } from './pages/ml/MlIntelligencePage.js';

// Shared Pages
import { MachinesGalleryPage } from './pages/shared/MachinesGalleryPage.js';



export const App: React.FC = () => {
  const { setActiveRole, updateLiveTelemetry, setLiveConnected, setAiDrawerOpen, theme } = useAppStore();
  const location = useLocation();

  // Ensure theme is always light
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

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

    if (path.endsWith('/ai') || path.endsWith('/copilot')) {
      setAiDrawerOpen(true);
    }
  }, [location.pathname]);

  // Connect to backend WebSocket for live telemetry streaming and cache invalidations
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        let wsUrl = (import.meta.env.VITE_WS_URL as string) || '';
        if (!wsUrl) {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = window.location.hostname;
          const port = window.location.port ? `:${window.location.port}` : '';
          wsUrl = `${protocol}//${host}${port}/ws`;
        }

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
                machineCode: data.payload.machineCode || 'TX-1250-A',
                timestamp: data.payload.timestamp,
                vibRMS: data.payload.vibRMS,
                tempBearing: data.payload.tempBearing,
                tempMotor: data.payload.tempMotor,
                current: data.payload.current,
                speedRpm: data.payload.speedRpm,
                healthIndex: data.payload.healthIndex || (data.payload.vibRMS > 4.5 ? 22.0 : 96.0),
                anomalyScore: data.payload.anomalyScore || (data.payload.vibRMS > 4.5 ? 0.92 : 0.05),
                isAnomaly: data.payload.isAnomaly !== undefined ? data.payload.isAnomaly : data.payload.vibRMS > 4.5,
                severity: data.payload.severity || (data.payload.vibRMS > 4.5 ? 'CRITICAL' : 'LOW'),
                estimatedRulDays: data.payload.estimatedRulDays || (data.payload.vibRMS > 4.5 ? 18 : 60)
              });
              // Invalidate machine-specific telemetry query
              queryClient.invalidateQueries({ queryKey: ['machineTelemetryHistory', data.payload.machineCode] });
              queryClient.invalidateQueries({ queryKey: ['technicianOverview'] });
              queryClient.invalidateQueries({ queryKey: ['technicianMachines'] });
              queryClient.invalidateQueries({ queryKey: ['machineSensors'] });
              queryClient.invalidateQueries({ queryKey: ['machineAlerts'] });
              queryClient.invalidateQueries({ queryKey: ['maintenanceOverview'] });
              queryClient.invalidateQueries({ queryKey: ['maintenanceRisk'] });
              queryClient.invalidateQueries({ queryKey: ['productionOverview'] });
              queryClient.invalidateQueries({ queryKey: ['directorOverview'] });
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader />

        <main className="flex-1 pb-16 bg-[#f8fafc]">
          <Routes>
            {/* Role Selection */}
            <Route path="/role-selection" element={<RoleSelectionPage />} />

            {/* Technician Routes */}
            <Route path="/technician/overview" element={<TechnicianOverview />} />
            <Route path="/technician/machines" element={<MachinesGalleryPage />} />
            <Route path="/technician/machines/:id" element={<MachineInspectionPage />} />
            <Route path="/technician/machines/:machineId/sensors" element={<TechnicianSensorsPage />} />
            <Route path="/technician/sensors/:sensorId" element={<SensorDetailPage />} />
            <Route path="/technician/diagnostics" element={<TechnicianDiagnosticsPage />} />
            <Route path="/technician/ml-insights" element={<MlIntelligencePage />} />
            <Route path="/technician/alerts" element={<AlertsPage />} />
            <Route path="/technician/alerts/:id" element={<AlertsPage />} />
            <Route path="/technician/work-orders" element={<WorkOrdersPage />} />
            <Route path="/technician/procedures" element={<TechnicianProceduresPage />} />
            <Route path="/technician/spare-parts" element={<TechnicianSparePartsPage />} />
            <Route path="/technician/history" element={<TechnicianHistoryPage />} />
            <Route path="/technician/ai" element={<CopilotPage title="Copilote IA RAG — Technicien" />} />

            {/* Maintenance Manager Routes */}
            <Route path="/maintenance/overview" element={<MaintenanceOverview />} />
            <Route path="/maintenance/ml-insights" element={<MlIntelligencePage />} />
            <Route path="/maintenance/machines" element={<MachinesGalleryPage />} />
            <Route path="/maintenance/machines/:id" element={<MachineInspectionPage />} />
            <Route path="/maintenance/machines/:machineId/sensors" element={<TechnicianSensorsPage />} />
            <Route path="/maintenance/sensors" element={<MaintenanceSensorsPage />} />
            <Route path="/maintenance/risks" element={<RiskAnalysisPage />} />
            <Route path="/maintenance/plans" element={<MaintenancePlansPage />} />
            <Route path="/maintenance/work-orders" element={<WorkOrdersPage />} />
            <Route path="/maintenance/technicians" element={<TechniciansPage />} />
            <Route path="/maintenance/spare-parts" element={<TechnicianSparePartsPage />} />
            <Route path="/maintenance/history" element={<MaintenanceHistoryPage />} />
            <Route path="/maintenance/ai" element={<CopilotPage title="Copilote IA RAG — Maintenance" />} />

            {/* Production Manager Routes */}
            <Route path="/production/overview" element={<ProductionOverview />} />
            <Route path="/production/ml-insights" element={<MlIntelligencePage />} />
            <Route path="/production/lines" element={<ProductionLineDetailsPage />} />
            <Route path="/production/lines/:id" element={<ProductionLineDetailsPage />} />
            <Route path="/production/oee" element={<OeeAnalysisPage />} />
            <Route path="/production/performance" element={<ProductionPerformancePage />} />
            <Route path="/production/downtime" element={<ProductionDowntimePage />} />
            <Route path="/production/quality" element={<ProductionQualityPage />} />
            <Route path="/production/orders" element={<ProductionOrdersPage />} />
            <Route path="/production/history" element={<ProductionHistoryPage />} />
            <Route path="/production/ai" element={<CopilotPage title="Copilote IA RAG — Production" />} />

            {/* Industrial Director Routes */}
            <Route path="/director/overview" element={<DirectorOverview />} />
            <Route path="/director/ml-insights" element={<MlIntelligencePage />} />
            <Route path="/director/kpis" element={<DirectorKpisPage />} />
            <Route path="/director/analytics" element={<FinancialRoiPage />} />
            <Route path="/director/risk" element={<RiskAnalysisPage />} />
            <Route path="/director/operations" element={<DirectorOperationsPage />} />
            <Route path="/director/systems" element={<DirectorSystemsPage />} />
            <Route path="/director/exports" element={<DirectorCsvExportPage />} />
            <Route path="/director/history" element={<DirectorHistoryPage />} />
            <Route path="/director/ai-insights" element={<CopilotPage title="Synthèses IA Direction" />} />
            <Route path="/director/ai" element={<CopilotPage title="Copilote IA RAG — Direction" />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminControlPanel />} />
            <Route path="/admin/overview" element={<AdminControlPanel />} />
            <Route path="/admin/machines" element={<AdminMachinesPage />} />
            <Route path="/admin/components" element={<AdminComponentsPage />} />
            <Route path="/admin/integrations" element={<AdminIntegrationsPage />} />
            <Route path="/admin/erp" element={<AdminIntegrationsPage />} />
            <Route path="/admin/mes" element={<AdminIntegrationsPage />} />
            <Route path="/admin/scada" element={<AdminIntegrationsPage />} />
            <Route path="/admin/opcua" element={<AdminIntegrationsPage />} />
            <Route path="/admin/rag" element={<AdminRagPage />} />
            <Route path="/admin/models" element={<MlIntelligencePage />} />
            <Route path="/admin/mlops" element={<MlIntelligencePage />} />
            <Route path="/admin/ml-insights" element={<MlIntelligencePage />} />
            <Route path="/admin/bi-datasets" element={<AdminBiExportsPage />} />
            <Route path="/admin/exports" element={<AdminBiExportsPage />} />
            <Route path="/admin/datasets" element={<AdminDatasetsPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />

            {/* Direct ML Intelligence Route */}
            <Route path="/ml-insights" element={<MlIntelligencePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/role-selection" replace />} />
          </Routes>
        </main>
      </div>

      {/* AI Copilot Slide-over Drawer */}
      <AICopilotDrawer />
    </div>
  );
};

