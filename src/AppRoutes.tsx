import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLayout, AIDockPage, CalendarPage, TasksPage, NotesPage, LeadsPage, FinancePage, AnalyticsPage, MarketingPage, SocialPage, VeritonPage, CreatorOSPage, OmniSearchPage, BrowserPage, TerminalPage, SimulatorsPage, VaultPage, IntegrationsPage, AgentsPage, PreferencesPage } from "@/ui/layout";
import { DashboardPage } from "@/features/dashboard";

const Login = lazy(() => import("@/pages/auth/Login"));
const AuthCallback = lazy(() => import("@/pages/auth/AuthCallback"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Additional pages found in src/pages
const ContactsPage = lazy(() => import("@/pages/contacts/ContactsPanel"));
const CRMPage = lazy(() => import("@/pages/crm/CRMPanel"));
const EmailPage = lazy(() => import("@/pages/email/EmailPanel"));
const MediaPage = lazy(() => import("@/pages/media/MediaPanel"));
const OfficePage = lazy(() => import("@/pages/office/OfficePanel"));
const JournalPage = lazy(() => import("@/pages/journal/JournalPanel"));
const MusicPage = lazy(() => import("@/pages/music/MusicPanel"));
const ProjectPage = lazy(() => import("@/pages/projects/ProjectsPanel"));
const CommPage = lazy(() => import("@/pages/communications/CommunicationsPanel"));
const LegalPage = lazy(() => import("@/pages/legal/LegalPanel"));

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
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Main app with new layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai-dock" element={<AIDockPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/veriton" element={<VeritonPage />} />
          <Route path="/creator" element={<CreatorOSPage />} />
          <Route path="/omni" element={<OmniSearchPage />} />
          <Route path="/browser" element={<BrowserPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/simulators" element={<SimulatorsPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />

          {/* Restored missing routes from src/pages */}
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/email" element={<EmailPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/office" element={<OfficePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="/communications" element={<CommPage />} />
          <Route path="/legal" element={<LegalPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
