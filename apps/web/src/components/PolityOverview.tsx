import { useState, useRef, useLayoutEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import {
  catalog,
  contextTopic,
  coverageLine,
  homeAndRelated,
  topicThemes,
  type CatalogTheme,
} from "../content/catalog";
import browser from "../content/theme-browser.json";
import { readListState, saveListState } from "../navigation/list-state";
import { ThemeToggle } from "./ThemeToggle";
const pathFor = (topic: string) => `gs2/polity/topics/${topic}`;
const metaFor = (id: string) =>
  browser.maps.find((m) => m.microthemeIds.includes(id));

export function PolityOverview({
  topicId,
  themeId,
  onNavigate,
}: {
  topicId?: string;
  themeId?: string;
  onNavigate: (path: string) => void;
}) {
  const topic =
    catalog.topics.find((t) => t.id === topicId) ||
    (topicId === contextTopic.id ? contextTopic : undefined);
  const themes = topic ? topicThemes(topic.id) : catalog.themes;
  const selected = themes.find((t) => t.id === themeId);
  const scope = `${topicId || "polity"}:${selected?.id || "list"}`;
  const [saved] = useState(() => readListState(scope));
  const [query, setQuery] = useState(saved.query);
  const main = useRef<HTMLElement>(null);
  const focused = useRef(saved.focused);
  const persist = () =>
    saveListState(scope, {
      query,
      scroll: main.current?.scrollTop || 0,
      focused: focused.current,
    });
  const changeQuery = (value: string) => {
    focused.current = "";
    setQuery(value);
    saveListState(scope, {
      query: value,
      scroll: main.current?.scrollTop || 0,
      focused: "",
    });
  };
  useLayoutEffect(() => {
    const el = main.current;
    if (!el) return;
    el.scrollTop = saved.scroll;
    const button = [
      ...el.querySelectorAll<HTMLButtonElement>("[data-theme-id]"),
    ].find((b) => b.dataset.themeId === saved.focused);
    button?.focus({ preventScroll: true });
  }, [saved]);
  const navigate = (path: string) => {
    persist();
    onNavigate(path);
  };
  const openTheme = (t: CatalogTheme) => {
    focused.current = t.id;
    navigate(
      t.studyRoute && t.status !== "outline-only"
        ? t.studyRoute
        : `${pathFor(topic?.id || t.homeTopicId)}?theme=${encodeURIComponent(t.id)}`,
    );
  };
  const matches = (t: CatalogTheme) =>
    `${t.title} ${t.subject} ${metaFor(t.id)?.meaning || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const results = themes.filter(matches);
  const parts = topic ? homeAndRelated(topic.id) : null;
  const groups =
    topic?.id === "constitution"
      ? browser.groups.map((label) => ({
          label,
          themes: parts!.home
            .filter((t) => metaFor(t.id)?.group === label && matches(t))
            .sort(
              (a, b) =>
                browser.maps.indexOf(metaFor(a.id)!) -
                browser.maps.indexOf(metaFor(b.id)!),
            ),
        }))
      : [
          {
            label: "Themes in this topic",
            themes: parts?.home.filter(matches) || [],
          },
        ];
  const related = parts?.related.filter(matches) || [];
  const themeRow = (t: CatalogTheme) => {
    const home =
      catalog.topics.find((x) => x.id === t.homeTopicId)?.title ||
      "Prelims context";
    const available = t.status !== "outline-only";
    return (
      <li key={t.id}>
        <button
          className="theme-row"
          data-theme-id={t.id}
          aria-label={`${t.title}${t.subject !== "Polity" ? ` · ${t.subject}` : ""}`}
          onClick={() => openTheme(t)}
        >
          <span className="list-row-copy">
            <strong>
              {t.title}
              {t.subject !== "Polity" && (
                <span className="subject-tag">{t.subject}</span>
              )}
            </strong>
            <span className="list-description">
              {metaFor(t.id)?.meaning ||
                `PYQ theme within ${home.toLowerCase()}`}
            </span>
            <small>
              {t.mains} Mains · {t.prelims} Prelims
              {topic && t.homeTopicId !== topic.id ? ` · Home: ${home}` : ""}
            </small>
          </span>
          <span className={`list-status ${available ? "available" : ""}`}>
            {available ? "Map available" : "Outline only"}
            <ArrowRight size={17} />
          </span>
        </button>
      </li>
    );
  };
  return (
    <div className="app-shell syllabus-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("")}>
          Polity Atlas
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button onClick={() => navigate("gs2")}>GS II</button>
          <span>/</span>
          <button onClick={() => navigate("gs2/polity")}>Polity</button>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>
      <main
        ref={main}
        className="syllabus-scroll"
        aria-label="Polity syllabus overview"
        onScroll={persist}
      >
        <div className="syllabus-content">
          {topic && (
            <button
              className="list-back"
              onClick={() =>
                navigate(selected ? pathFor(topic.id) : "gs2/polity")
              }
            >
              <ArrowLeft size={16} />
              {selected ? "Back to topic themes" : "All topics"}
            </button>
          )}
          <div className="list-intro">
            <span className="eyebrow">
              {selected ? "Theme outline" : "GS II · Polity"}
            </span>
            <h1>{selected?.title || topic?.title || "Polity syllabus"}</h1>
            <p>
              {selected
                ? `${selected.subject} · ${selected.mains} Mains · ${selected.prelims} Prelims`
                : topic?.meaning ||
                  "Choose a syllabus topic, then a theme to explore its connections."}
            </p>
            {!selected && (
              <p className="list-coverage">
                {topic
                  ? coverageLine(topic.id)
                  : "9 syllabus topics · 139 Polity themes · 15 related themes"}
              </p>
            )}
          </div>
          {selected ? (
            <article className="theme-outline">
              <section>
                <h2>Study map</h2>
                <p>
                  Outline only. Detailed provisions, judgments and
                  current-affairs connections for this theme are not yet
                  authored.
                </p>
              </section>
              <section>
                <h2>Syllabus connections</h2>
                {selected.links.map((l) => (
                  <div className="coverage-link" key={l.topicId}>
                    <button
                      onClick={() =>
                        navigate(
                          `${pathFor(l.topicId)}?theme=${encodeURIComponent(selected.id)}`,
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
                    <p>{l.explanation}</p>
                  </div>
                ))}
                {!selected.links.length && (
                  <p>
                    Supporting Prelims context. No placement under a specific
                    Mains bullet is asserted.
                  </p>
                )}
              </section>
              <section>
                <h2>PYQ evidence</h2>
                <p>Recorded years: {selected.years.join(", ")}.</p>
                <p>
                  Counts come from accepted occurrences in the supplied
                  register. They describe question coverage, not the
                  completeness of a study graph.
                </p>
                {selected.flaggedRows > 0 && (
                  <p className="coverage-caution">
                    {selected.flaggedRows} source row needs a text-quality
                    check. Its original flag is retained in the private audit.
                  </p>
                )}
              </section>
            </article>
          ) : (
            <>
              <div className="list-tools">
                <div className="search-wrap">
                  <MagnifyingGlass size={20} />
                  <input
                    aria-label="Search Polity themes"
                    placeholder={
                      topic
                        ? "Find a theme in this topic…"
                        : "Search all Polity themes…"
                    }
                    value={query}
                    onChange={(e) => changeQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && query.trim() && results[0])
                        openTheme(results[0]);
                      if (e.key === "Escape") changeQuery("");
                    }}
                  />
                  {query && (
                    <button
                      className="clear-search"
                      aria-label="Clear search"
                      onClick={() => changeQuery("")}
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>
                <span aria-live="polite">
                  {query.trim()
                    ? `${results.length} matching themes`
                    : topic
                      ? `${themes.length} themes`
                      : "Syllabus first"}
                </span>
              </div>
              {topic && (
                <details className="list-context">
                  <summary>Revision structure & syllabus placement</summary>
                  <ul>
                    {topic.outline.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <p>
                    Browsing groups are editorial headings. Original PYQ tags
                    and syllabus placements are retained.
                  </p>
                  <details>
                    <summary>View theme placement notes</summary>
                    {themes.map((t) => (
                      <div className="placement-note" key={t.id}>
                        <strong>
                          {t.title}
                          {t.subject !== "Polity" ? ` · ${t.subject}` : ""}
                        </strong>
                        {t.links
                          .filter((l) => l.topicId === topic.id)
                          .map((l) => (
                            <p key={l.topicId}>
                              <b>
                                {l.type === "register-tag"
                                  ? "Existing PYQ mapping"
                                  : "Editorial revision placement"}
                                :{" "}
                              </b>
                              {l.explanation}
                            </p>
                          ))}
                      </div>
                    ))}
                  </details>
                </details>
              )}
              {!topic && !query.trim() ? (
                <>
                  <section
                    className="browse-group"
                    aria-label="Syllabus topics"
                  >
                    <h2>Syllabus topics</h2>
                    <ol className="theme-list topic-list">
                      {catalog.topics.map((t) => (
                        <li key={t.id}>
                          <button
                            className="topic-row"
                            aria-label={`${t.ordinal.toString().padStart(2, "0")} · ${t.title}`}
                            onClick={() => navigate(pathFor(t.id))}
                          >
                            <span className="topic-number">
                              {t.ordinal.toString().padStart(2, "0")}
                            </span>
                            <span className="list-row-copy">
                              <strong>{t.title}</strong>
                              <span className="list-description">
                                {t.meaning}
                              </span>
                              <small>
                                {topicThemes(t.id).length} mapped themes
                              </small>
                            </span>
                            <ArrowRight size={20} />
                          </button>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <button
                    className="list-back"
                    onClick={() => navigate(pathFor(contextTopic.id))}
                  >
                    Prelims context · 2 themes
                    <ArrowRight size={17} />
                  </button>
                </>
              ) : !topic ? (
                <section
                  className="browse-group"
                  aria-label="Theme search results"
                >
                  <h2>Search results</h2>
                  <ul className="theme-list">{results.map(themeRow)}</ul>
                </section>
              ) : (
                <>
                  {!query.trim() && (
                    <nav className="group-jumps" aria-label="Theme groups">
                      {groups
                        .filter((g) => g.themes.length)
                        .map((g, i) => (
                          <button
                            key={g.label}
                            onClick={() =>
                              document
                                .getElementById(`browse-group-${i}`)
                                ?.scrollIntoView({ block: "start" })
                            }
                          >
                            {g.label}
                          </button>
                        ))}
                      {related.length > 0 && (
                        <button
                          onClick={() =>
                            document
                              .getElementById("related-themes")
                              ?.scrollIntoView({ block: "start" })
                          }
                        >
                          Related themes
                        </button>
                      )}
                    </nav>
                  )}
                  {groups.map(
                    (g, i) =>
                      g.themes.length > 0 && (
                        <section
                          key={g.label}
                          id={`browse-group-${i}`}
                          className="browse-group"
                          aria-label={g.label}
                        >
                          <h2>
                            {g.label}
                            <span>{g.themes.length}</span>
                          </h2>
                          <ul className="theme-list">
                            {g.themes.map(themeRow)}
                          </ul>
                        </section>
                      ),
                  )}
                  {related.length > 0 && (
                    <section
                      id="related-themes"
                      className="browse-group related-themes"
                      aria-label="Related themes"
                    >
                      <h2>
                        Related themes<span>{related.length}</span>
                      </h2>
                      <p>
                        These themes belong primarily to another syllabus topic.
                        Open an available map or inspect its outline.
                      </p>
                      <ul className="theme-list">{related.map(themeRow)}</ul>
                    </section>
                  )}
                </>
              )}
              {query.trim() && !results.length && (
                <div className="list-empty">
                  <h2>No matching themes</h2>
                  <p>Try a shorter term or clear your search.</p>
                  <button onClick={() => changeQuery("")}>Clear search</button>
                </div>
              )}
            </>
          )}
          <details className="list-sources">
            <summary>Sources & coverage notes</summary>
            <a href={catalog.sources[0].url!} target="_blank" rel="noreferrer">
              UPSC CSE 2026 · syllabus, page 34
            </a>
            <p>
              Headings and revision prompts are paraphrases. Open the
              notification for exact wording.
            </p>
            <p>
              PYQ register: July 2026 snapshot. Mains 2013–2025; Prelims
              2009–2026. Topic totals overlap; do not add them.
            </p>
            <p>
              Syllabus links organise revision; they are not legal relationships
              or verified answer keys. Map available means an authored revision
              graph exists, not exhaustive judgment or current-affairs coverage.
            </p>
          </details>
        </div>
      </main>
    </div>
  );
}
