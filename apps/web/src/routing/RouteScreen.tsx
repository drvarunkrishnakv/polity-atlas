import { useEffect, useState, type ComponentType, type ReactNode } from "react";

type LoadState<T> =
  | { status: "ready"; key: string; value: T }
  | { status: "error"; key: string; error: Error };

export function RouteNotice({
  busy = false,
  title = "Loading your atlas…",
  onLibrary,
  onReload,
}: {
  busy?: boolean;
  title?: string;
  onLibrary: () => void;
  onReload?: () => void;
}) {
  if (busy)
    return (
      <main
        className="loading"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {title}
        <div className="route-actions">
          <button onClick={onLibrary}>Back to library</button>
        </div>
      </main>
    );
  return (
    <main className="loading" role="alert">
      <h1>{title}</h1>
      <p className="route-error-detail">
        The content could not be loaded. Reload to try again.
      </p>
      <div className="route-actions">
        {onReload ? <button onClick={onReload}>Reload</button> : null}
        <button onClick={onLibrary}>Back to library</button>
      </div>
    </main>
  );
}

/** Drop a finished import when its route is no longer the one on screen. */
export function RouteScreen<P>({
  routeKey,
  load,
  failureTitle,
  onLibrary,
  render,
}: {
  routeKey: string;
  load: () => Promise<ComponentType<P>>;
  failureTitle: string;
  onLibrary: () => void;
  render: (Screen: ComponentType<P>) => ReactNode;
}) {
  const [state, setState] = useState<LoadState<ComponentType<P>> | null>(null);
  useEffect(() => {
    let active = true;
    const key = routeKey;
    load()
      .then((value) => {
        if (!active) return;
        setState({ status: "ready", key, value });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const error =
          reason instanceof Error ? reason : new Error(String(reason));
        console.error(error);
        setState({ status: "error", key, error });
      });
    return () => {
      active = false;
    };
  }, [routeKey, load]);
  const current = state?.key === routeKey ? state : null;
  if (!current) return <RouteNotice busy onLibrary={onLibrary} />;
  if (current.status === "error")
    return (
      <RouteNotice
        title={failureTitle}
        onLibrary={onLibrary}
        onReload={() => location.reload()}
      />
    );
  return render(current.value);
}
