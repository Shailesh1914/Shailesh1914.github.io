// Runs each argument as a shell command, in order, continuing after failures.
// Prints a summary and exits non-zero if any command failed.
// Usage: node scripts/run-all.mjs "cmd one" "cmd two" ...
import { spawnSync } from "node:child_process";

const results = [];
for (const cmd of process.argv.slice(2)) {
  console.log(`\n>>> ${cmd}`);
  const { status, signal } = spawnSync(cmd, { shell: true, stdio: "inherit" });
  results.push({ cmd, ok: status === 0, code: status ?? signal });
}

console.log("\n==== Summary ====");
for (const { cmd, ok, code } of results) console.log(`${ok ? "PASS" : "FAIL"}  ${cmd}${ok ? "" : ` (exit ${code})`}`);
const failed = results.filter((x) => !x.ok).length;
console.log(failed ? `${failed} of ${results.length} step(s) failed.` : `All ${results.length} step(s) passed.`);
process.exit(failed ? 1 : 0);
