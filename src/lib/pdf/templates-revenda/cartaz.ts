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

export const CARTAZ_CSS = `
  .tpl-cartaz{ font-family:'DM Sans',Arial,sans-serif; color:#3c3f40; display:flex; flex-direction:column; }
  .tpl-cartaz h1,.tpl-cartaz h3{ margin:0; font-family:'Red Hat Display',Arial,sans-serif; }
  .tpl-cartaz p{ margin:0; }
  .tpl-cartaz ul{ margin:0; padding:0; list-style:none; }
  .tpl-cartaz .eyebrow{ display:inline-block; font-size:8.2pt; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#d3bd7e; margin:0 0 3mm; }

  .tpl-cartaz .block-hero{ position:relative; width:100%; height:128mm; flex:0 0 128mm; overflow:hidden; background:linear-gradient(128deg, #24262a 0%, #3c3f40 34%, #54585a 62%, #d3bd7e 100%); }
  .tpl-cartaz .block-hero img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tpl-cartaz .hero-scrim{ position:absolute; left:0; right:0; bottom:0; height:70%; background:linear-gradient(180deg, rgba(36,38,42,0) 0%, rgba(30,31,33,.35) 35%, rgba(24,25,27,.82) 72%, rgba(20,21,22,.94) 100%); }
  .tpl-cartaz .hero-content{ position:absolute; left:0; right:0; bottom:0; padding:10mm 10mm 9mm; color:#fff; }
  .tpl-cartaz .hero-content h1{ font-weight:800; font-size:32pt; line-height:1.03; color:#fff; }
  .tpl-cartaz .unit-line{ font-weight:600; font-size:13pt; color:#f4f2ee; margin-top:2mm; }
  .tpl-cartaz .gold-rule{ width:26mm; height:1.4pt; background:#c2a558; margin:4mm 0; }
  .tpl-cartaz .tagline{ font-size:9.5pt; font-weight:500; color:rgba(244,242,238,.92); max-width:120mm; line-height:1.45; }

  .tpl-cartaz .block-gallery{ display:flex; width:100%; height:24mm; flex:0 0 24mm; gap:.6mm; background:#3c3f40; }
  .tpl-cartaz .gallery-shot{ position:relative; flex:1 1 0; overflow:hidden; background:linear-gradient(155deg,#3c3f40,#54585a 55%,#7c7568 100%); }
  .tpl-cartaz .gallery-shot img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }

  .tpl-cartaz .lower{ flex:1 1 auto; padding:5mm 9mm 4mm; display:flex; flex-direction:column; gap:4mm; }
  .tpl-cartaz .block-quickfacts{ display:flex; border-top:.75pt solid #e4e0d8; border-bottom:.75pt solid #e4e0d8; padding:3.6mm 0; }
  .tpl-cartaz .qf-item{ flex:1; padding:0 3mm; border-right:.75pt solid #e4e0d8; }
  .tpl-cartaz .qf-item:last-child{ border-right:none; }
  .tpl-cartaz .qf-value{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:12pt; color:#3c3f40; line-height:1.05; }
  .tpl-cartaz .qf-label{ font-size:7.2pt; letter-spacing:.09em; text-transform:uppercase; color:#54585a; }

  .tpl-cartaz .row-2col{ display:grid; grid-template-columns:1.28fr 1fr; gap:9mm; }
  .tpl-cartaz .col-title{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:10.4pt; letter-spacing:.03em; text-transform:uppercase; color:#3c3f40; margin-bottom:3mm; padding-bottom:1.6mm; border-bottom:1.4pt solid #c2a558; display:inline-block; }
  .tpl-cartaz .block-description p{ font-size:9.2pt; line-height:1.6; color:#54585a; }
  .tpl-cartaz .specs-grid{ margin-top:3.6mm; display:grid; grid-template-columns:1fr 1fr; gap:2.2mm 4mm; }
  .tpl-cartaz .specs-grid li{ display:flex; justify-content:space-between; font-size:8.4pt; padding-bottom:1.6mm; border-bottom:.5pt dotted #e4e0d8; color:#54585a; }
  .tpl-cartaz .specs-grid li strong{ color:#3c3f40; font-weight:700; }
  .tpl-cartaz .amenities-list{ display:flex; flex-wrap:wrap; gap:2.2mm; }
  .tpl-cartaz .amenities-list li{ font-size:8pt; font-weight:500; padding:2mm 3.6mm; background:#f4f2ee; border:.5pt solid #e4e0d8; border-radius:8mm; color:#3c3f40; white-space:nowrap; }
  .tpl-cartaz .price-value{ font-family:'Red Hat Display',sans-serif; font-weight:800; font-size:19pt; color:#3c3f40; line-height:1; }
  .tpl-cartaz .price-value span{ font-weight:700; font-size:8pt; color:#c2a558; text-transform:uppercase; letter-spacing:.08em; margin-left:1.5mm; }
  .tpl-cartaz .price-terms{ margin-top:3mm; display:flex; flex-direction:column; gap:1.8mm; }
  .tpl-cartaz .price-terms li{ font-size:8.4pt; line-height:1.45; color:#54585a; padding-left:3.4mm; position:relative; }
  .tpl-cartaz .price-terms li::before{ content:""; position:absolute; left:0; top:1.8mm; width:1.6mm; height:1.6mm; background:#c2a558; border-radius:50%; }
  .tpl-cartaz .block-location p{ font-size:8.6pt; line-height:1.5; color:#54585a; }
  .tpl-cartaz .address{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:10pt; color:#3c3f40; margin-bottom:1.8mm; }

  .tpl-cartaz .block-cta{ margin-top:auto; background:#3c3f40; color:#fff; border-radius:1.5mm; padding:6mm 9mm; display:flex; align-items:center; justify-content:space-between; gap:6mm; }
  .tpl-cartaz .block-cta h3{ font-weight:700; font-size:13.5pt; color:#fff; }
  .tpl-cartaz .cta-sub{ font-size:8.6pt; color:#d3bd7e; margin-top:1.2mm; }
  .tpl-cartaz .cta-contact{ text-align:right; flex:0 0 auto; }
  .tpl-cartaz .cta-contact .broker{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:10.8pt; color:#fff; }
  .tpl-cartaz .cta-contact .phone{ font-weight:700; font-size:12.5pt; color:#d3bd7e; margin-top:1mm; }
`;

