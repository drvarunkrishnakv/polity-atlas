import type { Connection, GraphRelease } from "../content/types";
export function neighbours(id: string, edges: Connection[]): Set<string> {
  const result = new Set([id]);
  for (const edge of edges) {
    if (edge.source === id) result.add(edge.target);
    if (edge.target === id) result.add(edge.source);
  }
  return result;
}
export function validateGraph(graph: GraphRelease): string[] {
  const errors: string[] = [];
  const ids = new Set(graph.nodes.map((n) => n.id));
  const sourceIds = new Set(graph.sources.map((s) => s.id));
  if (ids.size !== graph.nodes.length) errors.push("Duplicate node identity");
  if (new Set(graph.edges.map((e) => e.id)).size !== graph.edges.length)
    errors.push("Duplicate edge identity");
  for (const n of graph.nodes) {
    if (!n.title || !n.meaning || !n.bullets.length || !n.sources.length)
      errors.push(`Incomplete node: ${n.id}`);
    if (
      n.groupId &&
      !ids.has(n.groupId) &&
      !["supporting", "historical"].includes(n.groupId)
    )
      errors.push(`Unknown teaching group: ${n.id}`);
    if (n.sources.some((s) => !sourceIds.has(s)))
      errors.push(`Unknown source on ${n.id}`);
  }
  for (const e of graph.edges) {
    if (!ids.has(e.source) || !ids.has(e.target))
      errors.push(`Dangling edge: ${e.id}`);
    if (e.source === e.target) errors.push(`Self edge: ${e.id}`);
    if (
      !e.explanation ||
      !e.evidence.length ||
      e.evidence.some((s) => !sourceIds.has(s))
    )
      errors.push(`Unsupported edge: ${e.id}`);
    if (e.role && !["structure", "context", "connection"].includes(e.role))
      errors.push(`Invalid teaching role: ${e.id}`);
    if (!["direct", "analytical"].includes(e.classification))
      errors.push(`Invalid relationship: ${e.id}`);
  }
  for (const id of graph.initialIds)
    if (!ids.has(id)) errors.push(`Unknown initial node: ${id}`);
  for (const q of graph.pyqs)
    if (!ids.has(q.conceptId) || !sourceIds.has(q.source))
      errors.push(`Invalid PYQ: ${q.id}`);
  return errors;
}
