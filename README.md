# Polity Atlas

A personal UPSC Mains revision graph. Read elsewhere, then use the graph to recall
concepts and understand justified connections. No textbook reader, tutor or game.

## Product contract

GS papers → subjects → syllabus topics → PYQ microthemes → concepts. A compact
node contains a title and one-line meaning. The inspector shows short recall
bullets, Mains use, explained connections and source references. Show the complete
curated microtheme from the start; highlight direct neighbours only.

The selected design is `docs/design/selected-canvas-option-2.png`. Generated mock
copy is visual reference only, not study evidence.

## Run

Node.js 22.12+ and npm are required.

```sh
npm ci
npm run dev
npm run check
npx playwright install chromium
npm run test:e2e
```

The app is in `apps/web`; curated, versioned content is separate from components.
The Polity overview maps nine syllabus topics and 154 unique PYQ themes.
The first topic, Constitution & its foundations, now has 37 detailed maps covering its 38 home microtheme identities. See `docs/HANDOFF.md` for exact
implementation and verification status, and `docs/ARCHITECTURE.md` for boundaries.

## Public code, private corpus

This repository contains code, small original study summaries and documentation.
Books, extracted text, embeddings, Tracker data, source packets, credentials and
machine-specific manifests are excluded from Git. A local corpus snapshot exists
in the owner's workspace; it is not required to run the public example. Corpus
setup details remain in ignored `docs/private/CORPUS_WORKSPACE.md`.

Do not upload the workspace wholesale. Run `npm run audit:public` before publishing.
Any future agent can work on UI from this repository; private-source generation
requires separately provisioned corpus access. No upstream project is required.

## Workflow

Read `AGENTS.md` before editing. One issue and branch per task; independent worktrees
for simultaneous agents. Pull requests, automated checks and previews precede
merging. Main is protected on the public remote. Production release is a separate,
explicit action. Never put provider credentials in frontend code.

## Polity coverage map

Open GS II → Polity → a syllabus topic → a PYQ theme. The canvas uses the first
nine GS II syllabus bullets as the Polity spine; headings are concise paraphrases
with a link to the official 2026 notification. All nine topics remain present.
The catalogue preserves 139 Polity themes (118 Mains / 210 Prelims occurrences)
and 15 related themes from other subjects. Topic memberships overlap and must
not be summed. Two supporting Prelims themes are separate from the Mains bullets.

Existing question-register tags and new editorial navigation placements are
labelled separately. Theme outlines are not completed study graphs. Mains data
covers 2013–2025 and Prelims 2009–2026; supplied questions/answers are not certified
against official papers. Raw texts and per-question audit trails remain private.

## First study example

From Constitution & its foundations, choose Fundamental Rights → Open Fundamental
Rights graph. All 47 concepts and 52 links are already on the canvas.
Start with the six rights categories, then select Right to Freedom → Article 21 →
Puttaswamy → Privacy without revealing anything. Selecting a category frames its
Articles. Node tints and text labels distinguish categories, Articles, judgments,
applications, events and context. Supporting and omitted provisions sit in separate
labelled reference areas. Hover changes
highlighting; click/tap pins the inspector. “Frame connections” only moves the
camera. Use the overview, pan/zoom or Fit graph to explore off-screen concepts,
and “Why?” for relationship evidence. Reset preserves the complete graph.

Desktop uses a right inspector; smaller screens support closing details and phones
use a bottom sheet. The graph deliberately pans beyond the screen at readable zoom.
The sample has 47 nodes, 52 relationships and seven Mains angles. Its current-affairs
example is dated 2024. See docs/CONTENT_REVIEW.md for scope and source limitations.

## Constitution foundations release

From GS II → Polity → Constitution & its foundations, select a home theme and
open its study map. There are 36 new maps plus the original Fundamental Rights
map; the two constitutional-morality register identities share one destination.
The 11 related themes retain their later home-topic authoring passes.

The new bank contains 234 canonical concepts, 367 explained relationships and
84 short PYQ angles, labelled Mains or Prelims. Shared Articles keep their existing
identities. All eleven duty clauses, the full Directive Principles Article family,
all five writs, constitutional history and making, Parts and Schedules, amendments,
and selected cases and dated citizenship developments are included. This is
curated revision coverage, not every judgment or a complete current-law service.

The map loads on demand. Its headings surround the topic and details extend
outwards; select a heading to frame its group. Every node is already present.
Source dates remain visible. Dark/light appearance, bookmarks, direct-neighbour
highlighting and the responsive inspector work across the new maps.
