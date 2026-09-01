import type { TemplateRevenda } from "@/generated/prisma/client";
import { fontFacesCss } from "./fonts";
import { EDITORIAL_CSS, renderEditorial } from "./editorial";
import { INFOGRAFICO_CSS, renderInfografico } from "./infografico";
import { BROCHURA_CSS, renderBrochura } from "./brochura";
import { CARTAZ_CSS, renderCartaz } from "./cartaz";
import { MOSAICO_CSS, renderMosaico } from "./mosaico";
import { DUPLA_CSS, renderDupla } from "./dupla";
import type { UnidadeRevendaTemplateData } from "./tipos";

export type { UnidadeRevendaTemplateData, FotoRevendaTemplate } from "./tipos";

const RENDERERS: Record<TemplateRevenda, (u: UnidadeRevendaTemplateData) => string> = {
  EDITORIAL: renderEditorial,
  INFOGRAFICO: renderInfografico,
  BROCHURA: renderBrochura,
  CARTAZ: renderCartaz,
  MOSAICO: renderMosaico,
  DUPLA: renderDupla,
};

export function renderizarUnidade(template: TemplateRevenda, u: UnidadeRevendaTemplateData): string {
  return RENDERERS[template](u);
}

/** CSS de todos os templates + fontes, incluído uma única vez no documento — o custo de
 * incluir os 6 é desprezível perto do de gerar o PDF, e evita ter que descobrir de
 * antemão quais templates aparecem nesta geração. */
export function templatesCss(): string {
  return `${fontFacesCss()}${EDITORIAL_CSS}${INFOGRAFICO_CSS}${BROCHURA_CSS}${CARTAZ_CSS}${MOSAICO_CSS}${DUPLA_CSS}`;
}
