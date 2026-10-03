# Handoff

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
