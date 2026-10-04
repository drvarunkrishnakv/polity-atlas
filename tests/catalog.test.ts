import { describe, it, expect } from "vitest";
import {
  catalog,
  coverageLine,
  homeAndRelated,
  validateCatalog,
  topicThemes,
} from "../apps/web/src/content/catalog";
import {
  studyForTheme,
  validateStudyIndex,
} from "../apps/web/src/content/study-index";
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
  it("only exposes reviewed study destinations and never publishes source passages", () => {
    expect(validateStudyIndex()).toEqual([]);
    const routed = catalog.themes.filter((t) => t.studyRoute);
    expect(routed.find((t) => t.status === "study-example")?.id).toBe(
      graph.syllabus.microthemeId,
    );
    for (const theme of routed) {
      if (theme.status === "study-example") {
        expect(theme.studyRoute).toBe("gs2/polity/fundamental-rights");
        expect(theme.id).toBe(graph.syllabus.microthemeId);
        continue;
      }
      expect(theme.status).toBe("study-map");
      expect(studyForTheme(theme.id)?.route).toBe(theme.studyRoute);
    }
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
    const unreviewed = structuredClone(catalog);
    unreviewed.themes[1].status = "study-map";
    unreviewed.themes[1].studyRoute = "gs2/polity/study/not-reviewed";
    expect(
      validateCatalog(unreviewed).some((e) =>
        e.startsWith("Unreviewed study map"),
      ),
    ).toBe(true);
  });
  it("counts constitution home and related themes from metadata", () => {
    const { themes, home, related, studied } = homeAndRelated("constitution");
    expect(themes).toHaveLength(49);
    expect(home).toHaveLength(38);
    expect(related).toHaveLength(11);
    expect(home.length + related.length).toBe(themes.length);
    expect(studied.every((theme) => theme.homeTopicId === "constitution")).toBe(
      true,
    );
    expect(coverageLine("constitution")).toBe(
      `${studied.length} of 38 home themes have study maps; 11 related themes`,
    );
    expect(catalog.themes).toHaveLength(154);
    expect(studied.length).toBeLessThan(154);
    for (const topic of catalog.topics) {
      if (topic.id === "constitution") continue;
      for (const theme of topicThemes(topic.id)) {
        if (theme.status === "study-example" || theme.status === "study-map")
          continue;
        expect(theme.status).toBe("outline-only");
      }
    }
  });
});
