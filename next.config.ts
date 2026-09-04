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
  // com "input directory .../chromium/bin does not exist". Pelo mesmo motivo, as
  // fontes dos templates de revenda (lidas via fs, não importadas) também precisam
  // ser listadas aqui pra entrar no bundle da função serverless.
  outputFileTracingIncludes: {
    "/admin/empreendimentos/\\[id\\]": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/admin/revendas": [
      "node_modules/@sparticuz/chromium/bin/**/*",
      "src/lib/pdf/templates-revenda/fonts/*.woff2",
    ],
    // Mesma geração de PDF, agora também chamada pela API de agente — cada rota vira um
    // bundle serverless próprio, então precisa da própria entrada aqui (a das páginas do
    // painel acima não cobre estas).
    "/api/agente/empreendimentos/\\[id\\]/gerar-tabela": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/agente/revendas/gerar-tabela": [
      "node_modules/@sparticuz/chromium/bin/**/*",
      "src/lib/pdf/templates-revenda/fonts/*.woff2",
    ],
  },
};

export default nextConfig;
