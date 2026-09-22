// Cloudflare Workers KV integration with localStorage fallback

const WORKER_BASE = import.meta.env.VITE_WORKER_URL || "https://lifeos1-api.ceogps.workers.dev";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { supabase } = await import("@/platform/supabase/client");
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  if (session?.user?.email) headers["X-User-Id"] = session.user.email;
  return headers;
}

export async function kvLoad<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${WORKER_BASE}/api/kv/${encodeURIComponent(key)}`, { headers });
    if (response.ok) {
      const data = await response.json();
      return data.value as T;
    }
  } catch {
    // Fall through to localStorage
  }
  // Fallback to localStorage
  const { localStorageDB } = await import("@/platform/storage/localStorage");
  return localStorageDB.get(key, defaultValue);
}

export async function kvSave<T>(key: string, value: T): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${WORKER_BASE}/api/kv/${encodeURIComponent(key)}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ value }),
    });
    if (!response.ok) throw new Error("KV save failed");
    return;
  } catch {
    // Fall through to localStorage
  }
  // Fallback to localStorage
  const { localStorageDB } = await import("@/platform/storage/localStorage");
  localStorageDB.set(key, value);
}

export async function kvDelete(key: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${WORKER_BASE}/api/kv/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) throw new Error("KV delete failed");
    return;
  } catch {
    // Fall through to localStorage
  }
  const { localStorageDB } = await import("@/platform/storage/localStorage");
  localStorageDB.remove(key);
}

export async function kvList(prefix?: string): Promise<string[]> {
  try {
    const headers = await getAuthHeaders();
    const url = prefix ? `${WORKER_BASE}/api/kv?prefix=${encodeURIComponent(prefix)}` : `${WORKER_BASE}/api/kv`;
    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      return data.keys as string[];
    }
  } catch {
    // Fall through
  }
  const { localStorageDB } = await import("@/platform/storage/localStorage");
  return localStorageDB.keys();
}