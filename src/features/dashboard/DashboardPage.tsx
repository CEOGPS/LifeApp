import React from "react";
import { Panel, StatTile, SectionTitle } from "@/ui/primitives";
import { PanelGrid } from "@/ui/layout";
import TimeDateWeather from "@/pages/dashboard/_components/TimeDateWeather";
import NotesModule from "@/pages/dashboard/_components/NotesModule";
import TasksModule from "@/pages/dashboard/_components/TasksModule";
import LeadsModule from "@/pages/dashboard/_components/LeadsModule";
import NotificationsModule from "@/pages/dashboard/_components/NotificationsModule";
import AgentMonitor from "@/pages/dashboard/_components/AgentMonitor";
import YoutubePlayer from "@/pages/dashboard/_components/YoutubePlayer";
import MusicPlayer from "@/pages/dashboard/_components/MusicPlayer";
import FinancialStats from "@/pages/dashboard/_components/FinancialStats";
import RoiAnalysis from "@/pages/dashboard/_components/RoiAnalysis";
import CreditScore from "@/pages/dashboard/_components/CreditScore";
import BudgetExpenses from "@/pages/dashboard/_components/BudgetExpenses";
import AiMoneyTips from "@/pages/dashboard/_components/AiMoneyTips";
import AiInsights from "@/pages/dashboard/_components/AiInsights";
import LifeHacks from "@/pages/dashboard/_components/LifeHacks";
import SocialAnalytics from "@/pages/dashboard/_components/SocialAnalytics";
import MarketingAnalytics from "@/pages/dashboard/_components/MarketingAnalytics";
import CalendarModule from "@/pages/dashboard/_components/CalendarModule";
import BrowserArea from "@/pages/dashboard/_components/BrowserArea";
import QuickLinks from "@/pages/dashboard/_components/QuickLinks";
import ActivityFeedPanel from "@/pages/dashboard/ActivityFeedPanel";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Row: Time/Weather + Quick Stats */}
      <PanelGrid columns={3} gap="md">
        <Panel className="col-span-1">
          <TimeDateWeather />
        </Panel>
        <Panel>
          <QuickLinks />
        </Panel>
        <Panel>
          <AgentMonitor />
        </Panel>
      </PanelGrid>

      {/* Second Row: Core Modules */}
      <PanelGrid columns={2} gap="md">
        <Panel className="col-span-2 lg:col-span-1">
          <NotesModule />
        </Panel>
        <Panel className="col-span-2 lg:col-span-1">
          <TasksModule />
        </Panel>
      </PanelGrid>

      {/* Third Row: Business/Finance */}
      <SectionTitle title="BUSINESS & FINANCE" subtitle="CRM, Pipeline, Revenue" />
      <PanelGrid columns={4} gap="md">
        <Panel className="col-span-4 lg:col-span-1">
          <LeadsModule />
        </Panel>
        <Panel className="col-span-4 lg:col-span-1">
          <FinancialStats />
        </Panel>
        <Panel className="col-span-4 lg:col-span-1">
          <RoiAnalysis />
        </Panel>
        <Panel className="col-span-4 lg:col-span-1">
          <CreditScore />
        </Panel>
      </PanelGrid>

      <PanelGrid columns={2} gap="md">
        <Panel className="col-span-2 lg:col-span-1">
          <BudgetExpenses />
        </Panel>
        <Panel className="col-span-2 lg:col-span-1">
          <AiMoneyTips />
        </Panel>
      </PanelGrid>

      {/* Fourth Row: AI & Intelligence */}
      <SectionTitle title="AI INTELLIGENCE" subtitle="Insights, Tips, Life Hacks" />
      <PanelGrid columns={2} gap="md">
        <Panel className="col-span-2 lg:col-span-1">
          <AiInsights />
        </Panel>
        <Panel className="col-span-2 lg:col-span-1">
          <LifeHacks />
        </Panel>
      </PanelGrid>

      {/* Fifth Row: Media & Social */}
      <SectionTitle title="MEDIA & SOCIAL" subtitle="Music, Video, Social Analytics" />
      <PanelGrid columns={3} gap="md">
        <Panel className="col-span-3 lg:col-span-1">
          <MusicPlayer />
        </Panel>
        <Panel className="col-span-3 lg:col-span-1">
          <YoutubePlayer />
        </Panel>
        <Panel className="col-span-3 lg:col-span-1">
          <SocialAnalytics />
        </Panel>
      </PanelGrid>

      <PanelGrid columns={2} gap="md">
        <Panel className="col-span-2 lg:col-span-1">
          <MarketingAnalytics />
        </Panel>
        <Panel className="col-span-2 lg:col-span-1">
          <CalendarModule />
        </Panel>
      </PanelGrid>

      {/* Sixth Row: Browser & Activity */}
      <SectionTitle title="TOOLS & ACTIVITY" subtitle="Browser, Notifications, Activity Feed" />
      <PanelGrid columns={2} gap="md">
        <Panel className="col-span-2 lg:col-span-1">
          <BrowserArea />
        </Panel>
        <Panel className="col-span-2 lg:col-span-1">
          <NotificationsModule />
        </Panel>
      </PanelGrid>

      <Panel className="col-span-full">
        <ActivityFeedPanel />
      </Panel>
    </div>
  );
}