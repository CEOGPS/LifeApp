import { Router } from "itty-router";
import { corsHeaders, withCors } from "./utils/cors";

// Import route handlers
import { oauthRoutes } from "./routes/oauth";
import { llmRoutes } from "./routes/llm";
import { integrationsRoutes } from "./routes/integrations";
import { activityRoutes } from "./routes/activity";
import { kvRoutes } from "./routes/kv";
import { vaultRoutes } from "./routes/vault";
import { emailRoutes } from "./routes/email";
import { stripeRoutes } from "./routes/stripe";
import { githubRoutes } from "./routes/github";
import { slackRoutes } from "./routes/slack";
import { notionRoutes } from "./routes/notion";
import { calendarRoutes } from "./routes/calendar";
import { spotifyRoutes } from "./routes/spotify";
import { youtubeRoutes } from "./routes/youtube";
import { cloudflareRoutes } from "./routes/cloudflare";
import { nylasRoutes } from "./routes/nylas";
import { socialRoutes } from "./routes/social";
import { contactsRoutes } from "./routes/contacts";
import { agentsRoutes } from "./routes/agents";
import { tasksRoutes } from "./routes/tasks";
import { financeRoutes } from "./routes/finance";
import { projectsRoutes } from "./routes/projects";
import { browseRoutes } from "./routes/browse";
import { searchRoutes } from "./routes/search";
import { uploadRoutes } from "./routes/upload";
import { metaRoutes } from "./routes/meta";
import { xRoutes } from "./routes/x";
import { musicRoutes } from "./routes/music";
import { tagsRoutes } from "./routes/tags";
import { configRoutes } from "./routes/config";

const router = Router();

// Health check (no auth) - MUST BE FIRST
router.get("/health", () => withCors(new Response(JSON.stringify({ status: "ok", service: "lifeos1-api" }), {
  headers: { "Content-Type": "application/json" }
})));

// CORS OPTIONS handler
router.options("*", (request) => new Response(null, {
  headers: corsHeaders(request.headers.get("Origin") || "*")
}));

// Public config (no auth)
router.use("/api/config", configRoutes);

// Auth-required routes
router.use("/api/oauth/*", oauthRoutes);
router.use("/api/llm/*", llmRoutes);
router.use("/api/integrations/*", integrationsRoutes);
router.use("/api/activity/*", activityRoutes);
router.use("/api/kv*", kvRoutes);
router.use("/api/vault/*", vaultRoutes);
router.use("/api/email/*", emailRoutes);
router.use("/api/stripe/*", stripeRoutes);
router.use("/api/github/*", githubRoutes);
router.use("/api/slack/*", slackRoutes);
router.use("/api/notion/*", notionRoutes);
router.use("/api/calendar/*", calendarRoutes);
router.use("/api/spotify/*", spotifyRoutes);
router.use("/api/youtube/*", youtubeRoutes);
router.use("/api/cloudflare/*", cloudflareRoutes);
router.use("/api/nylas/*", nylasRoutes);
router.use("/api/social/*", socialRoutes);
router.use("/api/contacts/*", contactsRoutes);
router.use("/api/agents/*", agentsRoutes);
router.use("/api/tasks*", tasksRoutes);
router.use("/api/finance/*", financeRoutes);
router.use("/api/projects/*", projectsRoutes);
router.use("/api/browse*", browseRoutes);
router.use("/api/search*", searchRoutes);
router.use("/api/upload*", uploadRoutes);
router.use("/api/meta/*", metaRoutes);
router.use("/api/x/*", xRoutes);
router.use("/api/music/*", musicRoutes);
router.use("/api/tags*", tagsRoutes);

// 404 handler
router.all("*", () => withCors(new Response(JSON.stringify({ error: "Not found" }), {
  status: 404,
  headers: { "Content-Type": "application/json" }
})));

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return router.handle(request, env, ctx);
  }
};