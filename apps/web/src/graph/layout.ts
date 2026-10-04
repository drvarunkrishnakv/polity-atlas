import type { Concept, Connection } from "../content/types";
import { cardWidth } from "./presentation";

const COLUMN = 300;
const ROW = 190;
const CLUSTER_GAP = 80;
const PER_ROW = 3;
type Bare = Omit<Concept, "position" | "groupId">;

/** Deterministic clusters for a projected map. Not used by the authored rights layout. */
export function layoutTopicMap(
  concepts: Bare[],
  edges: Connection[],
  rootId: string,
): Concept[] {
  const byId = new Map(concepts.map((concept) => [concept.id, concept]));
  const children = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.role !== "structure") continue;
    if (!byId.has(edge.source) || !byId.has(edge.target)) continue;
    const list = children.get(edge.source) ?? [];
    if (!list.includes(edge.target)) list.push(edge.target);
    children.set(edge.source, list);
  }
  for (const list of children.values()) list.sort();

  const parent = new Map<string, string>();
  const seen = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const child of children.get(id) ?? []) {
      if (seen.has(child)) continue;
      seen.add(child);
      parent.set(child, id);
      queue.push(child);
    }
  }

  const branches = (children.get(rootId) ?? []).filter(
    (id) => parent.get(id) === rootId,
  );
  const descendants = (id: string): string[] => {
    const kids = (children.get(id) ?? []).filter(
      (child) => parent.get(child) === id,
    );
    return kids.flatMap((child) => [child, ...descendants(child)]);
  };

  const placed = new Map<string, { x: number; y: number; groupId?: string }>();
  // Keep the first teaching ring readable. Leaf clusters extend outwards rather
  // than forcing every heading into one very long horizontal strip.
  const sides = [
    branches.filter((_, i) => i % 2 === 0),
    branches.filter((_, i) => i % 2 === 1),
  ];
  sides.forEach((heads, side) => {
    const direction = side === 0 ? -1 : 1;
    const heightFor = (id: string) =>
      Math.max(1, Math.ceil(descendants(id).length / PER_ROW)) * ROW +
      CLUSTER_GAP;
    const totalHeight = heads.reduce((sum, id) => sum + heightFor(id), 0);
    let cursorY = -totalHeight / 2;
    for (const head of heads) {
      const rest = descendants(head);
      const headConcept = byId.get(head)!;
      const height = heightFor(head);
      const centerY = cursorY + height / 2;
      const centerX = 140 + direction * 480;
      placed.set(head, {
        x: centerX - cardWidth(asCard(headConcept)) / 2,
        y: centerY,
      });
      const groupId = headConcept.kind === "category" ? head : undefined;
      const rows = Math.max(1, Math.ceil(rest.length / PER_ROW));
      rest.forEach((id, index) => {
        const node = byId.get(id)!;
        placed.set(id, {
          x:
            centerX +
            direction * COLUMN * (1 + (index % PER_ROW)) -
            cardWidth(asCard(node)) / 2,
          y: centerY + (Math.floor(index / PER_ROW) - (rows - 1) / 2) * ROW,
          groupId,
        });
      });
      cursorY += height;
    }
  });
  const root = byId.get(rootId);
  if (root) placed.set(rootId, { x: 140 - cardWidth(asCard(root)) / 2, y: 0 });

  const maxY = Math.max(
    0,
    ...[...placed.values()].map((position) => position.y),
  );
  concepts
    .map((concept) => concept.id)
    .filter((id) => !placed.has(id))
    .sort()
    .forEach((id, index) => {
      placed.set(id, {
        x: (index % 4) * COLUMN,
        y: maxY + ROW * 2 + Math.floor(index / 4) * ROW,
      });
    });

  const used = new Set<string>();
  for (const position of placed.values()) {
    let guard = 0;
    while (
      used.has(`${position.x},${position.y}`) &&
      guard < concepts.length + 2
    ) {
      position.x += COLUMN;
      guard += 1;
    }
    used.add(`${position.x},${position.y}`);
  }

  return concepts.map((concept) => {
    const position = placed.get(concept.id) ?? { x: 0, y: 0 };
    const { groupId: _ignored, ...rest } = concept as Bare & {
      groupId?: string;
    };
    return {
      ...rest,
      position: { x: position.x, y: position.y },
      ...(position.groupId ? { groupId: position.groupId } : {}),
    };
  });
}

function asCard(concept: Bare): Concept {
  return { ...concept, position: { x: 0, y: 0 } };
}
