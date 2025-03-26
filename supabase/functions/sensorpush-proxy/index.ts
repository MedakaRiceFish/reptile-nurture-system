
// Follow this setup guide to integrate the Deno runtime and Supabase functions
// https://deno.com/manual/runtime/supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const BASE_URL = "https://api.sensorpush.com/api/v1";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { path, method, token, body } = await req.json();
    
    // Build the full URL
    const url = `${BASE_URL}${path}`;
    
    // Create current date for AWS Signature v4
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    
    // Headers for the request
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-Amz-Date": amzDate,
      ...corsHeaders
    };
    
    // Add content-type if method is POST
    if (method === "POST" || body) {
      headers["Content-Type"] = "application/json";
    }
    
    // Make the request to SensorPush API
    const response = await fetch(url, {
      method: method || "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    // Get response data
    const responseData = await response.json();
    
    // Return the response with CORS headers
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    // Return error response
    return new Response(JSON.stringify({
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
