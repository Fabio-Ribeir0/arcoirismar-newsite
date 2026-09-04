import "server-only";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { Empreendimento } from "@/generated/prisma/client";
import { EmpreendimentoSchema } from "./schema";
import { registrarHistoricoPlanoPagamento } from "./service";

/**
 * Lógica de negócio de criar/atualizar um Empreendimento, sem `requireAdmin()` nem
 * `redirect()`/`revalidatePath()` — usada tanto pela Server Action (que cuida da parte de
 * UI) quanto pela rota da API de agente (que devolve JSON). Uma única fonte de verdade pro
 * que conta como "criar"/"atualizar" um empreendimento.
 */

export type EmpreendimentoData = ReturnType<typeof EmpreendimentoSchema.parse>;

export type ResultadoEmpreendimento =
  | { sucesso: true; empreendimento: Empreendimento }
  | { sucesso: false; mensagem: string };

function montarDadosEmpreendimento(data: EmpreendimentoData, slug: string) {
  return {
    nome: data.nome,
    slug,
    status: data.status,
    destaque: data.destaque,
    espelhoVenda: data.espelhoVenda === "on",
    slogan: data.slogan || null,
    descricao: data.descricao || null,
    endereco: data.endereco || null,
    bairro: data.bairro || null,
    cidade: data.cidade || null,
    estado: data.estado || null,
    cep: data.cep || null,
    latitude: data.latitude ? Number(data.latitude) : null,
    longitude: data.longitude ? Number(data.longitude) : null,
    entregaPrevista: data.entregaPrevista ? new Date(data.entregaPrevista) : null,
    andares: data.andares ? Number(data.andares) : null,
    unidadesPorAndar: data.unidadesPorAndar ? Number(data.unidadesPorAndar) : null,
    valorBase: data.valorBase || null,
    dormitoriosPadrao: data.dormitoriosPadrao ? Number(data.dormitoriosPadrao) : null,
    suitesPadrao: data.suitesPadrao ? Number(data.suitesPadrao) : null,
    areaPrivativaPadrao: data.areaPrivativaPadrao ? Number(data.areaPrivativaPadrao) : null,
    vagasPadrao: data.vagasPadrao ? Number(data.vagasPadrao) : null,
  };
}

export async function criarEmpreendimentoCore(data: EmpreendimentoData): Promise<ResultadoEmpreendimento> {
  const slug = data.slug || slugify(data.nome);

  const existente = await prisma.empreendimento.findUnique({ where: { slug } });
  if (existente) {
    return { sucesso: false, mensagem: "Já existe um empreendimento com esse slug." };
  }

  const empreendimento = await prisma.empreendimento.create({
    data: montarDadosEmpreendimento(data, slug),
  });

  return { sucesso: true, empreendimento };
}

export async function atualizarEmpreendimentoCore(
  id: string,
  data: EmpreendimentoData,
  autorId: string
): Promise<ResultadoEmpreendimento> {
  const slug = data.slug || slugify(data.nome);

  const atual = await prisma.empreendimento.findUnique({ where: { id } });
  if (!atual) {
    return { sucesso: false, mensagem: "Empreendimento não encontrado." };
  }

  const conflito = await prisma.empreendimento.findFirst({ where: { slug, NOT: { id } } });
  if (conflito) {
    return { sucesso: false, mensagem: "Já existe outro empreendimento com esse slug." };
  }

  const novaData = montarDadosEmpreendimento(data, slug);
  const motivo = data.motivo || null;

  const empreendimento = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.empreendimento.update({ where: { id }, data: novaData });

    // Só valorBase muda por aqui — as condições de pagamento têm suas próprias
    // actions/rotas, então entram inalteradas neste snapshot de histórico.
    const condicoesAtuais = await tx.condicaoPagamentoEmpreendimento.findMany({
      where: { empreendimentoId: id },
      orderBy: { ordem: "asc" },
    });

    await registrarHistoricoPlanoPagamento(tx, {
      empreendimentoId: id,
      valorBaseAnterior: atual.valorBase,
      valorBaseNovo: novaData.valorBase,
      condicoesAnteriores: condicoesAtuais,
      condicoesNovas: condicoesAtuais,
      autorId,
      motivo,
    });

    return atualizado;
  });

  return { sucesso: true, empreendimento };
}
