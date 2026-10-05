# Handoff

## Recall Atlas rename — 2026-10-05

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/20
- Branch: `codex/rename-recall-atlas`, based on `100eeca` from PR #18
  (`codex/inline-topic-graph`). Assisting tool: Codex.
- GitHub repository renamed to `drvarunkrishnakv/recall-atlas`; shared local
  origin updated. Main protection verified unchanged (admin enforcement and
  strict required `quality` check). Existing PRs retain their numbers and bases.
- App headers, browser title, README, npm workspace names/lockfile and repository
  links now use Recall Atlas. The original `polity-atlas-theme` storage key is
  intentionally retained for saved appearance preferences. Subject labels,
  academic records, permanent IDs, routes and historical screenshots are unchanged.
- Checks: `npm ci`; `npm run check` passed formatting, TypeScript, 24 unit tests,
  production build and public audit. Browser theme/catalogue suites passed all
  12 desktop/phone/tablet cases with one worker, using
  `npx playwright test --config output/rename.config.ts tests/browser/theme.spec.ts tests/browser/catalog.spec.ts --workers=1`.
  Initial four-worker run had one desktop blocked-storage timeout; sequential
  rerun passed without application changes. Isolated test server used port 4186.
- Visual QA: reviewed `docs/design/recall-atlas-{desktop,phone}.png`.
  Browser title and retained legacy light-mode preference verified using Playwright
  CLI. Review server: http://localhost:4188/ . Physical devices/Safari untested.
  npm install reports two moderate dependency advisories; dependencies unchanged.
- No merge or production deployment. Next: review this rename atop PR #18;
  main's README and existing running copies change only when the branch is integrated.
  The local workspace folder remains in place to preserve other active worktrees.

