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

/** Spatial grouping is presentation, not additional legal relationships. */
export function teachingRegions(graph: GraphRelease) {
  const groups = [
    ...graph.nodes
      .filter((n) => n.kind === "category")
      .map((n) => ({
        id: n.id,
        title: n.title,
        note: n.meaning,
      })),
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
  ];
  return groups.map((group) => {
    const members = graph.nodes.filter(
      (n) => n.groupId === group.id || n.id === group.id,
    );
    const left = Math.min(...members.map((n) => n.position.x)) - 24;
    const top = Math.min(...members.map((n) => n.position.y)) - 62;
    return {
      ...group,
      left,
      top,
      width:
        Math.max(...members.map((n) => n.position.x + cardWidth(n))) -
        left +
        24,
      height: Math.max(...members.map((n) => n.position.y + 112)) - top + 24,
    };
  });
}
