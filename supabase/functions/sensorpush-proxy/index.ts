
// Follow this setup guide to integrate the Deno runtime and Supabase functions
// https://deno.land/manual/runtime/supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const BASE_URL = "https://api.sensorpush.com/api/v1";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    console.log("SensorPush Edge Function: Request received");
    const { path, method, token, body } = await req.json();
    
    // Build the full URL
    const url = `${BASE_URL}${path}`;
    console.log(`SensorPush Edge Function: Making ${method} request to ${url}`);
    
    // Create headers for the request
    const headers: HeadersInit = {
      "Accept": "application/json",
      ...corsHeaders
    };
    
    // Only add Authorization header if token is provided (not for initial auth)
    if (token) {
      // For SensorPush API authentication:
      // For OAuth flow: no header needed for initial authorization
      // For authenticated calls: pass token as-is (which should be a valid JWT)
      headers["Authorization"] = token;
      
      // Log that we're using the token (redacted for security)
      const tokenPreview = token.substring(0, 10) + "...";
      console.log(`SensorPush Edge Function: Using token for Authorization: ${tokenPreview}`);
    }
    
    // Add content-type for all requests to ensure proper JSON handling
    headers["Content-Type"] = "application/json";
    
    // Log complete request details for debugging
    console.log("SensorPush Edge Function: Full request details:", {
      url,
      method,
      headers: {
        ...headers,
        "Authorization": headers["Authorization"] ? "[REDACTED]" : undefined
      },
      bodyLength: body ? JSON.stringify(body).length : 0
    });
    
    // Make the request to SensorPush API
    const response = await fetch(url, {
      method: method || "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    // Log detailed response information
    console.log(`SensorPush Edge Function: Response status: ${response.status} ${response.statusText}`);
    const responseHeaders = Object.fromEntries([...response.headers.entries()]);
    console.log("SensorPush Edge Function: Response headers:", responseHeaders);
    
    // Get response data
    let responseData;
    const responseText = await response.text();
    
    try {
      responseData = JSON.parse(responseText);
      
      // Redact sensitive data in logs for auth responses
      if (path === '/oauth/authorize' || path === '/oauth/access_token') {
        console.log("SensorPush Edge Function: Successfully parsed auth response JSON", 
          {
            hasAuthorization: !!responseData?.authorization,
            hasApiKey: !!responseData?.apikey,
            responseKeys: Object.keys(responseData || {})
          });
      } else {
        // Log non-sensitive response data
        console.log("SensorPush Edge Function: Successfully parsed response JSON", 
          path === '/devices/sensors' 
            ? { sensorCount: Object.keys(responseData?.sensors || {}).length }
            : { responseType: typeof responseData, status: responseData?.status });
      }
    } catch (e) {
      console.error("SensorPush Edge Function: Failed to parse response as JSON:", e.message);
      console.error("SensorPush Edge Function: Raw response text:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));
      responseData = { error: "Invalid JSON response", rawResponse: responseText.substring(0, 1000) };
    }
    
    if (!response.ok) {
      console.error("SensorPush Edge Function: API error", {
        status: response.status,
        statusText: response.statusText,
        error: responseData?.error || responseData?.message,
        type: responseData?.type,
        data: responseData
      });
      
      // Return the error response to the client with proper status code
      return new Response(JSON.stringify({
        error: responseData?.error || responseData?.message || response.statusText,
        status: response.status,
        data: responseData
      }), {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    
    // Log success metrics for various endpoints
    if (path === '/devices/sensors' && responseData.sensors) {
      console.log(`SensorPush Edge Function: Successfully fetched ${Object.keys(responseData.sensors).length} sensors`);
    }
    else if (path === '/samples' && responseData.sensors) {
      const totalSamples = Object.values(responseData.sensors)
        .reduce((sum: number, samples: any[]) => sum + samples.length, 0);
      console.log(`SensorPush Edge Function: Successfully fetched ${totalSamples} samples for ${Object.keys(responseData.sensors).length} sensors`);
    }
    else if (path === '/oauth/authorize' && responseData.authorization) {
      console.log("SensorPush Edge Function: Successfully obtained authorization token");
    }
    
    // Return the response with CORS headers
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    // Log the detailed error
    console.error("SensorPush Edge Function: Unhandled error:", error.message);
    console.error("SensorPush Edge Function: Stack trace:", error.stack);
    
    // Return error response
    return new Response(JSON.stringify({
      error: error.message || "Unknown error occurred",
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
