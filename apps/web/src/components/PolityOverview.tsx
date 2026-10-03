import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
  useNodesInitialized,
  type Node,
  type NodeProps,
  type OnNodesChange,
} from "@xyflow/react";
import {
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  CornersOut,
  Minus,
  Plus,
  X,
  BookOpen,
} from "@phosphor-icons/react";
import {
  catalog,
  contextTopic,
  topicThemes,
  type CatalogTheme,
} from "../content/catalog";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../theme/ThemeProvider";
import "@xyflow/react/dist/style.css";

type MapNode = Node<
  {
    title: string;
    meaning: string;
    label: string;
    active: boolean;
    dimmed: boolean;
    root: boolean;
    select: () => void;
  },
  "map"
>;
function MapCard({ data }: NodeProps<MapNode>) {
  return (
    <div
      className={`concept-card map-card ${data.root ? "kind-category" : "kind-application"} ${data.active ? "active" : ""} ${data.dimmed ? "dimmed" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={data.title}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          data.select();
        }
      }}
    >
      {[Position.Left, Position.Right].map((p) => (
        <Handle key={p + "target"} type="target" id={p} position={p} />
      ))}
      <span className="category-dot" />
      <div className="card-copy">
        <span className="node-type">{data.label}</span>
        <strong>{data.title}</strong>
        <span className="map-meaning">{data.meaning}</span>
      </div>
      {[Position.Left, Position.Right].map((p) => (
        <Handle key={p + "source"} type="source" id={p} position={p} />
      ))}
    </div>
  );
}
const nodeTypes = { map: MapCard };
const pathFor = (topic: string) => `gs2/polity/topics/${topic}`;
export function PolityOverview({
  topicId,
  themeId,
  onNavigate,
}: {
  topicId?: string;
  themeId?: string;
  onNavigate: (path: string) => void;
}) {
  const { theme } = useTheme();
  const topic =
    catalog.topics.find((t) => t.id === topicId) ||
    (topicId === contextTopic.id ? contextTopic : undefined);
  const themes = useMemo(() => (topic ? topicThemes(topic.id) : []), [topic]);
  const selectedTheme = themes.find((t) => t.id === themeId);
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [measurements, setMeasurements] = useState<
    Record<string, NonNullable<MapNode["measured"]>>
  >({});
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow<MapNode>();
  const initialized = useNodesInitialized();
  const selected = selectedTheme?.id || "root";
  const active = hovered || selected;
  const openTheme = (t: CatalogTheme) => {
    setQuery("");
    setHovered(null);
    setDetailsOpen(true);
    const home =
      topic && themes.some((x) => x.id === t.id) ? topic.id : t.homeTopicId;
    onNavigate(`${pathFor(home)}?theme=${encodeURIComponent(t.id)}`);
  };
  const select = (id: string) => {
    if (id === "root") {
      setDetailsOpen(true);
      if (topic) onNavigate(pathFor(topic.id));
      return;
    }
    if (topic) {
      const t = themes.find((t) => t.id === id);
      if (t) openTheme(t);
    } else onNavigate(pathFor(id));
  };
  const members = topic
    ? themes.map((t) => ({
        id: t.id,
        title: t.title,
        meaning: `${t.mains} Mains · ${t.prelims} Prelims${t.subject !== "Polity" ? ` · ${t.subject}` : ""}`,
        label:
          t.status === "study-example"
            ? "Study example available"
            : "PYQ theme · outline",
        editorial:
          t.links.find((l) => l.topicId === topic.id)?.type ===
          "editorial-placement",
      }))
    : catalog.topics.map((t) => ({
        id: t.id,
        title: t.title,
        meaning: t.meaning,
        label: `Syllabus topic ${t.ordinal.toString().padStart(2, "0")}`,
        editorial: false,
      }));
  const nodes: MapNode[] = [
    {
      id: "root",
      type: "map" as const,
      position: { x: 0, y: 0 },
      data: {
        title: topic?.title || "Polity",
        meaning:
          topic?.meaning || "Nine syllabus topics · a connected revision map",
        label:
          topic?.id === contextTopic.id
            ? "Prelims context"
            : topic
              ? "Syllabus topic"
              : "GS II · Subject",
        active: active === "root",
        dimmed: false,
        root: true,
        select: () => select("root"),
      },
    },
    ...members.map((m, i): MapNode => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const rows = Math.ceil(members.length / 2);
      return {
        id: m.id,
        type: "map" as const,
        position: {
          x: side * (520 + (row % 2) * 30),
          y: (row - (rows - 1) / 2) * 150,
        },
        data: {
          title: m.title,
          meaning: m.meaning,
          label: m.label,
          active: active === m.id,
          dimmed: active !== "root" && active !== m.id,
          root: !topic,
          select: () => select(m.id),
        },
      };
    }),
  ].map((n) => ({ ...n, measured: measurements[n.id], draggable: false }));
  const edges = members.map((m) => {
    const left = nodes.find((n) => n.id === m.id)!.position.x < 0;
    const highlighted = active === "root" || active === m.id;
    return {
      id: `scope-${topic?.id || "polity"}-${m.id}`,
      source: "root",
      target: m.id,
      sourceHandle: left ? "left" : "right",
      targetHandle: left ? "right" : "left",
      ariaLabel: topic
        ? `${m.title}: ${themes.find((t) => t.id === m.id)?.links.find((l) => l.topicId === topic.id)?.explanation || "Supporting Prelims context from the supplied register."}`
        : `Syllabus membership: GS II includes topic ${m.title}; source: UPSC 2026 notification, page 34.`,
      style: {
        stroke: "var(--edge-structure-active)",
        strokeWidth: highlighted ? 1.5 : 1,
        opacity: highlighted ? 0.75 : 0.15,
        strokeDasharray: m.editorial ? "5 5" : undefined,
      },
    };
  });
  const onNodesChange = useCallback<OnNodesChange<MapNode>>((changes) => {
    setMeasurements((current) => {
      let next = current;
      for (const c of changes)
        if (
          c.type === "dimensions" &&
          c.dimensions &&
          (current[c.id]?.width !== c.dimensions.width ||
            current[c.id]?.height !== c.dimensions.height)
        ) {
          next = { ...next, [c.id]: c.dimensions };
        }
      return next;
    });
  }, []);
  useEffect(() => {
    if (!initialized) return;
    if (topic) setCenter(125, 55, { zoom: innerWidth <= 700 ? 0.75 : 0.85 });
    else fitView({ padding: 0.14, maxZoom: 1 });
  }, [initialized, topic, fitView, setCenter]);
  useEffect(() => {
    if (!initialized || !selectedTheme) return;
    const i = themes.findIndex((t) => t.id === selectedTheme.id);
    const x = (i % 2 === 0 ? -1 : 1) * (520 + (Math.floor(i / 2) % 2) * 30);
    const y =
      (Math.floor(i / 2) - (Math.ceil(themes.length / 2) - 1) / 2) * 150;
    setCenter(x + 125, y + 55, {
      zoom: innerWidth <= 700 ? 0.85 : 1,
      duration: 180,
    });
  }, [selectedTheme, initialized, themes, setCenter]);
  useEffect(() => {
    document.querySelector(".coverage-inspector")?.scrollTo(0, 0);
  }, [selectedTheme]);
  const results = query.trim()
    ? catalog.themes.filter((t) =>
        `${t.title} ${t.subject}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : [];
  const title = selectedTheme?.title || topic?.title || "Polity syllabus map";
  return (
    <div className="app-shell coverage-shell">
      <header className="topbar">
        <button className="brand" onClick={() => onNavigate("")}>
          Polity Atlas
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button onClick={() => onNavigate("gs2")}>GS II</button>
          <span>/</span>
          <button onClick={() => onNavigate("gs2/polity")}>Polity</button>
        </nav>
        <div className="header-actions">
          <div className="search-wrap">
            <MagnifyingGlass size={19} />
            <input
              aria-label="Search Polity themes"
              placeholder="Find a theme: federalism, rights…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) openTheme(results[0]);
                if (e.key === "Escape") setQuery("");
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
                aria-label="Theme search results"
              >
                {results.length ? (
                  results.map((t) => (
                    <button key={t.id} onClick={() => openTheme(t)}>
                      <strong>{t.title}</strong>
                      <small>
                        {t.subject} · {t.mains} Mains · {t.prelims} Prelims
                      </small>
                    </button>
                  ))
                ) : (
                  <p>No matching theme in this register.</p>
                )}
              </div>
            )}
          </div>
          <ThemeToggle />
          <button
            className="reset-button"
            onClick={() => {
              setHovered(null);
              setQuery("");
              fitView({ padding: 0.14, maxZoom: 1 });
            }}
            aria-label="Fit syllabus map"
          >
            <CornersOut size={18} />
            <span>Fit map</span>
          </button>
        </div>
      </header>
      <div className={`workspace ${detailsOpen ? "details-open" : ""}`}>
        <main className="canvas-area" aria-label="Polity syllabus overview">
          <div className="canvas-toolbar">
            <div className="legend">
              <span className="legend-item kind-category">
                <span className="category-dot" />
                Syllabus
              </span>
              <span className="legend-item kind-application">
                <span className="category-dot" />
                PYQ themes
              </span>
            </div>
            {topic && (
              <button
                className="index-toggle"
                onClick={() => onNavigate("gs2/polity")}
              >
                <ArrowLeft size={17} />
                <span>All topics</span>
              </button>
            )}
          </div>
          <div className="canvas-heading">
            <span className="eyebrow">GS II · syllabus first</span>
            <span>
              {topic?.title || "Polity"}
              <small className="scope-status">
                {topic
                  ? `${themes.length} mapped themes · select one to inspect`
                  : "9 syllabus topics · 139 Polity themes · 15 related themes"}
              </small>
            </span>
          </div>
          <div className="graph-viewport">
            <ReactFlow<MapNode>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onNodeClick={(_, n) => select(n.id)}
              onNodeMouseEnter={(_, n) => {
                if (matchMedia("(hover: hover)").matches) setHovered(n.id);
              }}
              onNodeMouseLeave={() => setHovered(null)}
              nodesFocusable={false}
              nodesDraggable={false}
              nodesConnectable={false}
              minZoom={0.15}
              maxZoom={1.8}
              colorMode={theme}
              zoomOnDoubleClick={false}
            >
              <Background
                variant={BackgroundVariant.Lines}
                gap={32}
                color="var(--grid)"
                lineWidth={0.5}
              />
            </ReactFlow>
          </div>
          <div className="canvas-footer">
            <span>
              {topic
                ? "All mapped themes are on canvas · Pan or use the list"
                : "Select a syllabus topic · Inspect its PYQ themes"}
            </span>
            <div className="zoom-controls">
              <button aria-label="Zoom out" onClick={() => zoomOut()}>
                <Minus size={18} />
              </button>
              <button aria-label="Zoom in" onClick={() => zoomIn()}>
                <Plus size={18} />
              </button>
            </div>
          </div>
          {!detailsOpen && (
            <button
              className="reopen-details"
              onClick={() => setDetailsOpen(true)}
            >
              <BookOpen size={17} />
              Show details
            </button>
          )}
        </main>
        {detailsOpen && (
          <aside
            className="inspector coverage-inspector"
            aria-label="Polity coverage inspector"
          >
            <div className="inspector-heading">
              <span className="eyebrow">
                {selectedTheme ? "Theme outline" : "Syllabus coverage"}
              </span>
              <button
                className="icon-button close-inspector"
                aria-label="Close details"
                onClick={() => setDetailsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <h1>{title}</h1>
            <p className="meaning">
              {selectedTheme
                ? `${selectedTheme.subject} · ${selectedTheme.mains} Mains · ${selectedTheme.prelims} Prelims`
                : topic?.meaning ||
                  "Start with the syllabus, then follow the themes examined within it."}
            </p>
            {selectedTheme ? (
              <>
                <section>
                  <h2>Study map</h2>
                  {selectedTheme.studyRoute ? (
                    <>
                      <p className="mains">
                        The Fundamental Rights example connects six rights
                        categories, Articles and selected judgments. It is not
                        exhaustive case-law coverage.
                      </p>
                      <button
                        className="frame-button"
                        onClick={() => onNavigate(selectedTheme.studyRoute!)}
                      >
                        Open Fundamental Rights graph <ArrowRight size={18} />
                      </button>
                    </>
                  ) : (
                    <p className="mains">
                      Mapped into the syllabus. Detailed provisions, judgments
                      and current-affairs connections for this theme are not yet
                      authored.
                    </p>
                  )}
                </section>
                <section>
                  <h2>Syllabus connections</h2>
                  {selectedTheme.links.map((l) => (
                    <div className="coverage-link" key={l.topicId}>
                      <button
                        onClick={() =>
                          onNavigate(
                            `${pathFor(l.topicId)}?theme=${encodeURIComponent(selectedTheme.id)}`,
                          )
                        }
                      >
                        {catalog.topics.find((t) => t.id === l.topicId)!.title}
                        <ArrowRight size={15} />
                      </button>
                      <small>
                        {l.type === "register-tag"
                          ? "Existing PYQ mapping"
                          : "Editorial revision placement"}
                      </small>
                      <p className="muted">{l.explanation}</p>
                    </div>
                  ))}
                  {!selectedTheme.links.length && (
                    <p className="mains">
                      Supporting Prelims context. No placement under a specific
                      Mains bullet is asserted.
                    </p>
                  )}
                </section>
                <section>
                  <h2>PYQ evidence</h2>
                  <p className="mains">
                    Recorded years: {selectedTheme.years.join(", ")}.
                  </p>
                  <p className="muted">
                    Counts come from accepted occurrences in the supplied
                    register. They describe question coverage, not the
                    completeness of the study graph.
                  </p>
                  {selectedTheme.flaggedRows > 0 && (
                    <p className="coverage-caution">
                      {selectedTheme.flaggedRows} source row needs a
                      text-quality check. Its original flag is retained in the
                      private audit.
                    </p>
                  )}
                </section>
                <button
                  className="back-link"
                  onClick={() => onNavigate(pathFor(topic!.id))}
                >
                  <ArrowLeft size={17} />
                  Back to topic themes
                </button>
              </>
            ) : topic ? (
              <>
                <section>
                  <h2>Revision structure</h2>
                  <ul className="recall">
                    {topic.outline.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2>Mapped themes · {themes.length}</h2>
                  <p className="muted">
                    Select a theme for its syllabus links and study-map status.
                    Related subjects keep their original identity.
                  </p>
                  <div className="coverage-list">
                    {themes.map((t) => (
                      <button key={t.id} onClick={() => openTheme(t)}>
                        <strong>{t.title}</strong>
                        <small>
                          {t.mains} Mains · {t.prelims} Prelims
                          {t.subject !== "Polity" ? ` · ${t.subject}` : ""}
                        </small>
                        <span>
                          {t.status === "study-example"
                            ? "Study example available →"
                            : "Theme outline →"}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2>Syllabus topics</h2>
                  <div className="coverage-list">
                    {catalog.topics.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onNavigate(pathFor(t.id))}
                      >
                        <strong>
                          {t.ordinal.toString().padStart(2, "0")} · {t.title}
                        </strong>
                        <small>{topicThemes(t.id).length} mapped themes</small>
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <h2>Coverage so far</h2>
                  <p className="mains">
                    139 Polity themes: 118 Mains and 210 Prelims occurrences.
                    Another 15 related themes connect from other subjects.
                  </p>
                  <p className="muted">
                    One study example is available: Fundamental Rights. Other
                    themes currently have a syllabus outline.
                  </p>
                  <button
                    className="frame-button"
                    onClick={() => onNavigate(pathFor(contextTopic.id))}
                  >
                    Prelims context · 2 themes
                    <ArrowRight size={18} />
                  </button>
                </section>
              </>
            )}
            <section className="sources">
              <h2>Source & scope</h2>
              <a
                href={catalog.sources[0].url!}
                target="_blank"
                rel="noreferrer"
              >
                UPSC CSE 2026 · syllabus, page 34
              </a>
              <p className="muted">
                Headings and revision prompts are paraphrases. Open the
                notification for exact wording.
              </p>
              <p className="muted">
                PYQ register: July 2026 snapshot. Mains 2013–2025; Prelims
                2009–2026. Topic totals overlap; do not add them.
              </p>
              <p className="muted">
                Syllabus links organise revision; they are not legal
                relationships or verified answer keys.
              </p>
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}
