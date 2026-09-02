import { escapeHtml } from "../comum";
import {
  area,
  enderecoCompleto,
  eyebrowLocalizacao,
  foto,
  imgSlot,
  informacoesHtml,
  moeda,
  unidadeTorre,
} from "./helpers";
import type { UnidadeRevendaTemplateData } from "./tipos";

export const EDITORIAL_CSS = `
  .tpl-editorial{ font-family:'DM Sans',Arial,sans-serif; color:#3c3f40; display:flex; flex-direction:column; }
  .tpl-editorial h1,.tpl-editorial h2,.tpl-editorial h3{ font-family:'Red Hat Display',Arial,sans-serif; margin:0; }
  .tpl-editorial p{ margin:0; }
  .tpl-editorial ul{ margin:0; padding:0; list-style:none; }

  .tpl-editorial .eyebrow{ font-weight:700; font-size:8.6px; letter-spacing:.22em; text-transform:uppercase; color:#c2a558; }

  .tpl-editorial .block-hero{ position:relative; padding:6mm 12mm 0 12mm; }
  .tpl-editorial .hero-masthead{ display:flex; justify-content:space-between; align-items:flex-end; gap:8mm; padding-bottom:4mm; }
  .tpl-editorial .hero-masthead-text h1{ font-size:26px; font-weight:800; line-height:1.03; color:#3c3f40; margin-top:3px; }
  .tpl-editorial .unit-tag{ font-weight:600; font-size:11px; letter-spacing:.03em; color:#54585a; margin-top:5px; display:block; }
  .tpl-editorial .hero-tagline{ font-style:italic; font-size:12px; line-height:1.35; color:#54585a; max-width:52mm; text-align:right; padding-bottom:2px; border-right:2px solid #c2a558; padding-right:9px; }
  .tpl-editorial .hero-photo-wrap{ position:relative; width:calc(100% + 24mm); margin-left:-12mm; height:65mm; overflow:hidden; }
  .tpl-editorial .hero-photo-wrap img{ width:100%; height:100%; object-fit:cover; display:block; }
  .tpl-editorial .photo-placeholder{ width:100%; height:100%; background:linear-gradient(135deg, rgba(60,63,64,.08), rgba(194,165,88,.16)), linear-gradient(155deg, #4a4d4e 0%, #6b6560 42%, #b6996a 78%, #c2a558 100%); position:relative; display:flex; align-items:center; justify-content:center; }
  .tpl-editorial .photo-label{ font-weight:600; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:#fff; opacity:.85; }
  .tpl-editorial .ghost-number{ position:absolute; left:12mm; bottom:5mm; font-family:'Red Hat Display',sans-serif; font-weight:900; font-size:88px; line-height:1; color:transparent; -webkit-text-stroke:1.3px rgba(255,255,255,.85); z-index:2; }

  .tpl-editorial .block-specs{ padding:5mm 12mm; }
  .tpl-editorial .specs-strip{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; }
  .tpl-editorial .spec-item{ display:flex; flex-direction:column; gap:3px; padding:0 14px; text-align:center; }
  .tpl-editorial .spec-item:first-child{ padding-left:0; }
  .tpl-editorial .spec-item:last-child{ padding-right:0; }
  .tpl-editorial .spec-value{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:16.5px; color:#3c3f40; white-space:nowrap; }
  .tpl-editorial .spec-label{ font-size:8px; font-weight:600; letter-spacing:.13em; text-transform:uppercase; color:#54585a; white-space:nowrap; }
  .tpl-editorial .spec-divider{ width:1px; align-self:stretch; background:linear-gradient(#d3bd7e,#c2a558,#d3bd7e); opacity:.55; }

  .tpl-editorial .block-description{ padding:0 12mm 5mm 12mm; border-bottom:1px solid #e4e0d8; }
  .tpl-editorial .description-inner{ display:flex; gap:8mm; align-items:flex-start; }
  .tpl-editorial .description-drop{ font-family:'Red Hat Display',sans-serif; font-weight:800; font-size:42px; line-height:.78; color:#c2a558; padding-top:2px; }
  .tpl-editorial .description-text{ font-size:10.5px; line-height:1.55; color:#54585a; }
  .tpl-editorial .description-text strong{ color:#3c3f40; font-weight:700; }

  .tpl-editorial .block-details{ padding:5mm 12mm; display:grid; grid-template-columns:56mm 1fr; gap:10mm; }
  .tpl-editorial .details-heading{ font-size:9px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#c2a558; margin-bottom:5px; display:block; }
  .tpl-editorial .ficha-row{ display:flex; justify-content:space-between; align-items:baseline; padding:3.6px 0; border-bottom:1px solid #e4e0d8; font-size:10.3px; }
  .tpl-editorial .ficha-row:last-child{ border-bottom:none; }
  .tpl-editorial .ficha-row span:first-child{ color:#54585a; }
  .tpl-editorial .ficha-row span:last-child{ font-family:'Red Hat Display',sans-serif; font-weight:700; color:#3c3f40; }
  .tpl-editorial .lazer-list{ display:grid; grid-template-columns:1fr 1fr; gap:0 8mm; }
  .tpl-editorial .lazer-list li{ font-size:10.3px; color:#3c3f40; padding:3.6px 0; border-bottom:1px solid #e4e0d8; display:flex; align-items:baseline; gap:7px; }
  .tpl-editorial .lazer-list li::before{ content:""; width:5px; height:5px; border-radius:50%; background:#c2a558; flex:none; transform:translateY(-1px); }

  .tpl-editorial .block-valores{ margin:0 12mm; padding:5mm 0; border-top:1px solid #e4e0d8; border-bottom:1px solid #e4e0d8; display:grid; grid-template-columns:56mm 1fr; gap:10mm; align-items:center; }
  .tpl-editorial .valores-amount{ font-family:'Red Hat Display',sans-serif; font-weight:900; font-size:25px; color:#3c3f40; line-height:1; }
  .tpl-editorial .valores-conditions li{ font-size:10.3px; color:#54585a; padding-left:13px; position:relative; line-height:1.4; }
  .tpl-editorial .valores-conditions li::before{ content:"—"; position:absolute; left:0; color:#c2a558; font-weight:700; }

  .tpl-editorial .block-location{ padding:4mm 12mm; display:flex; justify-content:space-between; align-items:center; gap:10mm; }
  .tpl-editorial .location-address{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:13.5px; color:#3c3f40; }
  .tpl-editorial .location-note{ font-size:10px; color:#54585a; margin-top:4px; max-width:110mm; line-height:1.5; }

  .tpl-editorial .block-cta{ background:#3c3f40; color:#fff; padding:7mm 12mm; margin-top:auto; display:flex; justify-content:space-between; align-items:center; gap:8mm; position:relative; }
  .tpl-editorial .block-cta::before{ content:""; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#c2a558,#d3bd7e,#c2a558); }
  .tpl-editorial .cta-heading h2{ font-size:16.5px; font-weight:700; color:#d3bd7e; letter-spacing:.08em; text-transform:uppercase; }
  .tpl-editorial .cta-heading p{ font-size:10px; line-height:1.5; color:#fff; margin-top:5px; }
`;

