"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { slugify } from "@/lib/slug";
import { EMPREENDIMENTO_STATUS } from "./schema";

export type ImportarCsvState =
  | { success: true; criados: number; erros: string[] }
  | { success: false; message: string }
  | undefined;

const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2MB

const STATUS_MAP: Record<string, (typeof EMPREENDIMENTO_STATUS)[number]> = {
  "em breve": "EM_BREVE",
  em_breve: "EM_BREVE",
  lancamento: "LANCAMENTO",
  "em obras": "EM_OBRAS",
  em_obras: "EM_OBRAS",
  "pronto para morar": "PRONTO",
  pronto: "PRONTO",
};

function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarStatus(valor: string): (typeof EMPREENDIMENTO_STATUS)[number] | null {
  const limpo = normalizarTexto(valor);
  if (!limpo) return "EM_BREVE";
  return STATUS_MAP[limpo] ?? null;
}

function normalizarInteiro(valor: string): { ok: true; valor: number | null } | { ok: false } {
  const limpo = valor.trim();
  if (!limpo) return { ok: true, valor: null };
  if (!/^\d+$/.test(limpo)) return { ok: false };
  return { ok: true, valor: Number(limpo) };
}

function normalizarDecimal(valor: string): { ok: true; valor: string | null } | { ok: false } {
  const limpo = valor.trim().replace(",", ".");
  if (!limpo) return { ok: true, valor: null };
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return { ok: false };
  return { ok: true, valor: limpo };
}

/** Parser simples de CSV (delimitador ";") com suporte a campos entre aspas. */
function parseCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let linhaAtual: string[] = [];
  let dentroAspas = false;
  const normalizado = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < normalizado.length; i++) {
    const char = normalizado[i];
    if (dentroAspas) {
      if (char === '"') {
        if (normalizado[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroAspas = false;
        }
      } else {
        campo += char;
      }
    } else if (char === '"') {
      dentroAspas = true;
    } else if (char === ";") {
      linhaAtual.push(campo);
      campo = "";
    } else if (char === "\n") {
      linhaAtual.push(campo);
      linhas.push(linhaAtual);
      linhaAtual = [];
      campo = "";
    } else {
      campo += char;
    }
  }
  if (campo !== "" || linhaAtual.length > 0) {
    linhaAtual.push(campo);
    linhas.push(linhaAtual);
  }

  return linhas.filter((linha) => linha.some((celula) => celula.trim() !== ""));
}

function gerarSlugUnico(nome: string, slugsExistentes: Set<string>): string {
  const base = slugify(nome) || "empreendimento";
  let slug = base;
  let contador = 2;
  while (slugsExistentes.has(slug)) {
    slug = `${base}-${contador}`;
    contador++;
  }
  slugsExistentes.add(slug);
  return slug;
}

export async function importarEmpreendimentosCsv(
  _prevState: ImportarCsvState,
  formData: FormData
): Promise<ImportarCsvState> {
  await requireAdmin();

  const arquivo = formData.get("csv");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { success: false, message: "Selecione um arquivo .csv." };
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { success: false, message: "Arquivo muito grande (máximo 2MB)." };
  }

  const texto = await arquivo.text();
  const linhas = parseCsv(texto).slice(1); // primeira linha = cabeçalho

  if (linhas.length === 0) {
    return { success: false, message: "O arquivo não tem nenhuma linha de dados." };
  }

  const existentes = await prisma.empreendimento.findMany({ select: { slug: true } });
  const slugsExistentes = new Set(existentes.map((e) => e.slug));

  let criados = 0;
  const erros: string[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const numeroLinha = i + 2; // +1 pelo cabeçalho, +1 pra contar a partir de 1
    const [nomeRaw, statusRaw = "", bairroRaw = "", cidadeRaw = "", estadoRaw = "", andaresRaw = "", unidadesPorAndarRaw = "", valorBaseRaw = ""] =
      linhas[i];

    const nome = (nomeRaw ?? "").trim();
    if (!nome || nome.length < 2) {
      erros.push(`Linha ${numeroLinha}: nome obrigatório (mínimo 2 caracteres).`);
      continue;
    }

    const status = normalizarStatus(statusRaw ?? "");
    if (!status) {
      erros.push(`Linha ${numeroLinha}: status inválido ("${statusRaw}").`);
      continue;
    }

    const andares = normalizarInteiro(andaresRaw ?? "");
    if (!andares.ok) {
      erros.push(`Linha ${numeroLinha}: "Andares" inválido ("${andaresRaw}").`);
      continue;
    }

    const unidadesPorAndar = normalizarInteiro(unidadesPorAndarRaw ?? "");
    if (!unidadesPorAndar.ok) {
      erros.push(`Linha ${numeroLinha}: "Unidades por andar" inválido ("${unidadesPorAndarRaw}").`);
      continue;
    }

    const valorBase = normalizarDecimal(valorBaseRaw ?? "");
    if (!valorBase.ok) {
      erros.push(`Linha ${numeroLinha}: "Valor base" inválido ("${valorBaseRaw}").`);
      continue;
    }

    const slug = gerarSlugUnico(nome, slugsExistentes);

    try {
      await prisma.empreendimento.create({
        data: {
          nome,
          slug,
          status,
          bairro: bairroRaw?.trim() || null,
          cidade: cidadeRaw?.trim() || null,
          estado: estadoRaw?.trim() || null,
          andares: andares.valor,
          unidadesPorAndar: unidadesPorAndar.valor,
          valorBase: valorBase.valor,
        },
      });
      criados++;
    } catch {
      erros.push(`Linha ${numeroLinha}: falha ao salvar "${nome}".`);
    }
  }

  revalidatePath("/admin/empreendimentos");

  return { success: true, criados, erros };
}
