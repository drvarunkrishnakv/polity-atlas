import { expect, it } from "vitest";
import data from "../apps/web/src/content/foundations.json";
import rightsData from "../apps/web/src/content/fundamental-rights.json";
import type { FoundationBank } from "../apps/web/src/content/foundations";
import type { GraphRelease } from "../apps/web/src/content/types";
import {
  composeTopic,
  topicMaps,
  topicSections,
} from "../apps/web/src/content/topic-graph";
import { neighbours, validateGraph } from "../apps/web/src/graph/explore";
const bank = data as FoundationBank;
const rights = rightsData as GraphRelease;
it("every theme focus preserves the complete canonical union and existing evidence", () => {
  const ids = new Set([...bank.concepts, ...rights.nodes].map((n) => n.id));
  const edges = new Set([...bank.edges, ...rights.edges].map((e) => e.id));
  expect(new Set(topicSections.flatMap((s) => s.slugs))).toEqual(
    new Set(topicMaps(bank, rights).map((m) => m.slug)),
  );
  for (const map of topicMaps(bank, rights)) {
    const graph = composeTopic(bank, rights, map.slug);
    expect(validateGraph(graph)).toEqual([]);
    expect(new Set(graph.nodes.map((n) => n.id))).toEqual(ids);
    expect(graph.nodes).toHaveLength(ids.size);
    expect(new Set(graph.edges.map((e) => e.id))).toEqual(edges);
    expect(
      new Set(graph.nodes.map((n) => `${n.position.x},${n.position.y}`)).size,
    ).toBe(ids.size);
    for (const original of bank.edges)
      expect(graph.edges.find((e) => e.id === original.id)).toEqual(original);
    for (const original of rights.edges) {
      const composed = graph.edges.find((e) => e.id === original.id)!;
      expect(composed.explanation).toBe(original.explanation);
      for (let i = 0; i < original.evidence.length; i++) {
        const source = rights.sources.find(
          (s) => s.id === original.evidence[i],
        )!;
        expect(
          graph.sources.find((s) => s.id === composed.evidence[i]),
        ).toEqual({ ...source, id: composed.evidence[i] });
      }
    }
    for (const node of bank.concepts) {
      const {
        position: _p,
        groupId: _g,
        ...content
      } = graph.nodes.find((n) => n.id === node.id)!;
      expect(content).toEqual(node);
    }
  }
});
it("shared Articles connect different themes without recursively highlighting the topic", () => {
  const graph = composeTopic(bank, rights, "constitutional-values");
  expect(graph.nodes.filter((n) => n.id === "a14")).toHaveLength(1);
  const lit = neighbours("a14", graph.edges);
  expect(lit.has("value-equality")).toBe(true);
  expect(lit.has("right-equality")).toBe(true);
  const privacy = neighbours("puttaswamy", graph.edges);
  expect(privacy.has("a21")).toBe(true);
  expect(privacy.has("privacy")).toBe(true);
  expect(privacy.has("fr")).toBe(false);
  expect(privacy.size).toBeLessThan(10);
});
