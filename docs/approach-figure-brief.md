I'm reworking the "THE APPROACH" section. The right column currently shows an SVG outline of a human body with an animated spine line, nodes, labels, symptom chips ("Lower back pain", "Neck tension", "Knee pain", "Jaw clenching") and a caption. I want to replace the body outline with a raster image of the body, keep the animated spine/node system, and redraw it to match the new image. Read the existing section's markup, CSS and JS fully before changing anything, and keep its existing design tokens, typography, animation style and interaction patterns.

## Assets (I'll place these in the repo; ask me where if unclear)
- `approach-figure-source.png` — the new figure. Back view, warm brown-black background (~#211E1A), clean fascia texture, NO glow points or bright line baked in. This ships.
- `approach-figure-reference.png` — the original reference with the bright line and glow points baked in, same composition. Development alignment only. Never ship it or reference it in production code.

## 1. Remove the body outline
Delete the current SVG body-outline paths (head, torso, arms, legs, the thin diagonal fascia lines). Keep the spine/node/label system, but redraw it per section 4.

## 2. Image + SVG sync — this is the critical requirement
The image and the SVG overlay must stay perfectly aligned at every viewport size, zoom level and device pixel ratio. Implement it like this:

- One wrapper element (e.g. `.approach-figure`) with `position: relative` and `aspect-ratio: W / H`, where W×H are the source image's natural pixel dimensions. Read them from the file; don't guess.
- Inside it, a `<picture>`/`<img>` with `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill;`. Because the box ratio equals the image ratio, `fill` never distorts or crops. Do not use `cover`, and do not use `background-image` on the section.
- Inside the same wrapper, the overlay `<svg>` with `position: absolute; inset: 0; width: 100%; height: 100%;` and `viewBox="0 0 W H"` (the image's own pixel dimensions) plus `preserveAspectRatio="xMidYMid meet"`. All node and path coordinates are in image pixel space.
- Labels/pills: if they are HTML elements, position them inside the same wrapper using percentages computed from the image coordinates (`left: x/W*100%`, `top: y/H*100%`) plus a transform for offset. That keeps anchors locked while font size stays fixed in px. Don't position them relative to the section or column. If they're SVG, keep their text from shrinking unreadably on mobile; convert them to HTML pills positioned as above if needed.
- Size the wrapper by width (column width), with a sensible `max-height` (e.g. `min(80vh, 900px)`) achieved by limiting width (`max-width: calc(80vh * W / H)`) so the aspect ratio is never broken.
- Nothing in this wrapper may use separate breakpoint-specific coordinates. There is one coordinate system.

## 3. Blend the image into the section (no visible rectangle)
- The section background stays the existing flat dark brown token. No full-section background image.
- Feather the image edges with `mask-image` (+ `-webkit-mask-image`) on the `<img>`: a radial or combined linear gradient that is opaque over the figure and fades to transparent across roughly the outer 12–15% on all sides. Tune it so feet, head and hands are never faded, and the floor shadow fades softly. There must be no visible rectangle edge on any background.
- Add a subtle CSS radial glow behind the figure (a pseudo-element on the wrapper, warm cream/sage at very low opacity, e.g. 4–8%) so the figure sits in soft light. Keep it subtle; it must not reduce text contrast in the left column.
- Image delivery: generate AVIF + WebP + PNG fallback at ~3 widths (e.g. 600, 900, 1300px) with `srcset`/`sizes`. If no image tooling exists in the project, tell me and use `sharp` via a one-off script (don't add it as a runtime dependency). `loading="lazy"`, `decoding="async"`, explicit width/height attributes. The image is decorative (`alt=""`); keep or add an accessible title/description on the SVG that describes the connections.

## 4. Redraw the line and nodes to match the image
The new image has no glow. Positions come from the glow points and main line in `approach-figure-reference.png`, then get checked against the final image.

Seven nodes, top to bottom. These are the figure's own left side, which appears on the viewer's left in this back view. Approximate positions as a fraction of image width/height, to be refined by measurement:

| id | anatomy | approx x | approx y | label |
|---|---|---|---|---|
| jaw | cheekbone / jaw angle | 0.44 | 0.13 | Jaw |
| neck | upper trapezius | 0.45 | 0.19 | Neck & shoulders |
| upperback | latissimus / mid-back | 0.45 | 0.29 | Upper back |
| core | lower back / lumbar | 0.45 | 0.40 | Spine & core |
| hip | glute | 0.41 | 0.49 | (see labels note) |
| knee | back of knee | 0.44 | 0.66 | (see labels note) |
| ankle | ankle / heel | 0.46 | 0.85 | (see labels note) |

- **Measure, don't trust the table.** Add a temporary dev-only calibration mode (e.g. `?calibrate=1`) that layers `approach-figure-reference.png` at 50% opacity over the new image inside the same wrapper and draws node crosshairs. Align each node to the centre of its glow point, and the path to the bright main line. Then confirm against the clean image that each node sits on a sensible anatomical spot. Remove the calibration mode, and don't ship the reference file, when done.
- **Main path.** One smooth path following the reference's bright line: from behind the jaw/ear, down the neck and along the spine through the upper and lower back, sweeping across to the glute, down the back of the thigh to the knee, and down the calf to the ankle. Build it as consecutive segments between adjacent nodes (jaw→neck→upperback→core→hip→knee→ankle), so any run of segments can be highlighted independently. If a glow point sits slightly off the line, route the path through the node rather than adding stubs.
- Keep the existing animation behaviour (draw-on, pulses and transitions, whatever it does now), re-pointed at the new geometry. Keep the existing visual language: inactive nodes and segments in muted sage at reduced opacity; active ones in cream with the soft halo. Highlight transitions ~300–400ms.
- Respect `prefers-reduced-motion`: no travelling or pulsing animation, just state changes.

**Labels note:** reuse the existing label strings in the code for every node. If the hip, knee or ankle nodes have no existing label, use "Hips & glutes", "Knees" and "Ankles & feet", and tell me in your summary that you added them. Keep the current rule for which labels show. If none exists, show labels for active nodes only, so they never crowd on small screens. Labels sit to the right of their node with the existing pill style and must not overlap each other at 320px width; offset them vertically if needed.

## 5. Symptom chains (replace the current chain data)
Keep the four chips and the existing interaction (one active at a time, "Neck tension" active by default, tapping a node also works). Replace the chain data and captions with:

- **Neck tension** — nodes: jaw, neck, upperback. Caption: "Neck tension is often tied to the jaw and the upper back, not just the neck."
- **Jaw clenching** — nodes: jaw, neck. Caption: "Jaw clenching often travels down into the neck and shoulders, and tension there can feed back into the jaw."
- **Lower back pain** — nodes: upperback, core, hip, knee. Caption: "Lower back pain often involves the glutes, hamstrings and lats, which all pull on the same sheet of fascia across the lower back."
- **Knee pain** — nodes: core, hip, knee, ankle. Caption: "Knee pain is often driven by the hips above and the ankle and foot below."

Highlight the segments between consecutive active nodes. When a node is tapped directly, activate the chip whose chain is most associated with it: jaw → Jaw clenching, neck → Neck tension, upperback → Neck tension, core → Lower back pain, hip → Lower back pain, knee → Knee pain, ankle → Knee pain. Keep chips as buttons with `aria-pressed`, nodes focusable with visible focus rings and accessible names. Announce caption changes politely (`aria-live="polite"`).

## 6. Layout
- Desktop: same two-column layout. The figure wrapper takes the right column's place, vertically centred against the text column like the current figure. Keep "One connected system" above, and caption, chips and helper text below, unchanged in style.
- Tablet/mobile: stack as now. Wrapper width ~min(100%, 420px), centred; chips wrap as now.

## 7. Verify before finishing
- Screenshot the section at 375, 768, 1024, 1440 and 1920px wide (and at 1440 with browser zoom 150% if you can). Confirm at each that nodes sit on the same anatomical spots, there's no visible image rectangle edge, labels don't overlap, and text contrast in the left column is unchanged.
- Click every chip and every node and confirm the correct chain and caption.
- Confirm the reference image and calibration code are not in the production build.
- Summarise what you changed, final W×H, final node coordinates, total image weight per format, and any labels you added.
````
