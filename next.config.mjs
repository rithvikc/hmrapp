/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Provide default values for build-time environment variables
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || '',
  },
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core'],
  },
};

export default nextConfig; 