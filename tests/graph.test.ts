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
      "226",
      "359",
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
    expect(related.has("right-freedom")).toBe(true);
    expect(related.has("fr")).toBe(false);
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

describe("Six-category teaching structure", () => {
  it("introduces six categories without lighting every Article", () => {
    const categories = graph.nodes.filter((n) => n.kind === "category");
    expect(categories).toHaveLength(6);
    const lit = neighbours("fr", graph.edges);
    expect(categories.every((n) => lit.has(n.id))).toBe(true);
    expect(
      graph.nodes
        .filter((n) => n.kind === "article")
        .every((n) => !lit.has(n.id)),
    ).toBe(true);
  });
  it("groups each guarantee under the correct category, including education", () => {
    const membership = {
      "right-equality": ["a14", "a15", "a16", "a17", "a18"],
      "right-freedom": ["a19", "a20", "a21", "a21A", "a22"],
      "right-exploitation": ["a23", "a24"],
      "right-religion": ["a25", "a26", "a27", "a28"],
      "right-cultural": ["a29", "a30"],
      "right-remedies": ["a32"],
    };
    for (const [parent, children] of Object.entries(membership)) {
      expect(
        graph.edges
          .filter((e) => e.source === parent && e.role === "structure")
          .map((e) => e.target)
          .sort(),
      ).toEqual([...children].sort());
      expect(
        graph.nodes
          .filter((n) => n.groupId === parent)
          .map((n) => n.id)
          .sort(),
      ).toEqual([...children].sort());
    }
    expect(neighbours("right-freedom", graph.edges).has("puttaswamy")).toBe(
      false,
    );
  });
  it("keeps supporting and omitted provisions outside the six categories", () => {
    expect(
      graph.nodes
        .filter((n) => n.groupId === "historical")
        .map((n) => n.id)
        .sort(),
    ).toEqual(["a31", "a31D", "a32A"]);
    expect(graph.nodes.filter((n) => n.groupId === "supporting")).toHaveLength(
      8,
    );
    for (const e of graph.edges.filter(
      (e) =>
        [
          "a12",
          "a13",
          "a31",
          "a31A",
          "a31B",
          "a31C",
          "a31D",
          "a32A",
          "a33",
          "a34",
          "a35",
        ].includes(e.target) && e.role !== "connection",
    )) {
      expect(e.source).toBe("constitution");
      expect(e.role).toBe("context");
    }
  });
});
