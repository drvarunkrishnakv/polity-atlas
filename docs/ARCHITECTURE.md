# Architecture

## Boundaries

- `apps/web`: TypeScript, React, Vite and React Flow. Browser-only exploration.
- `apps/web/src/content`: original curated graph release; stable node/edge/source IDs.
- `apps/web/src/graph`: pure selection, bounded highlighting and graph validation.
- `tooling`: public content validation and publication checks.
- `tests`: integration/browser tests. Private source files are never CI dependencies.
- Ignored `data`, `config`, `scripts`: existing independent Python retrieval corpus.

UI reads a graph repository interface. The initial example uses bundled records,
so every clone runs without a Firebase account. Firebase Hosting config is included;
Firestore and Authentication are the chosen future private publishing boundary,
not a pretend backend or required dependency for this sample. No live AI per hover.

Load one curated microtheme at a time as the corpus grows. Render its complete
node and edge set; never hide records behind per-node expansion or recursively
light up the corpus. Canvas is a graph, not a tree; multiple paths and cross-links
are supported. Direct-neighbour highlighting and camera framing are independent
of record visibility. Touch and keyboard selection have the same capabilities.

Start at readable zoom, with an overview map and explicit camera controls for the
full extent. Legacy `initialIds` remains validated for schema compatibility but
no longer controls rendering. Cross-microtheme links should become explicit named
gateways only when a real destination and sourced relationship exist. The detailed study release
contains one microtheme; syllabus navigation is a separate catalogue and never
pretends that mapped themes have authored academic connections.

## Teaching structure and presentation

Category records and sourced structural edges belong to the content release. Edge
roles distinguish `structure`, `context` and `connection`; legal vs analytical
classification remains separate. Existing Article IDs remain stable. Spatial
regions and node-type labels/colours live in `graph/presentation.ts`; region boxes
are not extra nodes or inferred academic links. All concepts still render at once.
The initial desktop camera frames the topic and six categories. Selecting a category
frames its Articles; phone navigation also exposes the six categories in the sidebar.

## Content changes

Keep IDs stable. Increment a content release version, review changed nodes/edges,
retain previous releases in Git for public summaries (private source artifacts in
private storage). Legal overruling, changed events and editorial corrections are
separate reasons. Do not replace an unchanged graph on every weekly import.

## Firebase

Deploy `apps/web/dist/client` to classic Firebase Hosting. Security rules deny client
writes and currently deny all database reads until a specific owner UID and private
content publishing workflow are configured. No Firebase project is silently reused.
A later Firestore adapter can implement the repository interface without changing
components. Server credentials and AI provider calls remain outside the client.

## Appearance preference

`theme/ThemeProvider.tsx` owns the browser-local dark/light preference. It sits
above routing and the React Flow provider so a theme change does not remount the
graph. `main.tsx` applies the saved `data-theme` before the first React render;
storage exceptions fall back to dark and leave in-session switching available.
`ThemeToggle` is shared by the library and graph. CSS tokens control surfaces,
text and graph strokes; the minimap uses the same kind classes as concept cards.
Appearance never changes the content release, traversal or graph positions.

## Syllabus-first navigation

`content/polity-catalog.json` is a separate coverage release: nine syllabus topics,
154 stable theme IDs, accepted-register counts, original short prompts and explained
syllabus mappings. `catalog.ts` validates references and resolves memberships.
Navigation links use `register-tag` or `editorial-placement`; neither asserts a
legal relationship. The original Fundamental Rights graph is unchanged.

`PolityOverview` renders the selected syllabus scope, with measured dimensions
retained on hover. All members of that navigation scope render immediately.
Selecting a topic changes scope; selecting a theme pins its outline and moves the
camera. No unauthored theme has an enabled study destination. Search and accessible
sidebar lists provide access to off-screen members. Shared theme IDs appear under
multiple topics without duplicating their source identity or occurrence counts.

Routes: `#/gs2/polity` is the overview, `#/gs2/polity/topics/<topic-id>` is a topic,
and `?theme=<stable-theme-id>` pins an outline. The study example lives at
`#/gs2/polity/fundamental-rights`. Old `#/gs2/polity?node=...` links still open the
study graph. The Polity breadcrumb returns to the overview. Browser history,
reload and appearance persistence are covered by browser tests.
