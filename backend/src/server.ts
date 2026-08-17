import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { RealtimeService } from './services/websocket.js';
import { authenticate } from './middleware/auth.js';

// Auth Controller
import { login, register, getMe } from './controllers/authController.js';

// Machine Controller
import { getMachines, getMachineById, createMachine, updateMachine, deleteMachine, getMachineTelemetry } from './controllers/machineController.js';

// Sensor Controller
import {
  getMachineSensors,
  getSensorById,
  getSensorHistory,
  getMaintenanceSensorAnalytics,
  createSensor,
  updateSensor,
  deleteSensor,
} from './controllers/sensorController.js';

// Technician Controller
import {
  getTechnicianOverview,
  getTechnicianMachines,
  getTechnicianTasks,
  getMachineAlerts,
  getAllAlerts,
  acknowledgeAlert,
  getMachinePredictions,
  getMachineTelemetryHistory,
  getTechnicianSpareParts,
  getTechnicianProcedures,
  getMachineMaintenanceHistory,
} from './controllers/technicianController.js';

// Maintenance Controller
import {
  getMaintenanceOverview,
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  getMaintenancePlans,
  createMaintenancePlan,
  getMaintenanceRisk,
  getTechnicians,
  getSpareParts,
} from './controllers/maintenanceController.js';

// Production Controller
import {
  getProductionOverview,
  getProductionLines,
  getProductionLineById,
  getOeeAnalysis,
  getProductionPerformance,
  getProductionDowntime,
  getProductionQuality,
  getProductionOrders,
} from './controllers/productionController.js';

// Director Controller
import {
  getDirectorOverview,
  getDirectorKPIs,
  getDirectorRisk,
  getDirectorFinancialImpact,
  getDirectorAiInsights,
  getDirectorOperations,
  getDirectorSystems,
  getDirectorAlerts,
} from './controllers/directorController.js';

// AI Controller
import { aiChat, getAiDiagnosis, recordAiFeedback } from './controllers/aiController.js';

// Reports & BI Export Controller
import {
  getReports,
  getReportById,
  generateReport,
  getReportSnapshot,
  getBiDatasetsList,
  exportBiDataset,
} from './controllers/reportController.js';

// Integration Controller
import {
  getIntegrationsOverview,
  getErpStatus,
  getMesStatus,
  getScadaStatus,
  getOpcuaStatus,
} from './controllers/integrationController.js';

// Admin Controller
import {
  getDemoStatus,
  triggerDemoScenario,
  resetDemoData,
  seedDemoFactory,
  getDemoScenarios,
  getFactories,
  createFactory,
  createDemoMachine,
  importMachineDatasheet,
  getComponents,
  createComponent,
  getRagDocuments,
  updateRagDocumentStatus,
  getModelVersions,
  retrainModel,
  getDriftStatus,
  getChampionChallengerReport,
  getAuditLogs,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from './controllers/adminController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize WebSocket broadcast engine
RealtimeService.getInstance().initialize(server);

app.use(cors());
app.use(express.json());

// ============================================================================
// Observability & Health Routes
// ============================================================================
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'MAINTIX Industrial Backend', time: new Date() }));
app.get('/ready', (req, res) => res.json({ status: 'READY', database: 'CONNECTED', websocket: 'ACTIVE' }));
app.get('/api/health', (req, res) => res.json({ status: 'online', service: 'MAINTIX Industrial Backend API', time: new Date() }));

// ============================================================================
// Public Authentication Routes
// ============================================================================
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);

// ============================================================================
// Authenticated Routes
// ============================================================================
app.use('/api', authenticate as any);

app.get('/api/auth/me', getMe as any);

// ============================================================================
// Machine Routes
// ============================================================================
app.get('/api/machines', getMachines);
app.get('/api/machines/:id', getMachineById);
app.post('/api/machines', createMachine);
app.put('/api/machines/:id', updateMachine);
app.delete('/api/machines/:id', deleteMachine);
app.get('/api/machines/:id/telemetry', getMachineTelemetry);

// ============================================================================
// Sensor Domain Routes (Technician & Maintenance Manager)
// ============================================================================
app.get('/api/machines/:machineId/sensors', getMachineSensors);
app.get('/api/sensors/:sensorId', getSensorById);
app.get('/api/sensors/:sensorId/history', getSensorHistory);
app.get('/api/maintenance/sensors', getMaintenanceSensorAnalytics);
app.post('/api/admin/sensors', createSensor);
app.put('/api/admin/sensors/:id', updateSensor);
app.delete('/api/admin/sensors/:id', deleteSensor);

// ============================================================================
// Technician Routes
// ============================================================================
app.get('/api/technician/overview', getTechnicianOverview);
app.get('/api/technician/machines', getTechnicianMachines);
app.get('/api/technician/tasks', getTechnicianTasks);
app.get('/api/technician/alerts', getAllAlerts);
app.get('/api/technician/spare-parts', getTechnicianSpareParts);
app.get('/api/technician/procedures', getTechnicianProcedures);
app.get('/api/machines/:machineId/alerts', getMachineAlerts);
app.patch('/api/machines/:machineId/alerts/:alertId/acknowledge', acknowledgeAlert);
app.patch('/api/alerts/:alertId/acknowledge', acknowledgeAlert);
app.get('/api/machines/:machineId/predictions', getMachinePredictions);
app.get('/api/machines/:machineId/telemetry-history', getMachineTelemetryHistory);
app.get('/api/machines/:machineId/maintenance-history', getMachineMaintenanceHistory);

