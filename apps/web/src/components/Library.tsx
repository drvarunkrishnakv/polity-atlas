import { ThemeToggle } from "./ThemeToggle";
import { ArrowLeft, ArrowRight, Circle } from "@phosphor-icons/react";
export function Library({
  subject,
  onNavigate,
}: {
  subject: boolean;
  onNavigate: (path: string) => void;
}) {
  const papers = [
    ["GS I", "History, society & geography"],
    ["GS II", "Polity, governance & international relations"],
    ["GS III", "Economy, environment, science & security"],
    ["GS IV", "Ethics, integrity & aptitude"],
  ];
  return (
    <div className="library">
      <header className="topbar">
        <button className="brand" onClick={() => onNavigate("")}>
          Recall Atlas
        </button>
        <span className="library-tag">Revision through connections</span>
        <ThemeToggle />
      </header>
      <main className="library-main">
        {subject && (
          <button className="back-link" onClick={() => onNavigate("")}>
            <ArrowLeft size={17} /> All papers
          </button>
        )}
        <span className="eyebrow">Your revision atlas</span>
        <h1>{subject ? "General Studies II" : "Start with a paper."}</h1>
        <p className="library-intro">
          {subject
            ? "Choose a subject to explore its syllabus and connected concepts."
            : "Revisit the essentials. See how ideas connect. Carry those connections into your answers."}
        </p>
        <div className="paper-list">
          {(subject
            ? [
                ["Polity", "Indian Constitution · syllabus & PYQ themes"],
                ["Governance", "Public policy and institutions"],
                ["International Relations", "India and the world"],
              ]
            : papers
          ).map(([title, description], i) => {
            const enabled = subject ? i === 0 : i === 1;
            return (
              <button
                key={title}
                disabled={!enabled}
                onClick={() => onNavigate(subject ? "gs2/polity" : "gs2")}
              >
                <span className="paper-symbol">
                  <Circle size={20} weight={enabled ? "duotone" : "regular"} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                {enabled ? (
                  <ArrowRight size={22} />
                ) : (
                  <span className="soon">Not in this example</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="sample-note">
          <span className="category-dot" />
          <p>
            <strong>Explore Polity through its syllabus</strong>
            <br />
            Nine syllabus topics, mapped PYQ themes and a Fundamental Rights
            study example. Follow the structure before the details.
          </p>
        </div>
      </main>
      <footer className="library-footer">
        A concise revision companion · Source references stay with each concept
      </footer>
    </div>
  );
}
