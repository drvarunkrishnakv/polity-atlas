# Handoff

## Complete microtheme view — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/polity-atlas/issues/5
- Branch: `codex/show-complete-theme`, based on hover fix handover `44610b2`.
  Assisting tool: Codex. Use the actual branch head when resuming.
- All 41 concepts and 46 edges in the current example render immediately and
  remain present through selection, search, camera movement and Reset. Removed
  per-node Reveal controls and obsolete expansion logic. Academic records unchanged.
- Hover still highlights only direct neighbours; selecting a node pins details.
  Article 21 → Puttaswamy → Privacy is available without disclosure steps.
- Added full-theme counts, an overview map, and Frame connections (camera only).
  The initial view uses readable zoom; off-screen nodes remain on the canvas and
  are accessible by pan/zoom, Fit graph, index or inspector links.
- Cross-theme gateways are reserved for actual sourced destinations. This example
  has only one microtheme, so none are fabricated. No new corpus work or deployment.
- Checks: `npm run check` passes (format, TypeScript, six unit tests, build, public
  audit). `npm run test:e2e`: 22 passed, two mouse-hover cases skipped on touch
  profiles. Includes complete graph counts, no Reveal controls, direct-only
  highlighting, camera framing, Privacy card clicking and the flicker regression.
- Screenshots: `docs/design/complete-theme-desktop.png` and
  `docs/design/privacy-chain-{desktop,phone}.png`. Chromium desktop/phone/tablet
  emulation passed; physical-device and Safari verification remain outstanding.
- Next: review this follow-up into the hover-fix branch (PR #4), then the original
  implementation (PR #2). Earlier checkpoint descriptions below are historical;
  per-node expansion is superseded by this user-approved complete-theme contract.


## Hover flicker follow-up — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/polity-atlas/issues/3
- Branch: `codex/fix-hover-flicker`, based on `bfe97a7` of the still-open app PR #2.
  Assisting tool: Codex. Fix commit: `245e95a`.
- Fix PR: https://github.com/drvarunkrishnakv/polity-atlas/pull/4 (open).
  Later handover-only commits may follow; use `git rev-parse HEAD` to resume.
- Root cause reproduced in Chromium: hover rebuilt controlled nodes without their
  measured dimensions, temporarily hiding cards and removing edges. Hiding the
  hovered card also cleared the hover state.
- Fix: retain dimensions reported by React Flow's `onNodesChange`; keep content
  records and selection semantics unchanged. No corpus or CSS changes.
- Regression: test card centres and four edges across five nodes, checking every
  animation frame for lost highlights, hidden nodes or disappearing connections;
  verify stable bounds, pinned inspector and returning to selection on pointer exit.
- Checks: `npm run check` passed (format, TypeScript, six unit tests, build, public
  audit). `npm run test:e2e`: 19 passed, two hover-only cases skipped on touch
  profiles. Existing desktop/phone/tablet interaction tests passed.
- Screenshots: `docs/design/hover-fixed-desktop.png` and
  `docs/design/hover-fixed-phone.png`; Chromium emulation, not physical devices.
- Next: review the fix PR into the original feature branch, then review app PR #2
  into main. Firebase deployment remains unconfigured and unauthorized by this fix.


## Current task and ownership

Issue: https://github.com/drvarunkrishnakv/polity-atlas/issues/1
Repository: https://github.com/drvarunkrishnakv/polity-atlas
Branch: `feat/fundamental-rights-graph`. Assisting tool: Codex.
Foundation commit: `826d9b9`. App implementation commit: `1718a3d`.
PR: https://github.com/drvarunkrishnakv/polity-atlas/pull/2 (open for user review).
Later documentation-only commits may follow; use the actual branch head to resume.

## Completed

- Public repository; main requires a PR, the `quality` check and resolved discussions.
  Admin enforcement is enabled. Force pushes and branch deletion are disabled.
- Shared AGENTS.md with Claude/Gemini pointers, architecture, decisions, content
  review, publication boundary and Firebase deployment instructions.
- TypeScript/React/Vite/React Flow app matching selected option 2. GS papers → GS II
  subjects → Polity canvas. Other subjects are explicitly unavailable in this example.
- 41 source-cited nodes, 46 explained edges and seven paraphrased Mains angles.
  Full Part III provision skeleton plus selected cases and a dated 2024 event.
- Search, index, direct-only hover highlighting, pinned details, deliberate one-hop
  expansion, zoom/pan/fit/reset, source links and keyboard/touch selection.
- Desktop sidebar; tablet collapsible details; phone bottom sheet. Small screens
  intentionally start at readable zoom, with pan/fit for the wider graph.
- Python corpus is unchanged and ignored. Original HTML SHA-256 remains
  `6640d72b25071092f7aeebbdae0f7df5845e605bdb4bcd87efe0fc4a3469060e`.
- Vite filesystem serving is restricted to the app and dependencies; parent workspace
  files cannot be fetched through the development server. Regression test included.

## Verification

- `npm run check`: formatting, strict TypeScript, six graph/content tests,
  production build and public-file audit.
- `npm run test:e2e`: 18 cases across desktop, Pixel 7 and iPad-size emulation.
  Includes search/empty state, navigation, expansion, reset, keyboard, touch,
  inspector pinning, overflow and development-server filesystem isolation.
- All three test profiles run Chromium; this is not physical iPad/Safari certification.
- `npm audit --omit=dev --audit-level=high`: zero reported vulnerabilities after
  patching Vite to 6.4.3. Lockfile committed.
- Visual evidence: docs/design/fundamental-rights-{desktop,phone}.png and design-qa.md.
  Full local logs/screenshots are in ignored output/. CI reports remote results.

## Run / resume

```sh
npm ci
npm run dev
# http://localhost:4173/#/gs2/polity
npm run check
npx playwright install chromium
npm run test:e2e
```

Keep this task branch for review. Do not bypass main protection. Next agent should
read the issue/PR, inspect `git status`, and continue from the actual branch head.
No uncommitted private corpus file belongs in a handover commit.

## Outstanding decisions / next work

1. User tests Article 21 → Reveal connections → Puttaswamy → Privacy, then reviews
   the first PR before merging the app into main.
2. Select a dedicated Firebase project for a Hosting preview. Config exists, but
   no Firebase project has been created/selected and nothing has been deployed.
3. Firebase Auth, Firestore publishing and a private graph adapter remain future
   integration work. The sample intentionally uses bundled public study summaries.
4. No weekly scheduler, new embeddings, full corpus generation, live Tracker updates,
   all-subject content or full case-law coverage is implemented.
5. Complete physical-device and Safari checks before treating mobile support as
   production-validated. Current-content legal updates need fresh affected-source review.

The architecture decision is approved. UI density and academic usefulness of this
first example still await user feedback. Do not expand the product into a reader,
chat tutor or game during follow-up.
