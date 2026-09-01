import { escapeHtml } from "../comum";
import {
  area,
  corretorPresente,
  enderecoCompleto,
  eyebrowLocalizacao,
  foto,
  imgSlot,
  legendaSlot,
  moeda,
  unidadeTorre,
} from "./helpers";
import type { UnidadeRevendaTemplateData } from "./tipos";

export const INFOGRAFICO_CSS = `
  .tpl-infografico{ font-family:'DM Sans',Arial,sans-serif; color:#3c3f40; display:flex; flex-direction:column; gap:9px; padding:9mm 10mm 8mm; }
  .tpl-infografico h1,.tpl-infografico h2{ margin:0; font-family:'Red Hat Display',Arial,sans-serif; }
  .tpl-infografico p{ margin:0; }
  .tpl-infografico ul{ margin:0; padding:0; list-style:none; }

  .tpl-infografico .eyebrow{ font-weight:700; font-size:9.5px; letter-spacing:2px; text-transform:uppercase; color:#c2a558; }
  .tpl-infografico .section-head{ display:flex; align-items:baseline; gap:8px; margin-bottom:8px; }
  .tpl-infografico .section-head h2{ font-size:15px; font-weight:700; color:#3c3f40; }
  .tpl-infografico .section-head .rule{ flex:1; height:1px; background:#e4e0d8; }

  .tpl-infografico .block-hero{ display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #3c3f40; padding-bottom:10px; }
  .tpl-infografico .block-hero h1{ font-size:33px; font-weight:800; color:#3c3f40; line-height:1.02; margin-top:4px; }
  .tpl-infografico .unit-line{ font-family:'Red Hat Display',sans-serif; font-weight:500; font-size:13.5px; color:#54585a; margin-top:3px; }
  .tpl-infografico .tagline{ font-size:11.5px; color:#54585a; margin-top:6px; max-width:340px; line-height:1.4; }

  .tpl-infografico .block-photos{ display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
  .tpl-infografico .photo-slot{ height:88px; border-radius:2px; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; gap:4px; }
  .tpl-infografico .photo-slot img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tpl-infografico .photo-slot::before{ content:""; position:absolute; inset:0; background:linear-gradient(155deg, rgba(255,255,255,.10), rgba(0,0,0,.18)), linear-gradient(135deg, #54585a, #3c3f40 65%); }
  .tpl-infografico .photo-slot.alt::before{ background:linear-gradient(155deg, rgba(255,255,255,.14), rgba(0,0,0,.12)), linear-gradient(135deg, #c2a558, #a8894a 70%); }
  .tpl-infografico .photo-slot .cap{ position:relative; z-index:1; font-size:8px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; text-align:center; }

  .tpl-infografico .block-quickfacts{ display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
  .tpl-infografico .kpi{ border:1px solid #e4e0d8; border-radius:2px; background:#f4f2ee; padding:9px 10px; display:flex; flex-direction:column; justify-content:center; }
  .tpl-infografico .kpi .num{ font-family:'Red Hat Display',sans-serif; font-weight:900; font-size:21px; color:#3c3f40; line-height:1; }
  .tpl-infografico .kpi .num small{ font-size:11px; font-weight:700; margin-left:1px; }
  .tpl-infografico .kpi .lbl{ font-size:8.5px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#54585a; margin-top:1px; }

  .tpl-infografico .block-description p{ font-size:12px; line-height:1.58; color:#26282a; }
  .tpl-infografico .block-description p strong{ color:#3c3f40; font-weight:700; }

  .tpl-infografico .twin{ display:grid; grid-template-columns:1fr 1fr; gap:22px; }
  .tpl-infografico .spec-row{ display:flex; align-items:center; gap:9px; padding:5px 0; border-bottom:1px dotted #e4e0d8; }
  .tpl-infografico .spec-row:last-child{ border-bottom:none; }
  .tpl-infografico .spec-row .lbl{ flex:1; font-size:10.5px; color:#54585a; font-weight:500; }
  .tpl-infografico .spec-row .val{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:12.5px; color:#3c3f40; }
  .tpl-infografico .amenity-grid{ display:grid; grid-template-columns:1fr 1fr; gap:7px 10px; }
  .tpl-infografico .amenity{ display:flex; align-items:center; gap:7px; font-size:10.5px; color:#26282a; font-weight:500; }
  .tpl-infografico .amenity::before{ content:""; width:5px; height:5px; border-radius:50%; background:#c2a558; flex:none; }

  .tpl-infografico .block-pricing{ background:#f4f2ee; border:1px solid #e4e0d8; border-radius:2px; padding:11px 14px 12px; }
  .tpl-infografico .value-lbl{ font-size:9px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#54585a; }
  .tpl-infografico .value{ font-family:'Red Hat Display',sans-serif; font-weight:900; font-size:24px; color:#3c3f40; margin-top:2px; }
  .tpl-infografico .price-notes{ display:flex; flex-direction:column; gap:6px; margin-top:10px; }
  .tpl-infografico .price-notes li{ font-size:9.5px; color:#26282a; line-height:1.4; padding-left:12px; position:relative; }
  .tpl-infografico .price-notes li::before{ content:"—"; position:absolute; left:0; color:#c2a558; font-weight:700; }

  .tpl-infografico .block-location{ display:flex; align-items:center; gap:12px; border-top:1px solid #e4e0d8; border-bottom:1px solid #e4e0d8; padding:9px 0; }
  .tpl-infografico .block-location .addr{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:12px; color:#3c3f40; }
  .tpl-infografico .block-location .desc{ font-size:10px; color:#54585a; margin-top:2px; }

  .tpl-infografico .block-cta{ margin-top:auto; background:#3c3f40; border-radius:2px; padding:13px 16px; display:flex; justify-content:space-between; align-items:center; color:#fff; }
  .tpl-infografico .block-cta h2{ font-size:17px; font-weight:800; color:#fff; }
  .tpl-infografico .block-cta .sub{ font-size:10.5px; color:#d8d6d2; margin-top:3px; }
  .tpl-infografico .broker{ text-align:right; }
  .tpl-infografico .broker .name{ font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:13px; color:#d3bd7e; }
  .tpl-infografico .broker .phone{ margin-top:5px; font-family:'Red Hat Display',sans-serif; font-weight:700; font-size:14px; color:#fff; }
  .tpl-infografico .footnote{ font-size:7.5px; color:#9a9793; text-align:center; }
`;

