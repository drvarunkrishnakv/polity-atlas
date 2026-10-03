export type Kind =
  | "foundation"
  | "theme"
  | "category"
  | "article"
  | "judgment"
  | "application"
  | "event";
export interface Concept {
  id: string;
  title: string;
  meaning: string;
  kind: Kind;
  position: { x: number; y: number };
  groupId?: string;
  bullets: string[];
  mains: string;
  sources: string[];
  reviewedOn: string;
  locator?: string;
  date?: string;
  fullTitle?: string;
  status?: string;
  relationNote?: string;
}
export interface Connection {
  id: string;
  source: string;
  target: string;
  label: string;
  explanation: string;
  evidence: string[];
  classification: "direct" | "analytical";
  reviewStatus: string;
  role?: "structure" | "context" | "connection";
}
export interface Source {
  id: string;
  title: string;
  url: string | null;
  locator: string;
  edition: string;
  sha256?: string;
}
export interface GraphRelease {
  schemaVersion: number;
  version: string;
  title: string;
  scope: string;
  sourceCutoff: string;
  syllabus: {
    id: string;
    title: string;
    meaning: string;
    microthemeId: string;
  };
  nodes: Concept[];
  edges: Connection[];
  sources: Source[];
  /** Legacy view metadata; the entire microtheme now renders on arrival. */
  initialIds: string[];
  pyqs: {
    id: string;
    year: number;
    angle: string;
    conceptId: string;
    source: string;
    note: string;
  }[];
}
