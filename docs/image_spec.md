Here are the image specs, taken from the aspect ratios and column widths in the code. I used 2× the largest rendered width so the images stay sharp on retina screens. Astro generates the smaller sizes, so the owner only needs to supply the master file.

## Global export rules
- **Format:** export JPG (sRGB, quality ~85, progressive). Astro converts to AVIF/WebP automatically. Use PNG only if an image has transparency, which none of these do.
- **Colour:** sRGB profile embedded. Keep the warm, natural-light look consistent across all shots, because the palette is cream, sage and brown-black.
- **File size:** aim for 300 KB to 1 MB per master. Don't upload 10 MB camera originals.
- **Alt text:** every image gets descriptive alt text in the CMS. The owner should note what each shot shows.
- **Naming:** lowercase, hyphenated names such as `hero-treatment.jpg`. The current uploads have spaces and pasted names.

## Images needed

| # | Slot | Aspect (desktop → mobile crop) | Export size | Notes |
|---|---|---|---|---|
| 1 | **Hero** (poster or still) | 4:5 → 4:3 | **1200 × 1500** | Shown at ~560 px wide. On mobile it crops to 4:3 around the centre, so keep the action (hands, treatment area) in the middle horizontal band. No text or logos in the shot. |
| 2 | **About: portrait of Alex** | 3:4 → 4:3 | **1000 × 1333** | Shown at ~480 px wide. The current upload (941 × 1672, 9:16) gets cropped, so it should be re-exported at 3:4. Keep the face in the upper-middle third, because the mobile 4:3 crop cuts a lot off the top and bottom. |
| 3 | **Who it's for** (desk worker or runner) | 4:3 → 16:10 | **1000 × 750** | Shown at ~480 px wide. Leave headroom for the 16:10 crop on mobile. |
| 4 | **Services: Remedial massage** | 4:3 → 16:10 | **1200 × 900** | Shown at ~560 px wide. |
| 5 | **Services: Myofascial release** (forearm or hand) | 4:3 → 16:10 | **1200 × 900** | Same as above. |
| 6 | **Services: Trigger point therapy** | 4:3 → 16:10 | **1200 × 900** | Same as above. |
| 7 | **Services: Myofascial cupping** | 4:3 → 16:10 | **1200 × 900** | Same as above. |
| 8 | **Services: Dry needling** | 4:3 → 16:10 | **1200 × 900** | Same as above. |
| 9 | **Services: Corrective exercise** | 4:3 → 16:10 | **1200 × 900** | Same as above. |
| 10 | **8-Week Program card** (offer preview) | 16:9 | **1200 × 675** | Shown at ~580 px wide on desktop and full width on mobile. The Initial Session card has no photo slot. |
| 11 | **Final CTA** (full-bleed background) | ~2.5:1 on desktop, near-portrait on mobile | **2400 × 1350** (16:9) | See the notes below. |
| 12 | **Social share image** (`seo.yaml`) | 1.91:1 | **1200 × 630** JPG | Optional, but it is what shows when the site is shared on WhatsApp, Instagram or Facebook. Keep the key content inside the central ~1000 × 500 so crops don't clip it. |

Keep all six service shots in one visual style (same lighting, similar framing) so the accordion looks cohesive.

**Final CTA background:**
- It is cropped with `object-fit: cover`, so it is trimmed to a wide strip on desktop and a tall strip on mobile.
- A dark gradient (55–78% opacity) sits on top, with centred white text. Shoot something calm and low-contrast, with the subject off to one side or softly out of focus.
- Keep the important content in the central 40% of the width and height.
- Don't put any text in the image.

## Hero video (optional)
The code currently has no video support, only a still image. I can add a muted looping `<video>` that falls back to the still poster, if you want it.

- **Aspect and size:** 4:5, **1080 × 1350**. This matches the hero frame, so there's no letterboxing.
- **Format:** MP4 (H.264, High profile, yuv420p), 24–30 fps. Add a WebM (VP9) as well if the owner has the tooling, but it isn't required.
- **Length and size:** 6–12 s as a seamless loop (a collage with soft cross-dissolves works well). Keep it under about 3 MB for mobile, at roughly 1.5–2.5 Mbps video bitrate.
- **Audio:** none. Strip the audio track, because autoplay only works muted.
- **Safe area:** it crops to 4:3 on mobile, so keep the key action (hands, treatment area) inside the central 1080 × 810 band.
- **Framing:** no burned-in text, captions or logos.
- **Poster frame:** also export a **1200 × 1500 JPG** still. It shows while the video loads and for visitors with reduced-motion settings (the video won't autoplay for them), so it should be a good standalone image. It doubles as the hero image if the video isn't used.
- **Accessibility:** the video should be decorative and paused or hidden under `prefers-reduced-motion`. I'd build it that way.

## Already handled
- **Approach figure:** `approach-figure.png` is 1122 × 1402 and already in place. If the owner re-exports it, keep the same aspect ratio (≈0.80). Otherwise the animated node overlay has to be re-aligned.
- **Icons, social logos and favicon:** these are not photography and need nothing from the owner.

I can also put these specs into `docs/` as a hand-off sheet for the owner.