export function renderInfografico(u: UnidadeRevendaTemplateData): string {
  const eyebrow = eyebrowLocalizacao(u);
  const unitTag = unidadeTorre(u);
  const endereco = enderecoCompleto(u);

  const quickfacts = [
    u.areaPrivativa != null ? { num: area(u.areaPrivativa), lbl: "Área privativa" } : null,
    u.dormitorios != null ? { num: `${u.dormitorios} dorm.`, lbl: u.suites ? `${u.suites} suíte(s)` : "Dormitórios" } : null,
    u.vagas != null ? { num: `${u.vagas} vagas`, lbl: "Garagem" } : null,
    u.diferencial ? { num: escapeHtml(u.diferencial), lbl: "Diferencial" } : null,
  ].filter((k): k is { num: string; lbl: string } => k !== null);

  const fichaRows = [
    u.areaPrivativa != null ? ["Área privativa", area(u.areaPrivativa)] : null,
    u.andar ? ["Andar", escapeHtml(u.andar)] : null,
    u.torre ? ["Torre", escapeHtml(u.torre)] : null,
    u.elevadores != null ? ["Elevadores", String(u.elevadores)] : null,
    u.entregaPrevista ? ["Entrega prevista", escapeHtml(u.entregaPrevista)] : null,
  ].filter((r): r is [string, string] => r !== null);

  const fotosHtml = [0, 1, 2, 3]
    .map((i) => {
      const f = foto(u, i);
      return `<div class="photo-slot${!f && i % 2 === 1 ? " alt" : ""}">${imgSlot(f)}${legendaSlot(f, "cap")}</div>`;
    })
    .join("");

  return `
    <div class="tpl-conteudo tpl-infografico">
      <section class="block-hero">
        <div class="identity">
          ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
          <h1>${escapeHtml(u.nome)}</h1>
          ${unitTag ? `<p class="unit-line">${escapeHtml(unitTag)}</p>` : ""}
          ${u.tagline ? `<p class="tagline">${escapeHtml(u.tagline)}</p>` : ""}
        </div>
      </section>

      <section class="block-photos">${fotosHtml}</section>

      ${quickfacts.length ? `<section class="block-quickfacts">${quickfacts.map((k) => `<div class="kpi"><div class="num">${k.num}</div><div class="lbl">${k.lbl}</div></div>`).join("")}</section>` : ""}

      ${u.descricao ? `<section class="block-description"><p>${escapeHtml(u.descricao)}</p></section>` : ""}

      ${
        fichaRows.length || u.amenidades.length
          ? `<section class="twin">
              <div>
                ${fichaRows.length ? `<div class="section-head"><h2>Ficha técnica</h2><span class="rule"></span></div>${fichaRows.map(([k, v]) => `<div class="spec-row"><span class="lbl">${k}</span><span class="val">${v}</span></div>`).join("")}` : ""}
              </div>
              <div>
                ${u.amenidades.length ? `<div class="section-head"><h2>Área de lazer</h2><span class="rule"></span></div><div class="amenity-grid">${u.amenidades.map((a) => `<div class="amenity">${escapeHtml(a)}</div>`).join("")}</div>` : ""}
              </div>
            </section>`
          : ""
      }

      <section class="block-pricing">
        <div class="section-head" style="margin-bottom:9px;"><h2>Valores e condições de pagamento</h2><span class="rule"></span></div>
        <p class="value-lbl">Valor da unidade</p>
        <p class="value">${moeda(u.valor)}</p>
        ${u.condicoesPagamento.length ? `<ul class="price-notes">${u.condicoesPagamento.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` : ""}
      </section>

      ${
        endereco || u.localizacaoNota
          ? `<section class="block-location">
              <div>
                ${endereco ? `<p class="addr">${escapeHtml(endereco)}</p>` : ""}
                ${u.localizacaoNota ? `<p class="desc">${escapeHtml(u.localizacaoNota)}</p>` : ""}
              </div>
            </section>`
          : ""
      }

      <section class="block-cta">
        <div>
          <h2>Interessado nesta unidade?</h2>
          <p class="sub">Fale com nossa equipe e agende uma visita.</p>
        </div>
        ${
          corretorPresente(u)
            ? `<div class="broker">
                ${u.corretorNome ? `<p class="name">${escapeHtml(u.corretorNome)}</p>` : ""}
                ${u.corretorTelefone ? `<p class="phone">${escapeHtml(u.corretorTelefone)}</p>` : ""}
              </div>`
            : ""
        }
      </section>

      <p class="footnote">Imagens meramente ilustrativas. Valores e condições sujeitos a alteração e disponibilidade.</p>
    </div>
  `;
}
