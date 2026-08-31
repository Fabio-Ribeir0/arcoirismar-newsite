"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { buscarCoordenadas } from "./geocode-actions";

// Centro de Praia Grande/SP — usado como ponto de partida quando o
// empreendimento ainda não tem coordenadas salvas.
const PRAIA_GRANDE: [number, number] = [-24.0086, -46.4025];

const ICONE_PIN = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#c2a558;border:2px solid #1f2a2e;box-shadow:0 0 0 2px #fff;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function MapaLocalizacao({
  latitudeInicial,
  longitudeInicial,
  errosLatitude,
  errosLongitude,
  prefixoIds = "",
}: {
  latitudeInicial?: string | null;
  longitudeInicial?: string | null;
  errosLatitude?: string[];
  errosLongitude?: string[];
  /**
   * Prefixo dos `id` dos campos de endereço que o botão "Buscar coordenadas" lê
   * do DOM. Necessário porque dois formulários com esse mapa não podem
   * disputar os mesmos ids globais — os `name` continuam sem prefixo, já que é
   * por eles que o FormData é montado.
   */
  prefixoIds?: string;
}) {
  const mapaDivRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadorRef = useRef<L.Marker | null>(null);
  const [latitude, setLatitude] = useState(latitudeInicial ?? "");
  const [longitude, setLongitude] = useState(longitudeInicial ?? "");
  const [buscando, setBuscando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    if (!mapaDivRef.current || mapaRef.current) return;

    const temCoordenadas = Boolean(latitudeInicial && longitudeInicial);
    const posicaoInicial: [number, number] = temCoordenadas
      ? [Number(latitudeInicial), Number(longitudeInicial)]
      : PRAIA_GRANDE;

    const mapa = L.map(mapaDivRef.current).setView(posicaoInicial, temCoordenadas ? 16 : 13);
    mapaRef.current = mapa;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa);

    const marcador = L.marker(posicaoInicial, { icon: ICONE_PIN, draggable: true }).addTo(mapa);
    marcadorRef.current = marcador;

    marcador.on("dragend", () => {
      const { lat, lng } = marcador.getLatLng();
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
    });

    mapa.on("click", (evento: L.LeafletMouseEvent) => {
      marcador.setLatLng(evento.latlng);
      setLatitude(evento.latlng.lat.toFixed(6));
      setLongitude(evento.latlng.lng.toFixed(6));
    });

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só monta o mapa uma vez
  }, []);

  function moverPin(lat: number, lng: number, zoom?: number) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    marcadorRef.current?.setLatLng([lat, lng]);
    mapaRef.current?.setView([lat, lng], zoom ?? mapaRef.current.getZoom());
  }

  async function handleBuscar() {
    setBuscando(true);
    setMensagem(null);

    const valorDe = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value;

    const resultado = await buscarCoordenadas({
      endereco: valorDe(`${prefixoIds}endereco`),
      bairro: valorDe(`${prefixoIds}bairro`),
      cidade: valorDe(`${prefixoIds}cidade`),
      estado: valorDe(`${prefixoIds}estado`),
      cep: valorDe(`${prefixoIds}cep`),
    });

    setBuscando(false);

    if (!resultado.success) {
      setMensagem(resultado.message);
      return;
    }

    setLatitude(resultado.latitude.toFixed(6));
    setLongitude(resultado.longitude.toFixed(6));
    moverPin(resultado.latitude, resultado.longitude, 16);
    setMensagem(`Encontrado: ${resultado.enderecoEncontrado}`);
  }

  function handleCoordenadaManual(tipo: "lat" | "lng", valor: string) {
    const novaLatitude = tipo === "lat" ? valor : latitude;
    const novaLongitude = tipo === "lng" ? valor : longitude;
    if (tipo === "lat") setLatitude(valor);
    else setLongitude(valor);
    moverPin(Number(novaLatitude), Number(novaLongitude));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-medium text-primary">Localização no mapa</h3>
          <p className="text-xs text-ink/50">
            Busca o endereço preenchido acima (OpenStreetMap/Nominatim) e posiciona o pin.
            Arraste o pin ou clique no mapa para ajustar manualmente.
          </p>
        </div>
        <button
          type="button"
          onClick={handleBuscar}
          disabled={buscando}
          className="shrink-0 rounded-md border border-line px-4 py-2 text-sm font-medium text-primary hover:bg-mist disabled:opacity-60"
        >
          {buscando ? "Buscando..." : "Buscar coordenadas pelo endereço"}
        </button>
      </div>

      {mensagem && <p className="text-sm text-ink/70">{mensagem}</p>}

      <div ref={mapaDivRef} className="h-80 w-full rounded-lg border border-line" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`${prefixoIds}latitude`} className="text-sm font-medium text-ink">
            Latitude
          </label>
          <input
            id={`${prefixoIds}latitude`}
            name="latitude"
            value={latitude}
            onChange={(e) => handleCoordenadaManual("lat", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {errosLatitude?.map((error) => (
            <p key={error} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${prefixoIds}longitude`} className="text-sm font-medium text-ink">
            Longitude
          </label>
          <input
            id={`${prefixoIds}longitude`}
            name="longitude"
            value={longitude}
            onChange={(e) => handleCoordenadaManual("lng", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {errosLongitude?.map((error) => (
            <p key={error} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
