"use client";

import { useActionState, useState } from "react";
import { criarTokenApi, revogarTokenApi } from "./tokens-actions";
import { DeleteButton } from "@/components/delete-button";

type AdminOpcao = { id: string; nome: string };

type TokenApi = {
  id: string;
  nome: string;
  userId: string;
  criadoEm: Date;
  ultimoUsoEm: Date | null;
  revogadoEm: Date | null;
};

export function TokensApiSection({ admins, tokens }: { admins: AdminOpcao[]; tokens: TokenApi[] }) {
  const [state, action, pending] = useActionState(criarTokenApi, undefined);
  const [copiado, setCopiado] = useState(false);
  const nomePorId = new Map(admins.map((a) => [a.id, a.nome]));

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-6">
      <div>
        <h2 className="font-display text-lg font-medium text-primary">API para agentes</h2>
        <p className="text-sm text-ink/60">
          Um token dá a uma automação (ex.: um agente de IA) acesso às mesmas áreas do
          administrador escolhido, via <code className="text-xs">Authorization: Bearer</code>.
        </p>
      </div>

      <form action={action} className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label htmlFor="token-nome" className="text-xs font-medium text-ink/60">
            Nome do token
          </label>
          <input
            id="token-nome"
            name="nome"
            type="text"
            placeholder="Ex.: Agente de tabelas"
            required
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="token-userId" className="text-xs font-medium text-ink/60">
            Age como
          </label>
          <select
            id="token-userId"
            name="userId"
            required
            defaultValue=""
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="" disabled>
              Selecione um administrador
            </option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Gerando..." : "Gerar token"}
        </button>
      </form>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

      {state?.success && (
        <div className="space-y-2 rounded-md border border-line bg-mist p-4">
          <p className="text-sm text-ink/70">
            Copie este token agora — ele não será mostrado novamente:
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={state.token}
              onFocus={(e) => e.target.select()}
              className="flex-1 truncate rounded-md border border-line bg-white px-3 py-2 text-xs text-ink/70"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(state.token);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              }}
              className="rounded-md border border-line px-3 py-2 text-xs font-semibold text-primary hover:bg-white"
            >
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {tokens.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-[#e9eaec] text-left text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Age como</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium">Último uso</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-primary">{t.nome}</td>
                  <td className="px-4 py-3 text-ink/70">{nomePorId.get(t.userId) ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/60">{t.criadoEm.toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-ink/60">
                    {t.ultimoUsoEm ? t.ultimoUsoEm.toLocaleDateString("pt-BR") : "Nunca"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        t.revogadoEm ? "bg-ink/10 text-ink/60" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {t.revogadoEm ? "Revogado" : "Ativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!t.revogadoEm && (
                      <DeleteButton
                        action={revogarTokenApi.bind(null, t.id)}
                        label="Revogar"
                        confirmMessage={`Revogar o token "${t.nome}"? Ele para de funcionar imediatamente.`}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
