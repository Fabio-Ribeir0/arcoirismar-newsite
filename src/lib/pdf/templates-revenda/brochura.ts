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

export const BROCHURA_CSS = `
  .tpl-brochura{ font-family:'DM Sans',Arial,sans-serif; color:#3c3f40; display:flex; }
  .tpl-brochura h1,.tpl-brochura h2,.tpl-brochura h3{ margin:0; font-family:'Red Hat Display',Arial,sans-serif; }
  .tpl-brochura p{ margin:0; }
  .tpl-brochura ul{ margin:0; padding:0; list-style:none; }

  .tpl-brochura .side-column{ width:63mm; flex:0 0 63mm; background:#3c3f40; color:#fff; display:flex; }
  .tpl-brochura .spine{ flex:0 0 8mm; background:#2c2e2f; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .tpl-brochura .spine-text{ writing-mode:vertical-rl; transform:rotate(180deg); white-space:nowrap; font-size:7.5px; letter-spacing:.28em; color:#d3bd7e; text-transform:uppercase; font-weight:600; }
  .tpl-brochura .side-content{ flex:1; padding:9mm 8mm 7mm; display:flex; flex-direction:column; gap:5mm; }
  .tpl-brochura .eyebrow{ margin:0 0 2.5mm; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#d3bd7e; font-weight:700; }
  .tpl-brochura .side-content h1{ font-weight:700; font-size:22px; line-height:1.06; color:#fff; }
  .tpl-brochura .tagline{ margin:2.5mm 0 0; font-size:10px; line-height:1.45; color:#d9d7d3; }
  .tpl-brochura .unit-tag{ margin-top:3.5mm; padding-top:3.5mm; border-top:1px solid rgba(211,189,126,.4); }
  .tpl-brochura .unit-label{ margin:0 0 1mm; font-size:8px; letter-spacing:.18em; text-transform:uppercase; color:#d3bd7e; font-weight:700; }
  .tpl-brochura .unit-tag h2{ font-weight:600; font-size:15px; color:#fff; }
  .tpl-brochura .quick-facts li{ padding:2.6mm 0; border-top:1px solid rgba(255,255,255,.14); display:flex; flex-direction:column; gap:.6mm; }
  .tpl-brochura .quick-facts li:last-child{ border-bottom:1px solid rgba(255,255,255,.14); }
  .tpl-brochura .quick-facts strong{ font-weight:700; font-size:14px; color:#d3bd7e; }
  .tpl-brochura .fact-label{ font-size:8.5px; color:#d9d7d3; }
  .tpl-brochura .block-floorplan h3{ margin:0 0 2mm; font-size:8.5px; letter-spacing:.16em; text-transform:uppercase; color:#d3bd7e; font-weight:700; }
  .tpl-brochura .placeholder-floorplan{ height:28mm; border-radius:2px; overflow:hidden; position:relative; border:1px solid rgba(211,189,126,.35); background:repeating-linear-gradient(45deg, rgba(255,255,255,.035) 0 2px, transparent 2px 10px), linear-gradient(155deg, #4a4e4f 0%, #34373a 100%); }
  .tpl-brochura .placeholder-floorplan img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tpl-brochura .block-contact{ margin-top:auto; padding-top:4mm; border-top:1px solid rgba(211,189,126,.4); }
  .tpl-brochura .block-contact h3{ margin:0 0 1.5mm; font-weight:700; font-size:13px; color:#d3bd7e; letter-spacing:.08em; text-transform:uppercase; }
  .tpl-brochura .block-contact p{ margin:0; font-size:9.5px; line-height:1.5; color:#fff; }

  .tpl-brochura .main-column{ flex:1; background:#f4f2ee; padding:9mm 9mm 7mm; display:flex; flex-direction:column; gap:4mm; }
  .tpl-brochura .main-column h2{ margin:0 0 2mm; font-weight:700; font-size:13.5px; color:#3c3f40; }
  .tpl-brochura .section-label{ display:block; font-size:8px; letter-spacing:.18em; text-transform:uppercase; color:#c2a558; font-weight:700; margin-bottom:1mm; }
  .tpl-brochura .placeholder-hero{ height:44mm; border-radius:2px; overflow:hidden; position:relative; background:linear-gradient(128deg, #cdbb8e 0%, #c2a558 46%, #a98a3f 100%); color:#fff; }
  .tpl-brochura .placeholder-hero img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tpl-brochura .block-description p{ margin:0; font-size:10.5px; line-height:1.5; color:#54585a; }
  .tpl-brochura .spec-grid{ display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid #e4e0d8; border-left:1px solid #e4e0d8; }
  .tpl-brochura .spec-grid li{ padding:2.4mm 3mm; border-right:1px solid #e4e0d8; border-bottom:1px solid #e4e0d8; display:flex; flex-direction:column; gap:.6mm; }
  .tpl-brochura .spec-grid strong{ font-weight:700; font-size:13px; color:#3c3f40; }
  .tpl-brochura .spec-grid span{ font-size:8px; letter-spacing:.04em; text-transform:uppercase; color:#54585a; }
  .tpl-brochura .amenities-list{ display:grid; grid-template-columns:1fr 1fr; gap:.5mm 6mm; }
  .tpl-brochura .amenities-list li{ font-size:10.5px; color:#54585a; padding:1.4mm 0 1.4mm 4mm; border-bottom:1px solid #e4e0d8; position:relative; }
  .tpl-brochura .amenities-list li::before{ content:""; position:absolute; left:0; top:50%; transform:translateY(-50%); width:5px; height:5px; background:#c2a558; border-radius:50%; }
  .tpl-brochura .pricing-block{ display:flex; gap:7mm; align-items:flex-start; background:#fff; border:1px solid #e4e0d8; border-left:3px solid #c2a558; padding:3.5mm 6mm; }
  .tpl-brochura .price-label{ display:block; font-size:8px; letter-spacing:.14em; text-transform:uppercase; color:#54585a; margin-bottom:1mm; }
  .tpl-brochura .price-figure strong{ font-weight:900; font-size:19px; color:#3c3f40; white-space:nowrap; }
  .tpl-brochura .pricing-block ul{ flex:1; display:flex; flex-direction:column; gap:1.2mm; border-left:1px solid #e4e0d8; padding-left:6mm; }
  .tpl-brochura .pricing-block li{ font-size:9.5px; line-height:1.35; color:#54585a; }
  .tpl-brochura .block-location p{ margin:0 0 1mm; font-size:10px; line-height:1.45; color:#54585a; }
`;

