
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
      'Accept': 'application/json',
      ...corsHeaders
    });
    
    // Add authorization header if token is provided and not the initial auth request
    if (token && !path.includes('/oauth/authorize') && !path.includes('/oauth/accesstoken')) {
      console.log("Adding authorization token to request");
      // Fix: Properly format authorization header with "Bearer" prefix
      headers.set('Authorization', `Bearer ${token}`);
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
    
    // Log the full request for debugging (excluding sensitive data)
    console.log(`Full request to SensorPush API:
    URL: ${url}
    Method: ${method}
    Headers: ${JSON.stringify(Object.fromEntries([...headers.entries()].filter(([key]) => !['authorization'].includes(key.toLowerCase()))))}`);
    
    // Make the request to SensorPush API
    console.log(`Sending request to SensorPush API...`);
    const response = await fetch(url, options);
    
    // Log the response status
    console.log(`SensorPush API response status: ${response.status} ${response.statusText}`);
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch (e) {
        errorText = await response.text();
      }
      
      console.error(`SensorPush API error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      return new Response(
        JSON.stringify({
          error: errorText,
          status: response.status
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 but include error details in the body
        }
      );
    }
    
    // Parse the response as JSON
    const data = await response.json();
    
    // Sanitize sensitive data in logs
    const sanitizedData = { ...data };
    if (sanitizedData.accesstoken) {
      sanitizedData.accesstoken = "***TOKEN HIDDEN***";
    }
    if (sanitizedData.refreshtoken) {
      sanitizedData.refreshtoken = "***TOKEN HIDDEN***";
    }
    if (sanitizedData.authorization) {
      sanitizedData.authorization = "***TOKEN HIDDEN***";
    }
    
    console.log(`SensorPush API successful response received:`, sanitizedData);
    
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
        status: 200 // Return 200 but include error details in the body
      }
    );
  }
})
