// Criterion 6 from SPEC.md, plus SPEC "Privacy" applied to every tracked file.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT, createReporter, decodeEntities } from "./lib.mjs";

const SKIP = new Set(["package-lock.json"]);
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
// tel: links, or 10-15 digit sequences allowing spaces, dots, dashes, brackets and a leading +.
const TEL = /tel:[^"'\s>]+/gi;
const PHONE = /(?<![\w.\/#%-])\+?\(?\d[\d\s().\-]{8,20}\d(?![\w.\/-])/g;

const files = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" }).split("\0").filter(Boolean);
const r = createReporter(`Privacy checks (${files.length} git-tracked files)`);

const emails = [];
const phones = [];
for (const f of files) {
  if (SKIP.has(path.basename(f))) continue;
  let buf;
  try { buf = readFileSync(path.join(ROOT, f)); } catch { continue; }
  if (buf.subarray(0, 8000).includes(0)) continue; // binary
  buf.toString("utf8").split("\n").forEach((raw, i) => {
    const line = decodeEntities(raw); // so "+91&nbsp;..." is seen as "+91 ..."
    const where = `${f}:${i + 1}`;
    for (const m of line.matchAll(EMAIL)) emails.push(`${where}: ${m[0]}`);
    const seen = new Set();
    for (const m of line.matchAll(TEL)) { phones.push(`${where}: ${m[0]}`); seen.add(m[0].replace(/\D/g, "")); }
    for (const m of line.matchAll(PHONE)) {
      const digits = m[0].replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15 || seen.has(digits)) continue;
      phones.push(`${where}: ${m[0].trim()}`);
    }
  });
}
emails.length ? r.fail("Criterion 6: no email addresses in tracked files", emails) : r.pass("Criterion 6: no email addresses in tracked files");
phones.length ? r.fail("Criterion 6: no phone numbers in tracked files", phones) : r.pass("Criterion 6: no phone numbers in tracked files");

const pdfs = files.filter((f) => /\.pdf$/i.test(f));
pdfs.length ? r.fail("Privacy: no tracked .pdf files", pdfs) : r.pass("Privacy: no tracked .pdf files");

const html = readFileSync(path.join(ROOT, "index.html"), "utf8");
const pdfLinks = [];
html.split("\n").forEach((line, i) => {
  for (const m of line.matchAll(/\b(?:href|src|data|action)\s*=\s*["']?([^"'\s>]*\.pdf(?:[?#][^"'\s>]*)?)/gi)) pdfLinks.push(`index.html:${i + 1}: ${m[1]}`);
});
pdfLinks.length ? r.fail("Criterion 6: index.html links to no .pdf", pdfLinks) : r.pass("Criterion 6: index.html links to no .pdf");

r.finish();
