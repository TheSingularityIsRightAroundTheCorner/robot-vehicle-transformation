# Production Bank Handoff

## Completed in this pass

1. Removed the artist nickname from the currently published bank README and from local authored review/handoff documents. Historical Git commits are preserved; this is not a history purge.
2. Copied the original robot model and pose rig into the private production set; public source files remain unchanged.
3. Added progressive 45-degree forward flight (adjustable in the viewer), a shared-scene dawn OP final, sunset hero hover and reusable sea-split module. Added beauty/robot/wake/environment/bridge exports and scale/speed/width/depth/spray controls.
4. Added procedural space, data-center and confirmed Alcatraz sandbox-base environments, with multiple camera/lighting variants and an underground hangar view.
5. Added viewer entry points, documentation, still capture, preview capture and behavioral checks. Review stills were inspected after rendering.

## Entry points

- `index.html`: original bridge, five cameras and four lighting profiles.
- `action_viewer.html`: robot OP and presentation hero hover.
- `production_viewer.html`: space, data center, island/gate/dock/underground hangar.
- `ACTION_README.md`: shared-scene robot and wake API.
- `PRODUCTION_README.md`: further bank scenes and their limits.

## Important implementation decisions

The imported pose rig solves against world anchors. Reset its carrier to identity before posing, then apply flight scale/rotation/translation; otherwise seeking accumulates a coordinate-space error and tears apart the model. The public rig was not modified to solve this.

The wake removes the original ocean within a 32-sample strip, then supplies the recessed floor, side spray, crest foam and pooled shards. Geometry and particle counts remain fixed. It uses an adapter for this bank's water shader; arbitrary water renderers need their own adapter. Isolated export passes are not depth holdouts; beauty is the authority for bridge-cable occlusion.

The OP's last approach deliberately grows beyond the frame while passing the camera. That is not a static hero framing test. Use `hero_hover` for a complete presentation pose.

## Verified

- Random-access rendering returns the same OP frame after sampling other shots/times.
- Shared-scene membership for robot/wake; stable scene node count; positive default deck-crossing clearance; isolated wake has both transparent and opaque pixels; no WebGL error.
- All three extra sets reproduce the same frame after seeks and keep their node counts stable.
- Captures are from a dedicated temporary headless browser, not personal browsing tabs.

## Still requires production direction

Helmet redesign is supplied by the artist; no invented sentai helmet is adopted. No replacement human puppet, bug-army models, combat animation, cockpit or command room is included. The new environments are backgrounds/staging assets, not complete episodes. The base's small sea-level service door is not a full robot clearance solution; a later lift/submerged-launch shot must be designed with the chosen robot scale. Audio/captions remain in the editing pipeline.

The private repository remains private. Keep artist names, private source paths and personal contact data out of future files and commits. Use GitHub noreply author/committer addresses. Preserve the imported model/rig bytes and the third-party runtime license.
