import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLayout } from "./components/layout/AppLayout";

// Lazy-loaded sub-app wrappers
const VeritonWrapper = lazy(() => import("./pages/veriton/VeritonWrapper").then(m => ({ default: m.default })));
const LucidWrapper = lazy(() => import("./pages/lucid/LucidWrapper").then(m => ({ default: m.default })));
const OmniSearchWrapper = lazy(() => import("./pages/OmniSearch/OmniSearchWrapper").then(m => ({ default: m.default })));
const CreatorWrapper = lazy(() => import("./pages/creator/CreatorWrapper").then(m => ({ default: m.default })));

// Lazy-loaded main feature pages
const DashboardPage = lazy(() => import("./pages/dashboard/Dashboard").then(m => ({ default: m.default })));
const JournalPage = lazy(() => import("./pages/journal/JournalPanel").then(m => ({ default: m.default })));
const CRMPage = lazy(() => import("./pages/crm/CRMPanel").then(m => ({ default: m.default })));
const CommunicationsPage = lazy(() => import("./pages/communications/CommunicationsPanel").then(m => ({ default: m.default })));
const ContactsPage = lazy(() => import("./pages/contacts/ContactsPanel").then(m => ({ default: m.default })));
const EmailPage = lazy(() => import("./pages/email/EmailPanel").then(m => ({ default: m.default })));
const IntegrationsPage = lazy(() => import("./pages/integrations/IntegrationsPanel").then(m => ({ default: m.default })));
const LegalPage = lazy(() => import("./pages/legal/LegalPanel").then(m => ({ default: m.default })));
const MediaPage = lazy(() => import("./pages/media/MediaPanel").then(m => ({ default: m.default })));
const MusicPage = lazy(() => import("./pages/music/MusicPanel").then(m => ({ default: m.default })));
const OfficePage = lazy(() => import("./pages/office/OfficePanel").then(m => ({ default: m.default })));
const ProjectsPage = lazy(() => import("./pages/projects/ProjectsPanel").then(m => ({ default: m.default })));
const SocialPage = lazy(() => import("./pages/social/SocialPanel").then(m => ({ default: m.default })));
const NotesPage = lazy(() => import("./pages/dashboard/_components/NotesModule").then(m => ({ default: m.default })));
const TasksPage = lazy(() => import("./pages/tasks/TasksPanel").then(m => ({ default: m.default })));
const VaultPage = lazy(() => import("./pages/vault/VaultPanel").then(m => ({ default: m.default })));
const SimulatorsPage = lazy(() => import("./pages/simulators/AlternateLifeExplorer").then(m => ({ default: m.default })));
const AIDockPage = lazy(() => import("./components/ErebusDock").then(m => ({ default: m.ErebusDock })));
const AIHubPage = lazy(() => import("./pages/aihub/AIHubPage"));
const CalendarPage = lazy(() => import("./pages/dashboard/_components/CalendarModule").then(m => ({ default: m.default })));
const FinancePage = lazy(() => import("./pages/finance/FinancePanel").then(m => ({ default: m.default })));
const MarketingPage = lazy(() => import("./pages/dashboard/_components/MarketingAnalytics").then(m => ({ default: m.default })));

export function AppRoutes() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid #dc143c',
            borderTopColor: 'transparent', borderRadius: '50%',
            margin: '0 auto 1rem', animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#fff', fontFamily: 'system-ui' }}>Loading LifeOS...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    }>
      <Routes>
        {/* Protected app routes - no login required */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai-dock" element={<AIDockPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/leads" element={<Navigate to="/crm" replace />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/analytics" element={<Navigate to="/marketing" replace />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/veriton/*" element={<VeritonWrapper />} />
          <Route path="/lucid/*" element={<LucidWrapper />} />
          <Route path="/omni" element={<OmniSearchWrapper />} />
          <Route path="/creator" element={<CreatorWrapper />} />
          <Route path="/browser" element={<Navigate to="/omni" replace />} />
          <Route path="/simulators" element={<SimulatorsPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/agents" element={<AIHubPage />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/communications" element={<CommunicationsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/email" element={<EmailPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/office" element={<OfficePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>

        {/* Sub-apps with their own routing */}
        <Route path="/veriton/*" element={<VeritonWrapper />} />
        <Route path="/lucid/*" element={<LucidWrapper />} />
        <Route path="/omni" element={<OmniSearchWrapper />} />
        <Route path="/creator" element={<CreatorWrapper />} />

        {/* Catch-all */}
        <Route path="*" element={
          <div style={{ padding: "2rem", color: "#fff", background: "#050505", minHeight: "100vh" }}>
            <h1>Page not found</h1>
            <p>The requested page could not be found.</p>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}