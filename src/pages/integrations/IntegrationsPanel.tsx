import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Plug,
  Search,
  Key,
  RefreshCw,
  Circle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import PanelLayout from "@/components/layout/PanelLayout.tsx";
import { usePersistentState } from "@/lib/usePersistentState.ts";
import { loadCredentials, saveCredential, deleteCredential } from "@/lib/integrationsSupabase.ts";
import { useAuth } from "@/lib/SupabaseAuthContext.tsx";

type Category =
  | "All"
  | "LLMs"
  | "Social"
  | "Marketing"
  | "Finance"
  | "Communications"
  | "Dev Tools"
  | "Business"
  | "AI Media"
  | "Productivity"
  | "Browsers"
  | "More";

type Integration = {
  name: string;
  category: Exclude<Category, "All">;
  icon: string;
  desc: string;
};

const INTEGRATIONS: Integration[] = [
  // LLMs
  { name: "OpenAI", category: "LLMs", icon: "🤖", desc: "GPT-4o, o1, and DALL·E via the OpenAI API." },
  { name: "Anthropic", category: "LLMs", icon: "🧠", desc: "Claude 3.5 Sonnet and Haiku models." },
  { name: "Google AI (Gemini)", category: "LLMs", icon: "✨", desc: "Gemini 1.5 Pro and Flash via Google AI Studio." },
  { name: "Hugging Face", category: "LLMs", icon: "🤗", desc: "Access thousands of open-source models." },
  { name: "Ollama (local)", category: "LLMs", icon: "🦙", desc: "Run LLMs locally on your own machine." },
  { name: "Groq", category: "LLMs", icon: "⚡", desc: "Ultra-fast inference with LPU hardware." },
  { name: "OpenRouter", category: "LLMs", icon: "🔀", desc: "Unified API gateway to 100+ models." },
  { name: "Grok (xAI)", category: "LLMs", icon: "𝕏", desc: "Grok-2 from xAI with real-time web access." },
  { name: "DeepSeek", category: "LLMs", icon: "🔍", desc: "DeepSeek-V3 and R1 reasoning models." },
  { name: "Mistral", category: "LLMs", icon: "🌬️", desc: "Mistral Large 2 and Mixtral series models." },
  { name: "Cohere", category: "LLMs", icon: "🌀", desc: "Command R+ for RAG and enterprise tasks." },
  { name: "Meta LLaMA", category: "LLMs", icon: "🦾", desc: "Llama 3.3 70B and 405B open models." },
  { name: "Gemma", category: "LLMs", icon: "💎", desc: "Google's lightweight open Gemma models." },
  { name: "Qwen", category: "LLMs", icon: "🐉", desc: "Alibaba's Qwen 2.5 multilingual models." },
  { name: "Hermes", category: "LLMs", icon: "🏛️", desc: "Nous Research Hermes fine-tuned models." },
  { name: "Anyscale", category: "LLMs", icon: "📡", desc: "Scalable OSS model endpoints via Anyscale." },
  { name: "NVIDIA NIM", category: "LLMs", icon: "🖥️", desc: "Deploy optimized models on NVIDIA NIM." },
  { name: "Copilot (Microsoft)", category: "LLMs", icon: "🪟", desc: "Microsoft Copilot Studio and Azure OpenAI." },
  { name: "Azure AI", category: "LLMs", icon: "☁️", desc: "Azure AI Foundry model deployments." },

  // Social
  { name: "Instagram", category: "Social", icon: "📸", desc: "Read/post to Instagram via Graph API." },
  { name: "Facebook", category: "Social", icon: "👥", desc: "Pages, groups, and feed management." },
  { name: "Twitter/X", category: "Social", icon: "🐦", desc: "Post tweets, read timelines, and analytics." },
  { name: "LinkedIn", category: "Social", icon: "💼", desc: "Profile data, posts, and company pages." },
  { name: "TikTok", category: "Social", icon: "🎵", desc: "Upload videos and pull TikTok analytics." },
  { name: "YouTube", category: "Social", icon: "▶️", desc: "Upload videos, manage playlists, analytics." },
  { name: "Reddit", category: "Social", icon: "🤖", desc: "Read subreddits, post, and track karma." },
  { name: "Snapchat", category: "Social", icon: "👻", desc: "Snap Kit login and story integrations." },
  { name: "Pinterest", category: "Social", icon: "📌", desc: "Create pins, boards, and track analytics." },
  { name: "Discord", category: "Social", icon: "🎮", desc: "Bot messages, webhooks, and server data." },
  { name: "Threads", category: "Social", icon: "🧵", desc: "Post and read Threads via Meta API." },
  { name: "CEO GPS", category: "Social", icon: "🗺️", desc: "Executive social presence tracking." },
  { name: "WhatsApp", category: "Social", icon: "💬", desc: "Business messaging via WhatsApp Cloud API." },
  { name: "Telegram", category: "Social", icon: "✈️", desc: "Bots, channels, and message automation." },
  { name: "Signal", category: "Social", icon: "🔒", desc: "Encrypted messaging via Signal Protocol." },
  { name: "Nextdoor", category: "Social", icon: "🏘️", desc: "Local community posts and business pages." },

  // Marketing
  { name: "Google Analytics", category: "Marketing", icon: "📊", desc: "GA4 events, audiences, and funnels." },
  { name: "Ahrefs", category: "Marketing", icon: "🔗", desc: "Backlinks, keywords, and SEO audits." },
  { name: "MOZ", category: "Marketing", icon: "🟣", desc: "Domain authority and keyword explorer." },
  { name: "Mailchimp", category: "Marketing", icon: "🐒", desc: "Email campaigns, audiences, and automations." },
  { name: "SendGrid", category: "Marketing", icon: "📧", desc: "Transactional email and marketing campaigns." },
  { name: "Brevo", category: "Marketing", icon: "💌", desc: "CRM, email, and SMS marketing platform." },
  { name: "Klaviyo", category: "Marketing", icon: "📣", desc: "E-commerce email & SMS automation." },
  { name: "HubSpot", category: "Marketing", icon: "🟠", desc: "CRM, marketing hub, and sales pipeline." },
  { name: "Monday.com", category: "Marketing", icon: "📅", desc: "Work OS for campaign and project tracking." },
  { name: "ClickUp", category: "Marketing", icon: "✅", desc: "Tasks, docs, goals, and time tracking." },
  { name: "Jotform", category: "Marketing", icon: "📋", desc: "Forms, surveys, and lead capture." },
  { name: "Postman", category: "Marketing", icon: "📮", desc: "API testing and team collaboration." },
  { name: "Canva", category: "Marketing", icon: "🎨", desc: "Design assets and brand templates." },

  // Finance
  { name: "Stripe", category: "Finance", icon: "💳", desc: "Payments, subscriptions, and billing." },
  { name: "Plaid", category: "Finance", icon: "🏦", desc: "Bank account linking and transaction data." },
  { name: "PayPal", category: "Finance", icon: "🅿️", desc: "Payments, invoices, and dispute management." },
  { name: "Venmo", category: "Finance", icon: "💸", desc: "Peer-to-peer payment tracking." },
  { name: "Cash App", category: "Finance", icon: "💵", desc: "Cash App business payments and payouts." },
  { name: "SoFi", category: "Finance", icon: "🏛️", desc: "SoFi banking and investment accounts." },
  { name: "Chase", category: "Finance", icon: "🔵", desc: "Chase bank data via Plaid integration." },
  { name: "Brex", category: "Finance", icon: "💼", desc: "Corporate cards, expenses, and budgets." },
  { name: "Digits", category: "Finance", icon: "🔢", desc: "Real-time financial analytics and AI CFO." },
  { name: "Crypto.com", category: "Finance", icon: "🪙", desc: "Crypto portfolio and exchange data." },
  { name: "Kraken", category: "Finance", icon: "🦑", desc: "Crypto trading and staking via Kraken API." },
  { name: "DraftKings", category: "Finance", icon: "🏆", desc: "Fantasy sports and betting account data." },
  { name: "Credit Karma", category: "Finance", icon: "📈", desc: "Credit score and financial health tracking." },
  { name: "Experian", category: "Finance", icon: "📉", desc: "Credit reports and identity monitoring." },
  { name: "MorningStar", category: "Finance", icon: "⭐", desc: "Investment research and portfolio ratings." },
  { name: "Mercury", category: "Finance", icon: "🪐", desc: "Mercury business bank accounts and cards." },

  // Communications
  { name: "Twilio", category: "Communications", icon: "📱", desc: "SMS, voice, and video programmable APIs." },
  { name: "Google Voice", category: "Communications", icon: "📞", desc: "Google Voice calls and SMS management." },
  { name: "Nylas", category: "Communications", icon: "✉️", desc: "Email, calendar, and contacts API layer." },
  { name: "Gmail (OAuth)", category: "Communications", icon: "📬", desc: "Read and send Gmail via Google OAuth." },
  { name: "Outlook", category: "Communications", icon: "📫", desc: "Microsoft Outlook email and contacts." },
  { name: "Apple iCloud", category: "Communications", icon: "🍎", desc: "iCloud Mail, contacts, and reminders." },
  { name: "Proton Mail", category: "Communications", icon: "🛡️", desc: "End-to-end encrypted email via Proton API." },
  { name: "Otter.ai", category: "Communications", icon: "🦦", desc: "Meeting transcription and AI summaries." },

  // Dev Tools
  { name: "Cloudflare", category: "Dev Tools", icon: "🌩️", desc: "DNS, CDN, Workers, and R2 storage." },
  { name: "AWS S3", category: "Dev Tools", icon: "🪣", desc: "Object storage and file management." },
  { name: "Azure Storage", category: "Dev Tools", icon: "🔷", desc: "Azure Blob, Queue, and Table storage." },
  { name: "GitHub", category: "Dev Tools", icon: "🐙", desc: "Repos, issues, PRs, and Actions." },
  { name: "GitLab", category: "Dev Tools", icon: "🦊", desc: "CI/CD pipelines and self-hosted repos." },
  { name: "Vercel", category: "Dev Tools", icon: "▲", desc: "Deploy and manage Vercel projects." },
  { name: "Supabase", category: "Dev Tools", icon: "⚡", desc: "Postgres, Auth, and Realtime backend." },
  { name: "Firebase", category: "Dev Tools", icon: "🔥", desc: "Firestore, Auth, and Cloud Functions." },
  { name: "PocketBase", category: "Dev Tools", icon: "🧳", desc: "Lightweight self-hosted backend and DB." },
  { name: "Prisma", category: "Dev Tools", icon: "🔺", desc: "Type-safe ORM and database migrations." },
  { name: "Docker", category: "Dev Tools", icon: "🐳", desc: "Container management and image builds." },
  { name: "VS Code", category: "Dev Tools", icon: "💻", desc: "VS Code settings sync and extensions." },
  { name: "Dropbox", category: "Dev Tools", icon: "📦", desc: "File sync, sharing, and Paper docs." },
  { name: "Browserbase", category: "Dev Tools", icon: "🌐", desc: "Headless browser automation in the cloud." },
  { name: "Replicate", category: "Dev Tools", icon: "🔁", desc: "Run and fine-tune ML models via API." },

  // Business
  { name: "Brilliant Directories", category: "Business", icon: "🗂️", desc: "Member directory and listing management." },
  { name: "WordPress", category: "Business", icon: "📝", desc: "Content management via WP REST API." },
  { name: "GoDaddy", category: "Business", icon: "🌍", desc: "Domain and website management." },
  { name: "Yelp", category: "Business", icon: "⭐", desc: "Business listings and review management." },
  { name: "YP.com", category: "Business", icon: "📖", desc: "Yellow Pages directory listing sync." },
  { name: "ShowMeLocal", category: "Business", icon: "📍", desc: "Local citation and listing management." },
  { name: "Alignable", category: "Business", icon: "🤝", desc: "Small business community networking." },
  { name: "Yahoo", category: "Business", icon: "🟣", desc: "Yahoo Finance and search integrations." },
  { name: "Airtable", category: "Business", icon: "🗃️", desc: "Databases, automations, and views." },
  { name: "Notion", category: "Business", icon: "📒", desc: "Docs, databases, and wikis via Notion API." },
  { name: "Zoominfo", category: "Business", icon: "🔭", desc: "B2B contact and company intelligence." },
  { name: "Linear", category: "Business", icon: "📐", desc: "Issue tracking and engineering workflows." },
  { name: "Plain", category: "Business", icon: "🎫", desc: "Customer support and ticketing platform." },
  { name: "Google Calendar", category: "Business", icon: "🗓️", desc: "Events, reminders, and scheduling." },
  { name: "Outlook Calendar", category: "Business", icon: "📆", desc: "Microsoft calendar events and meetings." },
  { name: "iCloud Calendar", category: "Business", icon: "🍏", desc: "Apple iCloud calendar sync." },

  // AI Media
  { name: "D-ID (avatar)", category: "AI Media", icon: "🧑‍💻", desc: "Realistic AI avatar video generation." },
  { name: "Suno (music)", category: "AI Media", icon: "🎸", desc: "AI-generated songs from text prompts." },
  { name: "ElevenLabs (voice)", category: "AI Media", icon: "🎙️", desc: "Ultra-realistic AI voice synthesis." },
  { name: "Stability AI", category: "AI Media", icon: "🖼️", desc: "Stable Diffusion image and video models." },
  { name: "Fish.Audio", category: "AI Media", icon: "🐟", desc: "Voice cloning and TTS synthesis." },
  { name: "Moondream2", category: "AI Media", icon: "🌙", desc: "Tiny vision-language model for edge." },
  { name: "Wan-AI", category: "AI Media", icon: "🌊", desc: "AI video generation via Wan 2.1." },
  { name: "Krea", category: "AI Media", icon: "🌈", desc: "Real-time AI image and video creation." },
  { name: "Blackforest Labs", category: "AI Media", icon: "🌲", desc: "FLUX image generation models." },
  { name: "Runwav", category: "AI Media", icon: "🎧", desc: "AI audio generation and sound effects." },
  { name: "Kling", category: "AI Media", icon: "🎬", desc: "Kling AI video generation from images." },
  { name: "Tenstrip", category: "AI Media", icon: "🎞️", desc: "AI-powered comic strip and storyboards." },

  // Browsers
  { name: "Opera", category: "Browsers", icon: "🔴", desc: "Opera browser automation and data sync." },
  { name: "Firefox", category: "Browsers", icon: "🦊", desc: "Firefox extension and bookmarks API." },
  { name: "Exa", category: "Browsers", icon: "🔎", desc: "Neural web search and content extraction." },
  { name: "Google Maps", category: "Browsers", icon: "🗺️", desc: "Places, geocoding, and directions API." },
  { name: "Apple Maps", category: "Browsers", icon: "🍎", desc: "MapKit JS and location services." },

  // Productivity (was empty)
  { name: "Todoist", category: "Productivity", icon: "✅", desc: "Tasks, projects, and productivity tracking." },
  { name: "Asana", category: "Productivity", icon: "📋", desc: "Work management and team coordination." },
  { name: "Trello", category: "Productivity", icon: "📌", desc: "Boards, cards, and Kanban workflows." },
  { name: "Calendly", category: "Productivity", icon: "📅", desc: "Scheduling and meeting automation." },

  // More
  { name: "Spotify", category: "More", icon: "🎵", desc: "Playback, playlists, and listening history." },
  { name: "Pandora", category: "More", icon: "📻", desc: "Pandora streaming and station data." },
  { name: "Vimeo", category: "More", icon: "🎥", desc: "Video hosting, analytics, and embedding." },
  { name: "Shutterstock", category: "More", icon: "📷", desc: "Stock photo and footage library search." },
  { name: "Genies", category: "More", icon: "🧞", desc: "Avatar and digital identity platform." },
  { name: "Ring", category: "More", icon: "🔔", desc: "Doorbell, camera, and alarm device API." },
  { name: "Temu", category: "More", icon: "🛍️", desc: "Temu marketplace product data and orders." },
  { name: "TikTok Shop", category: "More", icon: "🛒", desc: "TikTok Shop product listings and orders." },
  { name: "LunarCrush", category: "More", icon: "🌕", desc: "Social intelligence for crypto assets." },
  { name: "Malwarebytes", category: "More", icon: "🛡️", desc: "Threat detection and device security." },
  { name: "Trivago", category: "More", icon: "🏨", desc: "Hotel and travel price comparison." },
  { name: "Cron", category: "More", icon: "⏱️", desc: "Calendar and scheduling productivity app." },
  { name: "Alibaba", category: "More", icon: "🏪", desc: "Alibaba.com wholesale marketplace API." },
  { name: "Make (Integromat)", category: "More", icon: "⚙️", desc: "Visual automation workflows and scenarios." },
  { name: "Gumloop", category: "More", icon: "🔄", desc: "No-code AI workflow automation." },
  { name: "Antigravity", category: "More", icon: "🚀", desc: "AI-powered business growth platform." },
  { name: "Lumin", category: "More", icon: "💡", desc: "Document collaboration and PDF editing." },
  { name: "Luma", category: "More", icon: "🌟", desc: "NeRF and 3D scene capture platform." },
  { name: "Slack", category: "More", icon: "💬", desc: "Team messaging, bots, and workflows." },
  { name: "Hercules", category: "More", icon: "⚡", desc: "Hercules platform API and app services." },
  { name: "Base44", category: "More", icon: "🔧", desc: "No-code app builder and data platform." },
  { name: "QuarkAI", category: "More", icon: "⚛️", desc: "AI-native productivity and knowledge hub." },
];

