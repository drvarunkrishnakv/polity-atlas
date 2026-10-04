import { useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  CornersOut,
  X,
} from "@phosphor-icons/react";
import { graphFamily, graphRootId, kindLabel } from "../graph/presentation";
import type { Concept, GraphRelease } from "../content/types";
export function Inspector({
  concept,
  graph,
  onSelect,
  onFrameConnections,
  onClose,
}: {
  concept: Concept;
  graph: GraphRelease;
  onSelect: (id: string) => void;
  onFrameConnections: () => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.scrollTo({ top: 0 });
  }, [concept.id]);
  const family = graphFamily(graph);
  const rootId = graphRootId(graph);
  const allRelated = graph.edges.filter(
    (e) => e.source === concept.id || e.target === concept.id,
  );
  const isRightsRoot = family === "rights" && concept.kind === "theme";
  const organise =
    concept.id === rootId && (isRightsRoot || family === "topic");
  const structure = allRelated.filter((e) => e.role === "structure");
  const useStructure = isRightsRoot || (organise && structure.length > 0);
  const related = useStructure ? structure : allRelated;
  const contextLinks = useStructure
    ? allRelated.filter((e) => e.role !== "structure")
    : [];
  const pyqs = graph.pyqs.filter(
    (q) =>
      q.conceptId === concept.id ||
      (concept.id === rootId &&
        (!graph.display?.focusNodeIds ||
          graph.display.focusNodeIds.includes(q.conceptId))),
  );
  const connectionTitle = !organise
    ? "Direct connections"
    : family === "rights"
      ? "Six rights categories"
      : useStructure
        ? "Themes in this map"
        : "Direct connections";
  const connections = (
    <section>
      <div className="section-heading">
        <h2>{connectionTitle}</h2>
        <span>{related.length}</span>
      </div>
      <div className="connections">
        {related.map((e) => {
          const n = graph.nodes.find(
            (n) => n.id === (e.source === concept.id ? e.target : e.source),
          )!;
          return (
            <details key={e.id} className="connection">
              <summary>
                <button
                  onClick={(ev) => {
                    ev.preventDefault();
                    onSelect(n.id);
                  }}
                >
                  {e.source === concept.id ? (
                    <ArrowRight size={16} />
                  ) : (
                    <ArrowLeft size={16} />
                  )}
                  <span>
                    {n.title}
                    <small>
                      {e.target === concept.id
                        ? (
                            {
                              contains: "part of",
                              category: "category of",
                              "supporting provision": "constitutional context",
                              "historical provision": "historical part of",
                              "interpreted by": "interprets",
                              "applied in": "applies",
                              recognises: "recognised by",
                              directed: "directed by",
                            } as Record<string, string>
                          )[e.label] || e.label
                        : e.label}
                      {e.classification === "analytical" ? " · analytical" : ""}
                    </small>
                  </span>
                </button>
                <span className="why">Why?</span>
              </summary>
              <p>{e.explanation}</p>
              <p className="evidence">
                {e.evidence
                  .map((id) => graph.sources.find((s) => s.id === id)?.title)
                  .join(" · ")}
              </p>
            </details>
          );
        })}
      </div>
      {contextLinks.map((e) => {
        const n = graph.nodes.find(
          (n) => n.id === (e.source === concept.id ? e.target : e.source),
        )!;
        return (
          <div className="context-link" key={e.id}>
            <span>
              {family === "rights" ? "Constitutional context" : e.label}
            </span>
            <button onClick={() => onSelect(n.id)}>{n.title}</button>
            <p>{e.explanation}</p>
          </div>
        );
      })}
      <button
        className="frame-button"
        title="Move the view to these connections; all concepts stay on the canvas"
        onClick={onFrameConnections}
      >
        Frame connections
        <CornersOut size={17} />
      </button>
      <p className="muted source-note">
        All connections in this map are already on the canvas. Select a name to
        move to it.
      </p>
    </section>
  );
  return (
    <aside
      ref={panel}
      className="inspector"
      aria-label="Concept inspector"
      data-testid="inspector"
    >
      <div className="inspector-heading">
        <span className="eyebrow">Pinned details</span>
        <button
          className="icon-button close-inspector"
          aria-label="Close details"
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </div>
      <span className={`inspector-kind kind-${concept.kind}`}>
        {concept.typeLabel ?? kindLabel(concept.kind, family)}
      </span>
      <h1>{concept.title}</h1>
      <p className="meaning">{concept.meaning}</p>
      {concept.date && (
        <p className="date">
          {concept.date} ·{" "}
          {concept.kind === "event"
            ? "Dated example"
            : concept.kind === "judgment"
              ? "Judgment"
              : "Historical milestone"}
        </p>
      )}
      {isRightsRoot && (
        <p className="teaching-note">
          Start with a rights category, then follow its Articles. Judgments and
          applications connect across these groups.
        </p>
      )}
      {organise && family === "topic" && (
        <p className="teaching-note">
          Start with the organising themes, then follow Articles, judgments and
          applications. Cross-links stay on the canvas.
        </p>
      )}
      {organise && connections}
      <section>
        <h2>Quick recall</h2>
        <ul className="recall">
          {concept.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Mains connection</h2>
        <p className="mains">{concept.mains}</p>
        {concept.relationNote && (
          <p className="muted">{concept.relationNote}</p>
        )}
      </section>
      {!organise && connections}
      {pyqs.length > 0 && (
        <section>
          <h2>PYQ angles</h2>
          {pyqs.map((q) => (
            <button
              className="pyq"
              key={q.id}
              onClick={() => onSelect(q.conceptId)}
            >
              <span>{q.year}</span>
              <span className="pyq-angle">
                {q.stage
                  ? `${q.stage === "mains" ? "Mains" : "Prelims"} · `
                  : ""}
                {q.angle}
              </span>
            </button>
          ))}
          <p className="muted source-note">
            Paraphrased from your supplied PYQ register. These indicate question
            demand, not model answers.
          </p>
        </section>
      )}
      <section className="sources">
        <h2>Source notes</h2>
        {concept.fullTitle && <p className="full-title">{concept.fullTitle}</p>}
        {concept.sources.map((id) => {
          const s = graph.sources.find((s) => s.id === id)!;
          return (
            <div key={id}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                  <ArrowUpRight size={14} />
                </a>
              ) : (
                <p>{s.title}</p>
              )}
              <p className="muted">{concept.locator || s.locator}</p>
            </div>
          );
        })}
        {concept.status && <p className="muted">{concept.status}</p>}
        <p className="muted">
          Source checked {concept.reviewedOn}. Summaries are revision prompts;
          consult the cited text for detail.
        </p>
      </section>
    </aside>
  );
}
