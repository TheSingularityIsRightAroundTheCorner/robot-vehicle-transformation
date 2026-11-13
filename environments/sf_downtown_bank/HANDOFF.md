# SF Downtown Bank — Handoff

## Delivered

- Additive sibling environment under `environments/sf_downtown_bank/`.
- Six cameras: hill street, intersection, orthographic side stage, marker-only rooftop summon, giant placeholder battle and anti-gravity rollback.
- Day, sunset, night, dawn and battle-haze treatments.
- One deterministic damage value: cracks, broken panes, facade/trim/rail debris, fallen poles, tilted tram, crater bowls and smoke.
- Immutable original transform catalog for every physical debris piece and grouped falling prop. Both home and collapsed transforms are retained; sampling is reversible without a simulation cache.
- Shared Golden Gate dependencies imported by relative path, without modifying their source.
- Viewer, README, review stills, compressed preview, QA metrics and the complete captured original-transform catalog.

## Production decisions

The scene has a deliberately staged hillside/bay alignment, not a real street map. Architecture and tram are generic, with no copied business signage or distinctive commercial livery. There are no newly designed characters, owner puppets or monster silhouettes. The summon paths and giant volumes are markers only.

The side-stage framing is orthographic and static; its floor is a cross-street plane near local z=80, centered near x=-54. Character actions and ground anchors should be authored against this plane rather than treating the complete sloped city as a flat stage. The giant volumes are approximately 105 units tall; change the placeholder dimensions and cameras when final creature/robot scale is chosen.

Damage removes facade surfaces, not the entire structural building. Its debris is art-directed and may overlap in piles. Crater positions and maximum radii are authored constants in `downtown_scene.js`; the damage value controls their growth. Smoke uses a fixed instance pool and analytic absolute time. These are intentional style/performance choices, not a claim of physical demolition accuracy.

## Verification

The capture checks that a fixed intact frame is pixel-identical after full damage, a rollback sample and a lighting change. Original transforms remain unchanged, scene node count remains constant, intact debris alpha is empty, damaged debris has transparent/opaque pixels, side-stage uses an orthographic camera, all camera samples stay above the hillside and rollback reaches damage=0 with no detached pieces. Shader console errors and WebGL errors are checked as well.

The complete catalog in `review/home_transforms.json` permits independent transform comparisons. It is local to the city root, whose translation/rotation places the street in the shared bridge world. Never mix those local coordinates directly with the world-space robot carrier without applying the root transform.

## Remaining creative work

No battle choreography, bug army, actual rooftop-summoned vehicles, monster design, final helmets or character puppets are included. Supply the artist's approved art/designs before adding those assets. Beauty is the correct depth-occlusion reference; isolated passes require matching holdouts when recomposited with crossing objects.

## Privacy and repository rules

This bank is published at the artist's request. Do not add the artist's name, private home-directory paths or personal contact information to files/docs/commits. Use noreply author/committer email. Preserve existing source and use additive files unless a specific correction is authorized. 
