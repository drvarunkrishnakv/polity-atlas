import { layoutWholeTopic } from "../graph/topic-layout";
import type { Concept, GraphRelease } from "./types";
import { projectMap, type FoundationBank } from "./foundations";

export const topicPath = "gs2/polity/topics/constitution";
/** Reading order only: these groups do not assert additional academic edges. */
export const topicSections = [
  {
    title: "Origins & design",
    slugs: [
      "constitutional-history",
      "constitution-making",
      "commencement-repeal",
      "constitutional-structure",
      "constitutional-provisions",
    ],
  },
  {
    title: "Values & principles",
    slugs: [
      "preamble",
      "constitutional-values",
      "principles",
      "constitutionalism",
      "democracy",
      "constitutional-morality",
      "political-concepts",
      "rule-of-law",
      "human-rights-foundations",
    ],
  },
  {
    title: "Rights & remedies",
    slugs: [
      "fundamental-rights",
      "constitutional-remedies",
      "article-13-review",
      "access-to-justice",
      "security-and-rights",
      "constitutional-property",
    ],
  },
  {
    title: "Duties & policy",
    slugs: [
      "directive-principles",
      "fundamental-duties",
      "education-governance",
      "environmental-jurisprudence",
    ],
  },
  {
    title: "Change & safeguards",
    slugs: [
      "constitutional-amendment",
      "ninth-schedule",
      "constitutional-safeguards",
      "emergency-provisions",
    ],
  },
  {
    title: "Equality & inclusion",
    slugs: [
      "equality-reservation",
      "gender-justice",
      "scheduled-tribes",
      "tribal-safeguards",
      "scheduled-areas-and-tribes",
      "scheduled-areas",
    ],
  },
  {
    title: "Citizenship & identity",
    slugs: ["citizenship", "constitutional-languages", "national-honours"],
  },
];
export function topicMaps(bank: FoundationBank, rights: GraphRelease) {
  return [
    ...bank.maps.map((m) => ({
      slug: m.slug,
      title: m.title,
      rootId: m.rootId,
      microthemeIds: m.microthemeIds,
      nodeIds: m.nodeIds,
    })),
    {
      slug: "fundamental-rights",
      title: "Fundamental Rights",
      rootId: "fr",
      microthemeIds: [rights.syllabus.microthemeId],
      nodeIds: rights.nodes.map((n) => n.id),
    },
  ];
}

/** All authored records are present once. Focusing a theme changes spatial layout,
 * never membership or academic relationships. Source variants remain traceable. */
export function composeTopic(
  bank: FoundationBank,
  rights: GraphRelease,
  focus: string,
): GraphRelease {
  const focused =
    focus === "fundamental-rights" ? rights : projectMap(bank, focus);
  if (!focused) throw new Error(`Unknown topic focus: ${focus}`);
  const sourceAlias = new Map(
    rights.sources.map((s) => [
      s.id,
      bank.sources.some(
        (b) => b.id === s.id && JSON.stringify(b) !== JSON.stringify(s),
      )
        ? `rights:${s.id}`
        : s.id,
    ]),
  );
  const sourceId = (id: string) => sourceAlias.get(id) ?? id;
  const sources = new Map(bank.sources.map((s) => [s.id, s]));
  for (const source of rights.sources)
    sources.set(sourceId(source.id), { ...source, id: sourceId(source.id) });
  const concepts = new Map<string, Concept>();
  for (const node of rights.nodes)
    concepts.set(node.id, { ...node, sources: node.sources.map(sourceId) });
  for (const node of bank.concepts)
    concepts.set(node.id, { ...node, position: { x: 0, y: 0 } });
  const edges = new Map(bank.edges.map((e) => [e.id, e]));
  for (const edge of rights.edges) {
    if (edges.has(edge.id))
      throw new Error(`Conflicting edge identity: ${edge.id}`);
    edges.set(edge.id, { ...edge, evidence: edge.evidence.map(sourceId) });
  }
  const maps = topicMaps(bank, rights);
  const nodes = layoutWholeTopic(
    concepts,
    focused,
    topicSections
      .flatMap((s) => s.slugs)
      .map((slug) => maps.find((m) => m.slug === slug)!),
  );
  const pyqs = new Map(bank.maps.flatMap((m) => m.pyqs).map((q) => [q.id, q]));
  for (const q of rights.pyqs)
    if (!pyqs.has(q.id)) pyqs.set(q.id, { ...q, source: sourceId(q.source) });
  return {
    ...focused,
    version: `${bank.version}+inline-topic.1`,
    title: "Constitution & its foundations",
    scope: `Focus: ${focused.title}. All authored themes and their connections share this canvas.`,
    sourceCutoff: bank.sourceCutoff,
    nodes,
    edges: [...edges.values()],
    sources: [...sources.values()],
    pyqs: [...pyqs.values()],
    rootId: focused.rootId ?? "fr",
    display: {
      family: "topic",
      focusNodeIds: focused.nodes.map((n) => n.id),
      focusSlug: focus,
      topic: { id: "constitution", title: "Constitution & its foundations" },
    },
  };
}
