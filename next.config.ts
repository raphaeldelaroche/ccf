import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ["http://172.20.10.3:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.climatecontributionframework.org",
      },
    ],
  },
};

export default nextConfig;
