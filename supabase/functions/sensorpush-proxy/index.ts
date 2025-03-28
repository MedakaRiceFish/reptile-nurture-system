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
    console.log(`Making request to SensorPush API: ${method || 'GET'} ${url}`);

    // Prepare headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...corsHeaders
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
    Method: ${method || 'GET'}
    Headers: ${JSON.stringify(Object.fromEntries([...headers.entries()].filter(([key]) => !['authorization'].includes(key.toLowerCase()))))}`);

    // Make the request to SensorPush API
    console.log(`Sending request to SensorPush API...`);
    const response = await fetch(url, options);

    // Log the response status
    console.log(`SensorPush API response status: ${response.status} ${response.statusText}`);

    // Parse the response based on content type
    let responseData;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Handle non-OK responses
    if (!response.ok) {
      console.error(`SensorPush API error: ${response.status} ${response.statusText}`);

      if (typeof responseData === 'object') {
        console.error(`SensorPush API error details:`, responseData);
      } else {
        console.error(`SensorPush API error text: ${responseData}`);
      }

      // Return the error with the actual status code
      return new Response(
        JSON.stringify({
          error: responseData,
          status: response.status,
          statusText: response.statusText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        }
      );
    }

    // Sanitize sensitive data in logs
    let sanitizedData;
    if (typeof responseData === 'object') {
      sanitizedData = { ...responseData };
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
    } else {
      console.log(`SensorPush API successful response received (non-JSON)`);
    }

    // Return the successful response to the client
    return new Response(
      typeof responseData === 'object' ? JSON.stringify(responseData) : responseData,
      {
        headers: { ...corsHeaders, 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
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
        error: `SensorPush proxy error: ${error.message}`,
        status: 500,
        statusText: "Internal Server Error"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
