import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { catalog, validateCatalog } from "../content/catalog";
import { PolityOverview } from "../components/PolityOverview";
import { RouteNotice } from "../routing/RouteScreen";

export function OverviewScreen({
  topicId,
  themeId,
  onNavigate,
}: {
  topicId?: string;
  themeId?: string;
  onNavigate: (path: string) => void;
}) {
  let failure = "";
  try {
    const errors = validateCatalog();
    if (errors.length) failure = errors.join("; ");
  } catch (reason) {
    failure = reason instanceof Error ? reason.message : String(reason);
  }
  useEffect(() => {
    if (failure) console.error(new Error(failure));
  }, [failure]);
  if (failure)
    return (
      <RouteNotice
        title="Syllabus map unavailable"
        onLibrary={() => onNavigate("")}
        onReload={() => location.reload()}
      />
    );
  if (
    topicId &&
    topicId !== "prelims-context" &&
    !catalog.topics.some((topic) => topic.id === topicId)
  )
    return (
      <main className="loading">
        <h1>Topic not found</h1>
        <button onClick={() => onNavigate("gs2/polity")}>Back to Polity</button>
      </main>
    );
  return (
    <ReactFlowProvider key={topicId || "overview"}>
      <PolityOverview
        topicId={topicId}
        themeId={themeId}
        onNavigate={onNavigate}
      />
    </ReactFlowProvider>
  );
}
