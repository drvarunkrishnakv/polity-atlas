import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
  type NodeProps,
  type Node,
  type Edge,
} from "@xyflow/react";
import {
  MagnifyingGlass,
  Plus,
  Minus,
  CornersOut,
  ArrowCounterClockwise,
  List,
  X,
  BookOpen,
} from "@phosphor-icons/react";
import type { Concept, GraphRelease } from "../content/types";
import { expand, neighbours } from "../graph/explore";
import { Inspector } from "./Inspector";
import "@xyflow/react/dist/style.css";
type ConceptNode = Node<
  {
    concept: Concept;
    active: boolean;
    dimmed: boolean;
    onSelect: (id: string) => void;
  },
  "concept"
>;
function ConceptCard({ data }: NodeProps<ConceptNode>) {
  const { concept, active, dimmed } = data;
  return (
    <div
      className={`concept-card ${active ? "active" : ""} ${dimmed ? "dimmed" : ""} kind-${concept.kind}`}
      data-concept={concept.id}
      role="button"
      tabIndex={0}
      aria-label={`${concept.title}: ${concept.meaning}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          data.onSelect(concept.id);
        }
      }}
    >
      {[Position.Left, Position.Right, Position.Top, Position.Bottom].map(
        (p) => (
          <Handle key={"t" + p} id={"t" + p} type="target" position={p} />
        ),
      )}
      <span className="category-dot" />
      <div>
        <strong>{concept.title}</strong>
        <span className="node-meaning">{concept.meaning}</span>
      </div>
      {[Position.Left, Position.Right, Position.Top, Position.Bottom].map(
        (p) => (
          <Handle key={"s" + p} id={"s" + p} type="source" position={p} />
        ),
      )}
    </div>
  );
}
const nodeTypes = { concept: ConceptCard };
const categories = [
  ["foundation", "Foundation"],
  ["article", "Rights"],
  ["judgment", "Judgments"],
  ["application", "Connections"],
  ["event", "Current affairs"],
];
export function GraphCanvas({
  graph,
  onNavigate,
}: {
  graph: GraphRelease;
  onNavigate: (path: string) => void;
}) {
  const initialId = new URLSearchParams(location.hash.split("?")[1]).get(
    "node",
  );
  const validInitial = graph.nodes.some((n) => n.id === initialId)
    ? initialId!
    : "fr";
  const [selected, setSelected] = useState<string | null>(validInitial);
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(() => [
    ...new Set([...graph.initialIds, validInitial]),
  ]);
  const [query, setQuery] = useState("");
  const [indexOpen, setIndexOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [focusVersion, setFocusVersion] = useState(0);
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow<ConceptNode>();
  const active = hovered || selected;
  const lit = useMemo(
    () => (active ? neighbours(active, graph.edges) : new Set<string>()),
    [active, graph.edges],
  );
  const select = useCallback(
    (id: string, center = true) => {
      setSelected(id);
      setHovered(null);
      setDetailsOpen(true);
      setQuery("");
      setIndexOpen(false);
      setVisible((v) => (v.includes(id) ? v : [...v, id]));
      history.replaceState(
        null,
        "",
        `#/gs2/polity?node=${encodeURIComponent(id)}`,
      );
      if (center) {
        const n = graph.nodes.find((n) => n.id === id)!;
        setTimeout(
          () =>
            setCenter(n.position.x + 105, n.position.y + 30, {
              zoom: 1,
              duration: 240,
            }),
          50,
        );
      }
    },
    [graph.nodes, setCenter],
  );
  const reset = () => {
    setVisible(graph.initialIds);
    setSelected("fr");
    setHovered(null);
    setQuery("");
    setIndexOpen(false);
    setDetailsOpen(true);
    setFocusVersion((v) => v + 1);
    history.replaceState(null, "", "#/gs2/polity");
  };
  useEffect(() => {
    const t = setTimeout(() => {
      if (innerWidth <= 1100) {
        const n = graph.nodes.find((n) => n.id === (selected || "fr"))!;
        setCenter(n.position.x + 102, n.position.y + 29, {
          zoom: 0.85,
          duration: 180,
        });
      } else fitView({ padding: 0.12, maxZoom: 1.15, duration: 180 });
    }, 70);
    return () => clearTimeout(t);
  }, [focusVersion, fitView]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHovered(null);
        setQuery("");
        setIndexOpen(false);
        setSelected(null);
        setDetailsOpen(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const nodes: ConceptNode[] = graph.nodes
    .filter((n) => visible.includes(n.id))
    .map((concept) => ({
      id: concept.id,
      type: "concept",
      position: concept.position,
      data: {
        concept,
        active: active === concept.id,
        dimmed: !!active && !lit.has(concept.id),
        onSelect: (id) => select(id, false),
      },
      ariaLabel: `${concept.title}: ${concept.meaning}`,
      draggable: false,
      selected: selected === concept.id,
    }));
  const edges: Edge[] = graph.edges
    .filter((e) => visible.includes(e.source) && visible.includes(e.target))
    .map((e) => {
      const highlighted =
        !!active && (e.source === active || e.target === active);
      const from = graph.nodes.find((n) => n.id === e.source)!.position;
      const to = graph.nodes.find((n) => n.id === e.target)!.position;
      const dx = to.x - from.x,
        dy = to.y - from.y;
      const vertical = Math.abs(dx) < 140;
      return {
        ...e,
        label: undefined,
        sourceHandle:
          "s" +
          (vertical ? (dy > 0 ? "bottom" : "top") : dx > 0 ? "right" : "left"),
        targetHandle:
          "t" +
          (vertical ? (dy > 0 ? "top" : "bottom") : dx > 0 ? "left" : "right"),
        type: "default",
        style: {
          stroke: highlighted ? "#b7c9de" : "#34424f",
          strokeWidth: highlighted ? 1.8 : 1.1,
          opacity: active && !highlighted ? 0.2 : 0.9,
          strokeDasharray:
            e.classification === "analytical" ? "5 5" : undefined,
        },
        ariaLabel: `${e.label}: ${e.explanation}`,
        interactionWidth: 20,
        data: { explanation: e.explanation },
      };
    });
  const inspected = graph.nodes.find(
    (n) => n.id === (selected || hovered || "fr"),
  )!;
  const matches = graph.nodes.filter((n) =>
    (n.title + " " + n.meaning + " " + n.bullets.join(" "))
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const hiddenCount = [...neighbours(inspected.id, graph.edges)].filter(
    (id) => !visible.includes(id),
  ).length;
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => onNavigate("")}>
          Polity Atlas
        </button>
        <span className="header-divider" />
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button onClick={() => onNavigate("gs2")}>GS II</button>
          <span>/</span>
          <span>Polity</span>
        </nav>
        <div className="header-actions">
          <div className="search-wrap">
            <MagnifyingGlass size={19} />
            <input
              aria-label="Search concepts"
              placeholder="Search articles, cases, ideas…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim() && matches.length)
                  select(matches[0].id);
              }}
            />
            {query && (
              <button
                className="clear-search"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </button>
            )}
            {query.trim() && (
              <div
                className="search-results"
                role="region"
                aria-label="Search results"
              >
                {matches.length ? (
                  matches.map((n) => (
                    <button key={n.id} onClick={() => select(n.id)}>
                      <strong>{n.title}</strong>
                      <small>{n.meaning}</small>
                    </button>
                  ))
                ) : (
                  <p>No matching concepts. Try “privacy” or “Article 21”.</p>
                )}
              </div>
            )}
          </div>
          <span className="depth-label">Direct links</span>
          <button aria-label="Reset" className="reset-button" onClick={reset}>
            <ArrowCounterClockwise size={17} />
            <span>Reset</span>
          </button>
        </div>
      </header>
      <div className={`workspace ${detailsOpen ? "details-open" : ""}`}>
        <main
          className="canvas-area"
          aria-label="Fundamental Rights knowledge graph"
        >
          <div className="canvas-toolbar">
            <div className="legend">
              {categories.map(([kind, title]) => (
                <span key={kind} className={`legend-item kind-${kind}`}>
                  <span className="category-dot" />
                  {title}
                </span>
              ))}
            </div>
            <button
              aria-label="Topic index"
              className="index-toggle"
              aria-expanded={indexOpen}
              onClick={() => setIndexOpen((v) => !v)}
            >
              <List size={17} />
              <span>Topic index</span>
            </button>
          </div>
          <div className="canvas-heading">
            <span className="eyebrow">Indian Constitution</span>
            <span>
              Fundamental Rights <small>· Part III</small>
            </span>
          </div>
          {indexOpen && (
            <div className="topic-index">
              <div className="section-heading">
                <h2>Fundamental Rights</h2>
                <button
                  className="icon-button"
                  aria-label="Close index"
                  onClick={() => setIndexOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <p>Part III provisions and selected connections</p>
              {graph.nodes
                .filter((n) => n.id !== "constitution")
                .map((n) => (
                  <button key={n.id} onClick={() => select(n.id)}>
                    <strong>{n.title}</strong>
                    <small>{n.meaning}</small>
                  </button>
                ))}
            </div>
          )}
          <div className="graph-viewport">
            <ReactFlow<ConceptNode>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.12, maxZoom: 1.15 }}
              minZoom={0.2}
              maxZoom={1.8}
              nodesConnectable={false}
              nodesFocusable={false}
              nodesDraggable={false}
              elementsSelectable
              onNodeClick={(_, n) => select(n.id, false)}
              onNodeMouseEnter={(_, n) => {
                if (matchMedia("(hover: hover)").matches) setHovered(n.id);
              }}
              onNodeMouseLeave={() => setHovered(null)}
              onPaneClick={() => setHovered(null)}
              onEdgeClick={(_, e) => {
                const edge = graph.edges.find((x) => x.id === e.id)!;
                select(edge.source, false);
              }}
              onNodeDragStart={() => setHovered(null)}
              zoomOnDoubleClick={false}
              colorMode="dark"
            >
              <Background
                variant={BackgroundVariant.Lines}
                gap={32}
                color="#121c24"
                lineWidth={0.5}
              />
            </ReactFlow>
          </div>
          <div className="canvas-footer">
            <span className="desktop-hint">
              Hover to trace · Click to inspect · Scroll to zoom · Drag to pan
            </span>
            <span className="mobile-hint">
              Tap a concept to inspect · Pinch to zoom
            </span>
            <div className="zoom-controls">
              <button
                aria-label="Zoom out"
                onClick={() => zoomOut({ duration: 180 })}
              >
                <Minus size={18} />
              </button>
              <button
                aria-label="Zoom in"
                onClick={() => zoomIn({ duration: 180 })}
              >
                <Plus size={18} />
              </button>
              <button
                aria-label="Fit graph"
                onClick={() =>
                  fitView({ padding: 0.15, duration: 250, maxZoom: 1.15 })
                }
              >
                <CornersOut size={18} />
              </button>
            </div>
          </div>
          {!detailsOpen && (
            <button
              className="reopen-details"
              onClick={() => {
                setSelected(selected || "fr");
                setDetailsOpen(true);
              }}
            >
              <BookOpen size={17} /> Show details
            </button>
          )}
        </main>
        {detailsOpen && (
          <Inspector
            concept={inspected}
            graph={graph}
            onSelect={select}
            hiddenCount={hiddenCount}
            onExpand={() => {
              setVisible((v) => expand(inspected.id, v, graph.edges));
              setFocusVersion((v) => v + 1);
            }}
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
