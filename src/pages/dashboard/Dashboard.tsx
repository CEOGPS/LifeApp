import { motion } from "motion/react";
import Module from "./_components/Module";
import TimeDateWeather from "./_components/TimeDateWeather";
import { YoutubePlayerWithPersistence as YoutubePlayer } from "./_components/YoutubePlayer";
import FinancialStats from "./_components/FinancialStats";
import RoiAnalysis from "./_components/RoiAnalysis";
import CreditScore from "./_components/CreditScore";
import BudgetExpenses from "./_components/BudgetExpenses";

import {
  Clock,
  FileText,
  UserPlus,
  Bell,
  Bot,
  PlayCircle,
  Music2,
  DollarSign,
  BarChart2,
  Star,
  Receipt,
  Sparkles,
  Brain,
  Lightbulb,
  Share2,
  Megaphone,
  Calendar,
  Globe,
  Link2,
  Activity,
} from "lucide-react";

function MusicPlayer() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-white/60">
      Music player unavailable
    </div>
  );
}

function BrowserArea() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-white/60">
      Browser unavailable
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="p-4 min-h-full">
          {/* Welcome strip */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <div>
                    <h1 className="font-display text-xl tracking-[0.12em] text-white-95">
                      <span
                        style={{
                          color: "oklch(0.65 0.22 20)",
                          textShadow: "0 0 14px oklch(0.55 0.22 20 / 80%)",
                        }}
                      >
                        Cagednreality
                      </span>
                    </h1>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 glass-crimson rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-green" />
                    <span
                      className="text-xs font-display tracking-widest"
                      style={{ color: "oklch(0.75 0.22 20)" }}
                    >
                      LIFEOS ONLINE
                    </span>
                  </div>
                </motion.div>

      {/* Module grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gridAutoRows: "minmax(240px, auto)",
        }}
      >
        {/* Time / Date / Weather */}
        <Module title="Time & Weather" icon={<Clock size={13} />} accent>
          <TimeDateWeather />
        </Module>

        {/* Notifications */}
        <Module
          title="Notifications"
          icon={<Bell size={13} />}
          accent
          headerRight={
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-green" />
              <span
                className="text-[9px] font-display"
                style={{ color: "hsl(var(--teal))" }}
              >
                LIVE
              </span>
            </div>
          }
        >
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            No notifications
          </div>
        </Module>

        {/* Quick Links — moved near top */}
        <Module title="Quick Links" icon={<Link2 size={13} />}>
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            No quick links available
          </div>
        </Module>

        {/* Browser — moved near top */}
        <Module
          title="Browser"
          icon={<Globe size={13} />}
          className="col-span-1 row-span-1"
        >
          <BrowserArea />
        </Module>

        {/* Calendar (moved to where Tasks was) */}
        <Module title="Calendar" icon={<Calendar size={13} />}>
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            Calendar unavailable
          </div>
        </Module>

        {/* YouTube Player — full width (2 columns) */}
                <Module
                  title="YouTube Player"
                  icon={<PlayCircle size={13} />}
                  className="col-span-2"
                >
                  <YoutubePlayer />
                </Module>

                {/* Music Player */}
        <Module title="Music Player" icon={<Music2 size={13} />} accent>
          <MusicPlayer />
        </Module>

        {/* Financial Stats */}
        <Module title="Financial Stats" icon={<DollarSign size={13} />} accent>
          <FinancialStats />
        </Module>

        {/* ROI Analysis */}
        <Module title="ROI & Volume" icon={<BarChart2 size={13} />}>
          <RoiAnalysis />
        </Module>

        {/* Credit Score */}
        <Module title="Credit Scores" icon={<Star size={13} />} accent>
          <CreditScore />
        </Module>

        {/* Budget / Expenses */}
        <Module title="Budget & Expenses" icon={<Receipt size={13} />}>
          <BudgetExpenses />
        </Module>

        {/* AI Insights */}
        <Module title="AI Insights" icon={<Brain size={13} />} accent>
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            AI insights unavailable
          </div>
        </Module>

              </div>

      {/* Full-width activity feed — shows all actions across the dashboard */}
      <div className="mt-4 w-full">
        <Module
          title="Activity Feed"
          icon={<Activity size={13} />}
          accent
          className="w-full"
        >
          <div className="h-[460px] overflow-hidden">
            <div className="flex h-full items-center justify-center text-sm text-white/60">
              No recent activity
            </div>
          </div>
        </Module>
      </div>

      {/* Bottom spacer for Erebus dock */}
      <div className="h-24" />
    </div>
  );
}