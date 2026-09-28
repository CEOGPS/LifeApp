import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PanelLayout, Sidebar, Topbar, PlaceholderPanel } from "./index";
import { SIDEBAR_ITEMS } from "./sidebar-items";
import { UploadBanner } from "./UploadBanner";
import { ErebusDock } from "@/components/ErebusDock";

interface AppLayoutProps {
  user?: { name: string; email: string; avatar?: string } | null;
  onSignOut?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user, onSignOut }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = SIDEBAR_ITEMS.find((item) => {
    if (!item.href) return false;
    return location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
  })?.id;

  const sidebar = (
    <Sidebar
      collapsed={sidebarCollapsed}
      onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      activeItem={activeItem}
      onItemClick={(itemId) => {
        const item = SIDEBAR_ITEMS.find((entry) => entry.id === itemId);
        if (item?.href) navigate(item.href);
        item?.onClick?.();
      }}
    />
  );

  const topbar = (
    <Topbar
      title={getPageTitle(location.pathname)}
      breadcrumbs={getBreadcrumbs(location.pathname)}
      enableNotifications={true}
      notificationCount={0}
      user={user || undefined}
      onProfileClick={() => navigate("/preferences")}
      sidebarCollapsed={sidebarCollapsed}
    />
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <PanelLayout
        sidebar={sidebar}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        topbar={topbar}
        banner={<UploadBanner />}
        padding="none"
        maxWidth="none"
        gridBackground={true}
        className="bg-black"
      >
        <Outlet />
      </PanelLayout>
      <ErebusDock />
    </div>
  );
};

function getPageTitle(pathname: string): string {
  const item = SIDEBAR_ITEMS.find(i => i.href === pathname);
  return item?.label || "Dashboard";
}

function getBreadcrumbs(pathname: string): Array<{ label: string; href?: string }> {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard", href: "/" }];

  const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: "Dashboard", href: "/" }];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const item = SIDEBAR_ITEMS.find(i => i.href === currentPath);
    if (item) {
      breadcrumbs.push({ label: item.label, href: currentPath });
    } else {
      breadcrumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1) });
    }
  }

  return breadcrumbs;
}

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Dashboard"
        description="Your unified command center is coming together. Panels will appear here once modules are wired."
        variant="coming-soon"
      />
    </div>
  );
};

export const AIDockPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="AI Dock"
        description="Erebus autonomous agent dock with proactive speech, avatar, and sub-agent orchestration."
        variant="coming-soon"
      />
    </div>
  );
};

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Calendar"
        description="Unified calendar with Google/Outlook sync, time blocking, and AI scheduling."
        variant="coming-soon"
      />
    </div>
  );
};

export const TasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Tasks"
        description="Kanban + list hybrid with AI prioritization, recurring tasks, and project rollups."
        variant="coming-soon"
      />
    </div>
  );
};

export const NotesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Notes"
        description="Rich text notes with bidirectional linking, tags, and AI summarization."
        variant="coming-soon"
      />
    </div>
  );
};

export const LeadsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Leads CRM"
        description="Pipeline management with email sequences, enrichment, and AI scoring."
        variant="coming-soon"
      />
    </div>
  );
};

export const FinancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Finance"
        description="Net worth tracking, budgeting, investments, credit monitoring, and AI money tips."
        variant="coming-soon"
      />
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Analytics"
        description="Unified analytics across web, social, email, and business metrics."
        variant="coming-soon"
      />
    </div>
  );
};

export const MarketingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Marketing"
        description="Campaign management, attribution, A/B testing, and creative analytics."
        variant="coming-soon"
      />
    </div>
  );
};

export const SocialPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Social"
        description="Multi-platform publishing, engagement tracking, and content calendar."
        variant="coming-soon"
      />
    </div>
  );
};

export const VeritonPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Veriton Music Creator"
        description="AI-powered music generation, stem separation, and DAW integration."
        variant="coming-soon"
      />
    </div>
  );
};

export const CreatorOSPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="CreatorOS"
        description="Content pipeline: ideation → creation → publishing → analytics."
        variant="coming-soon"
      />
    </div>
  );
};

export const OmniSearchPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="OmniSearch"
        description="Universal search across all your data, apps, and the web."
        variant="coming-soon"
      />
    </div>
  );
};

export const BrowserPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Browser"
        description="Embedded browser with session management, automation, and scraper."
        variant="coming-soon"
      />
    </div>
  );
};

export const TerminalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Terminal"
        description="Full xterm.js terminal with SSH, local shell, and AI command assist."
        variant="coming-soon"
      />
    </div>
  );
};

export const SimulatorsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Simulators"
        description="Monte Carlo, scenario planning, financial modeling, and decision trees."
        variant="coming-soon"
      />
    </div>
  );
};

export const VaultPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Vault"
        description="Encrypted secrets, passwords, API keys, and secure notes."
        variant="coming-soon"
      />
    </div>
  );
};

export const IntegrationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Integrations"
        description="OAuth connections for Google, Microsoft, Notion, Slack, GitHub, Stripe, and 50+ services."
        variant="coming-soon"
      />
    </div>
  );
};

export const AgentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Agents"
        description="AgentZero orchestrator with Erebus, Kranos, Nova, Leo, Atlas, Iris, Echo, Aura sub-agents."
        variant="coming-soon"
      />
    </div>
  );
};

export const PreferencesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Preferences"
        description="Theme, notifications, AI behavior, privacy, and advanced settings."
        variant="coming-soon"
      />
    </div>
  );
};