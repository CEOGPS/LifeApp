import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// POST /api/llm/invoke - Invoke LLM with prompt
router.post("/invoke", async (request, env) => {
  try {
    const body = await request.json();
    const { prompt, systemPrompt, model = "auto", messages } = body;

    if (!prompt && !messages) {
      return Response.json({ error: "Missing prompt or messages" }, { 
        status: 400, 
        headers: corsHeaders() 
      });
    }

    // In production, this would call the actual LLM provider
    // For now return mock response
    const responseText = typeof prompt === 'string' 
      ? `Mock response to: ${prompt.slice(0, 100)}...`
      : "Mock response to messages";

    return Response.json({
      text: responseText,
      model_used: model,
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    }, { headers: corsHeaders() });

  } catch (e) {
    return Response.json({ error: "Invalid request" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }
});

// GET /api/llm/preference - Get user's preferred model
router.get("/preference", async (request, env) => {
  const userId = request.headers.get("X-User-Id");
  
  // In production, fetch from KV/DB
  return Response.json({
    preferred: "auto",
  }, { headers: corsHeaders() });
});

// POST /api/llm/preference - Set user's preferred model
router.post("/preference", async (request, env) => {
  const body = await request.json().catch(() => ({}));
  const { model } = body;

  if (!model) {
    return Response.json({ error: "Missing model" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  // In production, save to KV/DB
  return Response.json({ success: true, model }, { headers: corsHeaders() });
});

export { router as llmRoutes };