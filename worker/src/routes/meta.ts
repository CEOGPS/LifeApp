import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/meta/feed - Get Meta feed
router.get("/feed", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "8");

  return Response.json({ data: [], paging: {} }, { headers: corsHeaders() });
});

// GET /api/meta/status - Get Meta connection status
router.get("/status", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  return Response.json({ connected: false }, { headers: corsHeaders() });
});

// GET /api/meta/instagram/feed - Get Instagram feed
router.get("/instagram/feed", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "10");

  return Response.json({ data: [], paging: {} }, { headers: corsHeaders() });
});

export { router as metaRoutes };