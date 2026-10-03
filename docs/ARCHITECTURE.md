# Architecture

## Boundaries

- `apps/web`: TypeScript, React, Vite and React Flow. Browser-only exploration.
- `apps/web/src/content`: original curated graph release; stable node/edge/source IDs.
- `apps/web/src/graph`: pure selection, bounded highlighting and expansion functions.
- `tooling`: public content validation and publication checks.
- `tests`: integration/browser tests. Private source files are never CI dependencies.
- Ignored `data`, `config`, `scripts`: existing independent Python retrieval corpus.

UI reads a graph repository interface. The initial example uses bundled records,
so every clone runs without a Firebase account. Firebase Hosting config is included;
Firestore and Authentication are the chosen future private publishing boundary,
not a pretend backend or required dependency for this sample. No live AI per hover.

Only selected subjects/neighbourhoods should be loaded as the corpus grows. Never
render thousands of records simply because they exist. Canvas is a graph, not a tree;
multiple paths and cross-links are supported. Direct-neighbour highlighting is
independent of expansion. Touch and keyboard selection have the same capabilities.

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
