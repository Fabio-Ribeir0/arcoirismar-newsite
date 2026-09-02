import { escapeHtml } from "../comum";
import {
  area,
  carimboReservado,
  enderecoCompleto,
  eyebrowLocalizacao,
  foto,
  imgSlot,
  informacoesHtml,
  moeda,
  unidadeTorre,
} from "./helpers";
import type { UnidadeRevendaTemplateData } from "./tipos";

export const DUPLA_CSS = `
  .tpl-dupla{ font-family:'DM Sans',Arial,sans-serif; color:#3c3f40; display:flex; gap:5mm; }
  .tpl-dupla h1,.tpl-dupla h2{ margin:0; font-family:'Red Hat Display',Arial,sans-serif; }
  .tpl-dupla p{ margin:0; }
  .tpl-dupla ul{ margin:0; padding:0; list-style:none; }
  .tpl-dupla .eyebrow{ font-weight:700; font-size:7.6pt; letter-spacing:.16em; text-transform:uppercase; color:#c2a558; }
  .tpl-dupla .section-title{ font-weight:700; font-size:12.5pt; color:#3c3f40; }
  .tpl-dupla .section-title small{ display:block; font-weight:700; font-size:7.2pt; letter-spacing:.16em; color:#c2a558; text-transform:uppercase; margin-bottom:1.4mm; font-family:'DM Sans',sans-serif; }

  .tpl-dupla .content-col{ flex:1 1 auto; display:flex; flex-direction:column; gap:3.3mm; min-width:0; }

  .tpl-dupla .block-hero{ position:relative; display:flex; width:100%; height:81mm; overflow:hidden; }
  .tpl-dupla .hero-photo{ flex:1 1 50%; position:relative; overflow:hidden; }
  .tpl-dupla .hero-photo img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tpl-dupla .hero-photo.fachada{ background:linear-gradient(150deg,#46494a 0%,#3c3f40 45%,#2c2e2f 100%); }
  .tpl-dupla .hero-photo.sala{ background:linear-gradient(150deg,#d3bd7e 0%,#c2a558 55%,#a4884a 100%); }
  .tpl-dupla .hero-banner{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#3c3f40; color:#fff; text-align:center; padding:7mm 13mm; white-space:nowrap; z-index:2; }
  .tpl-dupla .hero-banner .eyebrow{ color:#d3bd7e; }
  .tpl-dupla .hero-banner h1{ font-weight:900; font-size:23pt; line-height:1.05; margin:1.6mm 0; }
  .tpl-dupla .hero-banner .unit-line{ font-weight:700; font-size:9.5pt; letter-spacing:.06em; color:#c2a558; text-transform:uppercase; }

  .tpl-dupla .block-quickfacts{ display:flex; background:#f4f2ee; border:1px solid #e4e0d8; }
  .tpl-dupla .quickfact{ flex:1; padding:3.6mm 4mm; border-right:1px solid #e4e0d8; }
  .tpl-dupla .quickfact:last-child{ border-right:none; }
  .tpl-dupla .qf-label{ font-weight:700; font-size:6.8pt; letter-spacing:.12em; text-transform:uppercase; color:#54585a; display:block; margin-bottom:1mm; }
  .tpl-dupla .qf-value{ font-weight:700; font-size:12pt; color:#3c3f40; }

  .tpl-dupla .block-description p{ font-size:9.4pt; line-height:1.42; color:#54585a; }

  .tpl-dupla .two-col-row{ display:flex; gap:5mm; }
  .tpl-dupla .two-col-row > section{ flex:1; min-width:0; }
  .tpl-dupla .block-fichatecnica ul{ margin-top:2mm; display:grid; grid-template-columns:1fr 1fr; gap:1.5mm 4mm; }
  .tpl-dupla .block-fichatecnica li{ font-size:8.6pt; line-height:1.3; color:#54585a; border-bottom:1px solid #e4e0d8; padding-bottom:1.1mm; }
  .tpl-dupla .block-fichatecnica li strong{ display:block; font-weight:700; font-size:9.6pt; color:#3c3f40; }
  .tpl-dupla .block-amenities ul{ margin-top:2mm; display:grid; grid-template-columns:1fr 1fr; gap:1.3mm 3mm; }
  .tpl-dupla .block-amenities li{ font-size:8.6pt; color:#54585a; padding-left:3.6mm; position:relative; line-height:1.3; }
  .tpl-dupla .block-amenities li::before{ content:""; position:absolute; left:0; top:.55em; width:1.8mm; height:1.8mm; background:#c2a558; border-radius:50%; }

  .tpl-dupla .block-valores{ position:relative; overflow:hidden; background:#f4f2ee; border-left:3px solid #c2a558; padding:3.4mm 5mm; display:flex; gap:6mm; align-items:center; }
  .tpl-dupla .valores-price{ flex:0 0 auto; border-right:1px solid #e4e0d8; padding-right:6mm; }
  .tpl-dupla .vp-label{ font-weight:700; font-size:7pt; letter-spacing:.14em; text-transform:uppercase; color:#54585a; display:block; margin-bottom:1mm; }
  .tpl-dupla .vp-value{ font-weight:900; font-size:19pt; color:#3c3f40; white-space:nowrap; }
  .tpl-dupla .block-valores ul{ flex:1; display:flex; flex-direction:column; gap:1.6mm; }
  .tpl-dupla .block-valores li{ font-size:8.6pt; line-height:1.4; color:#54585a; padding-left:3.6mm; position:relative; }
  .tpl-dupla .block-valores li::before{ content:"—"; position:absolute; left:0; color:#c2a558; font-weight:700; }

  .tpl-dupla .block-localizacao{ display:flex; justify-content:space-between; align-items:flex-end; gap:5mm; border-top:1px solid #e4e0d8; border-bottom:1px solid #e4e0d8; padding:2.8mm 0; }
  .tpl-dupla .loc-address{ font-weight:700; font-size:10.5pt; color:#3c3f40; }
  .tpl-dupla .loc-note{ font-size:8.6pt; color:#54585a; line-height:1.4; max-width:78mm; text-align:right; }

  .tpl-dupla .block-cta{ margin-top:auto; background:#3c3f40; color:#fff; padding:4mm 6mm; }
  .tpl-dupla .block-cta h2{ font-weight:700; font-size:13.5pt; margin-bottom:2mm; color:#d3bd7e; letter-spacing:.06em; text-transform:uppercase; }
  .tpl-dupla .cta-broker{ font-size:8.8pt; color:#fff; line-height:1.5; }

  .tpl-dupla .block-gallery{ flex:0 0 33mm; width:33mm; display:flex; flex-direction:column; gap:3.2mm; }
  .tpl-dupla .photo-tile{ flex:1; position:relative; overflow:hidden; background:linear-gradient(160deg,#d3bd7e,#c2a558 65%,#9c7f41); }
  .tpl-dupla .photo-tile img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
`;

