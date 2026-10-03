import data from "./polity-catalog.json";
export interface SyllabusTopic {
  id: string;
  syllabusId: string;
  ordinal: number;
  title: string;
  meaning: string;
  outline: string[];
  sourceId: string;
  locator: string;
  status: string;
}
export interface ThemeMapping {
  topicId: string;
  type: "register-tag" | "editorial-placement";
  explanation: string;
  sourceIds: string[];
}
export interface CatalogTheme {
  id: string;
  title: string;
  subject: string;
  homeTopicId: string;
  links: ThemeMapping[];
  mains: number;
  prelims: number;
  years: number[];
  flaggedRows: number;
  status: "study-example" | "outline-only";
  studyRoute?: string;
  sourceId: string;
}
export const catalog = data as Omit<typeof data, "themes"> & {
  themes: CatalogTheme[];
};
export const contextTopic = {
  id: "prelims-context",
  title: "Prelims context",
  meaning: "Supporting concepts outside the nine Mains bullets",
  outline: [
    "Keep supporting political concepts available for recall.",
    "These are not additional official Mains syllabus bullets.",
  ],
};
export const topicThemes = (id: string) =>
  catalog.themes.filter(
    (t) => t.homeTopicId === id || t.links.some((l) => l.topicId === id),
  );
export function validateCatalog(release: typeof catalog = catalog) {
  const errors: string[] = [];
  const topics = new Set(release.topics.map((t) => t.id));
  const sources = new Set(release.sources.map((s) => s.id));
  const ids = new Set<string>();
  if (
    topics.size !== 9 ||
    new Set(release.topics.map((t) => t.syllabusId)).size !== 9
  )
    errors.push("Nine distinct syllabus topics required");
  for (const t of release.themes) {
    if (ids.has(t.id)) errors.push(`Duplicate theme ${t.id}`);
    ids.add(t.id);
    if (!topics.has(t.homeTopicId) && t.homeTopicId !== "prelims-context")
      errors.push(`Missing home ${t.id}`);
    if (!sources.has(t.sourceId)) errors.push(`Missing source ${t.id}`);
    if (
      t.homeTopicId !== "prelims-context" &&
      !t.links.some((l) => l.topicId === t.homeTopicId)
    )
      errors.push(`Home must have an explained mapping ${t.id}`);
    if (new Set(t.links.map((l) => l.topicId)).size !== t.links.length)
      errors.push(`Duplicate mapping ${t.id}`);
    for (const l of t.links)
      if (
        !topics.has(l.topicId) ||
        !l.explanation ||
        !l.sourceIds.length ||
        l.sourceIds.some((id) => !sources.has(id))
      )
        errors.push(`Invalid mapping ${t.id}`);
    if (t.status === "outline-only" && t.studyRoute)
      errors.push(`Unbuilt destination ${t.id}`);
    if (
      t.status === "study-example" &&
      t.studyRoute !== "gs2/polity/fundamental-rights"
    )
      errors.push(`Unknown study route ${t.id}`);
    if (
      ![t.mains, t.prelims, t.flaggedRows].every(
        (n) => Number.isInteger(n) && n >= 0,
      )
    )
      errors.push(`Invalid counts ${t.id}`);
  }
  return errors;
}