const CATEGORIES: Category[] = [
  "All", "LLMs", "Social", "Marketing", "Finance", "Communications",
  "Dev Tools", "Business", "AI Media", "Productivity", "Browsers", "More",
];

const TEAL_LABEL = "oklch(0.75 0.15 175)";

// ── Credential model ────────────────────────────────────────────────────────
type Credential = {
  id: string;
  label: string;
  type: "apikey" | "oauth";
  status: "connected" | "pending" | "disconnected" | "error";
  provider?: string;
  keyPreview?: string;
  addedAt: number;
  lastSyncedAt?: number;
  lastSync?: string;
  syncError?: string;
  oauthState?: string; // for CSRF + pending tracking
};

// Services that support OAuth (many are hybrid)
const OAUTH_SERVICES = new Set([
  "Gmail (OAuth)", "Outlook", "Outlook Calendar", "Apple iCloud", "iCloud Calendar",
  "Google Analytics", "Google Calendar", "Google Drive", "Google Sheets",
  "Google Search Console", "Google Ads", "Google AI (Gemini)",
  "LinkedIn", "Twitter/X", "Facebook", "Instagram", "TikTok", "TikTok Shop",
  "YouTube", "GitHub", "Slack", "Spotify", "Zoom", "ClickUp", "Airtable",
  "HubSpot", "Monday.com", "Notion", "Discord", "Twilio", "Plaid",
  "Pinterest", "Reddit", "Snapchat", "Threads", "Stripe", "Dropbox",
  "Canva", "Linear", "Asana", "Trello", "Todoist", "Calendly",
  "Microsoft", "Copilot (Microsoft)", "Azure AI",
]);

