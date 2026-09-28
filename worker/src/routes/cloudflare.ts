import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/cloudflare/summary - Get Cloudflare summary
router.get("/summary", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  return Response.json({ 
    zones: 0,
    workers: 0,
    requests: 0
  }, { headers: corsHeaders() });
});

export { router as cloudflareRoutes };