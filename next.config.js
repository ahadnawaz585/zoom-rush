/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client side
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        path: false,
        stream: false,
        constants: false,
        crypto: false,
        os: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        url: false,
        assert: false,
        // Add other Node.js core modules used by your dependencies here
      };
    }
    return config;
  },
  // This helps with puppeteer in serverless environments
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
};

module.exports = nextConfig;