import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../theme/ThemeProvider";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  ViewportPortal,
  useNodesInitialized,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
  type NodeProps,
  type Node,
  type Edge,
  type OnNodesChange,
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
import { neighbours } from "../graph/explore";
import { cardWidth, kindStyle, teachingRegions } from "../graph/presentation";
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
      <div className="card-copy">
        <span className="node-type">
          {kindStyle[concept.kind].label}
          {concept.groupId === "historical" ? " · omitted" : ""}
          {concept.kind === "event" && concept.date
            ? ` · ${concept.date.slice(0, 4)}`
            : ""}
        </span>
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
  ["category", "Rights categories"],
  ["article", "Articles"],
  ["judgment", "Judgments"],
  ["application", "Concepts / uses"],
  ["event", "Current affairs"],
  ["foundation", "Context"],
];
export function GraphCanvas({
  graph,
  onNavigate,
}: {
  graph: GraphRelease;
  onNavigate: (path: string) => void;
}) {
  const { theme } = useTheme();
  const initialId = new URLSearchParams(location.hash.split("?")[1]).get(
    "node",
  );
  const validInitial = graph.nodes.some((n) => n.id === initialId)
    ? initialId!
    : "fr";
  const [selected, setSelected] = useState<string | null>(validInitial);
  const [hovered, setHovered] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<
    Record<string, NonNullable<ConceptNode["measured"]>>
  >({});
  // Controlled nodes must retain React Flow's measured dimensions. Dropping
  // them on hover hides the cards for remeasurement and interrupts pointer entry.
  const onNodesChange = useCallback<OnNodesChange<ConceptNode>>((changes) => {
    setMeasurements((current) => {
      let next = current;
      for (const change of changes) {
        if (change.type !== "dimensions" || !change.dimensions) continue;
        const previous = current[change.id];
        const { width, height } = change.dimensions;
        if (previous?.width === width && previous?.height === height) continue;
        if (next === current) next = { ...current };
        next[change.id] = { width, height };
      }
      return next;
    });
  }, []);
  const [query, setQuery] = useState("");
  const [indexOpen, setIndexOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [focusVersion, setFocusVersion] = useState(0);
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow<ConceptNode>();
  const initialized = useNodesInitialized();
  const regions = useMemo(() => teachingRegions(graph), [graph]);
  const focusConcept = useCallback(
    (id: string) => {
      const n = graph.nodes.find((n) => n.id === id)!;
      if (n.kind === "category" || (n.kind === "theme" && innerWidth > 700)) {
        const children = graph.edges
          .filter((e) => e.source === id && e.role === "structure")
          .map((e) => ({ id: e.target }));
        fitView({
          nodes: [{ id }, ...children],
          padding: 0.22,
          maxZoom: 1,
          duration: 240,
        });
      } else {
        setCenter(n.position.x + cardWidth(n) / 2, n.position.y + 46, {
          zoom: innerWidth <= 700 ? 0.85 : 1,
          duration: 240,
        });
      }
    },
    [graph, fitView, setCenter],
  );
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
      history.replaceState(
        null,
        "",
        `#/gs2/polity/fundamental-rights?node=${encodeURIComponent(id)}`,
      );
      if (center || graph.nodes.find((n) => n.id === id)?.kind === "category") {
        setTimeout(() => focusConcept(id), 50);
      }
    },
    [graph.nodes, focusConcept],
  );
  const reset = () => {
    setSelected("fr");
    setHovered(null);
    setQuery("");
    setIndexOpen(false);
    setDetailsOpen(true);
    setFocusVersion((v) => v + 1);
    history.replaceState(null, "", "#/gs2/polity/fundamental-rights");
  };
  useEffect(() => {
    if (!initialized) return;
    focusConcept(focusVersion ? "fr" : validInitial);
  }, [initialized, focusVersion, focusConcept]);
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
  const nodes: ConceptNode[] = graph.nodes.map((concept) => ({
    id: concept.id,
    type: "concept",
    position: concept.position,
    measured: measurements[concept.id],
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
  const edges: Edge[] = graph.edges.map((e) => {
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
        stroke: highlighted
          ? e.role === "structure"
            ? "var(--edge-structure-active)"
            : "var(--edge-active)"
          : e.role === "structure"
            ? "var(--edge-structure)"
            : "var(--edge)",
        strokeWidth: highlighted ? 2 : e.role === "structure" ? 1.5 : 1,
        opacity:
          active && !highlighted ? (e.role === "structure" ? 0.35 : 0.15) : 0.9,
        strokeDasharray: e.classification === "analytical" ? "5 5" : undefined,
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
          <button onClick={() => onNavigate("gs2/polity")}>Polity</button>
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
          <ThemeToggle />
          <span className="depth-label">Highlight: direct links</span>
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
              <small className="scope-status">
                6 rights categories · {graph.nodes.length} concepts ·{" "}
                {graph.edges.length} links on canvas
              </small>
            </span>
          </div>
          <div className="highlight-status" data-testid="highlight-status">
            {hovered ? "Hover preview" : "Highlighting"}:{" "}
            <strong>
              {graph.nodes.find((n) => n.id === active)?.title || "Whole theme"}
            </strong>
            {hovered && selected && hovered !== selected && (
              <small>
                Details pinned to{" "}
                {graph.nodes.find((n) => n.id === selected)?.title}
              </small>
            )}
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
              onNodesChange={onNodesChange}
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
              colorMode={theme}
            >
              <ViewportPortal>
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className="teaching-region"
                    data-region={region.id}
                    style={{
                      left: region.left,
                      top: region.top,
                      width: region.width,
                      height: region.height,
                    }}
                  >
                    <strong>{region.title}</strong>
                    <span>{region.note}</span>
                  </div>
                ))}
              </ViewportPortal>
              <MiniMap<ConceptNode>
                pannable
                zoomable
                ariaLabel="Theme overview — pan or zoom to explore the full canvas"
                nodeClassName={(node) => `kind-${node.data.concept.kind}`}
                nodeColor="var(--dot)"
                nodeStrokeColor="var(--minimap-stroke)"
                maskColor="var(--minimap-mask)"
              />
              <Background
                variant={BackgroundVariant.Lines}
                gap={32}
                color="var(--grid)"
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
            onFrameConnections={() => {
              const ids = neighbours(inspected.id, graph.edges);
              fitView({
                nodes: [...ids].map((id) => ({ id })),
                padding: 0.25,
                maxZoom: 1,
                duration: 250,
              });
            }}
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
