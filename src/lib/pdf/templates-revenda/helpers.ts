import { escapeAttr, escapeHtml } from "../comum";
import type { FotoRevendaTemplate, UnidadeRevendaTemplateData } from "./tipos";

/** Textarea de "um item por linha" → lista pronta pra exibir. */
export function linhas(texto: string | null | undefined): string[] {
  if (!texto) return [];
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function moeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function area(valor: number): string {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²`;
}

/** "Canto do Forte · Praia Grande/SP" — cada parte só entra se existir; `null` se não sobrar nada. */
export function eyebrowLocalizacao(u: UnidadeRevendaTemplateData): string | null {
  const cidadeEstado = [u.cidade, u.estado].filter(Boolean).join("/");
  const partes = [u.bairro, cidadeEstado || null].filter(Boolean) as string[];
  return partes.length ? partes.join(" · ") : null;
}

/** "Apto 302 · Torre A" — qualquer uma das duas partes pode faltar. */
export function unidadeTorre(u: UnidadeRevendaTemplateData): string | null {
  const partes: string[] = [];
  if (u.numeroUnidade) partes.push(`Apto ${u.numeroUnidade}`);
  if (u.torre) partes.push(`Torre ${u.torre}`);
  return partes.length ? partes.join(" · ") : null;
}

/** "Rua X, 450 — Bairro, Cidade/UF" — omite qualquer parte ausente. */
export function enderecoCompleto(u: UnidadeRevendaTemplateData): string | null {
  const rua = [u.endereco, u.numeroEndereco].filter(Boolean).join(", ");
  const cidadeEstado = [u.cidade, u.estado].filter(Boolean).join("/");
  const local = [u.bairro, cidadeEstado || null].filter(Boolean).join(", ");
  const partes = [rua, local].filter(Boolean);
  return partes.length ? partes.join(" — ") : null;
}

export function foto(u: UnidadeRevendaTemplateData, indice: number): FotoRevendaTemplate | null {
  return u.fotos[indice] ?? null;
}

/** `<img>` real quando existe foto no slot; string vazia quando não — o placeholder do
 * template (gradiente decorativo já desenhado no CSS) fica visível por trás. */
export function imgSlot(f: FotoRevendaTemplate | null, classe = ""): string {
  if (!f) return "";
  return `<img class="${classe}" src="${escapeAttr(f.url)}" alt="" />`;
}

export function legendaSlot(f: FotoRevendaTemplate | null, classe: string): string {
  if (!f?.legenda) return "";
  return `<span class="${classe}">${escapeHtml(f.legenda)}</span>`;
}

export function corretorPresente(u: UnidadeRevendaTemplateData): boolean {
  return Boolean(u.corretorNome || u.corretorTelefone || u.corretorEmail);
}

export { escapeHtml, escapeAttr };
