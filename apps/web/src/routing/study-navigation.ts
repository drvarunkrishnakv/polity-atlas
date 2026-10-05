import data from "../content/study-navigation.json";
export const studyMaps = data.maps;
/** Migrate combined-canvas bookmarks without loading any study content. */
export function studyBookmark(
  path: string,
  params: URLSearchParams,
): string | null {
  if (!path.startsWith("gs2/polity/topics/")) return null;
  const theme = studyMaps.find((m) =>
    m.microthemeIds.includes(params.get("theme") ?? ""),
  );
  const focus =
    path === "gs2/polity/topics/constitution"
      ? studyMaps.find((m) => m.slug === params.get("focus"))
      : undefined;
  const node = params.get("node");
  const requested = theme ?? focus;
  const target =
    node && path === "gs2/polity/topics/constitution"
      ? ((requested?.nodeIds.includes(node)
          ? requested
          : studyMaps.find((m) => m.nodeIds.includes(node))) ?? requested)
      : requested;
  if (!target) return null;
  return (
    target.route +
    (node && target.nodeIds.includes(node)
      ? `?node=${encodeURIComponent(node)}`
      : "")
  );
}