// Provider slug → Worker must know these
const OAUTH_SLUG: Record<string, string> = {
  "Gmail (OAuth)": "google",
  "Google Analytics": "google",
  "Google Ads": "google",
  "Google Calendar": "google",
  "Google Drive": "google",
  "Google Sheets": "google",
  "Google Search Console": "google",
  "Google AI (Gemini)": "google",
  "YouTube": "google",
  LinkedIn: "linkedin",
  "Twitter/X": "twitter",
  Facebook: "facebook",
  Instagram: "instagram",
  Threads: "instagram",
  TikTok: "tiktok",
  "TikTok Shop": "tiktok",
  GitHub: "github",
  Slack: "slack",
  Spotify: "spotify",
  Zoom: "zoom",
  ClickUp: "clickup",
  Airtable: "airtable",
  HubSpot: "hubspot",
  "Monday.com": "monday",
  Notion: "notion",
  Discord: "discord",
  Twilio: "twilio",
  Reddit: "reddit",
  Pinterest: "pinterest",
  Snapchat: "snapchat",
  Microsoft: "microsoft",
  Outlook: "microsoft",
  "Outlook Calendar": "microsoft",
  "Copilot (Microsoft)": "microsoft",
  "Azure AI": "microsoft",
  Stripe: "stripe",
  Dropbox: "dropbox",
  Canva: "canva",
  Linear: "linear",
  Asana: "asana",
  Trello: "trello",
  Todoist: "todoist",
  Calendly: "calendly",
  Plaid: "plaid",
  "Apple iCloud": "apple",
  "iCloud Calendar": "apple",
};