export function renderCartaz(u: UnidadeRevendaTemplateData): string {
  const eyebrow = eyebrowLocalizacao(u);
  const unitTag = unidadeTorre(u);
  const endereco = enderecoCompleto(u);
  const f0 = foto(u, 0);

  const quickfacts = [
    u.areaPrivativa != null ? [area(u.areaPrivativa), "Área privativa"] : null,
    u.dormitorios != null ? [`${u.dormitorios} dorm.`, u.suites ? `${u.suites} suíte(s)` : "Dormitórios"] : null,
    u.vagas != null ? [`${u.vagas} vagas`, "Garagem"] : null,
    u.entregaPrevista ? [escapeHtml(u.entregaPrevista), "Entrega prevista"] : null,
  ].filter((f): f is [string, string] => f !== null);

  const specs = [
    u.areaPrivativa != null ? ["Área privativa", area(u.areaPrivativa)] : null,
    u.andar ? ["Andar", escapeHtml(u.andar)] : null,
    u.torre ? ["Torre", escapeHtml(u.torre)] : null,
    u.elevadores != null ? ["Elevadores", String(u.elevadores)] : null,
  ].filter((s): s is [string, string] => s !== null);

  const filmstrip = [1, 2, 3, 4].map((i) => `<div class="gallery-shot">${imgSlot(foto(u, i))}</div>`).join("");

  return `
    <div class="tpl-conteudo tpl-cartaz">
      <section class="block-hero">
        ${imgSlot(f0)}
        <div class="hero-scrim"></div>
        <div class="hero-content">
          ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
          <h1>${escapeHtml(u.nome)}</h1>
          ${unitTag ? `<div class="unit-line">${escapeHtml(unitTag)}</div>` : ""}
          <div class="gold-rule"></div>
          ${u.tagline ? `<p class="tagline">${escapeHtml(u.tagline)}</p>` : ""}
        </div>
      </section>

      <section class="block-gallery">${filmstrip}</section>

      <div class="lower">
        ${quickfacts.length ? `<section class="block-quickfacts">${quickfacts.map(([v, l]) => `<div class="qf-item"><div class="qf-value">${v}</div><div class="qf-label">${l}</div></div>`).join("")}</section>` : ""}

        ${
          u.descricao || specs.length || u.amenidades.length
            ? `<section class="row-2col">
                <div class="block-description">
                  <h2 class="col-title">Sobre a unidade</h2>
                  ${u.descricao ? `<p>${escapeHtml(u.descricao)}</p>` : ""}
                  ${specs.length ? `<ul class="specs-grid">${specs.map(([k, v]) => `<li>${k} <strong>${v}</strong></li>`).join("")}</ul>` : ""}
                </div>
                <div class="block-amenities">
                  ${u.amenidades.length ? `<h2 class="col-title">Área de lazer</h2><ul class="amenities-list">${u.amenidades.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
                </div>
              </section>`
            : ""
        }

        <section class="row-2col">
          <div class="block-pricing">
            <h2 class="col-title">Valores e condições</h2>
            <div class="price-value">${moeda(u.valor)}</div>
            ${u.condicoesPagamento.length ? `<ul class="price-terms">${u.condicoesPagamento.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="block-location">
            ${endereco || u.localizacaoNota ? `<h2 class="col-title">Localização</h2>` : ""}
            ${endereco ? `<p class="address">${escapeHtml(endereco)}</p>` : ""}
            ${u.localizacaoNota ? `<p>${escapeHtml(u.localizacaoNota)}</p>` : ""}
          </div>
        </section>

        <section class="block-cta">
          <div>
            <h3>Interessado nesta unidade?</h3>
            <div class="cta-sub">Agende sua visita</div>
          </div>
          ${
            corretorPresente(u)
              ? `<div class="cta-contact">
                  ${u.corretorNome ? `<div class="broker">${escapeHtml(u.corretorNome)}</div>` : ""}
                  ${u.corretorTelefone ? `<div class="phone">${escapeHtml(u.corretorTelefone)}</div>` : ""}
                </div>`
              : ""
          }
        </section>
      </div>
    </div>
  `;
}
