// src/lib/unifiedStorage.ts
// Unified persistent storage — Supabase primary, Cloudflare KV via worker secondary, localStorage cache only

import { supabase } from "./supabaseClient";
import { getSupabaseClient } from "./supabaseClient";

const TABLE = "user_settings";
const LS_PREFIX = "lifeos_unified_";
const WORKER_BASE = import.meta.env.VITE_WORKER_URL || "https://lifeos1-api.ceogps.workers.dev";

interface UnifiedStorageOptions {
  useSupabase?: boolean;
  useWorkerKV?: boolean;
  userId?: string;
}

function getUserId(): string {
  // Try to get from Supabase auth
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lifeos_user_id");
    if (stored) return stored;
  }
  return "anonymous";
}

async function getUserIdAsync(): Promise<string> {
  try {
    const client = await getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    if (user?.id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("lifeos_user_id", user.id);
      }
      return user.id;
    }
  } catch {}
  return getUserId();
}

function lsRead(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(LS_PREFIX + key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

function lsWrite(key: string, val: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(val));
  } catch {
    // quota exceeded, ignore
  }
}

function lsDel(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_PREFIX + key);
  } catch {}
}

// Worker KV API calls
async function workerKVGet(key: string, userId: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${WORKER_BASE}/api/kv/get?key=${encodeURIComponent(key)}&user_id=${encodeURIComponent(userId)}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.value ?? null;
  } catch {
    return null;
  }
}

async function workerKVSet(key: string, value: unknown, userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${WORKER_BASE}/api/kv/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, user_id: userId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function workerKVDel(key: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${WORKER_BASE}/api/kv/del?key=${encodeURIComponent(key)}&user_id=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Supabase operations
async function sbGet(key: string, userId: string): Promise<unknown | null> {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from(TABLE)
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    if (error) {
      console.warn(`[unifiedStorage] Supabase getItem(${key}) failed:`, error.message);
      return null;
    }
    return (data as { value: unknown } | null)?.value ?? null;
  } catch (e) {
    console.warn(`[unifiedStorage] Supabase getItem(${key}) error:`, e);
    return null;
  }
}

async function sbSet(key: string, value: unknown, userId: string): Promise<boolean> {
  try {
    const client = await getSupabaseClient();
    const { error } = await (client as any)
      .from(TABLE)
      .upsert(
        { user_id: userId, key, value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" },
      );
    if (error) {
      console.warn(`[unifiedStorage] Supabase setItem(${key}) failed:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[unifiedStorage] Supabase setItem(${key}) error:`, e);
    return false;
  }
}

async function sbDel(key: string, userId: string): Promise<boolean> {
  try {
    const client = await getSupabaseClient();
    const { error } = await (client as any)
      .from(TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("key", key);
    if (error) {
      console.warn(`[unifiedStorage] Supabase removeItem(${key}) failed:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[unifiedStorage] Supabase removeItem(${key}) error:`, e);
    return false;
  }
}

async function sbListKeys(prefix?: string, userId?: string): Promise<string[]> {
  const uid = userId || await getUserIdAsync();
  try {
    const client = await getSupabaseClient();
    let query = (client as any).from(TABLE).select("key").eq("user_id", uid);
    if (prefix) query = query.like("key", `${prefix}%`);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r: { key: string }) => r.key);
  } catch (e) {
    console.warn(`[unifiedStorage] Supabase listKeys failed:`, e);
    // Fallback to localStorage
    const all: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) {
          const bare = k.slice(LS_PREFIX.length);
          if (!prefix || bare.startsWith(prefix)) all.push(bare);
        }
      }
    } catch {}
    return all;
  }
}

// Main unified storage functions
export async function unifiedGet<T = unknown>(key: string, options: UnifiedStorageOptions = {}): Promise<T | null> {
  const userId = options.userId || await getUserIdAsync();
  const useSupabase = options.useSupabase !== false;
  const useWorkerKV = options.useWorkerKV !== false;

  // 1. Check localStorage cache first (instant)
  const local = lsRead(key);
  if (local !== null) return local as T;

  // 2. Try Supabase (primary)
  if (useSupabase) {
    const remote = await sbGet(key, userId);
    if (remote !== null) {
      lsWrite(key, remote);
      return remote as T;
    }
  }

  // 3. Try Worker KV (secondary)
  if (useWorkerKV) {
    const remote = await workerKVGet(key, userId);
    if (remote !== null) {
      lsWrite(key, remote);
      return remote as T;
    }
  }

  return null;
}

