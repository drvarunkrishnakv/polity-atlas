import type { Concept, GraphRelease } from "../content/types";
/** Layout-only focus lens. Every canonical node stays present; no edges are created. */
export function layoutWholeTopic(
  concepts: Map<string, Concept>,
  focused: GraphRelease,
  ordered: { rootId: string; nodeIds: string[] }[],
): Concept[] {
  const positioned = new Map(
    focused.nodes.map((n) => [
      n.id,
      { position: n.position, groupId: n.groupId },
    ]),
  );
  // Keep the selected teaching structure readable. Other themes surround it in
  // deterministic blocks; shared concepts stay in the focus, with cross-links.
  const maxY = Math.max(...focused.nodes.map((n) => n.position.y)) + 480;
  let rowY = maxY;
  for (let index = 0; index < ordered.length; index += 3) {
    let rowHeight = 0;
    ordered.slice(index, index + 3).forEach((map, column) => {
      const remaining = [map.rootId, ...map.nodeIds].filter(
        (id, i, ids) => ids.indexOf(id) === i && !positioned.has(id),
      );
      remaining.forEach((id, i) =>
        positioned.set(id, {
          position: {
            x: -1400 + column * 1350 + (i % 4) * 310,
            y: rowY + Math.floor(i / 4) * 170,
          },
          groupId: undefined,
        }),
      );
      rowHeight = Math.max(rowHeight, Math.ceil(remaining.length / 4) * 170);
    });
    if (rowHeight) rowY += rowHeight + 200;
  }
  let extra = 0;
  for (const id of concepts.keys())
    if (!positioned.has(id))
      positioned.set(id, {
        position: {
          x: (extra++ % 4) * 310,
          y: rowY + Math.floor((extra - 1) / 4) * 170,
        },
        groupId: undefined,
      });
  return [...concepts.values()].map((n) => ({
    ...n,
    ...positioned.get(n.id)!,
  }));
}
