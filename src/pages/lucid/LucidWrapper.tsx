// src/pages/lucid/LucidWrapper.tsx
// Wrapper to embed Lucid Systems app within LifeOS1 dashboard - No auth, uses LifeOS1 styling

import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link } from "react-router-dom";
import { PanelLayout } from "@/components/layout/PanelLayout";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { Toaster } from "@/components/ui/Toaster";
import { Zap, LayoutGrid, Rocket, Activity, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

// Lazy load Lucid pages
const StrategyHub = lazy(() => import("./StrategyHub").then(m => ({ default: m.default })));
const CampaignDashboard = lazy(() => import("./CampaignDashboard").then(m => ({ default: m.default })));
const ActivityLog = lazy(() => import("./ActivityLog").then(m => ({ default: m.default })));
const FinancialAccounts = lazy(() => import("./FinancialAccounts").then(m => ({ default: m.default })));
const PageNotFound = lazy(() => import("./PageNotFound").then(m => ({ default: m.default })));

// Layout component using LifeOS1 styling
function LucidLayout() {
  const navItems = [
    { label: 'Strategy Hub', path: '/lucid/strategies', icon: LayoutGrid },
    { label: 'Campaigns', path: '/lucid/campaigns', icon: Rocket },
    { label: 'Activity Log', path: '/lucid/activity', icon: Activity },
    { label: 'Financial', path: '/lucid/accounts', icon: Wallet },
  ];

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      <aside className="w-64 shrink-0 border-r border-white/10 bg-white/5 flex flex-col">
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading font-semibold tracking-tight text-base">Lucid Systems</span>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <Route key={item.path} path={item.path} element={<Link to={item.path} />} />
          ))}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Agent online</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route element={<LucidLayout />}>
        <Route path="/lucid" element={<Navigate to="/lucid/strategies" replace />} />
        <Route path="/lucid/strategies" element={<StrategyHub />} />
        <Route path="/lucid/campaigns" element={<CampaignDashboard />} />
        <Route path="/lucid/activity" element={<ActivityLog />} />
        <Route path="/lucid/accounts" element={<FinancialAccounts />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default function LucidWrapper() {
  return (
    <PanelLayout
      title="Lucid Systems"
      subtitle="AI Marketing Strategy & Campaign Management"
      icon={<Zap className="text-primary" />}
    >
      <div className="h-full">
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Suspense fallback={
              <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <AuthenticatedApp />
              <Toaster />
            </Suspense>
          </Router>
        </QueryClientProvider>
      </div>
    </PanelLayout>
  );
}