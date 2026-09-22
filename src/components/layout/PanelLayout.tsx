import React from "react";
import { cn } from "@/lib/utils";

interface PanelLayoutProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export default function PanelLayout({ 
  title, 
  subtitle, 
  icon, 
  children, 
  actions, 
  className = "",
  accent = false
}: PanelLayoutProps) {
  return (
    <div className={cn(
      "glass rounded-2xl border overflow-hidden flex flex-col h-full",
      accent ? "border-primary/25 bg-primary/6" : "border-white/8",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-5 py-4 border-b shrink-0",
        accent ? "border-primary/20 bg-primary/10" : "border-white/6"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            accent ? "bg-primary/20 text-primary" : "bg-white/10 text-white"
          )}>
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base tracking-wider uppercase text-white-90 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] text-white-40 font-display tracking-widest uppercase truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden p-4 text-white-85">
        {children}
      </div>
    </div>
  );
}