import { Router } from "itty-router";
import { corsHeaders } from "../utils/cors";

const router = Router();

// GET /api/oauth/status - Check OAuth connection status for multiple providers
router.get("/status", async (request, env) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const userId = url.searchParams.get("user_id");
  const accountEmail = url.searchParams.get("account_email");
  const state = url.searchParams.get("state");

  if (!userId) {
    return Response.json({ error: "Missing user_id" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  try {
    // Query Supabase for actual OAuth credentials
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ 
        error: "Supabase not configured",
        connected: [],
        statuses: {}
      }, { headers: corsHeaders() });
    }

    let queryUrl = `${supabaseUrl}/rest/v1/integrations_credentials?user_id=eq.${encodeURIComponent(userId)}&select=id,integration_name,email,oauth_provider,oauth_access_token,status,updated_at`;
    
    if (provider) {
      queryUrl += `&oauth_provider=eq.${encodeURIComponent(provider)}`;
    }
    if (accountEmail) {
      queryUrl += `&email=eq.${encodeURIComponent(accountEmail)}`;
    }

    const response = await fetch(queryUrl, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.status}`);
    }

    const credentials = await response.json();
    
    const connected: string[] = [];
    const statuses: Record<string, { connected: boolean; email?: string; lastSynced?: string }> = {};
    
    for (const cred of credentials) {
      const key = cred.oauth_provider || cred.integration_name;
      const isConnected = cred.status === "on" && !!cred.oauth_access_token;
      
      if (isConnected) {
        connected.push(key);
        if (!statuses[key] || !statuses[key].connected) {
          statuses[key] = {
            connected: true,
            email: cred.email,
            lastSynced: cred.updated_at,
          };
        }
      } else if (!statuses[key]) {
        statuses[key] = { connected: false };
      }
    }

    return Response.json({
      connected,
      statuses,
    }, { headers: corsHeaders() });
  } catch (e) {
    console.error("[oauth/status] error:", e);
    return Response.json({
      error: "Failed to check OAuth status",
      connected: [],
      statuses: {},
    }, { headers: corsHeaders() });
  }
});

// GET /api/oauth/start - Initiate OAuth flow
router.get("/start", async (request, env) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const accountEmail = url.searchParams.get("account_email");
  const userId = url.searchParams.get("user_id");
  const state = url.searchParams.get("state");
  const redirectUri = url.searchParams.get("redirect_uri");

  if (!provider || !userId) {
    return Response.json({ error: "Missing provider or user_id" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  const oauthUrls: Record<string, string> = {
    google: "https://accounts.google.com/o/oauth2/v2/auth",
    microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    github: "https://github.com/login/oauth/authorize",
    slack: "https://slack.com/oauth/v2/authorize",
    facebook: "https://www.facebook.com/v18.0/dialog/oauth",
    instagram: "https://api.instagram.com/oauth/authorize",
    twitter: "https://twitter.com/i/oauth2/authorize",
    linkedin: "https://www.linkedin.com/oauth/v2/authorization",
    spotify: "https://accounts.spotify.com/authorize",
    notion: "https://api.notion.com/v1/oauth/authorize",
  };

  const authUrl = oauthUrls[provider] || `https://${provider}.com/oauth/authorize`;
  
  // Build redirect URI - use provided or default to Worker callback
  const callbackUri = redirectUri || `${new URL(request.url).origin}/api/oauth/callback`;
  
  const params = new URLSearchParams({
    client_id: env[`${provider.toUpperCase()}_CLIENT_ID`] || "",
    redirect_uri: callbackUri,
    response_type: "code",
    scope: getScopes(provider),
    state: state || crypto.randomUUID(),
    access_type: "offline",
    prompt: "consent",
  });

  // Store the pending OAuth state in Supabase for verification on callback
  if (accountEmail && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      await fetch(`${env.SUPABASE_URL}/rest/v1/integrations_credentials`, {
        method: "POST",
        headers: {
          "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          integration_name: provider,
          email: accountEmail,
          label: accountEmail,
          oauth_provider: provider,
          status: "pending",
          oauth_state: state,
          oauth_redirect_uri: callbackUri,
        }),
      });
    } catch (e) {
      console.warn("[oauth/start] Failed to store pending state:", e);
    }
  }
  
  return Response.redirect(`${authUrl}?${params.toString()}`, 302);
});

