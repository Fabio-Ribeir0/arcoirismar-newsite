import { escapeHtml } from "../comum";
import {
  area,
  corretorPresente,
  enderecoCompleto,
  eyebrowLocalizacao,
  foto,
  imgSlot,
  moeda,
  unidadeTorre,
} from "./helpers";
import type { UnidadeRevendaTemplateData } from "./tipos";

export const MOSAICO_CSS = `
  .tpl-mosaico{ font-family:'DM Sans',Arial,sans-serif; color:#3c3f40; display:flex; flex-direction:column; }
  .tpl-mosaico h1,.tpl-mosaico h2{ margin:0; font-family:'Red Hat Display',Arial,sans-serif; }
  .tpl-mosaico p{ margin:0; }
  .tpl-mosaico ul{ margin:0; padding:0; list-style:none; }
  .tpl-mosaico .eyebrow{ font-size:7.6pt; font-weight:700; letter-spacing:.16em; text-transform:uppercase; }

  .tpl-mosaico .mosaic{ position:relative; display:grid; grid-template-columns:1.5fr 1fr; gap:2.4mm; height:121mm; padding:2.4mm; background:#3c3f40; }
  .tpl-mosaico .tile{ position:relative; overflow:hidden; }
  .tpl-mosaico .tile img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tpl-mosaico .tile-fachada{ grid-row:1/2; background:linear-gradient(150deg,#4b4f50 0%,#3c3f40 42%,#8a7245 78%,#c2a558 130%); }
  .tpl-mosaico .mosaic-grid2{ display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:2.4mm; }
  .tpl-mosaico .mosaic-grid2 .tile:nth-child(1){ background:linear-gradient(160deg,#d3bd7e 0%,#c2a558 55%,#8a7245 130%); }
  .tpl-mosaico .mosaic-grid2 .tile:nth-child(2){ background:linear-gradient(155deg,#6d7173 0%,#54585a 50%,#3c3f40 130%); }
  .tpl-mosaico .mosaic-grid2 .tile:nth-child(3){ background:linear-gradient(200deg,#eae6dd 0%,#d3bd7e 60%,#b3924c 130%); }
  .tpl-mosaico .mosaic-grid2 .tile:nth-child(4){ background:linear-gradient(120deg,#eef0ec 0%,#cbbb92 45%,#54585a 130%); }
  .tpl-mosaico .id-panel{ position:absolute; left:38.5%; top:63%; width:44%; transform:translateY(-50%); z-index:5; background:linear-gradient(155deg, rgba(28,29,30,.90) 0%, rgba(45,42,32,.86) 100%); border-top:2.6px solid #c2a558; padding:6mm 7mm 6.5mm; }
  .tpl-mosaico .id-panel .eyebrow{ color:#d3bd7e; margin-bottom:2.2mm; display:block; }
  .tpl-mosaico .id-panel h1{ color:#fff; font-size:23pt; font-weight:800; line-height:1.04; }
  .tpl-mosaico .unit-line{ margin-top:3mm; display:flex; align-items:baseline; gap:2.4mm; flex-wrap:wrap; }
  .tpl-mosaico .unit-line strong{ color:#d3bd7e; font-size:11.5pt; font-weight:700; }
  .tpl-mosaico .unit-line span{ color:#e9e6df; font-size:8.4pt; }

  .tpl-mosaico .block-facts{ display:flex; background:#f4f2ee; border-bottom:1px solid #e4e0d8; }
  .tpl-mosaico .fact{ flex:1; padding:2.6mm 5mm; border-right:1px solid #e4e0d8; }
  .tpl-mosaico .fact:last-child{ border-right:none; }
  .tpl-mosaico .fact-value{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:10pt; color:#3c3f40; line-height:1.15; }
  .tpl-mosaico .fact-label{ font-size:6.6pt; letter-spacing:.09em; text-transform:uppercase; color:#54585a; }

  .tpl-mosaico .content-pad{ padding:2.5mm 9mm 0; }
  .tpl-mosaico .block-description p{ font-size:8.8pt; line-height:1.42; color:#3c3f40; }
  .tpl-mosaico .body-grid{ display:grid; grid-template-columns:1.18fr .82fr; gap:8mm; margin-top:2.5mm; }
  .tpl-mosaico .section-title{ font-size:10.4pt; font-weight:700; color:#3c3f40; margin-bottom:2mm; padding-bottom:1.2mm; border-bottom:1.4px solid #c2a558; display:inline-block; }
  .tpl-mosaico .specs-grid{ display:grid; grid-template-columns:1fr 1fr; gap:1.6mm 5mm; margin-top:4mm; }
  .tpl-mosaico .spec-item{ display:flex; justify-content:space-between; padding:1.5mm 0; border-bottom:1px solid #e4e0d8; font-size:8.2pt; }
  .tpl-mosaico .spec-item .k{ color:#54585a; }
  .tpl-mosaico .spec-item .v{ font-weight:700; color:#3c3f40; }
  .tpl-mosaico .amenities-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.4mm 3mm; margin-top:4.5mm; }
  .tpl-mosaico .amenity{ display:flex; align-items:center; gap:2mm; font-size:8pt; padding:1.1mm 0; }
  .tpl-mosaico .amenity::before{ content:""; width:2mm; height:2mm; border-radius:50%; background:#c2a558; flex:none; }
  .tpl-mosaico .sidebar > * + *{ margin-top:2.4mm; }
  .tpl-mosaico .card{ border:1px solid #e4e0d8; background:#f4f2ee; }
  .tpl-mosaico .card-accent-top{ border-top:2.6px solid #c2a558; }
  .tpl-mosaico .card-pad{ padding:3.4mm 4.5mm; }
  .tpl-mosaico .price-value{ font-weight:800; font-size:15pt; color:#3c3f40; line-height:1; margin-top:1.2mm; }
  .tpl-mosaico .payment-list{ margin-top:2.2mm; }
  .tpl-mosaico .payment-list li{ position:relative; padding-left:3.6mm; font-size:7.6pt; line-height:1.32; margin-bottom:1.2mm; color:#3c3f40; }
  .tpl-mosaico .payment-list li::before{ content:""; position:absolute; left:0; top:1.3mm; width:1.8mm; height:1.8mm; background:#c2a558; }
  .tpl-mosaico .loc-address{ font-weight:700; font-size:8.8pt; color:#3c3f40; margin-top:.8mm; line-height:1.3; }
  .tpl-mosaico .loc-note{ margin-top:1.6mm; font-size:7.6pt; line-height:1.35; color:#54585a; }
  .tpl-mosaico .block-cta{ background:#3c3f40; color:#fff; }
  .tpl-mosaico .block-cta .eyebrow{ color:#d3bd7e; }
  .tpl-mosaico .block-cta h3{ color:#fff; font-size:11.5pt; font-weight:700; margin-top:1.2mm; }
  .tpl-mosaico .broker{ margin-top:1.8mm; padding-top:1.8mm; border-top:1px solid rgba(255,255,255,.18); }
  .tpl-mosaico .broker-name{ font-weight:700; font-size:8.8pt; color:#fff; }
  .tpl-mosaico .broker-contact{ margin-top:1.2mm; font-size:7.8pt; color:#d3bd7e; font-weight:600; }
  .tpl-mosaico .block-footer{ margin-top:auto; padding:2mm 9mm 2.5mm; display:flex; justify-content:space-between; border-top:1px solid #e4e0d8; }
  .tpl-mosaico .brand{ font-weight:700; font-size:7.4pt; color:#3c3f40; }
  .tpl-mosaico .footer-tag{ font-size:6.4pt; color:#54585a; }
`;

