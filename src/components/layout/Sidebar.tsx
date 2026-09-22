import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  routes: Array<{ path: string; label: string; icon: string }>;
  isActive: (path: string) => boolean;
  onNavigate: () => void;
}

export function Sidebar({ 
  className, 
  routes, 
  isActive, 
  onNavigate 
}: SidebarProps) {
  return (
    <aside 
      className={cn(
        "w-64 bg-[#0d0e17] border-r border-white/10 flex flex-col overflow-y-auto",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <div>
            <h1 className="font-display text-lg tracking-wider text-white">CEO GPS</h1>
            <p className="text-[10px] text-white/40 font-display tracking-widest uppercase">LifeOS</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Dashboard sections">
        {routes.map((route) => {
          const active = isActive(route.path);
          return (
            <Link
              key={route.path}
              to={route.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-base">{route.icon}</span>
              <span className="truncate">{route.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="text-center text-[10px] text-white/30 font-display tracking-widest uppercase">
          CEO GPS v1.0
        </div>
      </div>
    </aside>
  );
}