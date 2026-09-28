import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/kv - List KV keys
router.get("/kv", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix");

  // In production, list from KV
  return Response.json({ keys: [] }, { headers: corsHeaders() });
});

// GET /api/kv/:key - Get KV value
router.get("/kv/:key", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const key = request.params.key;

  // In production, get from KV
  return Response.json({ value: null }, { headers: corsHeaders() });
});

// POST /api/kv/:key - Set KV value
router.post("/kv/:key", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const key = request.params.key;
  const body = await request.json().catch(() => ({}));
  const { value } = body;

  // In production, save to KV
  return Response.json({ success: true }, { headers: corsHeaders() });
});

// DELETE /api/kv/:key - Delete KV value
router.delete("/kv/:key", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const key = request.params.key;

  // In production, delete from KV
  return Response.json({ success: true }, { headers: corsHeaders() });
});

export { router as kvRoutes };