// Follow Deno and Supabase conventions for imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// SensorPush API base URL
const SENSORPUSH_API_BASE_URL = "https://api.sensorpush.com/api/v1";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get SensorPush credentials from environment variables or request body
    let email = Deno.env.get("SENSORPUSH_EMAIL");
    let password = Deno.env.get("SENSORPUSH_PASSWORD");

    // If credentials are provided in request body, use those instead
    // This allows for per-user authentication in a multi-user environment
    try {
      const requestData = await req.json();
      if (requestData.email && requestData.password) {
        email = requestData.email;
        password = requestData.password;
        console.log("Using credentials from request body");
      }
    } catch (e) {
      // No request body or invalid JSON, will use env vars
      console.log("No valid request body, using environment variables");
    }

    if (!email || !password) {
      throw new Error("Missing SensorPush credentials. Please provide email and password.");
    }

    console.log(`Starting SensorPush authentication for ${email}`);

    // STEP 1: Get authorization token using email and password
    console.log("Step 1: Calling /oauth/authorize");
    const authResponse = await fetch(`${SENSORPUSH_API_BASE_URL}/oauth/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error(`Authorization failed: ${authResponse.status} - ${errorText}`);
      throw new Error(`Failed to authorize: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    console.log("Authorization response:", JSON.stringify(authData, null, 2));

    if (!authData.authorization) {
      throw new Error("No authorization token returned from SensorPush API");
    }

    // STEP 2: Exchange authorization token for access token
    console.log("Step 2: Calling /oauth/accesstoken");
    const tokenResponse = await fetch(`${SENSORPUSH_API_BASE_URL}/oauth/accesstoken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorization: authData.authorization }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Access token request failed: ${tokenResponse.status} - ${errorText}`);
      throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("Access token response:", JSON.stringify(tokenData, null, 2));

    if (!tokenData.accesstoken) {
      throw new Error("No access token returned from SensorPush API");
    }

    // Return access token and refresh token to the client
    return new Response(
      JSON.stringify({
        accesstoken: tokenData.accesstoken,
        refreshtoken: tokenData.refreshtoken || null,
        message: "Authentication successful"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("SensorPush authentication error:", error.message);

    return new Response(
      JSON.stringify({
        error: error.message,
        status: 400,
        statusText: "Authentication Failed"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
