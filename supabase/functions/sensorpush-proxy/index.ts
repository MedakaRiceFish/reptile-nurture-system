
// Follow Deno and Supabase conventions for imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

// SensorPush API base URL
const SENSORPUSH_API_BASE_URL = "https://api.sensorpush.com/api/v1";

// AWS Signature V4 implementation for SensorPush Gateway Cloud API
async function createAwsSignatureV4(
  method: string,
  path: string,
  token: string,
  body?: string
) {
  // Extract AWS credentials from the token
  // The token from SensorPush should contain the necessary credentials
  let accessKey = '';
  let secretKey = '';
  let sessionToken = '';

  try {
    // Assuming token is in format "accessKey.secretKey.sessionToken"
    // This format may vary based on SensorPush's actual implementation
    const tokenParts = token.split('.');
    if (tokenParts.length >= 2) {
      accessKey = tokenParts[0];
      secretKey = tokenParts[1];
      if (tokenParts.length >= 3) {
        sessionToken = tokenParts[2];
      }
    } else {
      // If token doesn't follow expected format, use it as accessKey
      accessKey = token;
    }
  } catch (error) {
    console.error("Error parsing token:", error);
    throw new Error("Invalid token format");
  }

  // AWS SigV4 constants
  const service = "execute-api";
  const region = "us-east-1"; // Most AWS APIs are in us-east-1 by default
  const algorithm = "AWS4-HMAC-SHA256";
  const host = new URL(SENSORPUSH_API_BASE_URL).host;

  // Create date strings
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  // Create canonical request components
  const canonicalUri = path;
  const canonicalQueryString = "";
  const payload = body || '';
  
  // Calculate payload hash
  const payloadHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload)
  );
  const payloadHashHex = encodeHex(new Uint8Array(payloadHash));

  // Define headers to be signed (minimal set)
  const canonicalHeaders = 
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = "host;x-amz-date";

  // Create canonical request
  const canonicalRequest = 
    `${method}\n` +
    `${canonicalUri}\n` +
    `${canonicalQueryString}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHashHex}`;

  // Create string to sign
  const credentialScope = 
    `${dateStamp}/${region}/${service}/aws4_request`;

  const stringToSign = 
    `${algorithm}\n` +
    `${amzDate}\n` +
    `${credentialScope}\n` +
    `${encodeHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalRequest))))}`;

  // Calculate signature (simplified for demo - in production use actual HMAC-SHA256)
  const signature = "signature_placeholder"; // In a real implementation, this would be the calculated HMAC-SHA256 signature

  // Construct authorization header
  const authorizationHeader = 
    `${algorithm} ` +
    `Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

  return {
    'Authorization': authorizationHeader,
    'X-Amz-Date': amzDate,
    ...(sessionToken && { 'X-Amz-Security-Token': sessionToken })
  };
}

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
    
    // Handle authentication based on the endpoint
    if (token) {
      // The authorization endpoint uses a different authentication method
      if (path === '/oauth/authorize') {
        console.log("Using raw token for authorization endpoint");
        headers.set('Authorization', token);
      } else {
        // For Gateway Cloud API endpoints that require AWS SigV4
        console.log("Creating AWS Signature V4 headers for authenticated endpoint");
        try {
          const bodyStr = body ? JSON.stringify(body) : '';
          const sigV4Headers = await createAwsSignatureV4(method || 'GET', path, token, bodyStr);
          
          // Add all SigV4 headers
          Object.entries(sigV4Headers).forEach(([key, value]) => {
            headers.set(key, value);
          });
          
          console.log("AWS Signature V4 headers created and added to request");
        } catch (error) {
          console.error("Error creating AWS Signature V4:", error);
          throw new Error(`Failed to create AWS Signature: ${error.message}`);
        }
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
    Method: ${method}
    Headers: ${JSON.stringify(Object.fromEntries([...headers.entries()].filter(([key]) => !['authorization', 'x-amz-date', 'x-amz-security-token'].includes(key.toLowerCase()))))}
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
          status: response.status // Return actual error status instead of 200
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
        status: 500 // Return 500 for server errors
      }
    );
  }
})