// ============================================================================
// Maintenance Manager Routes
// ============================================================================
app.get('/api/maintenance/overview', getMaintenanceOverview);
app.get('/api/maintenance/risks', getMaintenanceRisk);
app.get('/api/maintenance/plans', getMaintenancePlans);
app.post('/api/maintenance/plans', createMaintenancePlan);
app.get('/api/maintenance/work-orders', getWorkOrders);
app.post('/api/maintenance/work-orders', createWorkOrder);
app.put('/api/maintenance/work-orders/:id', updateWorkOrder);
app.patch('/api/maintenance/work-orders/:id', updateWorkOrder);
app.get('/api/maintenance/technicians', getTechnicians);
app.get('/api/maintenance/spare-parts', getSpareParts);

// ============================================================================
// Production Manager Routes
// ============================================================================
app.get('/api/production/overview', getProductionOverview);
app.get('/api/production/lines', getProductionLines);
app.get('/api/production/lines/:id', getProductionLineById);
app.get('/api/production/oee', getOeeAnalysis);
app.get('/api/production/performance', getProductionPerformance);
app.get('/api/production/downtime', getProductionDowntime);
app.get('/api/production/quality', getProductionQuality);
app.get('/api/production/orders', getProductionOrders);

// ============================================================================
// Industrial Director Routes
// ============================================================================
app.get('/api/director/overview', getDirectorOverview);
app.get('/api/director/kpis', getDirectorKPIs);
app.get('/api/director/risk', getDirectorRisk);
app.get('/api/director/financial-impact', getDirectorFinancialImpact);
app.get('/api/director/ai-insights', getDirectorAiInsights);
app.get('/api/director/operations', getDirectorOperations);
app.get('/api/director/systems', getDirectorSystems);
app.get('/api/director/alerts', getDirectorAlerts);

// ============================================================================
// AI & RAG Routes
// ============================================================================
app.post('/api/ai/chat', aiChat);
app.post('/api/ai/diagnosis', getAiDiagnosis);
app.post('/api/feedback', recordAiFeedback);

// ============================================================================
// Reports & BI Export Routes
// ============================================================================
app.get('/api/reports', getReports);
app.get('/api/reports/:id', getReportById);
app.post('/api/reports/generate', generateReport);
app.get('/api/reports/snapshots/:id', getReportSnapshot);
app.get('/api/exports/bi-datasets', getBiDatasetsList);
app.get('/api/exports/bi-datasets/:datasetCode/download', exportBiDataset);

// ============================================================================
// Industrial Integration Routes (ERP, MES, SCADA, OPC-UA, MQTT)
// ============================================================================
app.get('/api/admin/integrations', getIntegrationsOverview);
app.get('/api/admin/erp', getErpStatus);
app.get('/api/admin/mes', getMesStatus);
app.get('/api/admin/scada', getScadaStatus);
app.get('/api/admin/opcua', getOpcuaStatus);

// ============================================================================
// Admin Platform Management Routes
// ============================================================================
app.get('/api/admin/factories', getFactories);
app.post('/api/admin/factories', createFactory);
app.post('/api/admin/machines/demo', createDemoMachine);
app.post('/api/admin/machines/import', importMachineDatasheet);
app.get('/api/admin/components', getComponents);
app.post('/api/admin/components', createComponent);
app.get('/api/admin/rag', getRagDocuments);
app.patch('/api/admin/rag/:id/status', updateRagDocumentStatus);
app.get('/api/admin/models', getModelVersions);
app.post('/api/admin/models/retrain', retrainModel);
app.get('/api/admin/models/drift', getDriftStatus);
app.get('/api/admin/models/compare', getChampionChallengerReport);
app.get('/api/admin/audit', getAuditLogs);
app.get('/api/admin/users', getUsers);
app.post('/api/admin/users', createUser);
app.put('/api/admin/users/:id', updateUser);
app.delete('/api/admin/users/:id', deleteUser);

// Demo Control Center
app.get('/api/admin/demo/status', getDemoStatus);
app.get('/api/admin/demo/scenarios', getDemoScenarios);
app.post('/api/admin/demo/scenario', triggerDemoScenario);
app.post('/api/admin/demo/reset', resetDemoData);
app.post('/api/admin/demo/seed', seedDemoFactory);
app.post('/api/admin/demo-scenario', triggerDemoScenario);

server.listen(PORT, () => {
  console.log(`🚀 MAINTIX Industrial Decision Intelligence Backend running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server active at ws://localhost:${PORT}/ws`);
  console.log(`📊 Registered complete API suite: Technician | Maintenance | Production | Director | Admin | BI Datasets`);
});
