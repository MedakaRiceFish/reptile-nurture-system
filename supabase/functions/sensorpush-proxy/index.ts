
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
    console.log("Request data received:", JSON.stringify({
      path: requestData.path,
      method: requestData.method,
      hasToken: !!requestData.token,
      hasBody: !!requestData.body
    }));
    
    // Extract the necessary data from the request
    const { path, method, token, body } = requestData;
    
    if (!path) {
      throw new Error("Path is required");
    }
    
    // Construct the full URL
    const url = `${SENSORPUSH_API_BASE_URL}${path}`;
    console.log(`Making request to SensorPush API: ${method} ${url}`);
    
    // Prepare headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...corsHeaders
    });
    
    // Add authorization header - SensorPush docs specify to use the token directly
    if (token) {
      headers.set('Authorization', token);
      console.log(`Authorization header set with token (first 10 chars): ${token.substring(0, 10)}...`);
    }
    
    // Configure the request options
    const options: RequestInit = {
      method: method || 'GET',
      headers: headers,
    };
    
    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
      console.log(`Request payload size: ${JSON.stringify(body).length} bytes`);
    }
    
    // Make the request to SensorPush API
    console.log(`Sending request to SensorPush API...`);
    const response = await fetch(url, options);
    
    // Log the response status
    console.log(`SensorPush API response status: ${response.status} ${response.statusText}`);
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SensorPush API error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      let errorMessage = `API Error ${response.status}`;
      
      // Try to parse the error text as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
        console.log("Parsed error message:", errorMessage);
      } catch (e) {
        // If can't parse as JSON, use the raw text
        console.log("Could not parse error as JSON, using raw text");
      }
      
      return new Response(
        JSON.stringify({
          error: errorMessage,
          status: response.status,
          data: errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 to client but include error info in body
        }
      );
    }
    
    // Parse the response as JSON
    const data = await response.json();
    console.log(`SensorPush API successful response received`);
    
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
    console.error("Error stack:", error.stack);
    
    // Return a formatted error response
    return new Response(
      JSON.stringify({
        error: `SensorPush proxy error: ${error.message}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to client but include error info in body
      }
    );
  }
})
