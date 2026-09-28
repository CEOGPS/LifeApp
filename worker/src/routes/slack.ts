import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/slack/workspace - Get Slack workspace info
router.get("/workspace", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  return Response.json({ 
    name: "", 
    channels: 0,
    members: 0
  }, { headers: corsHeaders() });
});

export { router as slackRoutes };