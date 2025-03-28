// Follow Deno and Supabase conventions for imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// SensorPush API base URL
const SENSORPUSH_API_BASE = "https://api.sensorpush.com/api/v1";

async function handleRequest(req: Request): Promise<Response> {
  try {
    const { path, token, body } = await req.json();

    if (!path) {
      return new Response(JSON.stringify({ error: "No path provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = `${SENSORPUSH_API_BASE}${path}`;
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    // Add authorization header if token is provided
    if (token) {
      // Different handling based on the endpoint type
      if (path.startsWith('/oauth/')) {
        // OAuth endpoints don't use Authorization header for /oauth/authorize
        // For /oauth/accesstoken and /oauth/refreshtoken, the tokens are in the body
        console.log("No Authorization header needed for OAuth endpoint");
      } else {
        // For all other API endpoints, use Bearer token format
        const cleanToken = token.trim().replace(/^Bearer\s+/, '');
        headers.set('Authorization', `Bearer ${cleanToken}`);
        console.log(`Setting Authorization header with Bearer token (first 10 chars): ${cleanToken.substring(0, 10)}...`);
      }
    }

    // Make the request to SensorPush API
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    });

    // Get the response data
    const data = await response.json();

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });

  } catch (error) {
    console.error("Error in proxy function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  // Handle the actual request
  return await handleRequest(req);
});