export function renderEditorial(u: UnidadeRevendaTemplateData): string {
  const eyebrow = eyebrowLocalizacao(u);
  const unitTag = unidadeTorre(u);
  const f0 = foto(u, 0);

  const specs = [
    u.areaPrivativa != null ? { valor: area(u.areaPrivativa), label: "Área privativa" } : null,
    u.dormitorios != null
      ? { valor: `${u.dormitorios} dorm.`, label: u.suites ? `${u.suites} suíte(s)` : "Dormitórios" }
      : null,
    u.vagas != null ? { valor: `${u.vagas} vagas`, label: "Garagem" } : null,
    u.diferencial ? { valor: escapeHtml(u.diferencial), label: "Diferencial" } : null,
    u.entregaPrevista ? { valor: escapeHtml(u.entregaPrevista), label: "Entrega prevista" } : null,
  ].filter((s): s is { valor: string; label: string } => s !== null);

  const fichaRows = [
    u.areaPrivativa != null ? ["Área privativa", area(u.areaPrivativa)] : null,
    u.andar ? ["Andar", escapeHtml(u.andar)] : null,
    u.torre ? ["Torre", escapeHtml(u.torre)] : null,
    u.elevadores != null ? ["Elevadores", String(u.elevadores)] : null,
    u.entregaPrevista ? ["Entrega prevista", escapeHtml(u.entregaPrevista)] : null,
  ].filter((r): r is [string, string] => r !== null);

  const condicoes = u.condicoesPagamento;
  const endereco = enderecoCompleto(u);

  return `
    <div class="tpl-conteudo tpl-editorial">
      <section class="block-hero">
        <div class="hero-masthead">
          <div class="hero-masthead-text">
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h1>${escapeHtml(u.nome)}</h1>
            ${unitTag ? `<span class="unit-tag">${escapeHtml(unitTag)}</span>` : ""}
          </div>
          ${u.tagline ? `<p class="hero-tagline">&ldquo;${escapeHtml(u.tagline)}&rdquo;</p>` : ""}
        </div>
        <div class="hero-photo-wrap">
          ${
            f0
              ? imgSlot(f0)
              : `<div class="photo-placeholder"><span class="photo-label">Foto ilustrativa</span></div>`
          }
          ${u.numeroUnidade ? `<span class="ghost-number">${escapeHtml(u.numeroUnidade)}</span>` : ""}
        </div>
      </section>

      ${
        specs.length
          ? `<section class="block-specs"><div class="specs-strip">${specs
              .map(
                (s, i) =>
                  (i > 0 ? `<div class="spec-divider"></div>` : "") +
                  `<div class="spec-item"><span class="spec-value">${s.valor}</span><span class="spec-label">${s.label}</span></div>`
              )
              .join("")}</div></section>`
          : ""
      }

      ${
        u.descricao
          ? `<section class="block-description"><div class="description-inner"><span class="description-drop">&ldquo;</span><p class="description-text">${escapeHtml(u.descricao)}</p></div></section>`
          : ""
      }

      ${
        fichaRows.length || u.amenidades.length
          ? `<section class="block-details">
              <div>
                ${fichaRows.length ? `<span class="details-heading">Ficha técnica</span><div class="ficha-list">${fichaRows.map(([k, v]) => `<div class="ficha-row"><span>${k}</span><span>${v}</span></div>`).join("")}</div>` : ""}
              </div>
              <div>
                ${u.amenidades.length ? `<span class="details-heading">Área de lazer</span><ul class="lazer-list">${u.amenidades.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
              </div>
            </section>`
          : ""
      }

      <section class="block-valores">
        <div class="valores-price">
          <span class="details-heading">Valor</span>
          <p class="valores-amount">${moeda(u.valor)}</p>
        </div>
        ${
          condicoes.length
            ? `<ul class="valores-conditions">${condicoes.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
            : ""
        }
      </section>

      ${
        endereco || u.localizacaoNota
          ? `<section class="block-location">
              <div>
                <span class="details-heading">Localização</span>
                ${endereco ? `<p class="location-address">${escapeHtml(endereco)}</p>` : ""}
                ${u.localizacaoNota ? `<p class="location-note">${escapeHtml(u.localizacaoNota)}</p>` : ""}
              </div>
            </section>`
          : ""
      }

      ${
        u.informacoes
          ? `<section class="block-cta">
              <div class="cta-heading">
                <h2>Informações</h2>
                <p>${informacoesHtml(u.informacoes)}</p>
              </div>
            </section>`
          : ""
      }
    </div>
  `;
}