export async function unifiedSet<T = unknown>(key: string, value: T, options: UnifiedStorageOptions = {}): Promise<boolean> {
  const userId = options.userId || await getUserIdAsync();
  const useSupabase = options.useSupabase !== false;
  const useWorkerKV = options.useWorkerKV !== false;

  // 1. Write to localStorage cache immediately
  lsWrite(key, value);

  // 2. Background sync to Supabase (primary)
  let sbOk = true;
  if (useSupabase) {
    sbOk = await sbSet(key, value, userId);
  }

  // 3. Background sync to Worker KV (secondary)
  let kvOk = true;
  if (useWorkerKV) {
    kvOk = await workerKVSet(key, value, userId);
  }

  return sbOk || kvOk;
}

export async function unifiedRemove(key: string, options: UnifiedStorageOptions = {}): Promise<boolean> {
  const userId = options.userId || await getUserIdAsync();
  const useSupabase = options.useSupabase !== false;
  const useWorkerKV = options.useWorkerKV !== false;

  // 1. Remove from localStorage cache
  lsDel(key);

  // 2. Background delete from Supabase
  let sbOk = true;
  if (useSupabase) {
    sbOk = await sbDel(key, userId);
  }

  // 3. Background delete from Worker KV
  let kvOk = true;
  if (useWorkerKV) {
    kvOk = await workerKVDel(key, userId);
  }

  return sbOk || kvOk;
}

export async function unifiedListKeys(prefix?: string, options: UnifiedStorageOptions = {}): Promise<string[]> {
  const userId = options.userId || await getUserIdAsync();
  const useSupabase = options.useSupabase !== false;

  const all: string[] = [];

  // Local keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) {
        const bare = k.slice(LS_PREFIX.length);
        if (!prefix || bare.startsWith(prefix)) all.push(bare);
      }
    }
  } catch {}

  // Remote keys from Supabase
  if (useSupabase) {
    try {
      const remote = await sbListKeys(prefix, userId);
      for (const r of remote) if (!all.includes(r)) all.push(r);
    } catch {}
  }

  return all;
}

// React hook for unified storage
import { useState, useEffect, useCallback } from "react";

interface UseUnifiedStorageMeta {
  loaded: boolean;
  isSyncing: boolean;
  lastSynced: number | null;
  error: string | null;
  sync: () => Promise<void>;
}

export function useUnifiedStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UnifiedStorageOptions = {}
): [T, (value: T | ((prev: T) => T)) => Promise<void>, UseUnifiedStorageMeta] {
  const getStoredValue = useCallback(async (): Promise<T> => {
    if (typeof window === "undefined") {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    const cached = lsRead(key);
    if (cached !== null) return cached as T;
    const remote = await unifiedGet<T>(key, options);
    return remote ?? (initialValue instanceof Function ? initialValue() : initialValue);
  }, [key, initialValue, options]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    const cached = lsRead(key);
    return cached !== null ? (cached as T) : (initialValue instanceof Function ? initialValue() : initialValue);
  });

  const [meta, setMeta] = useState<UseUnifiedStorageMeta>({
    loaded: false,
    isSyncing: false,
    lastSynced: null,
    error: null,
    sync: async () => {},
  });

  useEffect(() => {
    setMeta(prev => ({ ...prev, loaded: true }));
    // Hydrate from remote on mount
    (async () => {
      const remote = await unifiedGet<T>(key, options);
      if (remote !== null) {
        setStoredValue(remote);
        lsWrite(key, remote);
      }
    })();
  }, [key, options]);

  const sync = useCallback(async () => {
    setMeta(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const remote = await unifiedGet<T>(key, options);
      if (remote !== null) {
        setStoredValue(remote);
        lsWrite(key, remote);
        setMeta(prev => ({ ...prev, isSyncing: false, lastSynced: Date.now(), error: null }));
      } else {
        setMeta(prev => ({ ...prev, isSyncing: false, error: "No remote data found" }));
      }
    } catch (e) {
      setMeta(prev => ({ ...prev, isSyncing: false, error: e instanceof Error ? e.message : "Sync failed" }));
    }
  }, [key, options]);

  const setValue = useCallback(async (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      lsWrite(key, valueToStore);
      // Fire-and-forget background sync
      unifiedSet(key, valueToStore, options).catch(e => {
        console.warn(`[useUnifiedStorage] Background sync failed for ${key}:`, e);
      });
    } catch (error) {
      console.warn(`[useUnifiedStorage] Error setting value for ${key}:`, error);
    }
  }, [key, storedValue, options]);

  return [storedValue, setValue, { ...meta, sync }];
}

export function clearUnifiedStorage(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LS_PREFIX + key);
  }
}

export type { UseUnifiedStorageMeta, UnifiedStorageOptions };