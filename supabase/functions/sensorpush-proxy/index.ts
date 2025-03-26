
// Follow Deno and Supabase conventions for imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createHash } from "https://deno.land/std@0.177.0/crypto/mod.ts";

// SensorPush API base URL
const SENSORPUSH_API_BASE_URL = "https://api.sensorpush.com/api/v1";

// Create HMAC with key for AWS Signature V4
async function createHmac(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyObj = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", keyObj, encoder.encode(message));
}

// Convert ArrayBuffer to hex string
function toHexString(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// AWS Signature V4 implementation for SensorPush Gateway Cloud API
async function createAwsSignatureV4(
  method: string,
  url: string,
  token: string,
  body?: string
) {
  console.log(`Creating AWS SigV4 for ${method} ${url}`);
  
  // Parse the URL to get the host and path
  const parsedUrl = new URL(url);
  const host = parsedUrl.host;
  const path = parsedUrl.pathname;

  // Parse token to extract AWS credentials - format should be "accessKey.secretKey.sessionToken"
  let accessKey = '';
  let secretKey = '';
  let sessionToken = '';
  
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      accessKey = parts[0];
      secretKey = parts[1];
      if (parts.length >= 3) {
        sessionToken = parts[2];
      }
    } else {
      throw new Error("Token format invalid. Expected accessKey.secretKey.sessionToken");
    }
    
    console.log(`Credentials parsed: accessKey length=${accessKey.length}, secretKey length=${secretKey.length}, sessionToken provided=${!!sessionToken}`);
  } catch (error) {
    console.error("Error parsing credentials from token:", error);
    throw new Error(`Invalid credential format: ${error.message}`);
  }

  // AWS SigV4 constants
  const service = "execute-api";
  const region = "us-east-1"; // Most AWS APIs are in us-east-1 by default
  const algorithm = "AWS4-HMAC-SHA256";
  
  // Create date strings
  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  // Format the canonical headers
  const canonicalHeaders = [
    `host:${host}`,
    `x-amz-date:${amzDate}`
  ];
  
  if (sessionToken) {
    canonicalHeaders.push(`x-amz-security-token:${sessionToken}`);
  }
  
  if (method === 'POST' || method === 'PUT') {
    canonicalHeaders.push('content-type:application/json');
  }
  
  // Sort and join canonical headers
  canonicalHeaders.sort();
  const canonicalHeadersString = canonicalHeaders.join('\n') + '\n';
  
  // Get signed headers
  const signedHeaders = canonicalHeaders
    .map(h => h.split(':')[0].toLowerCase())
    .sort()
    .join(';');

  // Hash the request body
  const encoder = new TextEncoder();
  const payloadHash = toHexString(
    await crypto.subtle.digest("SHA-256", encoder.encode(body || ''))
  );
  
  // Create canonical request
  const canonicalRequest = [
    method,
    path,              // URI encoded path
    '',                // Query string (empty in this case)
    canonicalHeadersString,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  console.log("Canonical Request:", canonicalRequest);
  
  // Hash the canonical request
  const canonicalRequestHash = toHexString(
    await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest))
  );
  
  // Create the string to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  console.log("String to Sign:", stringToSign);

  // Create the signing key
  const encoder = new TextEncoder();
  const kDate = await createHmac(encoder.encode(`AWS4${secretKey}`), dateStamp);
  const kRegion = await createHmac(kDate, region);
  const kService = await createHmac(kRegion, service);
  const kSigning = await createHmac(kService, "aws4_request");
  
  // Calculate the signature
  const signature = toHexString(await createHmac(kSigning, stringToSign));
  
  console.log(`Signature: ${signature}`);

  // Create the authorization header
  const authorizationHeader = [
    `${algorithm} Credential=${accessKey}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ');

  // Prepare the headers object to return
  const headers: Record<string, string> = {
    'Authorization': authorizationHeader,
    'X-Amz-Date': amzDate
  };
  
  // Add session token if present
  if (sessionToken) {
    headers['X-Amz-Security-Token'] = sessionToken;
  }
  
  return headers;
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
      // The oauth/authorize endpoint uses a different authentication method
      if (path === '/oauth/authorize') {
        console.log("Using direct token for authorization endpoint");
        // For the OAuth endpoint, simply pass the credentials as JSON in the body
        // No Authorization header needed for this endpoint
      } else {
        // For Gateway Cloud API endpoints that require AWS SigV4
        console.log("Creating AWS Signature V4 headers for Gateway Cloud API");
        try {
          const bodyStr = body ? JSON.stringify(body) : '';
          const sigV4Headers = await createAwsSignatureV4(method || 'GET', url, token, bodyStr);
          
          // Add all SigV4 headers
          Object.entries(sigV4Headers).forEach(([key, value]) => {
            headers.set(key, value);
          });
          
          console.log("AWS Signature V4 headers created successfully");
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
          status: 200 // Return 200 but include error details in the body
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
        status: 200 // Return 200 but include error details in the body
      }
    );
  }
})
