# Polity Atlas

A personal UPSC Mains revision graph. Read elsewhere, then use the graph to recall
concepts and understand justified connections. No textbook reader, tutor or game.

## Product contract

GS papers → subjects → syllabus topics → PYQ microthemes → concepts. A compact
node contains a title and one-line meaning. The inspector shows short recall
bullets, Mains use, explained connections and source references. Reveal direct
neighbours first; never recursively light up the entire corpus.

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
The first example covers Fundamental Rights. See `docs/HANDOFF.md` for exact
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

## First example

Open GS II → Polity. Search for Article 21, select it, and reveal its connections.
Hover changes highlighting; click/tap pins the inspector. Use “Why?” to inspect
a relationship, the topic index for all provisions, and Reset for the base view.

Desktop uses a right inspector; smaller screens support closing details and phones
use a bottom sheet. The graph deliberately pans beyond the screen at readable zoom.
The sample has 41 nodes, 46 relationships and seven Mains angles. Its current-affairs
example is dated 2024. See docs/CONTENT_REVIEW.md for scope and source limitations.
