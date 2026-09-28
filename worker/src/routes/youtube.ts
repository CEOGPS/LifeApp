import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/youtube/channel - Get YouTube channel
router.get("/channel", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  return Response.json({ 
    title: "", 
    subscribers: 0,
    videos: 0
  }, { headers: corsHeaders() });
});

export { router as youtubeRoutes };