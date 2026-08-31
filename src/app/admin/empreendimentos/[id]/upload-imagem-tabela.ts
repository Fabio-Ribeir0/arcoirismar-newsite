"use client";

import { enviarArquivoDireto } from "@/lib/upload-direto";
import type { ResultadoUploadImagem } from "@/components/admin/rich-text-editor";
import { prepararUploadImagemTabela, confirmarUploadImagemTabela } from "./tabela-actions";

/**
 * Closure de upload de imagem inline para o RichTextEditor no contexto de um
 * empreendimento — o editor em si é genérico e não sabe onde o arquivo é gravado.
 */
export function criarUploadImagemTabela(empreendimentoId: string) {
  return async (file: File): Promise<ResultadoUploadImagem> => {
    const envio = await enviarArquivoDireto(file, () =>
      prepararUploadImagemTabela(empreendimentoId, file.type, file.size)
    );
    if (!envio.ok) return envio;

    const confirmacao = await confirmarUploadImagemTabela(empreendimentoId, envio.path);
    if (!confirmacao.success) return { ok: false, message: confirmacao.message };

    return { ok: true, url: confirmacao.url };
  };
}
