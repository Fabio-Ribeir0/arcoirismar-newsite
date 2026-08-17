"use server";

import { requireAdmin } from "@/lib/dal";

export type GeocodeState =
  | { success: true; latitude: number; longitude: number; enderecoEncontrado: string }
  | { success: false; message: string };

type EnderecoInput = {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
};

/**
 * Nominatim (OpenStreetMap) exige um User-Agent identificando a aplicação —
 * política de uso: https://operations.osmfoundation.org/policies/nominatim/
 */
const NOMINATIM_USER_AGENT = "ArcoIrisMarAdmin/1.0 (contato@arcoirismar.com.br)";

export async function buscarCoordenadas(endereco: EnderecoInput): Promise<GeocodeState> {
  await requireAdmin();

  const partes = [endereco.endereco, endereco.bairro, endereco.cidade, endereco.estado, endereco.cep, "Brasil"]
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte));

  if (partes.length <= 1) {
    return { success: false, message: "Preencha ao menos o endereço antes de buscar as coordenadas." };
  }

  const query = partes.join(", ");
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT },
    });
  } catch {
    return { success: false, message: "Não foi possível consultar o serviço de geocodificação." };
  }

  if (!resposta.ok) {
    return { success: false, message: "Não foi possível consultar o serviço de geocodificação." };
  }

  const resultados = (await resposta.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (resultados.length === 0) {
    return {
      success: false,
      message: "Endereço não encontrado. Ajuste o pin manualmente no mapa abaixo.",
    };
  }

  const [resultado] = resultados;
  return {
    success: true,
    latitude: Number(resultado.lat),
    longitude: Number(resultado.lon),
    enderecoEncontrado: resultado.display_name,
  };
}
