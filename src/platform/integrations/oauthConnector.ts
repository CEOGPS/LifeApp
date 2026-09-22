// OAuth connector utilities for the browser

const WORKER_BASE = import.meta.env.VITE_WORKER_URL || "https://lifeos1-api.ceogps.workers.dev";

export interface OAuthConfig {
  provider: string;
  accountEmail: string;
  userId: string;
  redirectUri?: string;
}

export interface OAuthState {
  provider: string;
  accountEmail: string;
  state: string;
  timestamp: number;
}

const OAUTH_STATES_KEY = "lifeos1_oauth_states";

function getStoredStates(): OAuthState[] {
  try {
    const data = localStorage.getItem(OAUTH_STATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStates(states: OAuthState[]): void {
  try {
    localStorage.setItem(OAUTH_STATES_KEY, JSON.stringify(states));
  } catch (e) {
    console.warn("[OAuth] Failed to save states:", e);
  }
}

function generateState(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function startOAuth(config: OAuthConfig): Promise<{ url: string; state: string }> {
  const state = generateState();
  const redirectUri = config.redirectUri || `${window.location.origin}/oauth/callback`;
  
  // Store state for verification
  const states = getStoredStates();
  states.push({
    provider: config.provider,
    accountEmail: config.accountEmail,
    state,
    timestamp: Date.now(),
  });
  saveStates(states);
  
  // Clean up old states (> 10 min)
  const cutoff = Date.now() - 10 * 60 * 1000;
  saveStates(states.filter(s => s.timestamp > cutoff));
  
  const url = `${WORKER_BASE}/api/oauth/start?provider=${encodeURIComponent(config.provider)}&account_email=${encodeURIComponent(config.accountEmail)}&user_id=${encodeURIComponent(config.userId)}&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  return { url, state };
}

export function openOAuthPopup(url: string, provider: string): Window | null {
  const popup = window.open(
    url,
    `oauth_${provider}`,
    "width=600,height=700,noopener,noreferrer"
  );
  
  if (!popup) {
    // Fallback to same-window redirect
    window.location.href = url;
    return null;
  }
  
  return popup;
}

export function verifyOAuthState(provider: string, accountEmail: string, state: string): boolean {
  const states = getStoredStates();
  const index = states.findIndex(s => s.provider === provider && s.accountEmail === accountEmail && s.state === state);
  
  if (index !== -1) {
    // Remove used state
    states.splice(index, 1);
    saveStates(states);
    return true;
  }
  
  return false;
}

export async function checkOAuthStatus(provider: string, accountEmail: string, state?: string): Promise<{ connected: boolean; error?: string }> {
  try {
    const { supabase } = await import("@/platform/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.email || "";
    
    let url = `${WORKER_BASE}/api/oauth/status?provider=${encodeURIComponent(provider)}&user_id=${encodeURIComponent(userId)}&account_email=${encodeURIComponent(accountEmail)}`;
    if (state) {
      url += `&state=${encodeURIComponent(state)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
    });
    
    const data = await response.json().catch(() => ({}));
    const connected = !!(data.connected || data.ok || data.access_token || data.status === "connected");
    
    return { connected, error: data.error || data.message };
  } catch (e) {
    return { connected: false, error: e instanceof Error ? e.message : "Failed to check status" };
  }
}

export async function disconnectOAuth(provider: string, accountEmail: string): Promise<boolean> {
  try {
    const { supabase } = await import("@/platform/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${WORKER_BASE}/api/oauth/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ provider, account_email: accountEmail }),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

// Listen for OAuth completion via postMessage
export function listenForOAuthCompletion(
  state: string,
  onSuccess: () => void,
  onError: (error: string) => void,
  timeout = 5 * 60 * 1000
): () => void {
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "oauth_success" && event.data?.state === state) {
      onSuccess();
      window.removeEventListener("message", handleMessage);
    } else if (event.data?.type === "oauth_error" && event.data?.state === state) {
      onError(event.data.error || "OAuth failed");
      window.removeEventListener("message", handleMessage);
    }
  };
  
  window.addEventListener("message", handleMessage);
  
  const timeoutId = setTimeout(() => {
    window.removeEventListener("message", handleMessage);
    onError("OAuth timeout");
  }, timeout);
  
  return () => {
    window.removeEventListener("message", handleMessage);
    clearTimeout(timeoutId);
  };
}