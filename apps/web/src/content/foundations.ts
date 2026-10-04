import type { Concept, Connection, GraphRelease, Source } from "./types";
import { validateGraph } from "../graph/explore";
import { layoutTopicMap } from "../graph/layout";
import { teachingRegions } from "../graph/presentation";

export type FoundationConcept = Omit<Concept, "position" | "groupId">;
export interface FoundationMap {
  slug: string;
  title: string;
  meaning: string;
  microthemeIds: string[];
  rootId: string;
  nodeIds: string[];
  edgeIds: string[];
  pyqs: GraphRelease["pyqs"];
}
export interface FoundationBank {
  schemaVersion: number;
  version: string;
  topicId: "constitution";
  sourceCutoff: string;
  sources: Source[];
  concepts: FoundationConcept[];
  edges: Connection[];
  maps: FoundationMap[];
}
export const CONSTITUTION_SYLLABUS_ID = "syllabus:cse2026:GS2:01";
export const CONSTITUTION_TOPIC = {
  id: "constitution",
  title: "Constitution & its foundations",
};
const filled = (value: string | undefined) =>
  !!value && value.trim().length > 0;
const kinds = new Set([
  "foundation",
  "theme",
  "category",
  "article",
  "judgment",
  "application",
  "event",
]);

/** Structural checks, then each map must project to a valid finite graph. */
export function validateBank(bank: FoundationBank): string[] {
  const errors: string[] = [];
  if (bank.schemaVersion !== 1) errors.push("Unsupported bank schema");
  if (bank.topicId !== "constitution") errors.push("Unexpected bank topic");
  if (!filled(bank.version)) errors.push("Missing bank version");
  if (typeof bank.sourceCutoff !== "string" || !bank.sourceCutoff.trim())
    errors.push("Missing source cutoff");

  const conceptIds = new Set<string>();
  for (const concept of bank.concepts) {
    if (!concept.id || conceptIds.has(concept.id))
      errors.push(`Duplicate concept ${concept.id || "(blank)"}`);
    conceptIds.add(concept.id);
    if (!kinds.has(concept.kind)) errors.push(`Invalid kind ${concept.id}`);
    if (
      !filled(concept.title) ||
      !filled(concept.meaning) ||
      !concept.bullets?.length ||
      concept.bullets.some((bullet) => !filled(bullet)) ||
      !filled(concept.mains) ||
      !concept.sources?.length ||
      !filled(concept.reviewedOn)
    )
      errors.push(`Incomplete concept ${concept.id}`);
  }

  const sourceIds = new Set<string>();
  for (const source of bank.sources) {
    if (!source.id || sourceIds.has(source.id))
      errors.push(`Duplicate source ${source.id || "(blank)"}`);
    sourceIds.add(source.id);
    if (
      !filled(source.title) ||
      !filled(source.locator) ||
      !filled(source.edition)
    )
      errors.push(`Incomplete source ${source.id}`);
  }
  for (const concept of bank.concepts)
    if (concept.sources.some((id) => !sourceIds.has(id)))
      errors.push(`Unknown source on ${concept.id}`);

  const edgeIds = new Set<string>();
  const edgesById = new Map<string, Connection>();
  for (const edge of bank.edges) {
    if (!edge.id || edgeIds.has(edge.id))
      errors.push(`Duplicate edge ${edge.id || "(blank)"}`);
    edgeIds.add(edge.id);
    edgesById.set(edge.id, edge);
    if (!conceptIds.has(edge.source) || !conceptIds.has(edge.target))
      errors.push(`Dangling edge ${edge.id}`);
    if (edge.source === edge.target) errors.push(`Self edge ${edge.id}`);
    if (
      !filled(edge.label) ||
      !filled(edge.explanation) ||
      !edge.evidence?.length ||
      !filled(edge.reviewStatus)
    )
      errors.push(`Unsupported edge ${edge.id}`);
    if (edge.evidence?.some((id) => !sourceIds.has(id)))
      errors.push(`Unknown source on edge ${edge.id}`);
    if (
      edge.role &&
      !["structure", "context", "connection"].includes(edge.role)
    )
      errors.push(`Invalid teaching role ${edge.id}`);
    if (!["direct", "analytical"].includes(edge.classification))
      errors.push(`Invalid relationship ${edge.id}`);
  }

  const slugs = new Set<string>();
  for (const map of bank.maps) {
    if (!map.slug || slugs.has(map.slug))
      errors.push(`Duplicate map ${map.slug || "(blank)"}`);
    slugs.add(map.slug);
    if (!filled(map.title) || !filled(map.meaning))
      errors.push(`Incomplete map ${map.slug}`);
    if (!map.microthemeIds?.length)
      errors.push(`Map without themes ${map.slug}`);
    if (new Set(map.microthemeIds).size !== map.microthemeIds.length)
      errors.push(`Duplicate microtheme ${map.slug}`);
    if (
      !Array.isArray(map.nodeIds) ||
      new Set(map.nodeIds).size !== map.nodeIds.length
    )
      errors.push(`Duplicate map node ${map.slug}`);
    if (
      !Array.isArray(map.edgeIds) ||
      new Set(map.edgeIds).size !== map.edgeIds.length
    )
      errors.push(`Duplicate map edge ${map.slug}`);
    if (!Array.isArray(map.pyqs)) errors.push(`Invalid PYQ list ${map.slug}`);
    const members = new Set(map.nodeIds ?? []);
    if (!members.has(map.rootId) || !conceptIds.has(map.rootId))
      errors.push(`Invalid root ${map.slug}`);
    for (const id of map.nodeIds ?? [])
      if (!conceptIds.has(id))
        errors.push(`Dangling map node ${map.slug}:${id}`);
    for (const id of map.edgeIds ?? []) {
      const edge = edgesById.get(id);
      if (!edge) errors.push(`Dangling map edge ${map.slug}:${id}`);
      else if (!members.has(edge.source) || !members.has(edge.target))
        errors.push(`Edge endpoint outside map ${map.slug}:${id}`);
    }
    for (const question of map.pyqs ?? [])
      if (
        !question.id ||
        !filled(question.angle) ||
        !members.has(question.conceptId) ||
        !sourceIds.has(question.source)
      )
        errors.push(`Invalid PYQ ${map.slug}:${question.id}`);
  }
  if (errors.length) return errors;

  for (const map of bank.maps) {
    const release = projectMap(bank, map.slug);
    if (!release) {
      errors.push(`Unprojected map ${map.slug}`);
      continue;
    }
    errors.push(
      ...validateGraph(release).map((error) => `${map.slug}: ${error}`),
    );
    const seen = new Set<string>();
    for (const node of release.nodes) {
      if (
        !Number.isFinite(node.position.x) ||
        !Number.isFinite(node.position.y)
      )
        errors.push(`Non-finite position ${map.slug}:${node.id}`);
      const key = `${node.position.x},${node.position.y}`;
      if (seen.has(key))
        errors.push(`Overlapping position ${map.slug}:${node.id}`);
      seen.add(key);
    }
    for (const region of teachingRegions(release))
      if (
        ![region.left, region.top, region.width, region.height].every((value) =>
          Number.isFinite(value),
        ) ||
        region.width <= 0 ||
        region.height <= 0
      )
        errors.push(`Non-finite region ${map.slug}:${region.id}`);
  }
  return errors;
}

