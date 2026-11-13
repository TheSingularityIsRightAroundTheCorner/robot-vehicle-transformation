# Weapon Bank Handoff

## Delivered

Three artist-led hero props share one procedural builder and viewer. Source drawings are not redistributed. All review assets are rendered from the same geometry used by the interactive viewer.

- Gemini: twin and docked beam blades, black grips and pommels, silver upper sleeves each with one recessed four-point sparkle, blue/red/yellow/green selection. Only one colour appears along a beam at any time. Colour-specific abilities remain undefined.
- Claude: heavy red rectangular cage covering the forearm, three actual strap loops with buckles, a rigid palm crossbar and three angular exit ports. The existing port cross-sections extend 45 mm farther forward; claws are 390 mm long with 460 mm of travel, still fitting fully inside the case. Full-length claws slide into the hollow case. Retracted, drawn white and complete white states; small ten-cell side gauge.
- GPT: elongated hexagonal plate with rear grips. Both the knot and inset hexagonal outline are real recesses, with bevels and lower floors. Thrown mode follows telekinetic star points and draws a progressively revealed constellation trail; wall and sphere modes use 37 tiles.
- Viewer: orbit, six fixed angles, state and progress controls, single-colour beams, outline/flat toggles, optional scale guide, light/dark stage and transparent 1080p PNG export.
- Delivery: 35 stills, 12-second MP4, render metrics and design checks.

The later claw drawing replaces the initial slim gauntlet interpretation. The final material correction makes all claw blades white, including the ordinary drawn state. Gemini now has black grips/pommels and silver upper sleeves with a single recessed sparkle on each hilt; no protruding gem remains. The later beam clarification replaces the simultaneous rainbow treatment. The shield engraving clarification replaces painted white markings. Do not revert these choices from older prompts.

## Structure

- `weapon_profiles.js`: names, states, colours and descriptive reference dimensions.
- `weapon_bank.js`: shared materials/layers, prop construction, absolute-time state sampling and camera framing.
- `shield_engraving.js`: normalized contour loops derived from the supplied symbol.
- `index.html`: controls and PNG export; `WeaponsLab.render` is the capture API.
- `tools/capture.mjs`: stills, preview frames and render regression checks.
- `tools/verify.mjs`: storage, rigid sliding, strap/grip, transparency and colour checks.
- `review`: current stills, video and verification results.

All dimensions are in metres. Forward along each blade is local +Y. Shield face and gauntlet back-of-hand plate face local +Z. Negative Z is the hand/forearm side. The Claude grip centre is `(0, 0.161, -0.049)`; straps are at Y `0.055`, `-0.090`, `-0.235`. Keep the wrist and elbow clear when attaching the bank to the character rig.

## Verification

All ten states render without browser exceptions or WebGL errors. Sampling away and back yields identical images, with stable object counts and finite geometry. Dedicated checks confirm three straps, a palm grip, projected exit frames, non-scaling claw extension, the fully retracted blade bounding boxes fitting inside the case, nonempty transparent exports and single-colour Gemini effects and recessed sparkle floors. Preview metadata is in `review/video_metadata.json`.

## Next integration

1. Review prop size and grip placement against the artist's final slim puppet proportions. The present hand/forearm is a plain scale guide, not a new character design.
2. Attach `root` under rig sockets and align the palm crossbar or shield handle with each hand. Keep the same procedural prop module for reference and animation.
3. Author attack paths, wrist poses and named colour abilities only after the artist specifies them. Current paths are reusable reference demonstrations.
4. Retain solid/effects separation when rendering action shots; use a shared 3D scene for body/prop occlusion.

The sphere is an energy cage with gaps between tiles, not a sealed mechanical sphere. The animation bank does not claim a physical simulation or continuous mesh conservation between the solid shield and its tile representations. The claw storage mechanism is a clear visual reference, not fabrication engineering.

The separate Claude helmet update flattens the central eye band to the GPT-like horizontal line while keeping the simplified rays. Existing shell colours, side mark, jaw rail and other visors stay as previously approved. Slimmer body volumes and final helmet-to-head fit remain separate pending work.
