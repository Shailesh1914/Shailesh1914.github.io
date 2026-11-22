// Criterion 4 from SPEC.md: no horizontal scroll at a 375px viewport.
import { execSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { ROOT, createReporter } from "./lib.mjs";

const WIDTH = 375;
const label = `Criterion 4: no horizontal scroll at ${WIDTH}px (scrollWidth <= ${WIDTH})`;
const r = createReporter("Mobile layout check (local index.html)");

let chrome = process.env.CHROME_PATH;
if (!chrome) {
  try { chrome = execSync("which chromium", { encoding: "utf8" }).trim(); } catch { /* not found */ }
}
if (!chrome) {
  r.fail(label, "No browser found: set CHROME_PATH or install chromium");
  r.finish();
} else {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(pathToFileURL(path.join(ROOT, "index.html")).href, { waitUntil: "load" });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    sw > WIDTH ? r.fail(label, `scrollWidth is ${sw}px`) : r.pass(label, `scrollWidth is ${sw}px`);
  } catch (e) {
    r.fail(label, `Could not run the browser (${chrome}): ${e.message.split("\n")[0]}`);
  } finally {
    await browser?.close();
  }
  r.finish();
}
