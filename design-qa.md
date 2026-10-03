# Design QA

## Reference and evidence

- Source visual truth: `docs/design/selected-canvas-option-2.png`, 1586 × 992 pixels.
- Implementation: `docs/design/fundamental-rights-desktop.png`, 1586 × 992 pixels;
  matching 1586 × 992 CSS viewport, DPR 1. No density conversion on desktop.
- State: selected concept, direct connections bright, unrelated context dim,
  inspector open. The reference selects Parliament; the requested implemented
  sample selects Article 21. This topic substitution is intentional, not a claim
  that the generated mock's academic content was reproduced.
- Phone: `docs/design/fundamental-rights-phone.png`, 1082 × 2202 pixels,
  412 × 839 CSS px at DPR 2.625 (rounding). Evaluated at CSS scale, not compared
  pixel-for-pixel against the desktop reference.
- Tablet: local `output/qa/tablet-base.png`, 1620 × 2160 pixels,
  810 × 1080 CSS px at DPR 2. Evaluated as responsive adaptation.
- Local focused pairs: `output/qa/reference-inspector.png` /
  `output/qa/implementation-inspector.png`; `reference-node.png` /
  `implementation-node.png`. Crops use the same desktop density.

## Findings and comparison history

1. P1 fixed: hover could replace pinned inspector details. Selection now owns
   inspector content; hover only previews highlighting. Browser regression passes.
2. P2 fixed: initial fit-to-all made phone/tablet nodes too small. Small screens
   now centre the selected concept at readable zoom. Pan, fit, search and index
   expose the wider graph. Offscreen canvas content is deliberate, unlike clipped
   persistent controls; controls remain within viewport.
3. P2 fixed: graph content could pass underneath the title and toolbar. The graph
   viewport now reserves top and bottom control areas.
4. P2 fixed: undersized recall text and React Flow's neutral-grey background drifted
   from the selected mock. Recall text is now 14px; the graph background uses the
   cool #090f14 token, including the background layer.
5. P2 fixed: selection labels did not reflect incoming edges. Inspector now uses
   incoming arrows and “part of”/“interprets” labels where appropriate.

## Required fidelity surfaces

- Typography: self-hosted Inter, clear title/meaning hierarchy, 26px desktop inspector
  title, 14px recall, compact graph labels. One-line node meanings can ellipsize;
  the inspector exposes the complete meaning. Case labels retain name and year.
- Spacing/layout: 64px desktop header, 365px desktop inspector, compact bordered
  nodes and restrained dividers. Compare full-view evidence and focused crops.
  Radial placement adapts the selected circuit style to this microtheme; there is
  no prescribed flowchart reading order. The extra topic heading/index are needed
  to expose the syllabus and complete article register.
- Colours/tokens: dark cool canvas/panel, muted slate text and edges, green article
  dots, pink judgments, cyan applications, purple foundation. Selected edges are
  light; unrelated nodes fade. Analytical links are dashed.
- Image/asset fidelity: the design contains no photographic or illustrated content
  to generate. Graph nodes/edges are functional React Flow UI, with Phosphor icons.
  No rasterized interface, invented decorative artwork, or image placeholders.
- Copy/content: short recall and Mains framing; no textbook paragraphs, fake high-yield
  scores or gamification. Mock-only “UPSC use” tags are replaced by actual question
  angles and cited evidence. Current-affairs example is explicitly dated.

## Interaction and accessibility checks

Desktop, touch-phone and touch-tablet Chromium profiles cover navigation, search,
no-results, topic index, omitted Article 31, relationship explanations, source titles,
keyboard activation, pinned details, direct-only expansion, reset and viewport bounds.
Console page-error capture is empty on the core flow. In-app browser inspection also
reported no error/warning logs. Focus outlines and reduced-motion CSS are present.
No horizontal document overflow. Pinch/pan use React Flow; physical gesture feel and
Safari are follow-up device checks, not claimed as verified.

## Open questions / follow-up polish

- P3: user's preferred node density and graph spacing after personal revision use.
- P3: validate the touch experience on the user's physical iPad and Android phone.
- Canvas facts use the cited-source review in docs/CONTENT_REVIEW.md; visual QA is
  not independent subject-expert certification.

## Implementation checklist

- [x] Restore selected visual direction and meaningful interactions.
- [x] Fix P1/P2 findings and recapture desktop and responsive states.
- [x] Preserve source access, concise notes and bounded highlighting.
- [x] Record limitations and handover instructions.

final result: passed
