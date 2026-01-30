---
title: Spatial, Motion & Damage Helpers
description: Use the built-in helpers for movement, spatial queries, and damage without reimplementing engine logic.
---

## Position & Rotation

All helpers accept a `commandBuffer` as the last argument. Provide `cmd` inside systems; omit it elsewhere to run on the store thread.

- `ecs.getPosition(target)` → `Vector3d | null`
- `ecs.setPosition(target, pos, cmd?)`
- `ecs.teleport(target, pos, rot?, cmd?)`
- `ecs.getRotation(target)` / `ecs.setRotation(target, rot, cmd?)`
- `ecs.getHeadRotation(target)` / `ecs.setHeadRotation(target, rot, cmd?)`

`target` can be a `PlayerHandle`, `PlayerRef`, or `Ref`.

## Velocity & Forces

- `ecs.getVelocity(target)`
- `ecs.setVelocity(target, vel, cmd?)`
- `ecs.addForce(target, force, cmd?)`

Use `cmd.ensureAndGetComponent(ref, Velocity)` before applying forces inside ticking systems to guarantee the component exists.

## Spatial Resources

Register a spatial index the engine can maintain for you:

```js
const spatial = ecs.registerSpatialResource(); // KDTree by default
```

Pass a string (`"octree"`, `"sap"`) or a `SpatialStructure` instance to change the backing structure. Use it inside custom `SpatialSystem`s or helper utilities that rely on spatial lookups.

## Damage Helpers

- `ecs.damageCauses()` → map of known `DamageCause` values.
- `ecs.applyDamage(target, amount | { amount, cause? }, cmd?)` – wraps `DamageSystems.executeDamage`.
- Ordering groups for advanced damage pipelines:
  - `ecs.damageGatherGroup()`
  - `ecs.damageFilterGroup()`
  - `ecs.damageInspectGroup()`

Group your own damage systems with these to align with built-in ordering.
For full signatures and edge cases, see the [ECS API Reference](/simplescripting/ecs/api-reference).

## Reference Utilities

- `ecs.toRef(target)` converts a player handle or ref-like object into a validated `Ref`.

## Practical Patterns

```js
// Safe teleport inside a system
ecs.registerEntityTickingSystem({
  name: "snap-up",
  query: [ecs.component("Transform")],
  tick(dt, idx, chunk, store, cmd) {
    const ref = chunk.getReferenceTo(idx);
    ecs.teleport(ref, { x: 0, y: 150, z: 0 }, { x: 0, y: 0, z: 0 }, cmd);
  },
});
```

With these helpers you can move entities, apply forces, and manage spatial data without dipping into low-level Java APIs.