## Inline Constitution topic graph — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/17
- Branch: `codex/inline-topic-graph`, based on `48da912` from PR #16.
  Implementation commit: `48e9e41`.
  PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/18
  (stacked on PR #16). Assisting tool for this correction: Codex.
  A documentation checkpoint follows; resume from the actual branch head.
- User correction: the syllabus topic must show study connections immediately,
  without requiring a separate Open map action. Constitution now lazy-loads a
  combined graph with 260 canonical concepts and all 419 existing edges.
- Explore theme, the grouped Topic index, or clicking another theme focuses it
  on the same topic route. The initial focus is Preamble. All records remain on
  canvas; focus deliberately rearranges the layout for readability, whereas
  ordinary selection/hover retain positions. Shared Articles occur once.
- Saved microtheme links resolve to their focus directly. New bookmarks preserve
  both theme focus and selected node. Legacy standalone routes still work.
  Eleven unauthored related themes retain home-topic outline links in the index.
- Canonical content JSON is unchanged. The union preserves original edge evidence,
  namespacing differing source records so their locators and URLs remain intact.
  Composition and spatial layout are separate. No new academic edges, corpus
  regeneration, source re-review, merge or deployment.
- Validation: `npm run check` passed format, TypeScript, 24 unit tests, production
  build and public audit. Full browser suite: 75 passed, six mouse-only touch
  skips. After final bookmark, index accessibility and mobile fit refinements,
  `tests/browser/topic-graph.spec.ts` passed seven tests with two mouse-only touch
  skips. Isolated browser config:
  `output/grok-pilot/independent.config.ts` (port 4175).
- Visual QA: desktop, phone and tablet dark/light screenshots under `output/qa/`
  with `inline-topic-` prefix. Tablet legend wrapping was corrected. Physical
  devices and Safari remain untested. Review server remains http://localhost:4177/.
- Limits: this is the existing authored Constitution content composed into one
  topic view, not completion of other syllabus topics or a new cross-topic edge
  authoring pass. Whole-topic fit is an overview; choose a theme or zoom for
  readable detail. Existing source cutoffs and selective case/event coverage apply.
- Next: user reviews this corrected interaction before the Federalism content batch.


## Constitution foundations — reviewed first-topic release, 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/15
- Branch: `codex/constitution-foundations`, based on `d4acd51` from PR #14.
  Implementation commit: `646de27`.
  PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/16
  (stacked on `codex/graph-on-demand`, PR #14). A documentation checkpoint
  commit follows; resume from the actual branch head.
  No merge, production deployment or remote-protection changes.
- Assisting tools: Grok CLI (`grok-4.7`, `xhigh`) drafted the engine and content
  in isolated worktrees. Codex independently reviewed, corrected and broadened
  records, revised the layout, integrated, tested and documented the release.
- Constitution & its foundations now has 36 new maps for 37 home identities,
  plus the unchanged Fundamental Rights map: 38/38 home identities have a study
  destination. The two constitutional-morality identities share one map.
  Eleven related themes remain part of their later home-topic authoring passes.
- New bank: 234 concepts, 367 explained edges, 27 sources, 84 paraphrased PYQ
  angles (14 Mains / 70 Prelims). Twenty-one concepts reuse the original rights
  records verbatim, excluding layout fields. IDs, register totals and existing
  taxonomy placements are preserved.
- Added lazy study routes and a small separate route index. Layout and one-hop
  highlighting remain independent from content. The whole selected map is present;
  heading selection frames details. Outward teaching groups replace a long strip.
  Portrait tablet and phone views centre a readable topic; the inspector lists
  its groups. Precise labels distinguish clauses, Schedules and historical context.
- Sources were retrieved for all home themes, then checked against actual book
  pages and primary texts. Review corrected narrow option-based notes and several
  legal distinctions. See `docs/CONTENT_REVIEW.md` for evidence and limitations.
  Embeddings and the private corpus were not regenerated or published.
- Validation: `npm run check` passes format, types, 22 unit tests, production build
  and public boundary audit. Full isolated browser run:
  `npx playwright test --config output/grok-pilot/independent.config.ts` —
  71 passed, four mouse-only tests skipped on touch profiles.
  Following the final tablet-camera and Mains-prompt refinements, the targeted
  catalogue/study suite passed: 22 tests, two mouse-only touch skips.
  Command: the same isolated config with `tests/browser/catalog.spec.ts` and
  `tests/browser/study-maps.spec.ts`.
- All 36 new routes were exercised with full node/edge membership on desktop,
  Pixel 7 and iPad Chromium profiles. Canonical-record, coverage, connectivity,
  core-family and bounded-neighbour tests pass. Hover checks retain measured
  dimensions and pinned details. Screenshots are in `docs/design/foundations-*`.
  Physical devices and Safari remain untested.
- Review server: http://localhost:4177/ . Earlier 4173 serves the primary checkout;
  do not use it to verify this branch. The isolated browser server uses 4175.
- Limitations: Constitution text cutoff is May 2024; case coverage is selective
  through November 2024. Two dated citizenship examples include an August 2026
  Gazette update; this is not an exhaustive current-law or current-affairs feed.
  Official PYQ transcription/answer keys were not re-certified. The weekly Tracker
  automation and cross-topic gateways remain unbuilt.
- Next concrete authoring batch: topic 2, Federalism & local government, with
  21 home identities. Inventory and review these against private sources, keep
  canonical Articles shared, and use a topic-scoped bank. Continue through the
  remaining seven topics before the separately reviewed cross-topic link pass.

## On-demand graph screens / Grok coding pilot — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/13
- Branch: `codex/graph-on-demand`, based on `3fe9624` of
  `codex/polity-syllabus-overview`. Implementation commit: `8480840`.
- PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/14 (stacked on PR #12).
  A handover-only commit follows; resume from the actual branch head.
- Assisting tools: Grok CLI (`grok-4.7`, `xhigh`) wrote code and review corrections
  in an isolated worktree. Codex specified scope, reviewed, independently tested,
  captured screenshots and prepared the PR. No automatic merge or deployment.
- App entry now imports only the library and small route loader. Two dynamically
  imported screen modules own React Flow and their respective dataset/validation.
  Home and GS II download neither engine nor catalogue/study records. Overview
  and study routes exclude each other's content. No content records changed.
- Loading/failure states permit Back to library; failures offer Reload. Stale
  loads cannot replace a newer route. Technical details stay in the console.
  Fresh canonical/legacy bookmarks, theme persistence, full graph membership,
  bounded highlighting and prior camera/selection behaviour are preserved.
- Independent `npm run check` passed: format, TypeScript, 14 unit tests, build,
  public audit. Full browser suite using the isolated worktree server on 4175:
  `npx playwright test --config output/grok-pilot/independent.config.ts` —
  55 passed, two mouse-only cases skipped on touch. Normal CI uses
  `npm run test:e2e` on 4173; the override avoids testing the primary checkout.
- Production request inspection on 4176 verified home, GS II, overview, canonical
  study and legacy study URLs. The pre-change negative control failed correctly.
  Entry JavaScript: 582.73 → 212.63 kB raw; 156.78 → 66.52 kB gzip.
  Study chunk 63.79 kB; overview 112.39 kB; shared graph engine 196.23 kB.
  No raised chunk warning threshold. This measures payload, not device speed.
- Screenshots: `docs/design/on-demand-*`; recovery screenshots intentionally
  simulate a failed chunk. Visual review and responsive widths pass in Chromium
  emulation; physical devices and Safari remain untested.
- Pilot required steering after excessive initial exploration, explicit per-run
  edit permissions, and review fixes to bookmark/slow-response tests and error
  presentation. Existing global Grok configuration was not changed. Continue with
  small bounded assignments and independent verification; do not infer that xhigh
  is the most efficient setting from this single run. Usage/transcripts remain
  in ignored local output, not in the public repository.
- Local production preview: http://localhost:4176/#/gs2/polity . Existing 4173
  remains the previous primary checkout. No larger feature has been assigned.
- Next: review this pilot PR and orchestration assessment before assigning another
  bounded change. Full Polity authoring remains at the previous coverage checkpoint.

## Polity syllabus overview — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/11
- Branch: `codex/polity-syllabus-overview`, based on appearance handover `a67a75f`.
  Assisting tool: Codex. Implementation commit: `5bddfa7`.
- PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/12 (open).
  A handover-only commit follows; use the actual branch head when resuming.
- Polity now opens a nine-topic syllabus overview. Topic canvases show all mapped
  themes; selecting a theme opens its coverage outline. Search, sidebar lists,
  back navigation, persistent appearance and old node bookmarks work. Fundamental
  Rights has a dedicated route and a Polity breadcrumb back to the overview.
- Separate catalogue `2026.10.04.1`: 139 Polity themes (118 Mains / 210 Prelims)
  and 15 related-subject themes (30 / 16), preserving canonical IDs. Two Polity
  themes remain Prelims context. Original tags and 87 new editorial placements
  are visibly distinguished. Counts overlap across syllabus topics.
- Reviewed the official 2026 notification and checked five imported register files
  against their manifest hashes. Accepted per-question counts reconcile with the
  catalogue. Three original source-quality flags remain disclosed. Private audit:
  `output/polity-expansion/`; no raw source text or source manifests are published.
- `npm run check`: passed (format, TypeScript, 14 unit tests, production build,
  public audit). `npm run test:e2e`: 37 passed, two mouse-only cases skipped on
  touch. Covers new hierarchy, bounded highlights, counts/references, status gates,
  legacy bookmarks, reload/history, no overflow, both themes and the hover fix.
- Screenshots: `docs/design/polity-{overview,theme}-{desktop,phone}.png`.
  Chromium emulation only; physical devices and Safari remain untested. Vite reports
  a >500 kB main bundle warning; it is not a build failure. Split catalogue/study
  loading before substantial additional content releases.
- Limits: this completes the agreed coverage-map step, not all Polity study notes.
  Only Fundamental Rights has an authored study example. Mains register ends in
  2025; 2026 Mains is not ingested. PYQ text and answers are not official-certified.
  Governance/social justice/IR are outside this core Polity navigation scope.
- Next: review the syllabus-to-theme structure, then author one coherent next
  microtheme (DPSP/duties or constitutional amendment/basic structure), preserving
  sourced connections and shared concept IDs. Do not bulk-generate unchecked graphs.
  Review this PR into PR #10's branch; no merge or Firebase deployment performed.

## Dark/light appearance — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/9
- Branch: `codex/dark-light-mode`, based on hierarchy handover `f5ca72d`.
  Assisting tool: Codex. Implementation commit: `10c6ac7`.
- PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/10 (open).
  A handover-only commit follows; use the current branch head when resuming.
- Sun/moon toggle in the library and graph header. Dark is the initial default;
  a browser-local preference survives navigation/reloads. Storage failures leave
  the toggle usable for the current session. Choice is per browser, not cloud-synced.
- Shared palette tokens cover the canvas, grid, links, minimap, inspector, search,
  index and library. Node types keep their semantic hue and explicit text labels.
  Changing appearance preserves pinned details, camera, all 47 concepts/52 edges,
  and the bounded hover behaviour. No content/corpus changes.
- Validation: `npm run check` passed (format, TypeScript, nine content/graph
  tests, production build and public audit); `npm run test:e2e`: 31 passed, two
  mouse-only cases skipped on touch profiles. New checks cover keyboard switching,
  persistence across routes/reloads, stable camera and selection, light-mode type
  label contrast, responsive bounds and blocked storage. Screenshots: `docs/design/light-mode-desktop.png`,
  `light-mode-phone.png`, `dark-mode-desktop.png`, `dark-mode-phone.png`.
- Limitations: Chromium desktop/phone/tablet emulation; physical devices and Safari
  remain untested. No merge or Firebase deployment.
- Next: review this follow-up into PR #8's branch, then the existing PR stack.

## Six categories and node-type colours — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/7
- Branch: `codex/rights-hierarchy-colours`, based on complete-theme handover
  `ceaa784`. Assisting tool: Codex. Implementation commit: `5a27d5a`.
- PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/8 (open).
  Later handover-only commits may follow; use the actual branch head when resuming.
- Release `2026.10.04.1`: 47 concepts, 52 explained edges and seven PYQ angles.
  Six category records introduce the Articles. Supporting and omitted provisions
  occupy separate labelled regions, not extra rights categories. All earlier
  concept IDs and substantive cross-links are retained. See CONTENT_REVIEW.md
  for sources, affected records and retired display-edge IDs.
- Neutral topic/context, purple categories, blue Articles, amber judgments, teal
  concepts/applications and rose dated events. Text badges supplement colour;
  topic/category cards are larger. Article 226 and 359 now use the Article type.
- Initial desktop view frames the six-category skeleton. Choosing a category
  frames its Articles without disclosure or hiding. All records stay on canvas.
  Root inspector lists six categories first and constitutional context separately.
- Desktop hover preview names the highlighted concept and identifies the pinned
  sidebar when they differ. Inspector is explicitly labelled Pinned details.
- Validation: `npm run check` passed (format, TypeScript, nine graph/content tests,
  build, public audit). `npm run test:e2e`: 25 passed, two mouse-only hover cases
  skipped on touch profiles. Category membership, colours, no disclosure, camera
  framing, pinned/hover distinction and flicker regression covered.
- Screenshots: `docs/design/six-categories-desktop.png`,
  `docs/design/typed-nodes-desktop.png`, `docs/design/freedom-articles-phone.png`.
  Chromium emulation; physical devices and Safari not tested.
- Next: review this follow-up into PR #6's branch, then the existing PR stack.
  No merge, Firebase deployment, corpus regeneration or private publication included.
  Older checkpoint descriptions below are historical and may describe superseded UI.


## Complete microtheme view — 2026-10-04

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/5
- Branch: `codex/show-complete-theme`, based on hover fix handover `44610b2`.
  Assisting tool: Codex. Implementation commit: `f8428d7`.
- PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/6 (open).
  Later handover-only commits may follow; use the actual branch head when resuming.
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

- Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/3
- Branch: `codex/fix-hover-flicker`, based on `bfe97a7` of the still-open app PR #2.
  Assisting tool: Codex. Fix commit: `245e95a`.
- Fix PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/4 (open).
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

Issue: https://github.com/drvarunkrishnakv/recall-atlas/issues/1
Repository: https://github.com/drvarunkrishnakv/recall-atlas
Branch: `feat/fundamental-rights-graph`. Assisting tool: Codex.
Foundation commit: `826d9b9`. App implementation commit: `1718a3d`.
PR: https://github.com/drvarunkrishnakv/recall-atlas/pull/2 (open for user review).
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

## Historical outstanding decisions from the initial example

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
