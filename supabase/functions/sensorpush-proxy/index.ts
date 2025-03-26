
// Follow Deno and Supabase conventions for imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// SensorPush API base URL
const SENSORPUSH_API_BASE_URL = "https://api.sensorpush.com/api/v1";

// Edge function to proxy requests to SensorPush API
serve(async (req) => {
  console.log("SensorPush proxy function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    
    // Extract the necessary data from the request
    const { path, method, token, body } = requestData;
    
    if (!path) {
      throw new Error("Path is required");
    }
    
    // Log what we're about to do (redact sensitive information)
    console.log(`Making ${method} request to SensorPush API at ${path}`);
    
    if (body) {
      console.log("Request body size:", JSON.stringify(body).length);
    }
    
    // Construct the full URL
    const url = `${SENSORPUSH_API_BASE_URL}${path}`;
    
    // Prepare headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...corsHeaders
    });
    
    // Add authorization header exactly as SensorPush expects it
    // Don't modify or prefix the token - use it exactly as stored
    if (token) {
      headers.set('Authorization', token);
      console.log("SensorPush Edge Function: Using token for Authorization:", token.substring(0, 10) + "...");
    }
    
    // Configure the request options
    const options: RequestInit = {
      method: method || 'GET',
      headers: headers,
    };
    
    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    // Make the request to SensorPush API
    console.log(`Sending request to ${url}`);
    const response = await fetch(url, options);
    
    // Log the status of the response
    console.log(`SensorPush API Response status: ${response.status}`);
    console.log(`SensorPush API Response status text: ${response.statusText}`);
    
    // If we get an error response, log more details
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SensorPush API error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      return new Response(
        JSON.stringify({
          error: `SensorPush API error: ${response.status} ${response.statusText}`,
          status: response.status,
          data: errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Parse the response as JSON
    const data = await response.json();
    
    // Return the successful response to the client
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    // Log the error
    console.error("SensorPush proxy error:", error.message);
    
    // Return a formatted error response
    return new Response(
      JSON.stringify({
        error: `SensorPush proxy error: ${error.message}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
