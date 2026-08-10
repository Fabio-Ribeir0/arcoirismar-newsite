import "server-only";
import fs from "node:fs";
import type { Browser } from "puppeteer-core";

// Locais mais comuns de instalação do Chrome/Edge — usado só em desenvolvimento
// local. Em produção (Vercel) o Chromium vem do pacote @sparticuz/chromium.
const CAMINHOS_CHROME_LOCAIS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

function encontrarChromeLocal(): string {
  const encontrado = CAMINHOS_CHROME_LOCAIS.find((caminho) => fs.existsSync(caminho));
  if (!encontrado) {
    throw new Error(
      "Nenhum Chrome/Edge encontrado neste computador para gerar o PDF em desenvolvimento. Instale o Google Chrome."
    );
  }
  return encontrado;
}

export async function abrirNavegador(): Promise<Browser> {
  const puppeteer = await import("puppeteer-core");

  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return puppeteer.launch({
    executablePath: encontrarChromeLocal(),
    headless: true,
  });
}
