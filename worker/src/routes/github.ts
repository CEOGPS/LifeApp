import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/github/user - Get GitHub user
router.get("/user", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: corsHeaders() 
    });
  }

  return Response.json({ 
    login: "", 
    name: "", 
    repos: 0,
    followers: 0
  }, { headers: corsHeaders() });
});

export { router as githubRoutes };