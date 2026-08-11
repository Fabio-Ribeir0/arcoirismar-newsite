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
  // O tracer de output não inclui sozinho o binário do Chromium usado pra
  // gerar o PDF da tabela em produção — sem isso a rota falha em runtime
  // com "input directory .../chromium/bin does not exist".
  outputFileTracingIncludes: {
    "/admin/empreendimentos/\\[id\\]": ["node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
