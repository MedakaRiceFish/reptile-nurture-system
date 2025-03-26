
// Follow Deno and Supabase conventions for imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// SensorPush API base URL
const SENSORPUSH_API_BASE_URL = "https://api.sensorpush.com/api/v1";

// Helper to create an AWS Signature V4 for SensorPush API
const createAwsSignature = (token: string) => {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  // Extract components from the provided token
  // The token from SensorPush OAuth contains the necessary AWS credentials
  const tokenParts = token.split('.');
  const credentials = tokenParts[0] || '';
  const signature = tokenParts[1] || '';
  
  // Create the authorization header according to AWS Signature V4 format
  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${credentials}/${dateStamp}/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`,
    'X-Amz-Date': amzDate
  };
};

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
    
    // Add AWS Signature V4 authentication headers
    if (token) {
      // The authorization endpoint provides a special token that must be used as-is
      if (path === '/oauth/authorize') {
        console.log("Using token as-is for authorization endpoint");
        headers.set('Authorization', token);
      } else {
        // For all other endpoints, we need AWS Signature V4
        console.log("Creating AWS Signature V4 for authenticated endpoint");
        const awsHeaders = createAwsSignature(token);
        
        for (const [key, value] of Object.entries(awsHeaders)) {
          headers.set(key, value);
        }
      }
      
      console.log("Authentication headers set");
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
    Headers: ${JSON.stringify(Object.fromEntries([...headers.entries()].filter(([key]) => !['authorization', 'x-amz-date'].includes(key.toLowerCase()))))}
    Has Body: ${!!options.body}`);
    
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
      
      return new Response(
        JSON.stringify({
          error: errorText,
          status: response.status
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