// GET /api/oauth/callback - Handle OAuth callback from providers
router.get("/callback", async (request, env) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const provider = url.searchParams.get("provider"); // Some providers pass this back

  if (error) {
    return Response.redirect(`${new URL(request.url).origin}/integrations?oauth_error=${encodeURIComponent(error)}`, 302);
  }

  if (!code || !state) {
    return Response.json({ error: "Missing code or state" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  try {
    // Look up the pending OAuth state in Supabase
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase not configured");
    }

    // Find the pending credential by state
    const pendingResponse = await fetch(
      `${supabaseUrl}/rest/v1/integrations_credentials?oauth_state=eq.${encodeURIComponent(state)}&status=eq.pending&select=*`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!pendingResponse.ok) {
      throw new Error("Failed to find pending OAuth state");
    }

    const pendingCreds = await pendingResponse.json();
    
    if (!pendingCreds || pendingCreds.length === 0) {
      throw new Error("Invalid or expired OAuth state");
    }

    const pendingCred = pendingCreds[0];
    const actualProvider = provider || pendingCred.oauth_provider;
    const redirectUri = pendingCred.oauth_redirect_uri || `${new URL(request.url).origin}/api/oauth/callback`;

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(actualProvider, code, redirectUri, env);
    
    if (!tokenResponse.access_token) {
      throw new Error("Failed to obtain access token");
    }

    // Update the credential with tokens
    const updateData: Record<string, any> = {
      oauth_access_token: tokenResponse.access_token,
      oauth_refresh_token: tokenResponse.refresh_token || null,
      oauth_expires_at: tokenResponse.expires_in 
        ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString() 
        : null,
      oauth_scope: tokenResponse.scope || getScopes(actualProvider),
      status: "on",
      updated_at: new Date().toISOString(),
    };

    if (tokenResponse.id_token) {
      updateData.oauth_id_token = tokenResponse.id_token;
    }

    const updateUrl = `${supabaseUrl}/rest/v1/integrations_credentials?id=eq.${pendingCred.id}`;
    await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(updateData),
    });

    // Redirect back to integrations page with success
    return Response.redirect(`${new URL(request.url).origin}/integrations?oauth_success=${actualProvider}`, 302);
    
  } catch (e) {
    console.error("[oauth/callback] error:", e);
    return Response.redirect(`${new URL(request.url).origin}/integrations?oauth_error=${encodeURIComponent(e instanceof Error ? e.message : "OAuth failed")}`, 302);
  }
});

// POST /api/oauth/disconnect - Disconnect OAuth provider
router.post("/disconnect", async (request, env) => {
  const body = await request.json().catch(() => ({}));
  const { provider, account_email } = body;
  
  if (!provider || !account_email) {
    return Response.json({ error: "Missing provider or account_email" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  try {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase not configured");
    }

    // Delete or mark as disconnected
    const deleteUrl = `${supabaseUrl}/rest/v1/integrations_credentials?oauth_provider=eq.${encodeURIComponent(provider)}&email=eq.${encodeURIComponent(account_email)}`;
    await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });

    return Response.json({ success: true, message: `Disconnected ${provider}` }, {
      headers: corsHeaders()
    });
  } catch (e) {
    console.error("[oauth/disconnect] error:", e);
    return Response.json({ error: "Failed to disconnect" }, { 
      status: 500, 
      headers: corsHeaders() 
    });
  }
});

