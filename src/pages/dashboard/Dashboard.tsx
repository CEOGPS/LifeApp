import { motion } from "motion/react";
import Module from "./_components/Module";
import TimeDateWeather from "./_components/TimeDateWeather";
import NotesModule from "./_components/NotesModule";
import TasksModule from "./_components/TasksModule";
import LeadsModule from "./_components/LeadsModule";
import NotificationsModule from "./_components/NotificationsModule";
import AgentMonitor from "./_components/AgentMonitor";
import { YoutubePlayerWithPersistence as YoutubePlayer } from "./_components/YoutubePlayer";
import MusicPlayer from "./_components/MusicPlayer";
import FinancialStats from "./_components/FinancialStats";
import RoiAnalysis from "./_components/RoiAnalysis";
import CreditScore from "./_components/CreditScore";
import BudgetExpenses from "./_components/BudgetExpenses";
import AiMoneyTips from "./_components/AiMoneyTips";
import AiInsights from "./_components/AiInsights";
import LifeHacks from "./_components/LifeHacks";
import SocialAnalytics from "./_components/SocialAnalytics";
import MarketingAnalytics from "./_components/MarketingAnalytics";
import CalendarModule from "./_components/CalendarModule";
import BrowserArea from "./_components/BrowserArea";
import QuickLinks from "./_components/QuickLinks";
import {
  Clock, FileText, CheckSquare, UserPlus, Bell, Bot, PlayCircle, Music2,
  DollarSign, BarChart2, Star, Receipt, Sparkles, Brain, Lightbulb,
  Share2, Megaphone, Calendar, Globe, Link2,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-4 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center gap-3"
      >
        <h1 className="font-display text-base tracking-[0.12em] text-white/80">
          LIFEOS
        </h1>
        <div className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 glass-crimson">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-display tracking-widest text-white/70">ONLINE</span>
        </div>
      </motion.div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gridAutoRows: "minmax(240px, auto)",
        }}
      >
        <Module title="Time & Weather" icon={<Clock size={13} />} accent>
          <TimeDateWeather />
        </Module>
        <Module title="Notes" icon={<FileText size={13} />}>
          <NotesModule />
        </Module>
        <Module title="Tasks" icon={<CheckSquare size={13} />}>
          <TasksModule />
        </Module>
        <Module title="Leads" icon={<UserPlus size={13} />}>
          <LeadsModule />
        </Module>
        <Module title="Notifications" icon={<Bell size={13} />} accent>
          <NotificationsModule />
        </Module>
        <Module title="Agent Monitor" icon={<Bot size={13} />}>
          <AgentMonitor />
        </Module>
        <Module title="Quick Links" icon={<Link2 size={13} />}>
          <QuickLinks />
        </Module>
        <Module title="Calendar" icon={<Calendar size={13} />}>
          <CalendarModule />
        </Module>
        <Module title="YouTube" icon={<PlayCircle size={13} />} className="col-span-2">
          <YoutubePlayer />
        </Module>
        <Module title="Music" icon={<Music2 size={13} />} accent>
          <MusicPlayer />
        </Module>
        <Module title="Browser" icon={<Globe size={13} />}>
          <BrowserArea />
        </Module>
        <Module title="Financial Stats" icon={<DollarSign size={13} />} accent>
          <FinancialStats />
        </Module>
        <Module title="ROI & Volume" icon={<BarChart2 size={13} />}>
          <RoiAnalysis />
        </Module>
        <Module title="Credit Scores" icon={<Star size={13} />} accent>
          <CreditScore />
        </Module>
        <Module title="Budget & Expenses" icon={<Receipt size={13} />}>
          <BudgetExpenses />
        </Module>
        <Module title="AI Money Tips" icon={<Sparkles size={13} />}>
          <AiMoneyTips />
        </Module>
        <Module title="AI Insights" icon={<Brain size={13} />} accent>
          <AiInsights />
        </Module>
        <Module title="Life Hacks" icon={<Lightbulb size={13} />}>
          <LifeHacks />
        </Module>
        <Module title="Social" icon={<Share2 size={13} />}>
          <SocialAnalytics />
        </Module>
        <Module title="Marketing" icon={<Megaphone size={13} />}>
          <MarketingAnalytics />
        </Module>
      </div>
      <div className="h-24" />
    </div>
  );
}
