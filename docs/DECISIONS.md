# Decisions

- 2026-10-03: Public code repository; separately stored private corpus. Approved by user.
- 2026-10-03: TypeScript / React / Vite / React Flow; retain Python source preparation.
  Rust adds no needed capability for the first browser graph.
- 2026-10-03: Firebase Hosting chosen; deploy only after a project is explicitly selected.
- 2026-10-03: Protect main with required PR and checks, no force pushes or deletion,
  enforcement for admins. Zero required external reviewers for a single-owner repo.
- 2026-10-03: Title + meaning on nodes; brief inspector. Direct neighbours highlight;
  additional depth requires deliberate expansion. Responsive touch controls required.
- 2026-10-03: First content release is an original, source-cited Fundamental Rights
  demonstration. Full corpus conversion and scheduled imports are separate work.

- 2026-10-04: User rejected per-node Reveal because hidden links look like absent
  knowledge. Supersedes the earlier deliberate-expansion decision: render every
  record in the current curated microtheme immediately. Hover remains one hop;
  selection pins details. Camera framing and the overview aid navigation without
  changing content visibility. Named gateways are reserved for real neighbouring
  microthemes; this single-theme example has none yet.

- 2026-10-04: User approved six-category teaching structure and type-coloured boxes.
  Categories precede Articles; cases and applications keep their cross-links.
  Main topic is neutral; categories purple, Articles blue, judgments amber,
  applications teal, current affairs rose. Labels supplement colour. Supporting
  and omitted provisions are visibly separate. Hover preview and pinned details
  have independent labels. No per-node disclosure or automatic corpus regeneration.

## 2026-10-04 — Persistent dark/light appearance

Provide an explicit sun/moon toggle in both app headers. Preserve dark as the
first-use default and store the choice in this browser. Both palettes retain the
node-type hues and labels. Theme is presentation state above routing; switching
must preserve selected concept and camera. No system-following or account-sync
setting is introduced for this two-mode request.

## 2026-10-04 — Syllabus coverage before bulk Polity authoring

Replace the Polity-to-example shortcut with a syllabus overview and PYQ theme
navigation. Use GS II bullets 1–9 for core Polity; retain overlaps from adjacent
subjects and a separate supporting Prelims context. Governance/social justice/IR
remain separate subject scopes. Preserve existing theme IDs and source tags while
making any new Mains navigation placement explicit.

Maintain a coverage catalogue independent from academic study graphs. An outline
must never imply that Articles, judgments or current-affairs claims have been
reviewed. Keep the current example intact and build further authored microthemes
in affected-record batches after the coverage map is reviewed. No corpus rebuild.

## 2026-10-04 — Load each graph screen with its own dataset

Home and GS II stay in the entry and download neither React Flow, the syllabus
catalogue, nor the Fundamental Rights graph. Overview and topic routes load the
catalogue screen only. Study routes, including legacy `?node=` links, load the
study screen and its graph only. Each screen owns its React Flow provider and
validates its own data. A stale load must not replace a newer route. Failures
remain on screen, with Reload and Back to library. No router or global store.

## 2026-10-04 — Shared constitution bank, separate study maps

Further constitution microthemes are projections of one reviewed bank, not
copies of the Fundamental Rights file. A map includes only the node and edge
IDs it lists. Shared concept IDs stay stable across maps. Catalogue aliases may
point two microtheme IDs at one slug. The study index is the only overview
metadata for those routes; the bank loads when `#/gs2/polity/study/<slug>`
opens. Each slug gets its own React Flow provider. The empty scaffold is not
reviewed content, and similarity or co-membership must not invent edges.


### First-topic shared bank and outward teaching layout — 2026-10-04

The authoring unit is a home microtheme within one syllabus topic. Several maps
may reuse a concept without duplicating its identity. The first bank uses 36 map
projections for 37 identities, alongside the unchanged Fundamental Rights release.
The final cross-topic integration remains a later source-reviewed pass.

Initial testing showed a single horizontal row made the main headings too small.
Balanced groups around the root keep the teaching skeleton readable, with details
extending outwards and all records present. Selection frames groups; one-hop hover
and pinned details remain separate. Historical milestones use Context, and optional
specific type labels distinguish Schedules, statutes and Article clauses.


## 2026-10-04 — Study connections inside the syllabus topic (issue #17)

The owner rejected the topic catalogue requiring an Open map action. Authored
syllabus topics must open study connections directly. Constitution composes its
existing banks, reuses shared identities and provides in-canvas theme focus.
Focus changes layout, never graph membership; hover remains one hop. Standalone
routes remain compatible, but are not a required navigation step. Untouched
syllabus topics remain explicit outlines until their content is authored.


## 2026-10-05 — Return to complete focused maps (issue #19)

Owner testing found the combined topic canvas required too much scrolling. Restore
syllabus topic → canonical PYQ theme → complete focused map, opening authored
maps on the first click. Only unfinished themes show a coverage outline. Preserve
all records within each map and one-hop highlighting; do not restore per-node
Reveal. Selected source-backed sidebar gateways link maps at shared Articles.
Existing combined-canvas bookmarks migrate rather than breaking. This supersedes
the 2026-10-04 inline-topic decision; it does not regenerate content or embeddings.
