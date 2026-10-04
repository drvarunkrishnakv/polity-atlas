import { describe, it, expect } from "vitest";
import published from "../apps/web/src/content/foundations.json";
import rights from "../apps/web/src/content/fundamental-rights.json";
import catalogue from "../apps/web/src/content/polity-catalog.json";
import { studyIndex } from "../apps/web/src/content/study-index";
import {
  projectMap,
  validateBank,
  type FoundationBank,
  type FoundationConcept,
} from "../apps/web/src/content/foundations";
import type { Connection, GraphRelease } from "../apps/web/src/content/types";
import { neighbours, validateGraph } from "../apps/web/src/graph/explore";
import { teachingRegions } from "../apps/web/src/graph/presentation";

const bank = published as FoundationBank;
const rightsGraph = rights as GraphRelease;

const concept = (
  id: string,
  kind: FoundationConcept["kind"],
): FoundationConcept => ({
  id,
  title: id,
  meaning: `${id} meaning`,
  kind,
  bullets: [`Recall ${id}`],
  mains: `Use ${id}`,
  sources: ["s1"],
  reviewedOn: "2026-10-04",
});
const edge = (
  id: string,
  source: string,
  target: string,
  role: Connection["role"],
): Connection => ({
  id,
  source,
  target,
  label: "links",
  explanation: `${source} links ${target}`,
  evidence: ["s1"],
  classification: "direct",
  reviewStatus: "source-checked",
  role,
});

function sampleBank(): FoundationBank {
  return {
    schemaVersion: 1,
    version: "test",
    topicId: "constitution",
    sourceCutoff: "Test cutoff",
    sources: [
      {
        id: "s1",
        title: "Source One",
        url: null,
        locator: "p. 1",
        edition: "2024",
      },
      {
        id: "unused",
        title: "Unused source",
        url: null,
        locator: "p. 2",
        edition: "2024",
      },
    ],
    concepts: [
      concept("root", "theme"),
      concept("cat-a", "category"),
      concept("cat-b", "category"),
      concept("art-a", "article"),
      concept("art-b", "article"),
      concept("case-a", "judgment"),
      concept("cross", "application"),
    ],
    edges: [
      edge("e-root-a", "root", "cat-a", "structure"),
      edge("e-root-b", "root", "cat-b", "structure"),
      edge("e-a-art", "cat-a", "art-a", "structure"),
      edge("e-b-art", "cat-b", "art-b", "structure"),
      edge("e-art-case", "art-a", "case-a", "connection"),
      edge("e-cross", "art-a", "cross", "connection"),
      edge("e-unlisted", "art-b", "case-a", "connection"),
    ],
    maps: [
      {
        slug: "sample-map",
        title: "Sample map",
        meaning: "A test structure",
        microthemeIds: [
          "microtheme:aaaaaaaaaaaaaaaaaaaaaaaa",
          "microtheme:bbbbbbbbbbbbbbbbbbbbbbbb",
        ],
        rootId: "root",
        nodeIds: [
          "root",
          "cat-a",
          "cat-b",
          "art-a",
          "art-b",
          "case-a",
          "cross",
        ],
        edgeIds: [
          "e-root-a",
          "e-root-b",
          "e-a-art",
          "e-b-art",
          "e-art-case",
          "e-cross",
        ],
        pyqs: [
          {
            id: "q1",
            year: 2020,
            angle: "Angle",
            conceptId: "art-a",
            source: "s1",
            note: "Note",
          },
        ],
      },
    ],
  };
}

function distance(graph: GraphRelease, from: string, to: string) {
  const queue = [from];
  const seen = new Set([from]);
  let hops = 0;
  while (queue.length) {
    const layer = queue.length;
    for (let index = 0; index < layer; index += 1) {
      const id = queue.shift()!;
      if (id === to) return hops;
      for (const next of neighbours(id, graph.edges)) {
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push(next);
      }
    }
    hops += 1;
  }
  return Infinity;
}

