import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { GraphRelease } from "../content/types";
import {
  projectMap,
  validateBank,
  type FoundationBank,
} from "../content/foundations";
import { validateGraph } from "../graph/explore";
import { GraphCanvas } from "../components/GraphCanvas";
import { RouteNotice } from "../routing/RouteScreen";

type State =
  | { slug: string; status: "ready"; graph: GraphRelease }
  | { slug: string; status: "missing" }
  | { slug: string; status: "error" };

export function FoundationScreen({
  slug,
  onNavigate,
}: {
  slug: string;
  onNavigate: (path: string) => void;
}) {
  const [state, setState] = useState<State | null>(null);
  useEffect(() => {
    let active = true;
    const requested = slug;
    import("../content/foundations.json")
      .then((module) => {
        if (!active) return;
        const bank = module.default as FoundationBank;
        const errors = validateBank(bank);
        if (errors.length) throw new Error(errors.join("; "));
        const graph = projectMap(bank, requested);
        if (!graph) {
          setState({ slug: requested, status: "missing" });
          return;
        }
        const graphErrors = validateGraph(graph);
        if (graphErrors.length) throw new Error(graphErrors.join("; "));
        setState({ slug: requested, status: "ready", graph });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        console.error(reason);
        setState({ slug: requested, status: "error" });
      });
    return () => {
      active = false;
    };
  }, [slug]);
  const current = state?.slug === slug ? state : null;
  if (!current) return <RouteNotice busy onLibrary={() => onNavigate("")} />;
  if (current.status === "error")
    return (
      <RouteNotice
        title="Study map unavailable"
        onLibrary={() => onNavigate("")}
        onReload={() => location.reload()}
      />
    );
  if (current.status === "missing")
    return (
      <main className="loading" role="alert">
        <h1>Study map unavailable</h1>
        <p className="route-error-detail">
          This study map is not in the reviewed release.
        </p>
        <div className="route-actions">
          <button onClick={() => onNavigate("gs2/polity/topics/constitution")}>
            Back to Constitution
          </button>
          <button onClick={() => onNavigate("")}>Back to library</button>
        </div>
      </main>
    );
  return (
    <ReactFlowProvider key={slug}>
      <GraphCanvas
        key={slug}
        graph={current.graph}
        studyPath={`gs2/polity/study/${slug}`}
        onNavigate={onNavigate}
      />
    </ReactFlowProvider>
  );
}
