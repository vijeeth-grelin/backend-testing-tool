import axios from 'axios';

/**
 * Optimized Axios instance for the Proxy server.
 * Used for forwarding requests to target APIs.
 */
const proxyClient = axios.create({
  timeout: 60000, // 60 seconds timeout for proxied requests
  validateStatus: () => true, // Forward all status codes to the client
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Interceptor for logging/performance tracking (optional)
proxyClient.interceptors.request.use((config) => {
  // We could add global tracing headers here if needed
  return config;
});

proxyClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log proxy errors for debugging
    console.error(`[Proxy Error] ${error.message}`);
    return Promise.reject(error);
  }
);

export default proxyClient;
