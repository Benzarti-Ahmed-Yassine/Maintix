import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { RoleSelectionPage } from '@/features/roles/pages/RoleSelectionPage';
import { TechnicianPage } from '@/features/technician/pages/TechnicianPage';
import { MaintenancePage } from '@/features/maintenance/pages/MaintenancePage';
import { ProductionPage } from '@/features/production/pages/ProductionPage';
import { DirectorPage } from '@/features/director/pages/DirectorPage';
import { AiCopilotPage } from '@/features/ai-copilot/pages/AiCopilotPage';
import { MlInsightsPage } from '@/features/ml-insights/pages/MlInsightsPage';
import { DigitalTwinPage } from '@/features/digital-twin/pages/DigitalTwinPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { ConnectedSystemsPage } from '@/features/connected-systems/pages/ConnectedSystemsPage';
import { KnowledgeBasePage } from '@/features/knowledge-base/pages/KnowledgeBasePage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Entry point — role selection IS the login */}
      <Route path="/" element={<RoleSelectionPage />} />
      <Route path="/login" element={<RoleSelectionPage />} />

      {/* App workspace routes — wrapped in AppLayout */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate replace to="/" />} />
        <Route path="technician"      element={<TechnicianPage />} />
        <Route path="maintenance"     element={<MaintenancePage />} />
        <Route path="production"      element={<ProductionPage />} />
        <Route path="director"        element={<DirectorPage />} />
        <Route path="copilot"         element={<AiCopilotPage />} />
        <Route path="ml-insights"     element={<MlInsightsPage />} />
        <Route path="digital-twin"    element={<DigitalTwinPage />} />
        <Route path="reports"         element={<ReportsPage />} />
        <Route path="settings"        element={<SettingsPage />} />
        <Route path="notifications"   element={<NotificationsPage />} />
        <Route path="connected-systems" element={<ConnectedSystemsPage />} />
        <Route path="knowledge-base"  element={<KnowledgeBasePage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
