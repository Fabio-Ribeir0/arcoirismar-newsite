import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { eyebrowEmpreendimento } from "@/lib/empreendimento-display";
import { formatTipoUnidade } from "@/lib/tabela-unidades";
import { LightboxGallery } from "@/components/site/lightbox-gallery";

export const dynamic = "force-dynamic";

export default async function EmpreendimentoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { slug },
    include: {
      unidades: true,
      midias: { where: { publico: true }, orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) notFound();

  const areas = empreendimento.unidades.map((u) => u.areaPrivativa).filter((a) => a > 0);
  const vagas = empreendimento.unidades.map((u) => u.vagas);
  const tipos = Array.from(
    new Set(
      empreendimento.unidades.map((u) => formatTipoUnidade(u.dormitorios, u.suites))
    )
  );

  const areaFaixa =
    areas.length > 0
      ? Math.min(...areas) === Math.max(...areas)
        ? `${Math.min(...areas)} m²`
        : `${Math.min(...areas)} a ${Math.max(...areas)} m²`
      : "A definir";

  const vagasFaixa =
    vagas.length > 0
      ? Math.min(...vagas) === Math.max(...vagas)
        ? `${Math.min(...vagas)}`
        : `${Math.min(...vagas)} a ${Math.max(...vagas)}`
      : "A definir";

  const entrega = empreendimento.entregaPrevista
    ? empreendimento.entregaPrevista.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : "A definir";

  const localizacao = [empreendimento.bairro, empreendimento.cidade, empreendimento.estado]
    .filter(Boolean)
    .join(", ");

  const fotos = empreendimento.midias.filter((m) => m.tipo === "FOTO");
  const plantas = empreendimento.midias.filter((m) => m.tipo === "PLANTA");
  const videos = empreendimento.midias.filter((m) => m.tipo === "VIDEO");

  return (
    <>
      {/* Banner */}
      <section className="relative flex min-h-[420px] items-end overflow-hidden bg-primary pt-32 pb-10 text-white">
        {empreendimento.bannerUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-managed Supabase Storage URL */}
            <img
              src={empreendimento.bannerUrl}
              alt={empreendimento.nome}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light" />
        )}
        <div className="relative w-full max-w-7xl mx-auto px-6">
          <p className="mb-3 text-xs font-semibold tracking-widest text-accent-light uppercase">
            {eyebrowEmpreendimento({
              bairro: empreendimento.bairro,
              cidade: empreendimento.cidade,
              status: empreendimento.status,
            })}
          </p>
          <h1 className="font-display text-4xl leading-tight font-medium md:text-5xl">
            {empreendimento.nome}
          </h1>
          {empreendimento.slogan && (
            <p className="mt-3 max-w-xl text-lg text-white/80">{empreendimento.slogan}</p>
          )}
        </div>
      </section>

      {/* Ficha rápida */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-6 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:col-span-2">
            <Ficha
              label="Tipos"
              valor={
                tipos.length > 0 ? (
                  <div className="space-y-0.5">
                    {tipos.map((tipo) => (
                      <div key={tipo}>{tipo}</div>
                    ))}
                  </div>
                ) : (
                  "A definir"
                )
              }
            />
            <Ficha label="Área privativa" valor={areaFaixa} />
            <Ficha label="Vagas de garagem" valor={vagasFaixa} />
            <Ficha label="Entrega prevista" valor={entrega} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-3">
        {/* Conteúdo principal */}
        <div className="space-y-14 lg:col-span-2">
          {empreendimento.descricao && (
            <div>
              <h2 className="font-display mb-4 text-2xl font-medium text-primary">
                Sobre o empreendimento
              </h2>
              <p className="leading-relaxed text-ink/70">{empreendimento.descricao}</p>
            </div>
          )}

          {fotos.length > 0 && (
            <div>
              <h2 className="font-display mb-4 text-2xl font-medium text-primary">Galeria</h2>
              <LightboxGallery
                images={fotos.map((foto) => ({
                  id: foto.id,
                  url: foto.url,
                  alt: foto.titulo ?? empreendimento.nome,
                }))}
              />
            </div>
          )}

          {plantas.length > 0 && (
            <div>
              <h2 className="font-display mb-4 text-2xl font-medium text-primary">Plantas</h2>
              <LightboxGallery
                images={plantas.map((planta) => ({
                  id: planta.id,
                  url: planta.url,
                  alt: planta.titulo ?? "Planta",
                }))}
              />
            </div>
          )}

          {videos.length > 0 && (
            <div>
              <h2 className="font-display mb-4 text-2xl font-medium text-primary">
                Vídeo institucional
              </h2>
              <div className="space-y-4">
                {videos.map((video) => (
                  <video
                    key={video.id}
                    controls
                    muted
                    className="w-full rounded-lg border border-line"
                  >
                    <source src={video.url} />
                  </video>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-display mb-4 text-2xl font-medium text-primary">Unidades</h2>
            {empreendimento.unidades.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-line bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-mist text-left text-ink/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium">Área</th>
                      <th className="px-4 py-3 font-medium">Vagas</th>
                      <th className="px-4 py-3 font-medium">Disponibilidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tipos.map((tipo) => {
                      const doTipo = empreendimento.unidades.filter(
                        (u) => formatTipoUnidade(u.dormitorios, u.suites) === tipo
                      );
                      const disponiveis = doTipo.filter((u) => u.status === "DISPONIVEL").length;
                      const areasDoTipo = doTipo.map((u) => u.areaPrivativa);
                      const vagasDoTipo = doTipo.map((u) => u.vagas);
                      return (
                        <tr key={tipo} className="border-t border-line">
                          <td className="px-4 py-3 font-medium text-primary">{tipo}</td>
                          <td className="px-4 py-3 text-ink/70">
                            {Math.min(...areasDoTipo)}
                            {Math.min(...areasDoTipo) !== Math.max(...areasDoTipo)
                              ? ` a ${Math.max(...areasDoTipo)}`
                              : ""}{" "}
                            m²
                          </td>
                          <td className="px-4 py-3 text-ink/70">
                            {Math.min(...vagasDoTipo)}
                            {Math.min(...vagasDoTipo) !== Math.max(...vagasDoTipo)
                              ? ` a ${Math.max(...vagasDoTipo)}`
                              : ""}
                          </td>
                          <td className="px-4 py-3 text-ink/70">
                            {disponiveis > 0
                              ? `${disponiveis} ${disponiveis > 1 ? "disponíveis" : "disponível"}`
                              : "Sob consulta"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-ink/50">Unidades em breve.</p>
            )}
            <p className="mt-3 text-xs text-ink/50">
              Valores e condições de pagamento disponíveis para corretores cadastrados.
            </p>
          </div>

          {empreendimento.latitude && empreendimento.longitude && (
            <div>
              <h2 className="font-display mb-4 text-2xl font-medium text-primary">
                Localização
              </h2>
              <p className="mb-4 text-ink/70">{localizacao}</p>
              <iframe
                src={`https://www.google.com/maps?q=${empreendimento.latitude},${empreendimento.longitude}&output=embed`}
                className="h-96 w-full rounded-lg border border-line"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-mist p-6">
            <p className="font-display mb-2 text-lg font-medium text-primary">
              Interessado neste empreendimento?
            </p>
            <p className="mb-5 text-sm text-ink/70">
              Fale com nossa equipe e receba mais informações, plantas e condições.
            </p>
            <a
              href={`https://wa.me/5513974185096?text=${encodeURIComponent(
                `Quero saber mais sobre o ${empreendimento.nome}!`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full justify-center rounded-md bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
            >
              Quero mais informações
            </a>
          </div>

          <div className="rounded-xl bg-primary p-6 text-white">
            <p className="font-display mb-2 text-lg font-medium">Sou corretor</p>
            <p className="mb-5 text-sm text-white/70">
              Acesse tabela de preços, disponibilidade de unidades e simulação de
              financiamento.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-md bg-accent px-6 py-3 font-semibold text-primary transition hover:bg-accent-light"
            >
              Acessar área do corretor
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

function Ficha({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs text-ink/60">{label}</p>
      <div className="font-display text-lg font-semibold text-primary">{valor}</div>
    </div>
  );
}
