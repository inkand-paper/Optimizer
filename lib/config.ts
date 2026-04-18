// Centralized configuration - all env vars accessed here
export const config = {
  apiSecretKey: process.env.API_SECRET_KEY,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
};

// Validate required environment variables on startup
if (!config.apiSecretKey) {
  console.error('❌ API_SECRET_KEY is not set in .env.local');
  console.error('Your /api/revalidate endpoint will be insecure!');
} else {
  console.log('✅ API_SECRET_KEY is configured');
}