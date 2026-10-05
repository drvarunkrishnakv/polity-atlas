export interface ListState {
  query: string;
  scroll: number;
  focused: string;
}
const memory = new Map<string, ListState>();
const empty = (): ListState => ({ query: "", scroll: 0, focused: "" });
export function readListState(scope: string): ListState {
  if (memory.has(scope)) return { ...memory.get(scope)! };
  try {
    const saved = JSON.parse(
      sessionStorage.getItem(`atlas-list:${scope}`) || "null",
    );
    if (
      saved &&
      typeof saved.query === "string" &&
      Number.isFinite(saved.scroll) &&
      typeof saved.focused === "string"
    )
      return saved;
  } catch {
    /* Storage is optional; in-session memory still works. */
  }
  return empty();
}
export function saveListState(scope: string, value: ListState) {
  memory.set(scope, { ...value });
  try {
    sessionStorage.setItem(`atlas-list:${scope}`, JSON.stringify(value));
  } catch {
    /* Optional persistence. */
  }
}
