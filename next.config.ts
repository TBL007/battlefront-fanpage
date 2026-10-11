import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.148"],
  images: {
    remotePatterns: [
      new URL("https://d7q5o5c3i3.ufs.sh/**"),
      new URL("https://cdn.discordapp.com/**"),
    ],
  },
};

export default nextConfig;
