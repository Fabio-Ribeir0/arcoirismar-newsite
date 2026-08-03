import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Banner uploads are validated up to 5MB; the multipart wrapper adds a
      // little overhead on top of the file itself, so leave some headroom.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
