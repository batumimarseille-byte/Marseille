import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const url = process.env.PW_URL || "http://127.0.0.1:5173/";
const outputPath = process.env.PW_SCREENSHOT || "tmp/playwright/mobile.png";

await mkdir("tmp/playwright", { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
});

await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Saved mobile screenshot: ${outputPath}`);
