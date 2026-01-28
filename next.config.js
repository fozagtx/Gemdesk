/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure MDX
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Skip static generation for error pages
  skipTrailingSlashRedirect: true,
  
  // Disable TypeScript checks during builds  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack configuration for AI SDK
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for browser compatibility
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
