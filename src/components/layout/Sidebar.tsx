import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Calendar,
  CheckSquare,
  DollarSign,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GitBranch,
  Globe,
  Heart,
  Image,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Music,
  Music2,
  Network,
  Plug,
  Scale,
  Search,
  Settings,
  Share2,
  Terminal,
  Users,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SIDEBAR_SECTIONS, type SidebarSection } from "./sidebar-items";

const LUCIDE: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Calendar,
  CheckSquare,
  DollarSign,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GitBranch,
  Globe,
  Heart,
  Image,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Music,
  Music2,
  Network,
  Plug,
  Scale,
  Search,
  Settings,
  Share2,
  Terminal,
  Users,
  Wand2,
  Zap,
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  routes?: Array<{ path: string; label: string; icon: string }>;
  isActive?: (path: string) => boolean;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  collapsed = false,
  onToggle,
  activeItem,
  onItemClick,
  routes = [],
  isActive,
  onNavigate,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(
      SIDEBAR_SECTIONS
        .filter(s => s.collapsible)
        .map(s => [s.id, s.defaultOpen ?? true])
    )
  );

  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };

  const renderIcon = (iconName: string): React.ReactElement => {
    const Icon = LUCIDE[iconName];
    if (Icon) return <Icon className="h-4 w-4" strokeWidth={1.75} />;
    if (iconName === "ChevronDown") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    }
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    );
  };

  return (
    <motion.aside
      ref={sidebarRef}
      className={cn(
        "fixed left-0 top-0 h-full glass border-r border-white/10 z-40 flex flex-col",
        "transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      style={{ width: collapsed ? 64 : 256 }}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!collapsed && (
            <span className="font-display tracking-widest uppercase text-primary text-[11px]">
              LifeOS
            </span>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors",
              collapsed && "ml-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" role="navigation" aria-label="Main navigation">
          {SIDEBAR_SECTIONS.map(section => (
            <SidebarSectionComponent
              key={section.id}
              section={section}
              collapsed={collapsed}
              activeItem={activeItem}
              openSections={openSections}
              onToggleSection={toggleSection}
              onItemClick={handleItemClick}
              renderIcon={renderIcon}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-display tracking-widest uppercase text-white text-[10px] truncate">User</p>
                  <p className="text-[9px] text-white/40 truncate">user@lifeos.app</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

interface SidebarSectionComponentProps {
  section: SidebarSection;
  collapsed: boolean;
  activeItem?: string;
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onItemClick: (itemId: string) => void;
  renderIcon: (name: string) => React.ReactElement;
}

const SidebarSectionComponent: React.FC<SidebarSectionComponentProps> = ({
  section,
  collapsed,
  activeItem,
  openSections,
  onToggleSection,
  onItemClick,
  renderIcon,
}) => {
  const isOpen = openSections[section.id] ?? true;
  const hasActive = section.items.some(item => item.id === activeItem);

  if (collapsed) {
    return (
      <div className="space-y-1">
        {section.items.map(item => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "w-full flex items-center justify-center p-2 rounded-lg",
              "text-white/50 hover:text-white hover:bg-white/10",
              activeItem === item.id && "bg-primary/20 text-primary",
              "transition-colors relative"
            )}
            title={item.label}
            aria-label={item.label}
            aria-current={activeItem === item.id ? "page" : undefined}
          >
            {renderIcon(item.icon as string)}
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[7px] bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-2">
        <span className="font-display tracking-widest uppercase text-[9px] text-white/40 px-2">
          {section.label}
        </span>
        {section.collapsible && (
          <button
            onClick={() => onToggleSection(section.id)}
            className="p-1 text-white/40 hover:text-white transition-colors"
            aria-label={isOpen ? `Collapse ${section.label}` : `Expand ${section.label}`}
            aria-expanded={isOpen}
          >
            {renderIcon(isOpen ? "ChevronDown" : "ChevronRight")}
          </button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden pl-2"
          >
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                  "text-white/70 hover:text-white hover:bg-white/10",
                  activeItem === item.id && "bg-primary/20 text-primary",
                  "transition-colors"
                )}
                aria-current={activeItem === item.id ? "page" : undefined}
              >
                {renderIcon(item.icon as string)}
                <span className="font-display tracking-widest uppercase text-[10px] flex-1 truncate">
                  {item.label}
                </span>
                {item.badge && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[8px] font-display tracking-widest uppercase",
                    item.badgeVariant === "primary" && "bg-primary/20 text-primary",
                    item.badgeVariant === "success" && "bg-emerald-500/20 text-emerald-400",
                    item.badgeVariant === "warning" && "bg-amber-500/20 text-amber-400",
                    item.badgeVariant === "danger" && "bg-red-500/20 text-red-400",
                    item.badgeVariant === "default" && "bg-white/10 text-white/60"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Sidebar.displayName = "Sidebar";