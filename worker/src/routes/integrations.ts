import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/integrations/credential - Get integration credentials
router.get("/credential", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  // In production, fetch from Supabase/DB
  return Response.json({}, { headers: corsHeaders() });
});

// POST /api/integrations/credential - Save integration credential
router.post("/credential", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const body = await request.json().catch(() => ({}));
  
  // In production, save to Supabase/DB
  return Response.json({ success: true, id: crypto.randomUUID() }, { headers: corsHeaders() });
});

// DELETE /api/integrations/credential - Delete integration credential
router.delete("/credential", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const url = new URL(request.url);
  const integrationName = url.searchParams.get("integration_name");
  const label = url.searchParams.get("label");

  // In production, delete from Supabase/DB
  return Response.json({ success: true }, { headers: corsHeaders() });
});

export { router as integrationsRoutes };