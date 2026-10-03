import { describe, it, expect } from "vitest";
import data from "../apps/web/src/content/fundamental-rights.json";
import type { GraphRelease } from "../apps/web/src/content/types";
import { neighbours, validateGraph } from "../apps/web/src/graph/explore";
const graph = data as GraphRelease;
describe("Published knowledge graph", () => {
  it("has stable, unique, source-backed records and valid references", () =>
    expect(validateGraph(graph)).toEqual([]));
  it("covers the Part III provision skeleton, including omitted 31", () => {
    const expected = [
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "21A",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "31A",
      "31B",
      "31C",
      "31D",
      "32",
      "32A",
      "33",
      "34",
      "35",
    ];
    expect(
      graph.nodes
        .filter((n) => n.kind === "article")
        .map((n) => n.id)
        .sort(),
    ).toEqual(expected.map((a) => "a" + a).sort());
  });
  it("highlights one hop, never traversing through a shared theme", () => {
    const related = neighbours("a21", graph.edges);
    expect(related.has("fr")).toBe(true);
    expect(related.has("puttaswamy")).toBe(true);
    expect(related.has("a15")).toBe(false);
    expect(related.has("privacy")).toBe(false);
  });
  it("connects the already-loaded privacy chain without recursive highlighting", () => {
    expect(neighbours("puttaswamy", graph.edges)).toEqual(
      new Set(["puttaswamy", "a21", "privacy"]),
    );
    expect(neighbours("privacy", graph.edges).has("a21")).toBe(false);
  });
  it("rejects broken references and unsupported edges", () => {
    const broken = structuredClone(graph);
    broken.edges[0].target = "missing";
    broken.edges[0].evidence = [];
    expect(validateGraph(broken)).toContain("Dangling edge: constitution--fr");
    expect(validateGraph(broken)).toContain(
      "Unsupported edge: constitution--fr",
    );
  });
  it("retains taxonomy identity and dated event context", () => {
    expect(graph.syllabus.microthemeId).toBe(
      "microtheme:3dc9a2d227339195a31d5617",
    );
    expect(graph.pyqs).toHaveLength(7);
    expect(
      graph.nodes
        .filter((n) => n.kind === "event")
        .every((n) => n.date && n.status),
    ).toBe(true);
  });
});
