import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { bundledRepository } from "./content/repository";
import type { GraphRelease } from "./content/types";
import { validateGraph } from "./graph/explore";
import { GraphCanvas } from "./components/GraphCanvas";
import { PolityOverview } from "./components/PolityOverview";
import { catalog, validateCatalog } from "./content/catalog";
import { Library } from "./components/Library";
export function App() {
  const [route, setRoute] = useState(location.hash.slice(2));
  const [graph, setGraph] = useState<GraphRelease | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    bundledRepository
      .load()
      .then((g) => {
        const errors = [...validateGraph(g), ...validateCatalog()];
        if (errors.length) throw Error(errors.join("; "));
        setGraph(g);
      })
      .catch((e) => setError(String(e)));
    const change = () => setRoute(location.hash.slice(2));
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const navigate = (path: string) => {
    location.hash = "/" + path;
  };
  if (error)
    return (
      <main className="loading">
        <h1>Study map unavailable</h1>
        <p>The content could not be loaded. Reload to try again.</p>
      </main>
    );
  if (!graph) return <main className="loading">Loading your atlas…</main>;
  const [path, query] = route.split("?");
  const params = new URLSearchParams(query);
  if (
    path === "gs2/polity/fundamental-rights" ||
    (path === "gs2/polity" && params.has("node"))
  )
    return (
      <ReactFlowProvider>
        <GraphCanvas graph={graph} onNavigate={navigate} />
      </ReactFlowProvider>
    );
  if (path === "gs2/polity" || path.startsWith("gs2/polity/topics/")) {
    const topicId = path.split("/")[3];
    if (
      topicId &&
      topicId !== "prelims-context" &&
      !catalog.topics.some((t) => t.id === topicId)
    )
      return (
        <main className="loading">
          <h1>Topic not found</h1>
          <button onClick={() => navigate("gs2/polity")}>Back to Polity</button>
        </main>
      );
    return (
      <ReactFlowProvider key={topicId || "overview"}>
        <PolityOverview
          topicId={topicId}
          themeId={params.get("theme") || undefined}
          onNavigate={navigate}
        />
      </ReactFlowProvider>
    );
  }
  return <Library subject={path === "gs2"} onNavigate={navigate} />;
}
