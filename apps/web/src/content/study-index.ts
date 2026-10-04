import data from "./study-index.json";

/** Small overview metadata. One map may alias several canonical microtheme IDs. */
export interface StudyIndexEntry {
  slug: string;
  title: string;
  microthemeIds: string[];
}
export interface StudyIndex {
  schemaVersion: number;
  maps: StudyIndexEntry[];
}
export const studyIndex = data as StudyIndex;
export const studyRoute = (slug: string) => `gs2/polity/study/${slug}`;
export function studyForTheme(id: string) {
  const map = studyIndex.maps.find((entry) => entry.microthemeIds.includes(id));
  if (!map) return undefined;
  return { ...map, route: studyRoute(map.slug) };
}
export function validateStudyIndex(index: StudyIndex = studyIndex): string[] {
  const errors: string[] = [];
  if (index.schemaVersion !== 1) errors.push("Unsupported study index");
  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const map of index.maps) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(map.slug))
      errors.push(`Invalid slug ${map.slug}`);
    if (slugs.has(map.slug)) errors.push(`Duplicate slug ${map.slug}`);
    slugs.add(map.slug);
    if (!map.title?.trim()) errors.push(`Missing title ${map.slug}`);
    if (!map.microthemeIds?.length) errors.push(`Missing themes ${map.slug}`);
    for (const id of map.microthemeIds ?? []) {
      if (ids.has(id)) errors.push(`Duplicate theme route ${id}`);
      ids.add(id);
      if (!/^microtheme:[a-f0-9]{24}$/.test(id))
        errors.push(`Invalid theme id ${id}`);
    }
  }
  return errors;
}