export function renderBrochura(u: UnidadeRevendaTemplateData): string {
  const eyebrow = eyebrowLocalizacao(u);
  const unitTag = unidadeTorre(u);
  const endereco = enderecoCompleto(u);
  const f0 = foto(u, 0);
  const f1 = foto(u, 1);

  const spine = [u.nome, unitTag, eyebrow].filter(Boolean).join(" · ");

  const facts = [
    u.areaPrivativa != null ? [area(u.areaPrivativa), "Área privativa"] : null,
    u.dormitorios != null ? [`${u.dormitorios} dorm.`, u.suites ? `${u.suites} suíte(s)` : "Dormitórios"] : null,
    u.vagas != null ? [`${u.vagas} vagas`, "Garagem"] : null,
    u.diferencial ? [escapeHtml(u.diferencial), "Diferencial"] : null,
  ].filter((f): f is [string, string] => f !== null);

  const specGrid = [
    u.areaPrivativa != null ? [area(u.areaPrivativa), "Área privativa"] : null,
    u.dormitorios != null ? [String(u.dormitorios), "Dormitórios"] : null,
    u.vagas != null ? [String(u.vagas), "Vagas de garagem"] : null,
    u.andar ? [escapeHtml(u.andar), "Andar"] : null,
    u.torre ? [escapeHtml(u.torre), "Torre"] : null,
    u.elevadores != null ? [String(u.elevadores), "Elevadores"] : null,
    u.entregaPrevista ? [escapeHtml(u.entregaPrevista), "Entrega prevista"] : null,
  ].filter((s): s is [string, string] => s !== null);

  return `
    <div class="tpl-conteudo tpl-brochura">
      <aside class="side-column">
        <div class="spine">${spine ? `<div class="spine-text">${escapeHtml(spine.toUpperCase())}</div>` : ""}</div>
        <div class="side-content">
          <section>
            ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
            <h1>${escapeHtml(u.nome)}</h1>
            ${u.tagline ? `<p class="tagline">${escapeHtml(u.tagline)}</p>` : ""}
            ${unitTag ? `<div class="unit-tag"><p class="unit-label">Unidade à venda</p><h2>${escapeHtml(unitTag)}</h2></div>` : ""}
          </section>

          ${facts.length ? `<section><ul class="quick-facts">${facts.map(([v, l]) => `<li><strong>${v}</strong><span class="fact-label">${l}</span></li>`).join("")}</ul></section>` : ""}

          <section class="block-floorplan">
            <h3>Planta da unidade</h3>
            <div class="placeholder-floorplan">${imgSlot(f1)}</div>
          </section>

          ${
            u.informacoes
              ? `<section class="block-contact">
                  <h3>Informações</h3>
                  <p>${informacoesHtml(u.informacoes)}</p>
                </section>`
              : ""
          }
        </div>
      </aside>

      <main class="main-column">
        <section><div class="placeholder-hero">${imgSlot(f0)}</div></section>

        ${
          u.descricao
            ? `<section class="block-description"><span class="section-label">Sobre a unidade</span><h2>${escapeHtml(u.nome)}</h2><p>${escapeHtml(u.descricao)}</p></section>`
            : ""
        }

        ${
          specGrid.length
            ? `<section><span class="section-label">Ficha técnica</span><h2>Especificações da unidade</h2><ul class="spec-grid">${specGrid.map(([v, l]) => `<li><strong>${v}</strong><span>${l}</span></li>`).join("")}</ul></section>`
            : ""
        }

        ${
          u.amenidades.length
            ? `<section><span class="section-label">Lazer</span><h2>Área de lazer</h2><ul class="amenities-list">${u.amenidades.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul></section>`
            : ""
        }

        <section>
          <span class="section-label">Valores e condições</span>
          <h2>Condições de pagamento</h2>
          <div class="pricing-block">
            <div class="price-figure"><span class="price-label">Valor da unidade</span><strong>${moeda(u.valor)}</strong></div>
            ${u.condicoesPagamento.length ? `<ul>${u.condicoesPagamento.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` : ""}
          </div>
        </section>

        ${
          endereco || u.localizacaoNota
            ? `<section class="block-location">
                <span class="section-label">Localização</span>
                <h2>${escapeHtml([u.bairro, u.cidade].filter(Boolean).join(", ") || "Localização")}</h2>
                ${endereco ? `<p><strong>${escapeHtml(endereco)}</strong></p>` : ""}
                ${u.localizacaoNota ? `<p>${escapeHtml(u.localizacaoNota)}</p>` : ""}
              </section>`
            : ""
        }
      </main>
    </div>
  `;
}
