import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
const paths = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const allowed =
  /^(?:apps\/web\/|tooling\/|tests\/|\.github\/|docs\/(?:design\/|ARCHITECTURE\.md$|DECISIONS\.md$|HANDOFF\.md$|CONTENT_CONVENTIONS\.md$|CONTENT_REVIEW\.md$|DEPLOYMENT\.md$)|(?:README|AGENTS|CLAUDE|GEMINI|design-qa)\.md$|(?:package(?:-lock)?|firebase)\.json$|firestore\.rules$|(?:playwright|vitest)\.config\.ts$|\.gitignore$|requirements(?:\.lock)?\.txt$)/;
const forbidden =
  /(^|\/)(?:data|config|output|private|node_modules|dist|\.venv|\.git)(\/|$)|(?:\.env(?:\.|$)|corpus_snapshot_manifest|\.pdf$|\.sqlite|\.npy$|\.npz$|\.csv$|\.tsv$)/i;
const secrets =
  /(?:gh[pousr]_[A-Za-z0-9]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|"private_key"\s*:\s*"[^"\s]+|\/Users\/[^\s/'"]+\/|\/Volumes\/[^\n'"]+\/codebase\/)/;
const errors = [];
for (const path of paths) {
  if (!allowed.test(path) || forbidden.test(path)) {
    errors.push(`File outside public boundary: ${path}`);
    continue;
  }
  const size = statSync(path).size;
  if (size > 2_000_000) errors.push(`Oversized public file: ${path}`);
  if (
    !/\.(png|jpe?g|webp|woff2?)$/.test(path) &&
    secrets.test(readFileSync(path, "utf8"))
  )
    errors.push(`Potential private material: ${path}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Public boundary passed: ${paths.length} candidate files; private corpus excluded.`,
);
