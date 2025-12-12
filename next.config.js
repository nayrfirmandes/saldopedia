const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Turbopack disabled for stability - using Webpack for better reliability
  experimental: {
    optimizePackageImports: ['lucide-react', '@headlessui/react', 'date-fns'],
  },
  
  // Image optimization - images now served from public folder for better performance
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false,
  },
  
  // Production optimizations
  reactStrictMode: true,
  
  // Allow cross-origin requests from all origins in development
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    ...(process.env.REPLIT_DEV_DOMAIN ? [process.env.REPLIT_DEV_DOMAIN] : []),
    ...(process.env.REPL_SLUG ? [`${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`] : []),
  ].filter(Boolean),
  
  // Allow all hosts for Replit environment
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devServer = {
        ...config.devServer,
        allowedHosts: "all",
      };
    }
    
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Redirect www to non-www for SEO
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.saldopedia.com',
          },
        ],
        destination: 'https://saldopedia.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withMDX(nextConfig));
