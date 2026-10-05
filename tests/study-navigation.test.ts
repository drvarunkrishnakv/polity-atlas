import { describe, it, expect } from "vitest";
import {
  studyBookmark,
  studyMaps,
} from "../apps/web/src/routing/study-navigation";
import links from "../apps/web/src/content/study-links.json";
import bank from "../apps/web/src/content/foundations.json";
import rights from "../apps/web/src/content/fundamental-rights.json";
import {
  projectMap,
  type FoundationBank,
} from "../apps/web/src/content/foundations";
import { neighbours } from "../apps/web/src/graph/explore";
const path = "gs2/polity/topics/constitution";
describe("Focused study navigation", () => {
  it("preserves old theme/focus/node bookmarks without rendering the combined canvas", () => {
    for (const map of studyMaps) {
      expect(
        studyBookmark(
          path,
          new URLSearchParams({ theme: map.microthemeIds[0] }),
        ),
      ).toBe(map.route);
      expect(
        studyBookmark(
          path,
          new URLSearchParams({ focus: map.slug, node: map.nodeIds[0] }),
        ),
      ).toBe(`${map.route}?node=${encodeURIComponent(map.nodeIds[0])}`);
    }
    expect(studyBookmark(path, new URLSearchParams())).toBeNull();
    expect(
      studyBookmark(path, new URLSearchParams({ theme: "missing" })),
    ).toBeNull();
    expect(
      studyBookmark(
        path,
        new URLSearchParams({ focus: "preamble", node: "puttaswamy" }),
      ),
    ).toBe("gs2/polity/fundamental-rights?node=puttaswamy");
    expect(
      studyBookmark(
        path,
        new URLSearchParams({ focus: "preamble", node: "missing" }),
      ),
    ).toBe("gs2/polity/study/preamble");
  });
  it("every gateway opens a real shared concept and reproduces destination evidence", () => {
    for (const link of links.links) {
      const from = studyMaps.find((m) => m.slug === link.from)!;
      const to = studyMaps.find((m) => m.slug === link.to)!;
      expect(from.nodeIds).toContain(link.anchorId);
      expect(to.nodeIds).toContain(link.anchorId);
      const source = link.to === "fundamental-rights" ? rights : bank;
      const edge = source.edges.find((e) => e.id === link.edgeId)!;
      expect([edge.source, edge.target]).toContain(link.anchorId);
      expect(link.explanation).toBe(edge.explanation);
      expect(link.classification).toBe(edge.classification);
      expect(link.sources).toEqual(
        edge.evidence.map((id) => source.sources.find((s) => s.id === id)),
      );
      if (link.to !== "fundamental-rights")
        expect(bank.maps.find((m) => m.slug === link.to)!.edgeIds).toContain(
          edge.id,
        );
    }
  });
  it("related map navigation does not inject off-map nodes or change one-hop traversal", () => {
    const graph = projectMap(bank as FoundationBank, "directive-principles")!;
    expect(graph.nodes).toHaveLength(28);
    expect(graph.nodes.some((n) => n.id === "puttaswamy")).toBe(false);
    const lit = neighbours("puttaswamy", rights.edges);
    expect(lit.has("a21")).toBe(true);
    expect(lit.has("privacy")).toBe(true);
    expect(lit.has("fr")).toBe(false);
  });
});