const WORKER_BASE =
  import.meta.env.VITE_WORKER_URL || "https://lifeos1-api.ceogps.workers.dev";
const WORKER_CONFIGURED = Boolean(import.meta.env.VITE_WORKER_URL);

const SYNC_ROUTES: Record<string, { url: string; summarize: (d: unknown) => string }> = {
  "Gmail (OAuth)": { url: "/api/email/accounts", summarize: emailSummary },
  Outlook: { url: "/api/email/accounts", summarize: emailSummary },
  "Proton Mail": { url: "/api/email/accounts", summarize: emailSummary },
  Nylas: { url: "/api/nylas/accounts", summarize: flatSummary },
  Stripe: { url: "/api/stripe/summary", summarize: flatSummary },
  Cloudflare: { url: "/api/cloudflare/summary", summarize: flatSummary },
  YouTube: { url: "/api/youtube/channel", summarize: flatSummary },
  GitHub: { url: "/api/github/user", summarize: flatSummary },
  Slack: { url: "/api/slack/workspace", summarize: flatSummary },
  Notion: { url: "/api/notion/me", summarize: flatSummary },
  "Google Calendar": { url: "/api/calendar/events", summarize: flatSummary },
  Spotify: { url: "/api/spotify/me", summarize: flatSummary },
};

