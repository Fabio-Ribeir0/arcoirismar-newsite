import { supabaseBrowser } from "./supabase-browser";
import { EMPREENDIMENTOS_BUCKET } from "./supabase-shared";

export type PrepararUploadResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

/**
 * Sobe o arquivo direto do navegador para o Supabase Storage usando a URL
 * assinada devolvida pela Server Action de preparo.
 *
 * O arquivo NUNCA passa pela Server Action: a borda da Vercel derruba
 * requisições com corpo grande antes mesmo de chegar no código da aplicação,
 * bem abaixo dos limites anunciados na interface. Só o preparo (metadados) e a
 * confirmação (URL final) trafegam pelo servidor.
 *
 * A confirmação fica por conta de quem chama, porque cada domínio grava a URL
 * num lugar diferente.
 */
export async function enviarArquivoDireto(
  arquivo: File,
  preparar: () => Promise<PrepararUploadResult>
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  const preparo = await preparar();
  if (!preparo.success) {
    return { ok: false, message: preparo.message };
  }

  const { error } = await supabaseBrowser.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .uploadToSignedUrl(preparo.path, preparo.token, arquivo, { contentType: arquivo.type });

  if (error) {
    return { ok: false, message: `Falha ao enviar o arquivo: ${error.message}` };
  }

  return { ok: true, path: preparo.path };
}