describe("Constitution foundations bank", () => {
  it("accepts the reviewed bank and agrees with the study index", () => {
    expect(validateBank(bank)).toEqual([]);
    expect(bank.topicId).toBe("constitution");
    expect(bank.maps.map((map) => map.slug).sort()).toEqual(
      studyIndex.maps.map((map) => map.slug).sort(),
    );
    for (const entry of studyIndex.maps) {
      const map = bank.maps.find((item) => item.slug === entry.slug);
      expect(map?.title).toBe(entry.title);
      expect([...(map?.microthemeIds ?? [])].sort()).toEqual(
        [...entry.microthemeIds].sort(),
      );
    }
  });

  it("covers exactly the first topic's home identities and preserves shared rights records", () => {
    const home = catalogue.themes.filter(
      (theme) => theme.homeTopicId === "constitution",
    );
    const authored = bank.maps.flatMap((map) => map.microthemeIds);
    expect(home).toHaveLength(38);
    expect(authored).toHaveLength(37);
    expect(new Set(authored).size).toBe(37);
    expect(new Set([...authored, rightsGraph.syllabus.microthemeId])).toEqual(
      new Set(home.map((theme) => theme.id)),
    );
    for (const concept of bank.concepts) {
      const original = rightsGraph.nodes.find((node) => node.id === concept.id);
      if (!original) continue;
      const { position: _position, groupId: _groupId, ...canonical } = original;
      expect(concept, concept.id).toEqual(canonical);
    }
    for (const map of bank.maps) {
      const release = projectMap(bank, map.slug)!;
      expect(
        release.nodes.every(
          (node) => distance(release, map.rootId, node.id) < Infinity,
        ),
      ).toBe(true);
      expect(
        map.pyqs.every(
          (question) =>
            question.stage === "mains" || question.stage === "prelims",
        ),
      ).toBe(true);
    }
  });

  it("retains complete foundational families and separates their legal status", () => {
    const ids = (slug: string) =>
      new Set(bank.maps.find((map) => map.slug === slug)!.nodeIds);
    const duties = ids("fundamental-duties");
    for (const clause of "abcdefghijk")
      expect(duties.has(`a51A-${clause}`)).toBe(true);
    const directives = ids("directive-principles");
    for (let article = 36; article <= 51; article++)
      expect(directives.has(`a${article}`)).toBe(true);
    for (const article of ["39A", "43A", "43B", "48A"])
      expect(directives.has(`a${article}`)).toBe(true);
    for (const writ of [
      "habeas",
      "mandamus",
      "prohibition",
      "certiorari",
      "quo",
    ])
      expect(ids("constitutional-remedies").has(`writ-${writ}`)).toBe(true);
    for (const concept of bank.concepts.filter(
      (node) => node.kind === "judgment" || node.kind === "event",
    ))
      expect(concept.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(bank.concepts.find((node) => node.id === "evt-adoption")?.kind).toBe(
      "foundation",
    );
    expect(
      bank.concepts.find((node) => node.id === "citizenship-act")?.typeLabel,
    ).toBe("Statute");
    expect(bank.concepts.find((node) => node.id === "caa-2026")?.date).toBe(
      "2026-08-19",
    );
    expect(
      bank.edges.every((edge) => edge.reviewStatus === "source-checked"),
    ).toBe(true);
  });

  it("projects only the listed records into a valid one-hop graph", () => {
    const source = sampleBank();
    expect(validateBank(source)).toEqual([]);
    const first = projectMap(source, "sample-map");
    const second = projectMap(source, "sample-map");
    expect(first).not.toBeNull();
    const release = first!;
    expect(validateGraph(release)).toEqual([]);
    expect(release.nodes.map((node) => node.id)).toEqual(
      source.maps[0].nodeIds,
    );
    expect(release.edges.map((item) => item.id)).toEqual(
      source.maps[0].edgeIds,
    );
    expect(release.edges.some((item) => item.id === "e-unlisted")).toBe(false);
    expect(release.sources.map((item) => item.id)).toEqual(["s1"]);
    expect(release.rootId).toBe("root");
    expect(release.display?.family).toBe("topic");
    expect(release.nodes.find((node) => node.id === "art-a")?.meaning).toBe(
      "art-a meaning",
    );
    expect(release.nodes.map((node) => node.position)).toEqual(
      second!.nodes.map((node) => node.position),
    );
    const keys = release.nodes.map(
      (node) => `${node.position.x},${node.position.y}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
    expect(
      release.nodes.every(
        (node) =>
          Number.isFinite(node.position.x) && Number.isFinite(node.position.y),
      ),
    ).toBe(true);
    const left = release.nodes.find((node) => node.id === "cat-a")!;
    const right = release.nodes.find((node) => node.id === "cat-b")!;
    expect(left.position.y).toBe(right.position.y);
    expect(Math.abs(left.position.x - right.position.x)).toBeGreaterThan(200);
    const article = release.nodes.find((node) => node.id === "art-a")!;
    const cross = release.nodes.find((node) => node.id === "cross")!;
    expect(cross.position.y).toBeGreaterThan(article.position.y);
    for (const region of teachingRegions(release)) {
      expect(
        [region.left, region.top, region.width, region.height].every((value) =>
          Number.isFinite(value),
        ),
      ).toBe(true);
      expect(region.width).toBeGreaterThan(0);
    }
    const lit = neighbours("art-a", release.edges);
    expect(lit.has("cat-a")).toBe(true);
    expect(lit.has("case-a")).toBe(true);
    expect(lit.has("cross")).toBe(true);
    expect(lit.has("root")).toBe(false);
    expect(lit.has("art-b")).toBe(false);
    for (const node of release.nodes)
      for (const other of release.nodes) {
        if (other.id === node.id) continue;
        const hops = distance(release, node.id, other.id);
        expect(neighbours(node.id, release.edges).has(other.id)).toBe(
          hops === 1,
        );
      }
  });

  it("validates every published map as content arrives", () => {
    for (const map of bank.maps) {
      const release = projectMap(bank, map.slug);
      expect(release).not.toBeNull();
      expect(validateGraph(release!)).toEqual([]);
      expect(release!.nodes.map((node) => node.id).sort()).toEqual(
        [...map.nodeIds].sort(),
      );
      expect(release!.edges.map((item) => item.id).sort()).toEqual(
        [...map.edgeIds].sort(),
      );
      for (const node of release!.nodes) {
        const canonical = bank.concepts.find((item) => item.id === node.id);
        expect(node.meaning).toBe(canonical?.meaning);
      }
      for (const node of release!.nodes)
        for (const other of release!.nodes) {
          if (other.id === node.id) continue;
          const hops = distance(release!, node.id, other.id);
          expect(neighbours(node.id, release!.edges).has(other.id)).toBe(
            hops === 1,
          );
        }
    }
  });

  it("rejects duplicate ids, dangling maps, unknown sources and a bad root", () => {
    const duplicateConcept = sampleBank();
    duplicateConcept.concepts.push(concept("root", "theme"));
    expect(validateBank(duplicateConcept).join(" ")).toMatch(
      /Duplicate concept root/,
    );

    const duplicateEdge = sampleBank();
    duplicateEdge.edges.push(edge("e-root-a", "root", "cat-b", "connection"));
    expect(validateBank(duplicateEdge).join(" ")).toMatch(
      /Duplicate edge e-root-a/,
    );

    const dangling = sampleBank();
    dangling.edges[0].target = "missing";
    expect(validateBank(dangling).join(" ")).toMatch(/Dangling edge e-root-a/);

    const unknown = sampleBank();
    unknown.concepts[0].sources = ["missing-source"];
    expect(validateBank(unknown).join(" ")).toMatch(/Unknown source on root/);

    const badRoot = sampleBank();
    badRoot.maps[0].rootId = "missing-root";
    expect(validateBank(badRoot).join(" ")).toMatch(/Invalid root sample-map/);

    const outside = sampleBank();
    outside.maps[0].nodeIds = outside.maps[0].nodeIds.filter(
      (id) => id !== "case-a",
    );
    expect(validateBank(outside).join(" ")).toMatch(
      /Edge endpoint outside map sample-map:e-art-case/,
    );

    const danglingNode = sampleBank();
    danglingNode.maps[0].nodeIds.push("not-in-bank");
    expect(validateBank(danglingNode).join(" ")).toMatch(
      /Dangling map node sample-map:not-in-bank/,
    );

    const empty = sampleBank();
    empty.concepts[3].bullets = [];
    empty.edges[4].explanation = " ";
    expect(validateBank(empty).join(" ")).toMatch(/Incomplete concept art-a/);
    expect(validateBank(empty).join(" ")).toMatch(
      /Unsupported edge e-art-case/,
    );
  });

  it("keeps the Fundamental Rights regions finite and leaves empty ones out", () => {
    const regions = teachingRegions(rightsGraph);
    expect(regions.map((region) => region.id).sort()).toEqual(
      [
        "historical",
        "right-cultural",
        "right-equality",
        "right-exploitation",
        "right-freedom",
        "right-religion",
        "right-remedies",
        "supporting",
      ].sort(),
    );
    expect(
      regions.every(
        (region) =>
          Number.isFinite(region.left) &&
          Number.isFinite(region.top) &&
          region.width > 0 &&
          region.height > 0,
      ),
    ).toBe(true);
    const lonely: GraphRelease = {
      ...rightsGraph,
      nodes: [rightsGraph.nodes.find((node) => node.id === "fr")!],
      edges: [],
      display: { family: "rights" },
    };
    expect(teachingRegions(lonely)).toEqual([]);
  });
});
