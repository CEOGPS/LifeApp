const R2_BASE = import.meta.env.VITE_R2_URL || "https://lifeos-r2.ceogps.workers.dev";

async function authHeaders(contentType?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;
  try {
    const { supabase } = await import("@/platform/supabase/client");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    const user = session?.user?.id || session?.user?.email;
    if (user) headers["X-User-Id"] = user;
  } catch {
    // unsigned local use
  }
  if (!headers["X-User-Id"] && typeof localStorage !== "undefined") {
    const id = localStorage.getItem("lifeos_user_id");
    if (id) headers["X-User-Id"] = id;
  }
  return headers;
}

export async function r2Put(
  key: string,
  body: Blob | ArrayBuffer | string,
  contentType = "application/octet-stream",
): Promise<{ ok: boolean; key: string; etag: string | null; size: number }> {
  const response = await fetch(
    `${R2_BASE}/api/r2/object?key=${encodeURIComponent(key)}`,
    { method: "PUT", headers: await authHeaders(contentType), body },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function r2Get(key: string): Promise<Blob> {
  const response = await fetch(
    `${R2_BASE}/api/r2/object?key=${encodeURIComponent(key)}`,
    { headers: await authHeaders() },
  );
  if (!response.ok) throw new Error(`R2 get failed: ${response.status}`);
  return response.blob();
}

export async function r2Delete(key: string): Promise<void> {
  const response = await fetch(
    `${R2_BASE}/api/r2/object?key=${encodeURIComponent(key)}`,
    { method: "DELETE", headers: await authHeaders() },
  );
  if (!response.ok) throw new Error(await response.text());
}

export async function r2List(prefix = ""): Promise<Array<{ key: string; size: number; uploaded: string }>> {
  const response = await fetch(
    `${R2_BASE}/api/r2/list?prefix=${encodeURIComponent(prefix)}`,
    { headers: await authHeaders() },
  );
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { objects: Array<{ key: string; size: number; uploaded: string }> };
  return data.objects;
}
