// src/pages/creator/CreatorWrapper.tsx
// Wrapper for Creator panel - content creation & publishing hub

import React from "react";
import { PanelLayout } from "@/components/layout/PanelLayout";
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  PenTool, 
  Sparkles,
  Upload,
  Share2,
  Calendar,
  TrendingUp
} from "lucide-react";

const features = [
  { 
    icon: FileText, 
    title: "Blog Posts", 
    desc: "Write and publish long-form content with rich editing",
    status: "Ready"
  },
  { 
    icon: Image, 
    title: "Visual Content", 
    desc: "Create graphics, thumbnails, and social images",
    status: "In Progress"
  },
  { 
    icon: Video, 
    title: "Video Studio", 
    desc: "Record, edit, and optimize video content",
    status: "Planned"
  },
  { 
    icon: Music, 
    title: "Audio/Podcasts", 
    desc: "Record, edit, and distribute audio content",
    status: "Planned"
  },
  { 
    icon: PenTool, 
    title: "Creative Writing", 
    desc: "Stories, scripts, newsletters, and copywriting",
    status: "Ready"
  },
  { 
    icon: Sparkles, 
    title: "AI Generation", 
    desc: "Generate content with local LLMs (Ollama)",
    status: "Ready"
  },
  { 
    icon: Calendar, 
    title: "Content Calendar", 
    desc: "Plan, schedule, and track publishing workflow",
    status: "In Progress"
  },
  { 
    icon: TrendingUp, 
    title: "Analytics", 
    desc: "Track performance across all platforms",
    status: "Planned"
  },
];

export default function CreatorWrapper() {
  return (
    <PanelLayout
      title="Creator Studio"
      subtitle="Content creation, publishing, and distribution hub"
      icon={<Sparkles className="text-crimson-400" />}
    >
      <div className="h-full flex flex-col">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10 hover:border-primary/30 transition-colors text-white/90">
            <Sparkles className="w-4 h-4 text-crimson-400" />
            <span className="text-sm font-medium">AI Generate</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10 hover:border-primary/30 transition-colors text-white/90">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Import Content</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10 hover:border-primary/30 transition-colors text-white/90">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Cross-Post</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10 hover:border-primary/30 transition-colors text-white/90">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Schedule</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const statusColors: Record<string, string> = {
              Ready: "text-emerald-400 bg-emerald-400/10",
              "In Progress": "text-amber-400 bg-amber-400/10",
              Planned: "text-sky-400 bg-sky-400/10",
            };
            const [statusBg, statusColor] = statusColors[feature.status].split(" ");
            
            return (
              <div 
                key={index}
                className="glass rounded-xl border border-white/5 hover:border-primary/20 transition-all p-5 flex flex-col h-full"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-white/60 text-sm mb-4 flex-1">{feature.desc}</p>
                <span className={`text-xs font-medium px-2 py-1 rounded ${statusBg} ${statusColor}`}>
                  {feature.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PanelLayout>
  );
}