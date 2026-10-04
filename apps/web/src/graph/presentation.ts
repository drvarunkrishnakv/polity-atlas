import type { Concept, GraphRelease, Kind } from "../content/types";

export const kindStyle: Record<Kind, { label: string; colour: string }> = {
  theme: { label: "Topic", colour: "#d5dfe9" },
  category: { label: "Rights category", colour: "#bda4f5" },
  article: { label: "Article", colour: "#79baff" },
  judgment: { label: "Judgment", colour: "#eac17d" },
  application: { label: "Concept / application", colour: "#76d3be" },
  event: { label: "Current affairs", colour: "#ed9bb7" },
  foundation: { label: "Context", colour: "#a3b2c2" },
};
export const cardWidth = (node: Concept) =>
  node.kind === "theme" ? 280 : node.kind === "category" ? 250 : 205;

export const graphFamily = (graph: GraphRelease): "rights" | "topic" =>
  graph.display?.family ?? "rights";

export function graphRootId(graph: GraphRelease): string {
  if (graph.rootId && graph.nodes.some((node) => node.id === graph.rootId))
    return graph.rootId;
  if (graph.nodes.some((node) => node.id === "fr")) return "fr";
  return (
    graph.nodes.find((node) => node.kind === "theme")?.id ??
    graph.nodes[0]?.id ??
    "fr"
  );
}

export function kindLabel(kind: Kind, family: "rights" | "topic" = "rights") {
  if (family === "topic" && kind === "category") return "Category";
  if (family === "topic" && kind === "theme") return "Theme";
  return kindStyle[kind].label;
}

/** Spatial grouping is presentation, not additional legal relationships. */
export function teachingRegions(graph: GraphRelease) {
  const family = graphFamily(graph);
  const groups = [
    ...graph.nodes
      .filter((n) => n.kind === "category")
      .map((n) => ({
        id: n.id,
        title: n.title,
        note: n.meaning,
      })),
    ...(family === "rights"
      ? [
          {
            id: "supporting",
            title: "Supporting provisions",
            note: "Part III framework · not additional rights categories",
          },
          {
            id: "historical",
            title: "Historical provisions",
            note: "Omitted Articles · reference only",
          },
        ]
      : []),
  ];
  return groups.flatMap((group) => {
    const members = graph.nodes.filter(
      (n) => n.groupId === group.id || n.id === group.id,
    );
    if (!members.length) return [];
    if (family === "topic" && members.length < 2) return [];
    const left = Math.min(...members.map((n) => n.position.x)) - 24;
    const top = Math.min(...members.map((n) => n.position.y)) - 62;
    const width =
      Math.max(...members.map((n) => n.position.x + cardWidth(n))) - left + 24;
    const height =
      Math.max(...members.map((n) => n.position.y + 112)) - top + 24;
    if (
      ![left, top, width, height].every((value) => Number.isFinite(value)) ||
      width <= 0 ||
      height <= 0
    )
      return [];
    return [{ ...group, left, top, width, height }];
  });
}
