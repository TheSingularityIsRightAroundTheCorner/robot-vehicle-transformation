# Downtown v2 — Production Handoff

## Active entry point

Use `index_v2.html` and `downtown_scene_v2.js`. This revision is additive: v1 source, viewer, review captures and other banks remain intact. `README_v2.md` is the current usage guide. Do not combine both DowntownBank factories in one viewer.

## Staging changes

The intersection camera is now inside the road at local z≈88, with a roughly five-unit camera height above the crossing. Close buildings frame both sides and debris falls nearby. The rooftop camera runs over the road at roof height, looking toward the bay. Additional outer blocks reduce the visible empty lots. Hill-street, giant battle volume staging and the original rollback route are retained.

Roof plates, trim and added block facades use the same deterministic reversible piece system. Tall intact side/back/interior shells shrink toward their original bases during heavy damage; independent jagged wall remnants emerge at matching locations. Chipped horizontal floor slabs appear behind the collapsed facades. Roof debris uses a mostly flat resting orientation so it does not become upright oversized boards. Original poses and matrices are retained for all physical debris pieces.

This is visual demolition: exposed slabs remain supported only by the stylized ruins, piles can overlap, and no rigid-body cache is needed. Intermediate states are authored interpolation. The artist can adjust rupture profiles, slab counts and activation thresholds in the v2 source.

## Side-stage integration

The stage is a dedicated scenic extension with fixed orthographic projection, not a crop of the perspective intersection. Foreground, middle and distant content live in distinct groups. Its far bridge reuses the original bank geometry at miniature scale; do not use this miniature as a robot-flight target. The main city retains the real shared bridge world.

- Actor contact plane: local y=`ground(80)`, z≈96; suggested x range -16…16.
- Vertical camera span: 26 units. Exported dimensions: 1920×1080.
- Stack: far → mid → near. Preserve identical origins and uncropped bounds.
- Suggested horizontal travel: far 0.12, mid 0.40, near 1.00.
- `bank.setParallaxOffset(value)` moves these groups without changing the camera.
- Export resets the offset to zero and restores the preview afterward.
- Damage affects near/mid walls, panes and roof plates; the distant scenic layer remains intact.

Use the viewer's single ZIP export. It contains the three PNGs, `stage.json` with center foot-contact pixels/shared projection and a README. The committed day/intact ZIP is ready to import into the artist's compositor. Re-export any lighting/damage combination from the viewer. This is not a flattened image requiring hand separation.

## Validation evidence

`review_v2/metrics.json` and `preview_metrics.json` record the current checks. Compare `home_transforms.json` to a freshly built v2 catalog for deterministic IDs/home poses. Exact repair and cross-build pixels are checked on the main city; stage repair is also exact. Alpha/projection checks and actual three-pass recomposition cover parallax alignment, with antialiasing error reported numerically. Roof detachment, hidden intact shells, exposed floors and jagged walls are checked alongside visual review.

`revision_contact.jpg` compares v1/v2 framing and damaged silhouettes. `parallax_contact.jpg` shows isolated passes on a checkerboard. The short MP4 demonstrates damage, restoration, rooftop staging and parallax motion.

## Preserved boundaries

The weapon, helmet, character puppet, bug army and monster designs remain the artist's work. Summon paths and giant boxes are placeholders. No public robot source was edited. Do not introduce the artist's name, local absolute paths or personal contact details into files/docs/commits; use noreply author and committer identities. Publication of this bank is authorized by the artist.
