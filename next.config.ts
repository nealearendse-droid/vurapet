import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["vurapet.vercel.app", "localhost:3000", "localhost:3001"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apdpeyvuhdawuftsxtku.supabase.co",
      },
    ],
  },
};

export default nextConfig;