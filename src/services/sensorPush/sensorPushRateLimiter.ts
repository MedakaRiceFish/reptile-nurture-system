
// Track the last API call time to respect rate limiting (1 call per minute)
let lastApiCallTime = 0;
const API_RATE_LIMIT_MS = 60 * 1000; // 1 minute in milliseconds

/**
 * Helper function to enforce rate limiting
 * @returns Promise that resolves when it's safe to make another API call
 */
export const enforceRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeElapsed = now - lastApiCallTime;
  
  if (lastApiCallTime > 0 && timeElapsed < API_RATE_LIMIT_MS) {
    const waitTime = API_RATE_LIMIT_MS - timeElapsed;
    console.log(`Rate limiting: waiting ${waitTime}ms before next API call`);
    
    // Wait for the required time
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update the last API call time
  lastApiCallTime = Date.now();
};
