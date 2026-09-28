export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  badgeVariant?: "default" | "primary" | "success" | "warning" | "danger";
  children?: SidebarItem[];
  href?: string;
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  label: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: "core",
    label: "CORE",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", href: "/dashboard" },
      { id: "tasks", label: "Tasks", icon: "CheckSquare", href: "/tasks" },
      { id: "notes", label: "Notes", icon: "FileText", href: "/notes" },
      { id: "music", label: "Music Hub", icon: "Music2", href: "/music" },
      { id: "contacts", label: "Contacts", icon: "Users", href: "/contacts" },
      { id: "crm", label: "CRM", icon: "Briefcase", href: "/crm" },
      { id: "email", label: "Email", icon: "Mail", href: "/email" },
      { id: "comms", label: "Communications", icon: "MessageSquare", href: "/communications" },
      { id: "finance", label: "Finance", icon: "DollarSign", href: "/finance" },
    ],
  },
  {
    id: "create",
    label: "CREATE",
    items: [
      { id: "creator", label: "CreatorOS1", icon: "Wand2", href: "/creator" },
      { id: "veriton", label: "Veriton", icon: "Music", href: "/veriton" },
      { id: "social", label: "SocialLinkOS1", icon: "Share2", href: "/social" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [
      { id: "ai-dock", label: "Agent Dock", icon: "Bot", href: "/ai-dock" },
      { id: "agents", label: "AgentZero", icon: "Network", href: "/agents" },
      { id: "omni", label: "OmniSearch", icon: "Search", href: "/omni" },
    ],
  },
  {
    id: "command",
    label: "COMMAND",
    items: [
      { id: "projects", label: "Projects", icon: "FolderKanban", href: "/projects" },
      { id: "calendar", label: "Calendar", icon: "Calendar", href: "/calendar" },
      { id: "office", label: "Office", icon: "FileSpreadsheet", href: "/office" },
    ],
  },
  {
    id: "life",
    label: "LIFE",
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: "journal", label: "Journal", icon: "BookOpen", href: "/journal" },
      { id: "simulators", label: "Simulators", icon: "GitBranch", href: "/simulators" },
    ],
  },
  {
    id: "vault",
    label: "VAULT",
    collapsible: true,
    defaultOpen: false,
    items: [
      { id: "media", label: "Media", icon: "Image", href: "/media" },
      { id: "vault", label: "Secure Vault", icon: "Lock", href: "/vault" },
      { id: "legal", label: "Legal", icon: "Scale", href: "/legal" },
    ],
  },
  {
    id: "more",
    label: "MORE",
    collapsible: true,
    defaultOpen: false,
    items: [
      { id: "integrations", label: "Integrations", icon: "Plug", href: "/integrations" },
      { id: "marketing", label: "Marketing", icon: "Megaphone", href: "/marketing" },
    ],
  },
];

export const SIDEBAR_ITEMS = SIDEBAR_SECTIONS.flatMap((section) => section.items);
