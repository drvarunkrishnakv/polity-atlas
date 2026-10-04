import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { bundledRepository } from "../content/repository";
import type { GraphRelease } from "../content/types";
import { validateGraph } from "../graph/explore";
import { GraphCanvas } from "../components/GraphCanvas";
import { RouteNotice } from "../routing/RouteScreen";

export function StudyScreen({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const [graph, setGraph] = useState<GraphRelease | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    bundledRepository
      .load()
      .then((release) => {
        if (!active) return;
        const errors = validateGraph(release);
        if (errors.length) throw new Error(errors.join("; "));
        setGraph(release);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const message =
          reason instanceof Error ? reason.message : String(reason);
        console.error(reason);
        setError(message);
      });
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <RouteNotice
        title="Study map unavailable"
        onLibrary={() => onNavigate("")}
        onReload={() => location.reload()}
      />
    );
  if (!graph) return <RouteNotice busy onLibrary={() => onNavigate("")} />;
  return (
    <ReactFlowProvider>
      <GraphCanvas
        graph={graph}
        studyPath="gs2/polity/fundamental-rights"
        onNavigate={onNavigate}
      />
    </ReactFlowProvider>
  );
}
