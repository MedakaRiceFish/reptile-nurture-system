
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
      // According to SensorPush API docs, Authorization header should be "Bearer token"
      headers["Authorization"] = `Bearer ${token}`;
      console.log("SensorPush Edge Function: Using Bearer token authentication");
    }
    
    // Add content-type if method is POST
    if (method === "POST" || body) {
      headers["Content-Type"] = "application/json";
    }
    
    // Log headers (redacted for security)
    console.log("SensorPush Edge Function: Request headers", {
      ...headers,
      "Authorization": headers["Authorization"] ? "Bearer [REDACTED]" : undefined
    });
    
    // Make the request to SensorPush API
    console.log(`SensorPush Edge Function: Sending ${method} request to ${url} with body:`, body ? JSON.stringify(body) : "none");
    const response = await fetch(url, {
      method: method || "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    // Log response status and potentially headers for debugging
    console.log(`SensorPush Edge Function: Response status: ${response.status}`);
    console.log(`SensorPush Edge Function: Response headers:`, Object.fromEntries([...response.headers.entries()]));
    
    // Get response data
    let responseData;
    const responseText = await response.text();
    
    try {
      responseData = JSON.parse(responseText);
      // Redact sensitive data in logs for auth responses
      if (path === '/oauth/authorize' || path === '/oauth/access_token') {
        console.log("SensorPush Edge Function: Successfully parsed auth response JSON", 
          responseData?.authorization ? "Authorization token received" : "No authorization token in response");
      } else {
        console.log("SensorPush Edge Function: Successfully parsed response JSON", responseData);
      }
    } catch (e) {
      console.error("SensorPush Edge Function: Failed to parse response as JSON", responseText);
      responseData = { error: "Invalid JSON response", rawResponse: responseText };
    }
    
    if (!response.ok) {
      console.error("SensorPush Edge Function: API error", {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      // Return the error response to the client with proper status code
      return new Response(JSON.stringify({
        error: responseData.error || responseData.message || response.statusText,
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
    
    // For successful sensor responses, log the count of sensors
    if (path === '/devices/sensors' && responseData.sensors) {
      console.log(`SensorPush Edge Function: Found ${Object.keys(responseData.sensors).length} sensors`);
    }
    // For successful sample responses, log the count of samples
    else if (path === '/samples' && responseData.sensors) {
      const totalSamples = Object.values(responseData.sensors)
        .reduce((sum: number, samples: any[]) => sum + samples.length, 0);
      console.log(`SensorPush Edge Function: Found ${totalSamples} total samples`);
    }
    // For auth responses, log success but redact the token
    else if ((path === '/oauth/authorize' || path === '/oauth/access_token') && responseData.authorization) {
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
    console.error("SensorPush Edge Function: Error", error);
    
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
