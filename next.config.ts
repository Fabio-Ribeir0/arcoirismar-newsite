import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Maior upload validado é o PDF de "Documentos adicionais" (até 15MB);
      // o wrapper multipart adiciona uma pequena sobra além do arquivo em si.
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
