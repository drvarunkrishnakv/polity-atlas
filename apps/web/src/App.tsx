import { useEffect, useState } from "react";
import { Library } from "./components/Library";
import { RouteScreen } from "./routing/RouteScreen";

const loadStudy = () =>
  import("./screens/StudyScreen").then((module) => module.StudyScreen);
const loadOverview = () =>
  import("./screens/OverviewScreen").then((module) => module.OverviewScreen);

export function App() {
  const [route, setRoute] = useState(location.hash.slice(2));
  useEffect(() => {
    const change = () => setRoute(location.hash.slice(2));
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const navigate = (path: string) => {
    location.hash = "/" + path;
  };
  const [path, query] = route.split("?");
  const params = new URLSearchParams(query);
  const onLibrary = () => navigate("");
  if (
    path === "gs2/polity/fundamental-rights" ||
    (path === "gs2/polity" && params.has("node"))
  )
    return (
      <RouteScreen
        key="study"
        routeKey="study"
        load={loadStudy}
        failureTitle="Study map unavailable"
        onLibrary={onLibrary}
        render={(Screen) => <Screen onNavigate={navigate} />}
      />
    );
  if (path === "gs2/polity" || path.startsWith("gs2/polity/topics/")) {
    const topicId = path.split("/")[3];
    return (
      <RouteScreen
        key="overview"
        routeKey="overview"
        load={loadOverview}
        failureTitle="Syllabus map unavailable"
        onLibrary={onLibrary}
        render={(Screen) => (
          <Screen
            topicId={topicId}
            themeId={params.get("theme") || undefined}
            onNavigate={navigate}
          />
        )}
      />
    );
  }
  return <Library subject={path === "gs2"} onNavigate={navigate} />;
}
