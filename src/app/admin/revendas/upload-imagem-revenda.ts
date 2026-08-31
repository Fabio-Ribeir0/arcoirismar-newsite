"use client";

import { enviarArquivoDireto } from "@/lib/upload-direto";
import type { ResultadoUploadImagem } from "@/components/admin/rich-text-editor";
import { prepararUploadImagemRevenda, confirmarUploadImagemRevenda } from "./upload-actions";

/** Closure de upload de imagem inline para o RichTextEditor no contexto de uma revenda. */
export function criarUploadImagemRevenda(unidadeId: string) {
  return async (file: File): Promise<ResultadoUploadImagem> => {
    const envio = await enviarArquivoDireto(file, () =>
      prepararUploadImagemRevenda(unidadeId, file.type, file.size)
    );
    if (!envio.ok) return envio;

    const confirmacao = await confirmarUploadImagemRevenda(unidadeId, envio.path);
    if (!confirmacao.success) return { ok: false, message: confirmacao.message };

    return { ok: true, url: confirmacao.url };
  };
}
