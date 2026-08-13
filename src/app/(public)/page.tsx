import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { HeroCarousel, type HeroSlide } from "@/components/site/hero-carousel";
import {
  EMPREENDIMENTO_STATUS_LABEL,
  eyebrowEmpreendimento,
  subtituloEmpreendimento,
} from "@/lib/empreendimento-display";
import { getConteudoSite, calcularAnosMercado } from "@/lib/conteudo-site";

const PILAR_GRADIENTE: Record<string, string> = {
  missao: "from-primary-light to-primary",
  visao: "from-accent to-accent-light",
  valores: "from-primary to-primary-light",
};

export default async function HomePage() {
  const include = { _count: { select: { unidades: true } } } as const;

  const [destacadosCarrossel, destacadosPortfolio, recentes, conteudo] = await Promise.all([
    prisma.empreendimento.findMany({
      where: { destaque: "CARROSSEL" },
      orderBy: { createdAt: "desc" },
      include,
    }),
    prisma.empreendimento.findMany({
      where: { destaque: { in: ["CARROSSEL", "PORTFOLIO"] } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include,
    }),
    prisma.empreendimento.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include,
    }),
    getConteudoSite(),
  ]);

  // Sem nada marcado como destaque ainda: cai para os mais recentes, pra
  // home não ficar vazia enquanto o admin não configura a curadoria.
  const empreendimentosCarrossel = destacadosCarrossel.length > 0 ? destacadosCarrossel : recentes;
  const empreendimentosPortfolio =
    destacadosPortfolio.length > 0 ? destacadosPortfolio : recentes;

  const slides: HeroSlide[] = empreendimentosCarrossel.slice(0, 6).map((emp) => ({
    eyebrow: eyebrowEmpreendimento({
      bairro: emp.bairro,
      cidade: emp.cidade,
      status: emp.status,
    }),
    titulo: emp.nome,
    subtitulo:
      emp.slogan ||
      subtituloEmpreendimento({
        totalUnidades: emp._count.unidades,
        entregaPrevista: emp.entregaPrevista,
      }),
    href: `/empreendimentos/${emp.slug}`,
    imagemUrl: emp.bannerUrl,
    videoUrl: emp.bannerVideoUrl,
  }));

  if (slides.length === 0) {
    slides.push({
      eyebrow: "Construção & incorporação",
      titulo: "Empreendimentos pensados para durar gerações.",
      subtitulo: "Do projeto à entrega das chaves — qualidade e transparência.",
      href: "/empreendimentos",
    });
  }

  const anosMercado = calcularAnosMercado(conteudo.fundacaoData);

  const pilares = [
    { chave: "missao", titulo: conteudo.missaoTitulo, texto: conteudo.missaoDescricao, imagem: conteudo.missaoImagemUrl },
    { chave: "visao", titulo: conteudo.visaoTitulo, texto: conteudo.visaoDescricao, imagem: conteudo.visaoImagemUrl },
    { chave: "valores", titulo: conteudo.valoresTitulo, texto: conteudo.valoresDescricao, imagem: conteudo.valoresImagemUrl },
  ];

  return (
    <>
      <HeroCarousel slides={slides} />

      <section className="bg-black py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-xl">
            <p className="mb-3 text-xs font-semibold tracking-widest text-accent-light uppercase">
              Portfólio
            </p>
            <h2 className="font-display text-3xl font-medium text-white md:text-4xl">
              Empreendimentos em destaque
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {empreendimentosPortfolio.slice(0, 6).map((emp) => (
              <Link
                key={emp.id}
                href={`/empreendimentos/${emp.slug}`}
                className="group block overflow-hidden rounded-xl border border-line bg-white transition duration-500 hover:bg-accent hover:shadow-lg"
              >
                {emp.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-managed Supabase Storage URL
                  <img
                    src={emp.bannerUrl}
                    alt={emp.nome}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-56 bg-gradient-to-br from-primary-light to-primary" />
                )}
                <div className="p-6">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-accent uppercase transition-colors duration-500 group-hover:text-white">
                    {EMPREENDIMENTO_STATUS_LABEL[emp.status]}
                  </p>
                  <h3 className="font-display mb-2 text-xl font-medium text-primary transition-colors duration-500 group-hover:text-white">
                    {emp.nome}
                  </h3>
                  <p className="text-sm text-ink/70 transition-colors duration-500 group-hover:text-white">
                    {subtituloEmpreendimento({
                      totalUnidades: emp._count.unidades,
                      entregaPrevista: emp.entregaPrevista,
                    })}
                  </p>
                </div>
              </Link>
            ))}
            {empreendimentosPortfolio.length === 0 && (
              <p className="text-white/60">Nenhum empreendimento publicado ainda.</p>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/empreendimentos"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 font-semibold text-primary transition hover:bg-accent-light"
            >
              Ver todos
            </Link>
          </div>
        </div>
      </section>

      <section id="sobre" className="border-t border-line bg-mist py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">
              Empresa
            </p>
            <h2 className="font-display mb-5 text-3xl font-medium text-primary md:text-4xl">
              {conteudo.sobreTitulo}
            </h2>
            <p className="mb-8 text-lg text-ink/70">{conteudo.sobreDescricao}</p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="font-display text-3xl font-semibold text-primary">{anosMercado}</p>
                <p className="text-sm text-ink/60">anos de mercado</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-primary">
                  {conteudo.stat2Valor}
                </p>
                <p className="text-sm text-ink/60">{conteudo.stat2Rotulo}</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-primary">
                  {conteudo.stat3Valor}
                </p>
                <p className="text-sm text-ink/60">{conteudo.stat3Rotulo}</p>
              </div>
            </div>
          </div>
          {conteudo.sobreImagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-managed Supabase Storage URL
            <img
              src={conteudo.sobreImagemUrl}
              alt={conteudo.sobreTitulo}
              className="h-80 w-full rounded-xl border border-line object-cover md:h-full"
            />
          ) : (
            <div className="h-80 rounded-xl border border-line bg-gradient-to-br from-primary-light to-primary md:h-full" />
          )}
        </div>
      </section>

      <section className="border-t border-line bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-xl">
            <p className="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">
              Missão, Visão e Valores
            </p>
            <h2 className="font-display text-3xl font-medium text-primary md:text-4xl">
              O que nos move
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pilares.map((pilar) => (
              <div
                key={pilar.chave}
                className="overflow-hidden rounded-xl border border-line bg-white"
              >
                {pilar.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-managed Supabase Storage URL
                  <img
                    src={pilar.imagem}
                    alt={pilar.titulo}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div
                    className={`h-48 w-full bg-gradient-to-br ${PILAR_GRADIENTE[pilar.chave]}`}
                  />
                )}
                <div className="p-6">
                  <h3 className="font-display mb-2 text-xl font-medium text-primary">
                    {pilar.titulo}
                  </h3>
                  <p className="text-sm text-ink/70">{pilar.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
