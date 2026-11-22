// Criteria 5 and 7 from SPEC.md, plus a light-theme-only proxy check
// (SPEC "Visual constraints", CLAUDE.md "Styling rules").
// Runs on the local files; no network or browser needed.
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT, createReporter, htmlToText, normalizeWs, findElementById, stripNonVisible } from "./lib.mjs";

const read = (f) => readFileSync(path.join(ROOT, f), "utf8");
const html = read("index.html");
const spec = read("SPEC.md");
const projects = read("projects.md");
const css = read("style.css");
const js = read("script.js");

const r = createReporter("Content checks (index.html)");

// ---- Criterion 5: banned words ----------------------------------------
{
  const label = "Criterion 5: no banned words in page text";
  const voice = /^##\s+Voice\s*$([\s\S]*?)(?=^##\s)/m.exec(spec)?.[1] ?? "";
  const list = /Never the words:\s*([^\n]+)/i.exec(voice)?.[1];
  if (!list) {
    r.fail(label, 'Could not find the "Never the words:" list under "## Voice" in SPEC.md');
  } else {
    const words = list.replace(/\.\s*$/, "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
    // Split the body into labelled regions (header, each section/element with an id, footer)
    // so each hit can be reported with where it was found.
    const body = stripNonVisible(html);
    const marks = [...body.matchAll(/<(header|footer|section|main|nav|div|article)\b[^>]*?(?:\bid\s*=\s*["']([^"']+)["'])?[^>]*>/gi)]
      .filter((m) => m[2] || /header|footer/i.test(m[1]))
      .map((m) => ({ at: m.index, name: m[2] ? `#${m[2]}` : `<${m[1].toLowerCase()}>` }));
    const hits = [];
    for (const w of words) {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      // Search tag-stripped text per region so attribute values are not counted.
      const bounds = [{ at: 0, name: "(top of page)" }, ...marks, { at: body.length }];
      for (let k = 0; k < bounds.length - 1; k++) {
        const chunk = body.slice(bounds[k].at, bounds[k + 1].at).replace(/^<[^>]*>/, "");
        const text = normalizeWs(htmlToText(chunk));
        for (const m of text.matchAll(re)) {
          const ctx = text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30);
          hits.push(`"${m[0]}" in ${bounds[k].name}: "…${ctx}…"`);
        }
      }
    }
    hits.length ? r.fail(label, hits) : r.pass(label, `checked ${words.join(", ")}`);
  }
}

// ---- Criterion 7: About text matches projects.md -----------------------
{
  const label = "Criterion 7: About text matches projects.md exactly";
  const mdAbout = /^##\s+About\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m.exec(projects)?.[1];
  const el = findElementById(html, "about");
  if (mdAbout == null) {
    r.fail(label, 'Could not find a "## About" section in projects.md');
  } else if (!el) {
    r.fail(label, 'index.html has no element with id="about"');
  } else {
    const paras = mdAbout.split(/\n\s*\n/).map(normalizeWs).filter(Boolean);
    const expected = normalizeWs(paras.join(" "));
    const pageInner = el.inner.replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]\s*>/gi, " ");
    const actual = normalizeWs(htmlToText(pageInner));
    const details = [];
    if (paras.length !== 2) details.push(`projects.md About has ${paras.length} paragraph(s), expected 2`);
    if (actual !== expected) {
      let i = 0;
      while (i < actual.length && actual[i] === expected[i]) i++;
      details.push(`first difference at character ${i}`);
      details.push(`expected (projects.md): "${expected}"`);
      details.push(`actual   (index.html):  "${actual}"`);
    }
    details.length ? r.fail(label, details) : r.pass(label);
  }
}

// ---- Light theme only (proxy check) -------------------------------------
{
  const label = "Light theme only (proxy check)";
  const findings = [];
  const scan = (file, text, patterns) => {
    text.split("\n").forEach((line, n) => {
      for (const [re, why] of patterns) if (re.test(line)) findings.push(`${file}:${n + 1}: ${why}: ${line.trim().slice(0, 120)}`);
    });
  };
  const darkMq = [/prefers-color-scheme\s*:\s*dark/i, "prefers-color-scheme: dark"];
  const toggle = [
    [/theme[-_ ]?(toggle|switch)|(toggle|switch)[-_ ]?theme/i, "theme toggle"],
    [/dark[-_ ]?(mode|theme)/i, "dark mode/theme reference"],
    [/data-theme|\.dataset\.theme/i, "data-theme switching"],
    [/classList\.(toggle|add|replace)\([^)]*dark/i, "adds/toggles a dark class"],
    [/color-scheme\s*:\s*dark|colorScheme\s*=\s*["']dark/i, "sets color-scheme dark"],
  ];
  scan("style.css", css, [darkMq]);
  scan("index.html", html, [darkMq, ...toggle]);
  scan("script.js", js, [darkMq, ...toggle]);
  findings.length ? r.fail(label, findings) : r.pass(label, "no dark media query or theme toggle found; colour review stays manual");
}

r.finish();