function emailSummary(d: unknown): string {
  if (Array.isArray(d)) return `${d.length} email account(s) connected`;
  return flatSummary(d);
}

function flatSummary(d: unknown): string {
  try {
    const s = JSON.stringify(d);
    if (!s || s.length < 4) return "empty";
    return s.length > 90 ? s.slice(0, 90) + "…" : s;
  } catch {
    return "n/a";
  }
}

function slugOf(name: string): string {
  return OAUTH_SLUG[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function generateState(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export default function IntegrationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [data, setData] = usePersistentState<Record<string, Credential[]>>(
    "integrations_data",
    {}
  );
  const [modalFor, setModalFor] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"apikey" | "oauth">("apikey");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [loadingCreds, setLoadingCreds] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from Supabase
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setLoadingCreds(false);
      return;
    }
    const load = async () => {
      setLoadingCreds(true);
      try {
        const credsMap = await loadCredentials(user.email);
        const converted: Record<string, Credential[]> = {};
        for (const [integrationName, accounts] of Object.entries(credsMap)) {
          converted[integrationName] = Object.values(accounts).map((acc: any) => ({
            id: acc.id || `${integrationName}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            label: acc.label || acc.email || "Unknown",
            type: acc.api_key ? "apikey" : "oauth",
            status:
              acc.status === "on" || acc.status === "connected"
                ? "connected"
                : acc.status === "pending"
                  ? "pending"
                  : "disconnected",
            provider: acc.oauth_provider || slugOf(integrationName),
            keyPreview: acc.api_key
              ? acc.api_key.replace(/^(.{4}).*(.{2})$/, "$1••••••$2")
              : undefined,
            addedAt: acc.created_at ? new Date(acc.created_at).getTime() : Date.now(),
            lastSyncedAt: acc.updated_at ? new Date(acc.updated_at).getTime() : undefined,
            lastSync: acc.oauth_access_token ? "OAuth connected" : acc.last_sync || undefined,
            syncError: acc.sync_error || undefined,
          }));
        }
        setData(converted);
      } catch (e) {
        console.warn("[Integrations] Failed to load credentials:", e);
      } finally {
        setLoadingCreds(false);
      }
    };
    load();
  }, [isAuthenticated, user?.email, setData]);

  // Auto-poll pending OAuth credentials every 8s
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const poll = async () => {
      const pending: { name: string; cred: Credential }[] = [];
      for (const [name, creds] of Object.entries(data || {})) {
        for (const c of creds) {
          if (c.type === "oauth" && c.status === "pending" && c.provider) {
            pending.push({ name, cred: c });
          }
        }
      }
      if (pending.length === 0) return;

      await Promise.all(
        pending.map(async ({ name, cred }) => {
          try {
            const res = await fetch(
              `${WORKER_BASE}/api/oauth/status?provider=${encodeURIComponent(cred.provider!)}&user_id=${encodeURIComponent(user.email)}&account_email=${encodeURIComponent(cred.label)}&state=${encodeURIComponent(cred.oauthState || "")}`
            );
            const j = await res.json().catch(() => null);
            const ok = !!(j && (j.connected || j.ok || j.access_token || j.status === "connected"));
            if (ok) {
              updateCreds(name, (c) =>
                c.map((x) =>
                  x.id === cred.id
                    ? {
                        ...x,
                        status: "connected" as const,
                        lastSync: "OAuth connected",
                        lastSyncedAt: Date.now(),
                        syncError: undefined,
                      }
                    : x
                )
              );
              // Persist success
              if (user?.email) {
                await saveCredential(user.email, {
                  user_email: user.email,
                  integration_name: name,
                  email: cred.label,
                  status: "on",
                  label: cred.label,
                  oauth_provider: cred.provider,
                }).catch(() => {});
              }
            } else if (j?.error || j?.message) {
              updateCreds(name, (c) =>
                c.map((x) =>
                  x.id === cred.id
                    ? { ...x, syncError: j.message || j.error || "Still pending" }
                    : x
                )
              );
            }
          } catch {
            // silent on poll failure
          }
        })
      );
    };

    pollRef.current = setInterval(poll, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [data, isAuthenticated, user?.email]);

  const totalConnected = Object.values(data || {}).reduce(
    (n, creds) => n + creds.filter((c) => c.status === "connected").length,
    0
  );

  const filtered = useMemo(() => {
    return INTEGRATIONS.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const updateCreds = useCallback(
    (name: string, updater: (c: Credential[]) => Credential[]) =>
      setData((prev) => ({ ...(prev ?? {}), [name]: updater(prev?.[name] || []) })),
    [setData]
  );

  // API key flow
  const addApiKey = async (name: string, label: string, key: string) => {
    if (!label.trim() || !key.trim() || !user?.email) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const cred: Credential = {
      id,
      label: label.trim(),
      type: "apikey",
      status: "connected",
      keyPreview: key.replace(/^(.{4}).*(.{2})$/, "$1••••••$2") || "key",
      addedAt: Date.now(),
    };
    updateCreds(name, (c) => [cred, ...c]);

    await saveCredential(user.email, {
      user_email: user.email,
      integration_name: name,
      email: label.trim(),
      api_key: key,
      status: "on",
      label: label.trim(),
    }).catch((e) => console.warn("[Integrations] saveCredential failed", e));
  };

  // OAuth start – proper popup + state
  const startOAuth = async (name: string, label: string) => {
    if (!label.trim() || !user?.email) return;
    if (!WORKER_CONFIGURED) {
      alert("OAuth requires VITE_WORKER_URL to be set.");
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const provider = slugOf(name);
    const state = generateState();

    updateCreds(name, (c) => [
      {
        id,
        label: label.trim(),
        type: "oauth",
        status: "pending",
        provider,
        addedAt: Date.now(),
        oauthState: state,
      },
      ...c,
    ]);
    setModalFor(null);

    const startUrl = `${WORKER_BASE}/api/oauth/start?provider=${encodeURIComponent(
      provider
    )}&account_email=${encodeURIComponent(label.trim())}&user_id=${encodeURIComponent(
      user.email
    )}&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(
      window.location.origin + "/oauth/callback"
    )}`;

    // Open popup (preferred) or new tab
    const popup = window.open(
      startUrl,
      `oauth_${provider}`,
      "width=600,height=700,noopener,noreferrer"
    );

    if (!popup) {
      // fallback: same-window redirect
      window.location.href = startUrl;
      return;
    }

    // Optional: listen for postMessage from callback page if you implement one
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "oauth_success" && event.data?.state === state) {
        updateCreds(name, (c) =>
          c.map((x) =>
            x.id === id
              ? { ...x, status: "connected" as const, lastSync: "OAuth connected", lastSyncedAt: Date.now() }
              : x
          )
        );
        window.removeEventListener("message", onMessage);
      }
    };
    window.addEventListener("message", onMessage);

    // Safety: clean up listener after 5 min
    setTimeout(() => window.removeEventListener("message", onMessage), 5 * 60 * 1000);
  };

  // Manual status check
  const checkOAuth = async (name: string, cred: Credential) => {
    if (!cred.provider || !user?.email) return;
    try {
      const res = await lifeosApi(`/api/oauth/status?provider=${encodeURIComponent(
        cred.provider
      )}&user_id=${encodeURIComponent(user.email)}&account_email=${encodeURIComponent(
        cred.label
      )}&state=${encodeURIComponent(cred.oauthState || "")}`, { method: "GET" });
      const ok = !!(res && (res.connected || res.ok || res.access_token || res.status === "connected"));
      updateCreds(name, (c) =>
        c.map((x) =>
          x.id === cred.id
            ? {
                ...x,
                status: ok ? "connected" : "pending",
                lastSync: ok ? "OAuth connected" : x.lastSync,
                lastSyncedAt: ok ? Date.now() : x.lastSyncedAt,
                syncError: ok ? undefined : (res && (res.message || res.error)) || "Not connected yet",
              }
            : x
        )
      );
    } catch {
      updateCreds(name, (c) =>
        c.map((x) =>
          x.id === cred.id ? { ...x, syncError: "Worker unreachable" } : x
        )
      );
    }
  };

  // Live sync
  const syncCred = async (name: string, cred: Credential) => {
    const route = SYNC_ROUTES[name];
    if (!route) {
      updateCreds(name, (c) =>
        c.map((x) =>
          x.id === cred.id ? { ...x, syncError: "No live endpoint wired yet" } : x
        )
      );
      return;
    }
    setSyncingId(cred.id);
    try {
      const res = await lifeosApi(route.url, {
        headers: { "X-User-Id": user?.email || "" },
      });
      updateCreds(name, (c) =>
        c.map((x) =>
          x.id === cred.id
            ? {
                ...x,
                lastSync: route.summarize(res),
                lastSyncedAt: Date.now(),
                syncError: undefined,
              }
            : x
        )
      );
    } catch (e) {
      updateCreds(name, (c) =>
        c.map((x) =>
          x.id === cred.id
            ? { ...x, syncError: e instanceof Error ? e.message : "Sync failed" }
            : x
        )
      );
    } finally {
      setSyncingId(null);
    }
  };

  const removeCred = async (name: string, id: string) => {
    const cred = data?.[name]?.find((c) => c.id === id);
    updateCreds(name, (c) => c.filter((x) => x.id !== id));
    if (cred && user?.email) {
      await deleteCredential(user.email, name, cred.label).catch(() => {});
    }
  };

  const openModal = (name: string, mode: "apikey" | "oauth") => {
    setModalMode(mode);
    setModalFor(name);
  };

  return (
    <PanelLayout
      title="Integrations"
      subtitle={`${INTEGRATIONS.length} integrations available · ${totalConnected} connected`}
      icon={<Plug size={16} />}
    >
      {/* Toolbar */}
      <div className="shrink-0 flex flex-col gap-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: "oklch(0.12 0.04 20 / 60%)",
            border: "1px solid oklch(0.55 0.22 20 / 25%)",
          }}
        >
          <Search size={14} className="text-white/40 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations…"
            className="bg-transparent outline-none text-white/80 placeholder:text-white/30 text-xs w-full font-display tracking-wide"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-3 py-1 rounded-md text-[10px] font-display tracking-widest uppercase transition-all cursor-pointer"
                style={{
                  background: isActive ? "oklch(0.55 0.22 20 / 30%)" : "oklch(0.12 0.04 20 / 40%)",
                  border: isActive ? "1px solid oklch(0.55 0.22 20 / 60%)" : "1px solid oklch(0.55 0.22 20 / 15%)",
                  color: isActive ? "oklch(0.75 0.22 20)" : "oklch(0.6 0.05 20)",
                  boxShadow: isActive ? "0 0 8px oklch(0.55 0.22 20 / 30%)" : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 text-[10px] font-display tracking-widest" style={{ color: TEAL_LABEL }}>
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" && ` in ${activeCategory}`}
        {search && ` for "${search}"`}
        {loadingCreds && " · loading credentials…"}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-white/30 text-xs font-display tracking-widest">
            No integrations found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((integration) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
                creds={data?.[integration.name] || []}
                syncingId={syncingId}
                onOpenApiKey={() => openModal(integration.name, "apikey")}
                onOpenOAuth={() => openModal(integration.name, "oauth")}
                onRemove={(id) => removeCred(integration.name, id)}
                onSync={(c) => syncCred(integration.name, c)}
                onCheckOAuth={(c) => checkOAuth(integration.name, c)}
              />
            ))}
          </div>
        )}
      </div>

      {modalFor && (
        <ConnectModal
          name={modalFor}
          canOAuth={OAUTH_SERVICES.has(modalFor)}
          mode={modalMode}
          onClose={() => setModalFor(null)}
          onSaveKey={(label, key) => addApiKey(modalFor, label, key)}
          onStartOAuth={async (label) => startOAuth(modalFor, label)}
        />
      )}
    </PanelLayout>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────
type IntegrationCardProps = {
  integration: Integration;
  creds: Credential[];
  syncingId: string | null;
  onOpenApiKey: () => void;
  onOpenOAuth: () => void;
  onRemove: (id: string) => void;
  onSync: (c: Credential) => void;
  onCheckOAuth: (c: Credential) => void;
};

function IntegrationCard({
  integration,
  creds,
  syncingId,
  onOpenApiKey,
  onOpenOAuth,
  onRemove,
  onSync,
  onCheckOAuth,
}: IntegrationCardProps) {
  const canApikey = true; // most services accept API keys; OAuth is additive
  const canOAuth = OAUTH_SERVICES.has(integration.name);
  const connectedCount = creds.filter((c) => c.status === "connected").length;

  return (
    <div
      className="glass-crimson rounded-xl p-3 flex flex-col gap-2.5 group transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: "oklch(0.1 0.04 20 / 55%)",
        border: "1px solid oklch(0.55 0.22 20 / 20%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{integration.icon}</span>
          <div>
            <p className="text-white/80 text-xs font-display tracking-wide leading-tight">
              {integration.name}
            </p>
            <span className="text-[9px] font-display tracking-widest uppercase" style={{ color: "oklch(0.75 0.15 175)" }}>
              {integration.category}
            </span>
          </div>
        </div>
        <span
          className="mt-0.5 shrink-0 flex items-center gap-1 text-[9px] font-display tracking-widest"
          style={{ color: connectedCount > 0 ? "oklch(0.72 0.18 145)" : "oklch(0.55 0 0 / 0.4)" }}
        >
          {connectedCount > 0 ? (
            <CheckCircle2 size={13} style={{ color: "oklch(0.72 0.18 145)", filter: "drop-shadow(0 0 4px oklch(0.72 0.18 145 / 70%))" }} />
          ) : (
            <Circle size={13} className="text-white/20" />
          )}
          {connectedCount > 0 ? `${connectedCount}●` : ""}
        </span>
      </div>

      <p className="text-white/50 text-[10px] leading-relaxed font-display tracking-wide line-clamp-2">
        {integration.desc}
      </p>

      {creds.length > 0 && (
        <div className="flex flex-col gap-1">
          {creds.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-2 py-1 rounded-md"
              style={{ background: "oklch(1 0 0 / 3%)", border: "1px solid oklch(0.55 0.22 20 / 12%)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background:
                    c.status === "connected"
                      ? "oklch(0.72 0.18 145)"
                      : c.status === "pending"
                        ? "oklch(0.8 0.15 80)"
                        : "oklch(0.55 0.2 25 / 0.5)",
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-white/70 truncate font-display">{c.label}</div>
                <div className="text-[8px] text-white/30 truncate">
                  {c.type === "apikey" ? c.keyPreview : c.status}
                  {c.syncError && ` · ${c.syncError}`}
                </div>
              </div>
              {c.type === "oauth" && c.status === "pending" && (
                <button onClick={() => onCheckOAuth(c)} title="Check connection status" className="text-white/30 hover:text-white/70 transition-colors cursor-pointer">
                  <RefreshCw size={9} />
                </button>
              )}
              {(c.type === "apikey" || c.status === "connected") && SYNC_ROUTES[integration.name] && (
                <button onClick={() => onSync(c)} title="Pull live data" className="text-white/30 hover:text-white/70 transition-colors cursor-pointer">
                  {syncingId === c.id ? <Loader2 size={10} className="animate-spin" /> : <span className="text-base leading-none">🔄</span>}
                </button>
              )}
              <button onClick={() => onRemove(c.id)} title="Remove account" className="text-white/25 hover:text-primary transition-colors cursor-pointer">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 mt-auto">
        {canApikey && (
          <button
            onClick={onOpenApiKey}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-display tracking-widest uppercase transition-all cursor-pointer hover:brightness-110 active:scale-95"
            style={{ background: "oklch(0.55 0.22 20 / 18%)", border: "1px solid oklch(0.55 0.22 20 / 35%)", color: "oklch(0.78 0.18 20)" }}
          >
            <Key size={9} />
            API KEY
          </button>
        )}
        {canOAuth && (
          <button
            onClick={onOpenOAuth}
            disabled={!WORKER_CONFIGURED}
            title={!WORKER_CONFIGURED ? "Set VITE_WORKER_URL in .env" : "Connect via OAuth"}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-display tracking-widest uppercase transition-all cursor-pointer hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "oklch(0.75 0.15 175 / 12%)", border: "1px solid oklch(0.75 0.15 175 / 30%)", color: "oklch(0.75 0.15 175)" }}
          >
            <RefreshCw size={9} />
            OAUTH
          </button>
        )}
      </div>
    </div>
  );
}

// ── Connect modal ───────────────────────────────────────────────────────────
type ConnectModalProps = {
  name: string;
  canOAuth: boolean;
  mode: "apikey" | "oauth";
  onClose: () => void;
  onSaveKey: (label: string, key: string) => void;
  onStartOAuth: (label: string) => Promise<void>;
};

function ConnectModal({ name, canOAuth, mode, onClose, onSaveKey, onStartOAuth }: ConnectModalProps) {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [starting, setStarting] = useState(false);

  const submit = () => {
    if (mode === "apikey") {
      onSaveKey(label, key);
      onClose();
    } else {
      if (!label.trim()) return;
      setStarting(true);
      onStartOAuth(label).finally(() => setStarting(false));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: "oklch(0 0 0 / 80%)" }} onClick={onClose}>
      <div className="glass rounded-2xl border w-full max-w-md overflow-hidden flex flex-col" style={{ borderColor: "oklch(0.55 0.22 20 / 25%)" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "oklch(0.55 0.22 20 / 15%)" }}>
          <span className="font-display text-sm tracking-wider" style={{ color: "oklch(0.62 0.22 20)" }}>
            CONNECT · {name.toUpperCase()}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-primary transition-colors">✕</button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          <p className="text-[10px] text-white/30 leading-relaxed">
            {canOAuth
              ? "LifeOS1 supports multiple accounts per service. Enter the account email/label first — it is bound before the OAuth handoff."
              : "Enter an account label and the API key for this service."}
          </p>

          <div>
            <label className="text-[9px] font-display tracking-wider block mb-1" style={{ color: "oklch(0.75 0.15 175)" }}>
              ACCOUNT LABEL / EMAIL
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-8 px-3 text-xs rounded-lg text-white/85 placeholder:text-white/20 focus:outline-none"
              style={{ background: "oklch(1 0 0 / 4%)", border: "1px solid oklch(0.55 0.22 20 / 15%)" }}
            />
          </div>

          {mode === "apikey" && (
            <div>
              <label className="text-[9px] font-display tracking-wider block mb-1" style={{ color: "oklch(0.75 0.15 175)" }}>
                API KEY
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-…"
                className="w-full h-8 px-3 text-xs rounded-lg text-white/85 placeholder:text-white/20 focus:outline-none"
                style={{ background: "oklch(1 0 0 / 4%)", border: "1px solid oklch(0.55 0.22 20 / 15%)" }}
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: "oklch(0.55 0.22 20 / 15%)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg glass text-white/50 text-xs font-display hover:text-white/80 transition-all">
            CANCEL
          </button>
          <button
            onClick={submit}
            disabled={mode === "apikey" ? !label.trim() || !key.trim() : !label.trim() || starting}
            className="px-4 py-2 rounded-lg glass-crimson text-primary text-xs font-display hover:glow-crimson-sm transition-all disabled:opacity-40"
          >
            {mode === "apikey" ? "SAVE KEY" : starting ? "STARTING…" : "CONNECT"}
          </button>
        </div>
      </div>
    </div>
  );
}