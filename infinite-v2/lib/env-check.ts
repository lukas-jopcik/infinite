/**
 * Environment variable validation and configuration
 */

export interface EnvironmentConfig {
  apiUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  missingVars: string[];
}

/**
 * Check environment variables and return configuration
 */
export function checkEnvironment(): EnvironmentConfig {
  const required = ['NEXT_PUBLIC_API_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    missingVars: missing
  };
}

/**
 * Validate API URL format
 */
export function validateApiUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get API configuration with validation
 */
export function getApiConfig() {
  const env = checkEnvironment();
  
  if (!validateApiUrl(env.apiUrl)) {
    console.error('Invalid API URL format:', env.apiUrl);
  }
  
  return {
    baseUrl: env.apiUrl,
    timeout: 10000, // 10 seconds
    retries: 3,
    isAvailable: env.missingVars.length === 0
  };
}

/**
 * Log environment status (development only)
 */
export function logEnvironmentStatus() {
  if (process.env.NODE_ENV === 'development') {
    const env = checkEnvironment();
    const apiConfig = getApiConfig();
    
    console.log('🔧 Environment Configuration:');
    console.log('  API URL:', env.apiUrl);
    console.log('  Production:', env.isProduction);
    console.log('  Missing vars:', env.missingVars.length > 0 ? env.missingVars : 'None');
    console.log('  API Available:', apiConfig.isAvailable);
  }
}
