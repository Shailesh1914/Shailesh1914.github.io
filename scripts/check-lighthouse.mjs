// Criteria 2 and 3 from SPEC.md: Lighthouse (mobile preset, uncached load).
// Usage: node scripts/check-lighthouse.mjs <url>
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { ROOT, createReporter } from "./lib.mjs";

const A11Y_MIN = 0.9;
const LCP_MAX_MS = 2000;
const A11Y = `Criterion 2: Lighthouse accessibility >= ${A11Y_MIN} (mobile)`;
const LCP = `Criterion 3: Largest Contentful Paint <= ${LCP_MAX_MS} ms (mobile, uncached)`;

const url = process.argv[2];
const r = createReporter(`Lighthouse checks (${url ?? "no URL"})`);
if (!url) {
  r.fail("Usage", "node scripts/check-lighthouse.mjs <url>");
  r.finish();
  process.exit();
}

let chromePath = process.env.CHROME_PATH;
if (!chromePath) {
  try { chromePath = execSync("which chromium", { encoding: "utf8" }).trim(); } catch { /* not found */ }
}

let chrome;
try {
  chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });
  // Default config = mobile preset (formFactor mobile, simulated throttling).
  // Storage reset is left enabled so the load is uncached.
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["accessibility", "performance"],
  });
  const lhr = result.lhr;

  const dir = path.join(ROOT, "reports");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `lighthouse-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, result.report);
  console.log(`Report written to ${path.relative(ROOT, file)}`);

  if (lhr.runtimeError) {
    r.fail("Lighthouse run", `${lhr.runtimeError.code}: ${lhr.runtimeError.message}`);
  }
  const score = lhr.categories.accessibility?.score;
  const lcp = lhr.audits["largest-contentful-paint"]?.numericValue;

  if (typeof score !== "number") r.fail(A11Y, "no accessibility score in report");
  else score >= A11Y_MIN ? r.pass(A11Y, `measured ${score.toFixed(2)}`) : r.fail(A11Y, `measured ${score.toFixed(2)}`);

  if (typeof lcp !== "number") r.fail(LCP, "no LCP value in report");
  else lcp <= LCP_MAX_MS ? r.pass(LCP, `measured ${Math.round(lcp)} ms`) : r.fail(LCP, `measured ${Math.round(lcp)} ms`);
} catch (e) {
  r.fail("Lighthouse run", e.message.split("\n")[0]);
} finally {
  await chrome?.kill();
}
r.finish();
