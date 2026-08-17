"use client";

import { useState, useTransition } from "react";
import {
  UNIDADE_STATUS_LABEL,
  UNIDADE_STATUS_BORDA,
  UNIDADE_STATUS_VIVIDO,
} from "@/lib/tabela-unidades";
import { atualizarStatusUnidadeEspelho } from "./actions";

export type UnidadeEspelho = {
  id: string;
  identificador: string;
  status: string;
  ultimaAnotacao: string | null;
};
export type AndarEspelho = { andar: number; unidades: UnidadeEspelho[] };
export type ContagemEspelho = Record<string, number>;
export type EmpreendimentoEspelho = {
  id: string;
  nome: string;
  andares: AndarEspelho[];
  unidadesSemAndar: number;
  contagem: ContagemEspelho;
};

function corBorda(status: string): string {
  return UNIDADE_STATUS_BORDA[status] ?? "border-ink/60";
}

function corVivida(status: string): string {
  return UNIDADE_STATUS_VIVIDO[status] ?? "bg-ink/60";
}

const STATUS_ORDEM = [
  "DISPONIVEL",
  "RESERVADO",
  "VENDIDO",
  "BLOQUEADO",
  "DECORADO",
  "TROCA_AREA",
] as const;

const POR_PAGINA = 4;

type SelecaoModal = { unidade: UnidadeEspelho; empreendimentoNome: string };

export function EspelhoVendaCarousel({
  empreendimentos,
}: {
  empreendimentos: EmpreendimentoEspelho[];
}) {
  const totalPaginas = Math.ceil(empreendimentos.length / POR_PAGINA);
  const [pagina, setPagina] = useState(0);
  const [selecao, setSelecao] = useState<SelecaoModal | null>(null);

  if (empreendimentos.length === 0) {
    return (
      <p className="text-sm text-ink/50">
        Nenhum empreendimento marcado com &quot;Espelho de Venda&quot;. Marque a opção na aba
        Detalhes de cada empreendimento para que apareça aqui.
      </p>
    );
  }

  const anterior = () => setPagina((p) => (p - 1 + totalPaginas) % totalPaginas);
  const proximo = () => setPagina((p) => (p + 1) % totalPaginas);

  const inicio = pagina * POR_PAGINA;
  const visiveis = empreendimentos.slice(inicio, inicio + POR_PAGINA);

  return (
    <div>
      <div className="relative px-0 sm:px-10">
        <div className="flex items-end gap-6 overflow-x-auto pb-2">
          {visiveis.map((empreendimento) => (
            <div key={empreendimento.id} className="shrink-0">
              <BlocoEmpreendimento
                empreendimento={empreendimento}
                onSelecionarUnidade={(unidade) =>
                  setSelecao({ unidade, empreendimentoNome: empreendimento.nome })
                }
              />
            </div>
          ))}
        </div>

        {totalPaginas > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Página anterior"
              className="absolute top-1/2 left-0 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-primary shadow transition hover:bg-mist"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={proximo}
              aria-label="Próxima página"
              className="absolute top-1/2 right-0 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-primary shadow transition hover:bg-mist"
            >
              <ChevronIcon direction="right" />
            </button>
          </>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          {Array.from({ length: totalPaginas }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Página ${index + 1}`}
              onClick={() => setPagina(index)}
              className={`size-2.5 rounded-full transition ${
                index === pagina ? "bg-primary" : "bg-line"
              }`}
            />
          ))}
        </div>
      )}

      <Legenda />

      {selecao && (
        <ModalUnidade
          unidade={selecao.unidade}
          empreendimentoNome={selecao.empreendimentoNome}
          onFechar={() => setSelecao(null)}
        />
      )}
    </div>
  );
}

function BlocoEmpreendimento({
  empreendimento,
  onSelecionarUnidade,
}: {
  empreendimento: EmpreendimentoEspelho;
  onSelecionarUnidade: (unidade: UnidadeEspelho) => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-6">
      <h2 className="font-display mb-4 text-lg font-medium text-primary">{empreendimento.nome}</h2>

      {empreendimento.andares.length === 0 ? (
        <p className="text-sm text-ink/50">Nenhuma unidade com andar definido.</p>
      ) : (
        <div className="space-y-1.5">
          {empreendimento.andares.map(({ andar, unidades }) => (
            <div key={andar} className="flex items-stretch gap-1.5">
              <span className="flex w-8 shrink-0 items-center justify-center text-xs font-semibold text-ink/50">
                {andar}
              </span>
              <div className="flex gap-1.5">
                {unidades.map((unidade) => (
                  <button
                    key={unidade.id}
                    type="button"
                    onClick={() => onSelecionarUnidade(unidade)}
                    title={`${unidade.identificador} — ${UNIDADE_STATUS_LABEL[unidade.status] ?? unidade.status}${unidade.ultimaAnotacao ? `\nAnotação: ${unidade.ultimaAnotacao}` : ""}`}
                    className={`flex w-14 shrink-0 items-center justify-center rounded-md border px-2 py-2 text-center text-xs font-semibold text-white transition hover:brightness-90 ${corVivida(unidade.status)} ${corBorda(unidade.status)}`}
                  >
                    {unidade.identificador}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {empreendimento.unidadesSemAndar > 0 && (
        <p className="mt-3 text-xs text-ink/40">
          {empreendimento.unidadesSemAndar} unidade(s) sem andar definido não exibida(s) aqui.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3 text-xs font-semibold text-ink/70">
        {STATUS_ORDEM.map((status) => (
          <ContagemStatus key={status} status={status} valor={empreendimento.contagem[status] ?? 0} />
        ))}
      </div>
    </div>
  );
}

function ContagemStatus({ status, valor }: { status: string; valor: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-3 shrink-0 rounded border ${corVivida(status)} ${corBorda(status)}`} />
      {valor}
    </span>
  );
}

function Legenda() {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
      {STATUS_ORDEM.map((status) => (
        <div key={status} className="flex items-center gap-2 text-sm text-ink/70">
          <span className={`size-3.5 rounded border ${corVivida(status)} ${corBorda(status)}`} />
          {UNIDADE_STATUS_LABEL[status]}
        </div>
      ))}
    </div>
  );
}

function ModalUnidade({
  unidade,
  empreendimentoNome,
  onFechar,
}: {
  unidade: UnidadeEspelho;
  empreendimentoNome: string;
  onFechar: () => void;
}) {
  const [status, setStatus] = useState<(typeof STATUS_ORDEM)[number]>(
    unidade.status as (typeof STATUS_ORDEM)[number]
  );
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSalvar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await atualizarStatusUnidadeEspelho(unidade.id, status, motivo);
      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }
      onFechar();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {empreendimentoNome}
        </p>
        <h3 className="font-display mt-1 text-xl font-medium text-primary">
          Unidade {unidade.identificador}
        </h3>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="espelho-status" className="text-sm font-medium text-ink">
              Status
            </label>
            <select
              id="espelho-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as (typeof STATUS_ORDEM)[number])}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {STATUS_ORDEM.map((valor) => (
                <option key={valor} value={valor}>
                  {UNIDADE_STATUS_LABEL[valor]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="espelho-motivo" className="text-sm font-medium text-ink">
              Motivo da alteração (opcional)
            </label>
            <textarea
              id="espelho-motivo"
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink/70 hover:bg-mist"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={pending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
          >
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
