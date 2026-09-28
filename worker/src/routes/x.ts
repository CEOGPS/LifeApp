import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/x/timeline - Get X timeline
router.get("/timeline", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const url = new URL(request.url);
  const handle = url.searchParams.get("handle");
  const max = parseInt(url.searchParams.get("max") || "10");

  return Response.json({ data: [], meta: {} }, { headers: corsHeaders() });
});

// GET /api/x/user - Get X user
router.get("/user", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  const url = new URL(request.url);
  const handle = url.searchParams.get("handle");

  return Response.json({ 
    username: handle,
    name: "",
    followers: 0,
    following: 0
  }, { headers: corsHeaders() });
});

export { router as xRoutes };