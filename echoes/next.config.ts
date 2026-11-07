import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google/earthengine','google-auth-library'],
};

export default nextConfig;