export function renderDupla(u: UnidadeRevendaTemplateData): string {
  const eyebrow = eyebrowLocalizacao(u);
  const unitTag = unidadeTorre(u);
  const endereco = enderecoCompleto(u);

  const quickfacts = [
    u.dormitorios != null ? ["Tipo", `${u.dormitorios} dorm.`] : null,
    u.areaPrivativa != null ? ["Área privativa", area(u.areaPrivativa)] : null,
    u.vagas != null ? ["Vagas", `${u.vagas} vagas`] : null,
    u.entregaPrevista ? ["Entrega", escapeHtml(u.entregaPrevista)] : null,
  ].filter((f): f is [string, string] => f !== null);

  const ficha = [
    u.areaPrivativa != null ? [area(u.areaPrivativa), "Área privativa"] : null,
    u.andar ? [escapeHtml(u.andar), "Andar"] : null,
    u.elevadores != null ? [String(u.elevadores), "Elevadores"] : null,
    u.entregaPrevista ? [escapeHtml(u.entregaPrevista), "Entrega prevista"] : null,
    u.dormitorios != null ? [`${u.dormitorios} dormitórios`, u.suites ? `Sendo ${u.suites} suíte(s)` : "Dormitórios"] : null,
    u.vagas != null ? [`${u.vagas} vagas`, "Garagem"] : null,
  ].filter((f): f is [string, string] => f !== null);

  const gallery = [2, 3, 4, 5, 6].map((i) => `<div class="photo-tile">${imgSlot(foto(u, i))}</div>`).join("");

  return `
    <div class="tpl-conteudo tpl-dupla">
      <div class="content-col">
        <section class="block-hero">
          <div class="hero-photo fachada">${imgSlot(foto(u, 0))}</div>
          <div class="hero-photo sala">${imgSlot(foto(u, 1))}</div>
          <div class="hero-banner">
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h1>${escapeHtml(u.nome)}</h1>
            ${unitTag ? `<span class="unit-line">${escapeHtml(unitTag)}</span>` : ""}
          </div>
        </section>

        ${quickfacts.length ? `<section class="block-quickfacts">${quickfacts.map(([l, v]) => `<div class="quickfact"><span class="qf-label">${l}</span><span class="qf-value">${v}</span></div>`).join("")}</section>` : ""}

        ${u.descricao ? `<section class="block-description"><p>${escapeHtml(u.descricao)}</p></section>` : ""}

        ${
          ficha.length || u.amenidades.length
            ? `<div class="two-col-row">
                <section class="block-fichatecnica">
                  ${ficha.length ? `<h2 class="section-title"><small>Especificações</small>Ficha técnica</h2><ul>${ficha.map(([v, l]) => `<li><strong>${v}</strong>${l}</li>`).join("")}</ul>` : ""}
                </section>
                <section class="block-amenities">
                  ${u.amenidades.length ? `<h2 class="section-title"><small>Área de lazer</small>Estrutura de bem-estar</h2><ul>${u.amenidades.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
                </section>
              </div>`
            : ""
        }

        <section class="block-valores">
          <div class="valores-price">
            <span class="vp-label">Valor da unidade</span>
            <span class="vp-value">${moeda(u.valor)}</span>
          </div>
          ${u.condicoesPagamento.length ? `<ul>${u.condicoesPagamento.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` : ""}
          ${carimboReservado(u)}
        </section>

        ${
          endereco || u.localizacaoNota
            ? `<section class="block-localizacao">
                <div>
                  <h2 class="section-title"><small>Localização</small></h2>
                  ${endereco ? `<p class="loc-address">${escapeHtml(endereco)}</p>` : ""}
                </div>
                ${u.localizacaoNota ? `<p class="loc-note">${escapeHtml(u.localizacaoNota)}</p>` : ""}
              </section>`
            : ""
        }

        ${
          u.informacoes
            ? `<section class="block-cta">
                <div>
                  <h2>Informações</h2>
                  <p class="cta-broker">${informacoesHtml(u.informacoes)}</p>
                </div>
              </section>`
            : ""
        }
      </div>

      <aside class="block-gallery">${gallery}</aside>
    </div>
  `;
}