// POST /api/oauth/token - Exchange code for token
router.post("/token", async (request, env) => {
  const body = await request.json().catch(() => ({}));
  const { code, provider, redirect_uri } = body;

  if (!code || !provider) {
    return Response.json({ error: "Missing code or provider" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  try {
    const tokenResponse = await exchangeCodeForToken(provider, code, redirect_uri, env);
    return Response.json(tokenResponse, { headers: corsHeaders() });
  } catch (e) {
    console.error("[oauth/token] error:", e);
    return Response.json({ error: e instanceof Error ? e.message : "Token exchange failed" }, { 
      status: 500, 
      headers: corsHeaders() 
    });
  }
});

// POST /api/oauth/token/save - Save token to storage
router.post("/token/save", async (request, env) => {
  const body = await request.json().catch(() => ({}));
  const { user_id, integration_name, email, oauth_provider, oauth_access_token, oauth_refresh_token, oauth_expires_at, oauth_scope, label } = body;
  
  if (!user_id || !integration_name || !oauth_access_token) {
    return Response.json({ error: "Missing required fields" }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  try {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase not configured");
    }

    const upsertData = {
      user_id,
      integration_name,
      email,
      label: label || email,
      oauth_provider,
      oauth_access_token,
      oauth_refresh_token,
      oauth_expires_at,
      oauth_scope,
      status: "on",
      updated_at: new Date().toISOString(),
    };

    const upsertUrl = `${supabaseUrl}/rest/v1/integrations_credentials`;
    const response = await fetch(upsertUrl, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify(upsertData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase upsert failed: ${error}`);
    }

    return Response.json({ success: true }, { headers: corsHeaders() });
  } catch (e) {
    console.error("[oauth/token/save] error:", e);
    return Response.json({ error: e instanceof Error ? e.message : "Failed to save token" }, { 
      status: 500, 
      headers: corsHeaders() 
    });
  }
});

async function exchangeCodeForToken(provider: string, code: string, redirectUri: string, env: any): Promise<any> {
  const tokenUrls: Record<string, string> = {
    google: "https://oauth2.googleapis.com/token",
    microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    github: "https://github.com/login/oauth/access_token",
    slack: "https://slack.com/api/oauth.v2.access",
    facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
    instagram: "https://api.instagram.com/oauth/access_token",
    twitter: "https://api.twitter.com/2/oauth2/token",
    linkedin: "https://www.linkedin.com/oauth/v2/accessToken",
    spotify: "https://accounts.spotify.com/api/token",
    notion: "https://api.notion.com/v1/oauth/token",
  };

  const tokenUrl = tokenUrls[provider];
  if (!tokenUrl) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const clientId = env[`${provider.toUpperCase()}_CLIENT_ID`] || "";
  const clientSecret = env[`${provider.toUpperCase()}_CLIENT_SECRET`] || "";

  if (!clientId || !clientSecret) {
    throw new Error(`Missing ${provider} client credentials`);
  }

  const params = new URLSearchParams();
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("code", code);
  params.set("redirect_uri", redirectUri);
  params.set("grant_type", "authorization_code");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Normalize response - some providers return different field names
  if (data.access_token) {
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      expires_in: data.expires_in || 3600,
      token_type: data.token_type || "Bearer",
      scope: data.scope || getScopes(provider),
      id_token: data.id_token || null,
    };
  }

  // Handle provider-specific response formats
  if (provider === "slack" && data.access_token) {
    return {
      access_token: data.access_token,
      refresh_token: null,
      expires_in: 3600,
      token_type: "Bearer",
      scope: data.scope || getScopes(provider),
    };
  }

  throw new Error("Invalid token response from provider");
}

function getScopes(provider: string): string {
  const scopes: Record<string, string> = {
    google: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly",
    microsoft: "User.Read Mail.ReadWrite Calendars.Read",
    github: "repo user:email",
    slack: "chat:write channels:read",
    facebook: "email public_profile pages_manage_posts",
    instagram: "instagram_content_publish",
    twitter: "tweet.read tweet.write users.read",
    linkedin: "r_liteprofile w_member_social",
    spotify: "user-read-private user-read-email playlist-read-private",
    notion: "read",
  };
  return scopes[provider] || "openid email profile";
}

export { router as oauthRoutes };