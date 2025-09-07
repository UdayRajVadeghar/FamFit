import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("./"),
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Enable static optimization
  trailingSlash: false,
};

export default nextConfig;
