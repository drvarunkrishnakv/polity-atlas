import { readFile, writeFile } from "node:fs/promises";
const root = new URL("../apps/web/src/content/", import.meta.url);
const read = async (name) =>
  JSON.parse(await readFile(new URL(name, root), "utf8"));
const bank = await read("foundations.json");
const rights = await read("fundamental-rights.json");
const maps = [
  {
    slug: "fundamental-rights",
    title: rights.title,
    route: "gs2/polity/fundamental-rights",
    microthemeIds: [rights.syllabus.microthemeId],
    nodeIds: rights.nodes.map((n) => n.id),
  },
  ...bank.maps.map((m) => ({
    slug: m.slug,
    title: m.title,
    route: `gs2/polity/study/${m.slug}`,
    microthemeIds: m.microthemeIds,
    nodeIds: m.nodeIds,
  })),
];
const specs = [
  [
    "fundamental-rights",
    "directive-principles",
    "a31C",
    "cf:directive-principles:a37:a31C",
  ],
  ["directive-principles", "fundamental-rights", "a31C", "a31C--dpsp"],
  [
    "fundamental-rights",
    "constitutional-values",
    "a14",
    "cf:constitutional-values:value-equality:a14",
  ],
  ["constitutional-values", "fundamental-rights", "a14", "a14--equality"],
  ["fundamental-rights", "constitutional-remedies", "a32", "c-re-basu"],
  ["constitutional-remedies", "fundamental-rights", "a32", "a32--a226"],
];
const links = specs.map(([from, to, anchorId, edgeId]) => {
  const target = maps.find((m) => m.slug === to);
  const original = to === "fundamental-rights" ? rights : bank;
  const edge = original.edges.find((e) => e.id === edgeId);
  const membership =
    to === "fundamental-rights"
      ? rights.edges.map((e) => e.id)
      : bank.maps.find((m) => m.slug === to).edgeIds;
  if (
    !target.nodeIds.includes(anchorId) ||
    !maps.find((m) => m.slug === from).nodeIds.includes(anchorId) ||
    !membership.includes(edgeId) ||
    ![edge.source, edge.target].includes(anchorId)
  )
    throw new Error(`Invalid gateway ${from}:${to}:${anchorId}`);
  return {
    id: `${from}:${to}:${anchorId}`,
    from,
    to,
    anchorId,
    edgeId,
    explanation: edge.explanation,
    classification: edge.classification,
    sources: edge.evidence.map((id) =>
      original.sources.find((s) => s.id === id),
    ),
  };
});
for (const [name, data] of [
  ["study-navigation.json", { version: "2026.10.05.1", maps }],
  ["study-links.json", { version: "2026.10.05.1", links }],
]) {
  const text = JSON.stringify(data, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    const current = await read(name);
    if (JSON.stringify(current) !== JSON.stringify(data))
      throw new Error(
        `${name} is stale; run node tooling/build-study-navigation.mjs`,
      );
  } else await writeFile(new URL(name, root), text);
}