export function renderMosaico(u: UnidadeRevendaTemplateData): string {
  const eyebrow = eyebrowLocalizacao(u);
  const unitTag = unidadeTorre(u);
  const endereco = enderecoCompleto(u);

  const resumo = [
    u.areaPrivativa != null ? area(u.areaPrivativa) : null,
    u.dormitorios != null ? `${u.dormitorios} dorm.${u.suites ? ` (${u.suites} suíte(s))` : ""}` : null,
    u.vagas != null ? `${u.vagas} vagas` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const facts = [
    ["Tipo", "Apartamento"],
    u.areaPrivativa != null ? ["Área privativa", area(u.areaPrivativa)] : null,
    u.vagas != null ? ["Garagem", `${u.vagas} vagas`] : null,
    u.entregaPrevista ? ["Entrega prevista", escapeHtml(u.entregaPrevista)] : null,
  ].filter((f): f is [string, string] => f !== null);

  const specs = [
    u.areaPrivativa != null ? ["Área privativa", area(u.areaPrivativa)] : null,
    u.dormitorios != null ? ["Dormitórios", u.suites ? `${u.dormitorios} (${u.suites} suíte(s))` : String(u.dormitorios)] : null,
    u.andar ? ["Andar", escapeHtml(u.andar)] : null,
    u.vagas != null ? ["Vagas", String(u.vagas)] : null,
    u.torre ? ["Torre", escapeHtml(u.torre)] : null,
    u.elevadores != null ? ["Elevadores", String(u.elevadores)] : null,
    u.entregaPrevista ? ["Entrega prevista", escapeHtml(u.entregaPrevista)] : null,
    u.diferencial ? ["Diferencial", escapeHtml(u.diferencial)] : null,
  ].filter((s): s is [string, string] => s !== null);

  const tiles = [1, 2, 3, 4].map((i) => `<div class="tile">${imgSlot(foto(u, i))}</div>`).join("");

  return `
    <div class="tpl-conteudo tpl-mosaico">
      <section class="mosaic">
        <div class="tile tile-fachada">${imgSlot(foto(u, 0))}</div>
        <div class="mosaic-grid2">${tiles}</div>
        <div class="id-panel">
          ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
          <h1>${escapeHtml(u.nome)}</h1>
          <div class="unit-line">
            ${unitTag ? `<strong>${escapeHtml(unitTag)}</strong>` : ""}
            ${resumo ? `<span>${resumo}</span>` : ""}
          </div>
        </div>
      </section>

      <section class="block-facts">${facts.map(([l, v]) => `<div class="fact"><div class="fact-value">${v}</div><div class="fact-label">${l}</div></div>`).join("")}</section>

      <div class="content-pad">
        ${u.descricao ? `<section class="block-description"><p>${escapeHtml(u.descricao)}</p></section>` : ""}

        <div class="body-grid">
          <div class="main-col">
            ${specs.length ? `<section><h2 class="section-title">Ficha técnica</h2><div class="specs-grid">${specs.map(([k, v]) => `<div class="spec-item"><span class="k">${k}</span><span class="v">${v}</span></div>`).join("")}</div></section>` : ""}
            ${u.amenidades.length ? `<section><h2 class="section-title">Área de lazer</h2><ul class="amenities-grid">${u.amenidades.map((a) => `<li class="amenity">${escapeHtml(a)}</li>`).join("")}</ul></section>` : ""}
          </div>
          <div class="sidebar">
            <section class="card card-accent-top card-pad">
              <h2 class="section-title" style="border-bottom:none;padding-bottom:0;margin-bottom:0;">Valores e condições</h2>
              <div class="price-value">${moeda(u.valor)}</div>
              ${u.condicoesPagamento.length ? `<ul class="payment-list">${u.condicoesPagamento.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` : ""}
            </section>
            ${
              endereco || u.localizacaoNota
                ? `<section class="card card-pad">
                    <h2 class="section-title" style="border-bottom:none;padding-bottom:0;margin-bottom:0;">Localização</h2>
                    ${endereco ? `<p class="loc-address">${escapeHtml(endereco)}</p>` : ""}
                    ${u.localizacaoNota ? `<p class="loc-note">${escapeHtml(u.localizacaoNota)}</p>` : ""}
                  </section>`
                : ""
            }
            <section class="card block-cta card-pad">
              <span class="eyebrow">Fale com a corretora</span>
              <h3>Interessado nesta unidade?</h3>
              ${
                corretorPresente(u)
                  ? `<div class="broker">
                      ${u.corretorNome ? `<div class="broker-name">${escapeHtml(u.corretorNome)}</div>` : ""}
                      <div class="broker-contact">${[u.corretorTelefone, u.corretorEmail].filter((v): v is string => Boolean(v)).map(escapeHtml).join(" · ")}</div>
                    </div>`
                  : ""
              }
            </section>
          </div>
        </div>
      </div>

      <footer class="block-footer">
        <span class="brand">CONSTRUTORA ARCO-ÍRIS MAR</span>
        <span class="footer-tag">Material ilustrativo · imagens meramente representativas</span>
      </footer>
    </div>
  `;
}
