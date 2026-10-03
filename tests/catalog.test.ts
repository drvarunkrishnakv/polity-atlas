import { describe, it, expect } from "vitest";
import {
  catalog,
  validateCatalog,
  topicThemes,
} from "../apps/web/src/content/catalog";
import graph from "../apps/web/src/content/fundamental-rights.json";

describe("Polity syllabus coverage", () => {
  it("retains all nine syllabus bullets and every imported theme identity", () => {
    expect(validateCatalog()).toEqual([]);
    expect(catalog.topics.map((t) => t.syllabusId)).toEqual(
      Array.from({ length: 9 }, (_, i) => `syllabus:cse2026:GS2:0${i + 1}`),
    );
    expect(catalog.themes.filter((t) => t.subject === "Polity")).toHaveLength(
      139,
    );
    expect(catalog.themes.filter((t) => t.subject !== "Polity")).toHaveLength(
      15,
    );
    expect(
      catalog.themes.every((t) => /^microtheme:[a-f0-9]{24}$/.test(t.id)),
    ).toBe(true);
  });
  it("reconciles unique theme counts without adding overlapping topic totals", () => {
    const polity = catalog.themes.filter((t) => t.subject === "Polity");
    expect(polity.reduce((n, t) => n + t.mains, 0)).toBe(118);
    expect(polity.reduce((n, t) => n + t.prelims, 0)).toBe(210);
    expect(catalog.themes.reduce((n, t) => n + t.flaggedRows, 0)).toBe(3);
    for (const topic of catalog.topics) {
      const themes = topicThemes(topic.id);
      expect(new Set(themes.map((t) => t.id)).size).toBe(themes.length);
      expect(themes.length).toBeGreaterThan(0);
    }
  });
  it("distinguishes editorial placement and keeps Prelims context outside Mains bullets", () => {
    const duties = catalog.themes.find(
      (t) => t.title === "Fundamental Duties",
    )!;
    expect(duties.links.find((l) => l.topicId === "constitution")?.type).toBe(
      "editorial-placement",
    );
    const rights = catalog.themes.find(
      (t) => t.id === graph.syllabus.microthemeId,
    )!;
    expect(rights.links.find((l) => l.topicId === "constitution")?.type).toBe(
      "register-tag",
    );
    expect(
      topicThemes("prelims-context")
        .map((t) => t.title)
        .sort(),
    ).toEqual(["National symbols", "Political thought"]);
    expect(
      topicThemes("prelims-context").every((t) => t.links.length === 0),
    ).toBe(true);
  });
  it("only exposes an existing study destination and never publishes source passages", () => {
    expect(catalog.themes.filter((t) => t.studyRoute).map((t) => t.id)).toEqual(
      [graph.syllabus.microthemeId],
    );
    const json = JSON.stringify(catalog);
    expect(json).not.toMatch(/"(?:question|answer|source_path|record_ids)":/);
    expect(json).not.toMatch(/data\/|\/Users\/|\/Volumes\//);
  });
  it("rejects missing homes, unsupported mappings and fictitious study destinations", () => {
    const broken = structuredClone(catalog);
    broken.themes[0].homeTopicId = "missing";
    broken.themes[0].links[0].sourceIds = [];
    broken.themes[0].studyRoute = "not-built";
    expect(
      validateCatalog(broken).some((e) => e.startsWith("Missing home")),
    ).toBe(true);
    expect(
      validateCatalog(broken).some((e) => e.startsWith("Invalid mapping")),
    ).toBe(true);
    expect(
      validateCatalog(broken).some((e) => e.startsWith("Unbuilt destination")),
    ).toBe(true);
  });
});
