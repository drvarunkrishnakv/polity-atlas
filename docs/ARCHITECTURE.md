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
gateways only when a real destination and sourced relationship exist. Detailed study maps are authored separately from syllabus navigation. Outline-only
themes never claim academic connections that have not been authored.

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
Selecting a topic changes scope; selecting an authored theme opens its study
route immediately. Selecting an unauthored theme pins its coverage outline. No unauthored theme has an enabled study destination. Search and accessible
sidebar lists provide access to off-screen members. Shared theme IDs appear under
multiple topics without duplicating their source identity or occurrence counts.

Routes: `#/gs2/polity` is the overview, `#/gs2/polity/topics/<topic-id>` is a topic,
and `?theme=<stable-theme-id>` opens an authored study or pins an unfinished outline. The study example lives at
`#/gs2/polity/fundamental-rights`. Old `#/gs2/polity?node=...` links still open the
study graph. The Polity breadcrumb returns to the overview. Browser history,
reload and appearance persistence are covered by browser tests.

## On-demand screen loading

The entry renders the library only. `App` statically imports the library and a
small route loader. It dynamically imports two screen modules and does not
import React Flow, the catalogue, or the study graph. `OverviewScreen` validates
`polity-catalog.json` and renders the syllabus map inside its own
`ReactFlowProvider` (`key` is the topic id, or `overview`). `StudyScreen`
validates the Fundamental Rights release through the graph repository and
renders that canvas inside its own provider. Neither screen imports the other
dataset.

Query-only changes, including `?theme=` and legacy `?node=`, keep the same
screen module. `ThemeProvider` stays above both screens, so appearance does not
remount the graph. A load that finishes after its route changed is ignored.
Pending and failed loads stay visible: Back to library is available in both,
and Reload retries a failed import or validation. The bundle size warning is
left in place; splitting is not hidden by raising `chunkSizeWarningLimit`.

## Constitution study maps

`content/foundations.json` is the shared constitution bank. It is a separate
release from `fundamental-rights.json`. A map lists canonical concept and edge
IDs. `projectMap` builds one `GraphRelease` from those records only: stable IDs
and meaning are copied, sources are limited to IDs the selected records use,
and no edge is added unless its ID is on the map. Positions come from
`graph/layout.ts`. The Fundamental Rights file keeps its authored coordinates.

`content/study-index.json` is the overview's route table. An entry maps one or
more canonical microtheme IDs to `gs2/polity/study/<slug>` and a title. Two
catalogue IDs may alias one map. The overview reads this file and the catalogue
only; it does not import the bank. Home, GS II, syllabus screens and the
Fundamental Rights route do not download the bank.

Catalogue status `study-map` is valid only when `studyRoute` matches the index.
`study-example` remains `gs2/polity/fundamental-rights`. Outline themes have no
study route. The constitution topic lists home themes and related themes
separately. Its coverage line counts home themes that currently have a study
example or study map. It does not treat the other syllabus themes as authored.

`#/gs2/polity/study/<slug>` loads `FoundationScreen`, validates the bank and the
projected graph, and mounts a new React Flow provider for that slug. Selection
and Reset stay on that path. The topic breadcrumb opens
`gs2/polity/topics/constitution`. An unknown slug stays on a recovery screen.
The first bank release covers 37 home identities in 36 maps. The original rights
release supplies the remaining home identity. Bank validation checks references,
evidence metadata and projected geometry; unit tests additionally check canonical
identity, full home coverage, connectedness and the core teaching families.


Topic layouts use balanced left/right teaching groups around the root. Descendants
extend outwards in bounded grids. Context and case nodes remain present outside
the first teaching ring; framing and the minimap make the full map navigable.
Coordinates are derived presentation data, never graph edges or evidence.
A concept may specify a more precise type label (clause, Schedule, statute,
constitutional Part or historical milestone) without changing traversal semantics.

PYQ angles may carry a Mains/Prelims stage from the source register. The original
rights release is untouched. Study metadata is small enough for syllabus screens;
the full bank is a separate lazy chunk, loaded only by a foundation study route.


## Focused maps and related-study navigation — 2026-10-05

The combined topic canvas experiment (PR #18) is superseded by owner feedback:
its scale required too much scrolling. Topic routes again show the syllabus
catalogue, and an authored theme opens its complete individual graph in one click.
The canonical content JSON, IDs, evidence and authored map membership are unchanged.
`TopicScreen`, combined graph composition and its layout code are removed.

A small `study-navigation.json` contains destinations and canonical node membership
for bookmark resolution. `routing/study-navigation.ts` maps old topic `theme`,
`focus` and `node` queries to a valid focused route. Migration replaces the current
history entry, avoiding back-button redirect loops. Invalid IDs cannot create a
study destination. Shared Articles retain their selected identity across map links.

`study-links.json` provides six explicit directional gateways (three pairs) at
Articles 14, 31C and 32. `RelatedMaps` renders the destination name, copied reviewed
edge explanation, legal/analytical classification and source locators in the
inspector. These are navigation links grounded in a shared Article and an existing
destination edge; they do not add nodes or inferred edges to the loaded graph.
They are selective gateways, not a completed cross-topic relationship pass.

`tooling/build-study-navigation.mjs` derives both small files from the public
canonical records and explicit gateway choices. Its `--check` runs in `npm run
check` to detect stale metadata. Unit checks verify the shared anchor, destination
edge and exact evidence; browser checks cover direct opening, old bookmarks,
related-map return navigation, one-hop highlights and complete map membership.
The full banks are still loaded only by their respective study screens.
