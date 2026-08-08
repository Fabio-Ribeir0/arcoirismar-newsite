import { prisma } from "./prisma";

const CONTEUDO_SITE_ID = "conteudo-site";

/**
 * Sempre existe uma única linha. Na primeira leitura, cria com o conteúdo
 * que já estava fixo no código da home, então o admin edita a partir daí —
 * sem isso o deploy dessa feature apagaria o texto atual da home.
 */
export async function getConteudoSite() {
  return prisma.conteudoSite.upsert({
    where: { id: CONTEUDO_SITE_ID },
    update: {},
    create: {
      id: CONTEUDO_SITE_ID,
      sobreTitulo: "Sobre a Arco-Íris Mar",
      sobreDescricao:
        "Há mais de três décadas construindo empreendimentos que unem qualidade construtiva, localização estratégica e respeito ao meio ambiente — do projeto à entrega das chaves.",
      fundacaoData: new Date("1994-10-01"),
      stat2Valor: 0,
      stat2Rotulo: "empreendimentos entregues",
      stat3Valor: 0,
      stat3Rotulo: "unidades entregues",
      missaoTitulo: "Missão",
      missaoDescricao:
        "Construir empreendimentos que unam qualidade construtiva, segurança e bem-estar, transformando sonhos em endereços reais para nossos clientes.",
      visaoTitulo: "Visão",
      visaoDescricao:
        "Ser referência em incorporação imobiliária na região, reconhecida pela excelência em cada projeto e pelo compromisso com quem confia na Arco-Íris Mar.",
      valoresTitulo: "Valores",
      valoresDescricao:
        "Transparência em cada etapa, respeito ao meio ambiente, compromisso com prazos e foco genuíno na satisfação de quem escolhe morar com a gente.",
    },
  });
}

/** Anos completos desde a fundação, considerando o mês/dia — não é só "ano atual - ano fundação". */
export function calcularAnosMercado(fundacaoData: Date): number {
  const agora = new Date();
  let anos = agora.getFullYear() - fundacaoData.getFullYear();

  const aindaNaoFezAniversarioEsteAno =
    agora.getMonth() < fundacaoData.getMonth() ||
    (agora.getMonth() === fundacaoData.getMonth() && agora.getDate() < fundacaoData.getDate());

  if (aindaNaoFezAniversarioEsteAno) anos--;

  return anos;
}
