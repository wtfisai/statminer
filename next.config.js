/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['neo4j-driver'],
  },
  webpack: (config, { isServer }) => {
    // Add WebSocket polyfill for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // PWA support
  ...{
    trailingSlash: false,
  }
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);