/** Compose one GraphRelease from listed canonical records. Does not invent edges. */
export function projectMap(
  bank: FoundationBank,
  slug: string,
): GraphRelease | null {
  const map = bank.maps.find((item) => item.slug === slug);
  if (!map || !map.microthemeIds.length) return null;
  const concepts = new Map(
    bank.concepts.map((concept) => [concept.id, concept]),
  );
  const edges = new Map(bank.edges.map((edge) => [edge.id, edge]));
  if (!concepts.has(map.rootId)) return null;
  if (map.nodeIds.some((id) => !concepts.has(id))) return null;
  if (map.edgeIds.some((id) => !edges.has(id))) return null;
  const selectedEdges = map.edgeIds.map((id) => edges.get(id)!);
  const members = new Set(map.nodeIds);
  if (
    selectedEdges.some(
      (edge) => !members.has(edge.source) || !members.has(edge.target),
    )
  )
    return null;
  const laidOut = layoutTopicMap(
    map.nodeIds.map((id) => concepts.get(id)!),
    selectedEdges,
    map.rootId,
  );
  const used = new Set<string>();
  for (const concept of laidOut) for (const id of concept.sources) used.add(id);
  for (const edge of selectedEdges)
    for (const id of edge.evidence) used.add(id);
  for (const question of map.pyqs) used.add(question.source);
  return {
    schemaVersion: 1,
    version: bank.version,
    title: map.title,
    scope: map.meaning,
    sourceCutoff: bank.sourceCutoff,
    syllabus: {
      id: CONSTITUTION_SYLLABUS_ID,
      title: CONSTITUTION_TOPIC.title,
      meaning: map.meaning,
      microthemeId: map.microthemeIds[0],
    },
    nodes: laidOut,
    edges: selectedEdges,
    sources: bank.sources.filter((source) => used.has(source.id)),
    initialIds: [map.rootId],
    pyqs: map.pyqs,
    rootId: map.rootId,
    display: { family: "topic", topic: CONSTITUTION_TOPIC },
  };
}
