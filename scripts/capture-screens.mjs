import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "screenshots");
mkdirSync(out, { recursive: true });

const url = process.env.DEMO_URL || "https://shade-pass.vercel.app";

const testOut = execSync("npm test", { cwd: root, encoding: "utf8" });
writeFileSync(join(out, "ci-test-output.txt"), testOut);

const browser = await chromium.launch();
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await desktop.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
await desktop.waitForTimeout(1500);
await desktop.screenshot({
  path: join(out, "desktop-live.png"),
  fullPage: true,
});

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await mobile.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
await mobile.waitForTimeout(1500);
await mobile.screenshot({
  path: join(out, "mobile-live.png"),
  fullPage: true,
});

const testPage = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const escaped = testOut
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");
await testPage.setContent(`<!doctype html><html><body style="margin:0;background:#0b1020;color:#d7ffe9;font:14px/1.45 ui-monospace,Consolas,monospace;padding:24px;">
<h1 style="font:600 20px Syne,sans-serif;color:#7ee0c8;margin:0 0 12px;">ShadePass — npm test</h1>
<pre style="white-space:pre-wrap;margin:0;">${escaped}</pre>
</body></html>`);
await testPage.screenshot({
  path: join(out, "test-results.png"),
  fullPage: true,
});

await browser.close();
console.log("Wrote desktop-live.png, mobile-live.png, test-results.png");
