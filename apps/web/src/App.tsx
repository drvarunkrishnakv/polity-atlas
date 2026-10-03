import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { bundledRepository } from "./content/repository";
import type { GraphRelease } from "./content/types";
import { validateGraph } from "./graph/explore";
import { GraphCanvas } from "./components/GraphCanvas";
import { Library } from "./components/Library";
export function App() {
  const [route, setRoute] = useState(location.hash.slice(2).split("?")[0]);
  const [graph, setGraph] = useState<GraphRelease | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    bundledRepository
      .load()
      .then((g) => {
        const errors = validateGraph(g);
        if (errors.length) throw Error(errors.join("; "));
        setGraph(g);
      })
      .catch((e) => setError(String(e)));
    const change = () => setRoute(location.hash.slice(2).split("?")[0]);
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
  if (route === "gs2/polity")
    return (
      <ReactFlowProvider>
        <GraphCanvas graph={graph} onNavigate={navigate} />
      </ReactFlowProvider>
    );
  return <Library subject={route === "gs2"} onNavigate={navigate} />;
}
