import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

