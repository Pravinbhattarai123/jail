import type { NextConfig } from "next";
import path from 'path'

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors.
    // This unblocks builds while we gradually fix lint issues across the codebase.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Force Next to treat this folder as the workspace root when multiple lockfiles exist
  outputFileTracingRoot: path.join(__dirname),
  // Keep other Next.js defaults
};

export default nextConfig;
