import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://d7q5o5c3i3.ufs.sh/**")],
  },
};

export default nextConfig;
