import data from "../content/study-links.json";
import { studyMaps } from "../routing/study-navigation";
import { ArrowUpRight } from "@phosphor-icons/react";
export function RelatedMaps({
  path,
  conceptId,
  onNavigate,
}: {
  path: string;
  conceptId: string;
  onNavigate: (path: string) => void;
}) {
  const current = studyMaps.find((m) => m.route === path);
  const links = data.links.filter(
    (link) => link.from === current?.slug && link.anchorId === conceptId,
  );
  if (!links.length) return null;
  return (
    <section className="related-maps" aria-label="Related study maps">
      <h2>Continue in another map</h2>
      <p className="muted source-note">
        Open the related theme at this same Article.
      </p>
      {links.map((link) => {
        const target = studyMaps.find((m) => m.slug === link.to)!;
        return (
          <div key={link.id} className="related-map">
            <button
              onClick={() =>
                onNavigate(
                  `${target.route}?node=${encodeURIComponent(link.anchorId)}`,
                )
              }
            >
              {target.title}
              <ArrowUpRight size={17} />
            </button>
            <p>{link.explanation}</p>
            <details>
              <summary>
                {link.classification === "analytical"
                  ? "Analytical connection"
                  : "Legal connection"}{" "}
                · Sources
              </summary>
              {link.sources.map((source) => (
                <p key={source.id}>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                  <span className="muted"> · {source.locator}</span>
                </p>
              ))}
            </details>
          </div>
        );
      })}
    </section>
  );
}
