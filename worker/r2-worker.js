const ALLOW = new Set([
  "https://lifeos1.pages.dev",
  "https://zero.ceogps.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function cors(request) {
  const origin = request.headers.get("Origin") || "";
  const allow = ALLOW.has(origin) ? origin : "https://lifeos1.pages.dev";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,HEAD,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-User-Id",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function userPrefix(request, url) {
  const raw = request.headers.get("X-User-Id") || url.searchParams.get("user_id") || "anonymous";
  return raw.replace(/[^a-zA-Z0-9@._-]/g, "").slice(0, 120) || "anonymous";
}

function objectKey(user, key) {
  const clean = String(key || "").replace(/^\/+/, "").replace(/\.\./g, "");
  if (!clean || clean.length > 512) return null;
  return `${user}/${clean}`;
}

export default {
  async fetch(request, env) {
    const headers = cors(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    const user = userPrefix(request, url);
    const json = (data, status = 200) => Response.json(data, { status, headers });
    try {
      if (url.pathname === "/health") {
        return json({ ok: true, bucket: "lifeos-storage", bound: !!env.LIFEOS_STORAGE });
      }
      if (url.pathname === "/api/r2/list" && request.method === "GET") {
        const extra = (url.searchParams.get("prefix") || "").replace(/^\/+/, "").replace(/\.\./g, "");
        const listed = await env.LIFEOS_STORAGE.list({ prefix: `${user}/${extra}`, limit: 100 });
        return json({
          objects: listed.objects.map((o) => ({
            key: o.key.slice(user.length + 1),
            size: o.size,
            uploaded: o.uploaded,
          })),
          truncated: listed.truncated,
        });
      }
      if (url.pathname === "/api/r2/object") {
        const key = objectKey(user, url.searchParams.get("key") || "");
        if (!key) return json({ error: "Missing or invalid key" }, 400);
        if (request.method === "PUT" || request.method === "POST") {
          const bytes = await request.arrayBuffer();
          const type = request.headers.get("Content-Type") || "application/octet-stream";
          const obj = await env.LIFEOS_STORAGE.put(key, bytes, { httpMetadata: { contentType: type } });
          return json({ ok: true, key: key.slice(user.length + 1), etag: obj?.etag || null, size: bytes.byteLength });
        }
        if (request.method === "GET" || request.method === "HEAD") {
          const obj = await env.LIFEOS_STORAGE.get(key);
          if (!obj) return new Response("Not found", { status: 404, headers });
          const out = {
            ...headers,
            "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
            "Cache-Control": "private, max-age=60",
          };
          if (request.method === "HEAD") return new Response(null, { headers: out });
          return new Response(obj.body, { headers: out });
        }
        if (request.method === "DELETE") {
          await env.LIFEOS_STORAGE.delete(key);
          return json({ ok: true });
        }
      }
      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: String(err?.message || err) }, 500);
    }
  },
};
