export type HistoryRow = {
  id: string;
  data: Date;
  autor: string;
  descricao: string;
  motivo: string | null;
};

export function formatarDataHoraBR(data: Date): string {
  return data.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function HistoryTable({
  rows,
  emptyMessage,
}: {
  rows: HistoryRow[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-ink/50">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="bg-mist text-left text-ink/60">
          <tr>
            <th className="px-4 py-2 font-medium">Data</th>
            <th className="px-4 py-2 font-medium">Alteração</th>
            <th className="px-4 py-2 font-medium">Por</th>
            <th className="px-4 py-2 font-medium">Motivo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-4 py-2 text-ink/70">{formatarDataHoraBR(row.data)}</td>
              <td className="px-4 py-2 text-ink/70">{row.descricao}</td>
              <td className="px-4 py-2 text-ink/70">{row.autor}</td>
              <td className="px-4 py-2 text-ink/50">{row.motivo ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
