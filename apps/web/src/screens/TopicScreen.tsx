import { useMemo, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { topicThemes } from "../content/catalog";
import bankData from "../content/foundations.json";
import rightsData from "../content/fundamental-rights.json";
import { type FoundationBank, validateBank } from "../content/foundations";
import type { GraphRelease } from "../content/types";
import {
  composeTopic,
  topicMaps,
  topicPath,
  topicSections,
} from "../content/topic-graph";
import { validateGraph } from "../graph/explore";
import { GraphCanvas } from "../components/GraphCanvas";
const bank = bankData as FoundationBank;
const rights = rightsData as GraphRelease;
const errors = [...validateBank(bank), ...validateGraph(rights)];
if (errors.length) throw new Error(errors.join("; "));
const maps = topicMaps(bank, rights);
const related = topicThemes("constitution").filter(
  (theme) => !maps.some((map) => map.microthemeIds.includes(theme.id)),
);

export function TopicScreen({
  themeId,
  onNavigate,
}: {
  themeId?: string;
  onNavigate: (path: string) => void;
}) {
  const [focus, setFocus] = useState(() => {
    const params = new URLSearchParams(location.hash.split("?")[1]);
    const node = params.get("node");
    return (
      maps.find((m) => m.microthemeIds.includes(themeId ?? ""))?.slug ??
      maps.find((m) => m.slug === params.get("focus"))?.slug ??
      maps.find((m) => m.rootId === node)?.slug ??
      (node ? maps.find((m) => m.nodeIds.includes(node))?.slug : undefined) ??
      "preamble"
    );
  });
  const graph = useMemo(() => {
    const release = composeTopic(bank, rights, focus);
    const failures = validateGraph(release);
    if (failures.length) throw new Error(failures.join("; "));
    return release;
  }, [focus]);
  const focusTheme = (slug: string) => {
    const map = maps.find((m) => m.slug === slug)!;
    history.replaceState(
      null,
      "",
      `#/${topicPath}?focus=${slug}&node=${encodeURIComponent(map.rootId)}`,
    );
    setFocus(slug);
  };
  return (
    <ReactFlowProvider key={focus}>
      <GraphCanvas
        key={focus}
        graph={graph}
        studyPath={topicPath}
        onNavigate={onNavigate}
        focusControl={
          <label className="theme-focus">
            Explore theme
            <select
              aria-label="Explore theme"
              value={focus}
              onChange={(e) => focusTheme(e.target.value)}
            >
              {topicSections.map((section) => (
                <optgroup key={section.title} label={section.title}>
                  {section.slugs.map((slug) => (
                    <option key={slug} value={slug}>
                      {maps.find((m) => m.slug === slug)!.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        }
        onSelectTheme={(id) => {
          const map = maps.find((m) => m.rootId === id);
          if (!map || map.slug === focus) return false;
          focusTheme(map.slug);
          return true;
        }}
        initialIndexOpen={
          !!themeId && related.some((theme) => theme.id === themeId)
        }
        indexExtras={
          <details
            className="related-topic-outlines"
            open={!!themeId && related.some((theme) => theme.id === themeId)}
          >
            <summary>
              Related syllabus themes · {related.length} outlines
            </summary>
            <p>
              These related themes belong to later authoring batches. Their
              outlines remain available in their home syllabus topics.
            </p>
            {related.map((theme) => (
              <button
                key={theme.id}
                onClick={() =>
                  onNavigate(
                    `gs2/polity/topics/${theme.homeTopicId}?theme=${encodeURIComponent(theme.id)}`,
                  )
                }
              >
                <strong>{theme.title}</strong>
                <small>View syllabus outline</small>
              </button>
            ))}
          </details>
        }
        indexGroups={topicSections.map((section) => ({
          title: section.title,
          ids: section.slugs.map(
            (slug) => maps.find((m) => m.slug === slug)!.rootId,
          ),
        }))}
      />
    </ReactFlowProvider>
  );
}
