// Shared helpers for the check-* scripts.
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Collects PASS/FAIL results and sets the exit code at the end.
export function createReporter(title) {
  let failures = 0;
  console.log(`\n== ${title} ==`);
  return {
    pass(label, detail = "") {
      console.log(`PASS  ${label}${detail ? `: ${detail}` : ""}`);
    },
    fail(label, details = []) {
      failures++;
      console.log(`FAIL  ${label}`);
      for (const d of [].concat(details)) console.log(`        - ${d}`);
    },
    finish() {
      console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
      process.exitCode = failures ? 1 : 0;
    },
  };
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", copy: "©", mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

// Removes comments and the contents of <script>, <style>, <template>, <noscript>.
export function stripNonVisible(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<head\b[\s\S]*?<\/head\s*>/gi, " ");
}

// Visible text of an HTML fragment (tags removed, entities decoded).
export function htmlToText(html) {
  return decodeEntities(stripNonVisible(html).replace(/<[^>]+>/g, " "));
}

export function normalizeWs(s) {
  return s.replace(/\s+/g, " ").trim();
}

// Returns { tag, inner } for the element whose id attribute equals `id`,
// matching nested tags of the same name to find the correct closing tag.
export function findElementById(html, id) {
  const open = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*\\bid\\s*=\\s*["']${id}["'][^>]*>`, "i").exec(html);
  if (!open) return null;
  const tag = open[1].toLowerCase();
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = open.index + open[0].length;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return { tag, inner: html.slice(open.index + open[0].length, m.index) };
  }
  return { tag, inner: html.slice(open.index + open[0].length) };
}
