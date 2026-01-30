---
title: ECS API Reference (JS)
description: Quick reference for every ECS helper exposed on the global `ecs` object.
---

Use this page as a cheat sheet while modding. Every entry is available on the global `ecs` object inside SimpleScripting mods.

## Components & Resources

- `ecs.components()` → map of all known builtin component types (aliases included).
- `ecs.component(id)` → resolve a component type by id/alias; throws if unknown.
- `ecs.createComponent(type)` → create a new instance of a component type.
- `ecs.registerComponent(id, supplier?)` → register a custom component. `id` must match `[a-z0-9_-]`. Without a supplier you get a dynamic map-backed component (`get/set`).
- `ecs.registerResource(id, supplier?)` → register a global resource type.

## Spawning & Archetypes

- `ecs.spawn(worldOrRef, components[], reason?)` → spawn an entity in the target store. `reason` defaults to `"SPAWN"`.
- `ecs.archetype(componentTypes)` → build an archetype that also acts as a `Query`.

## Queries

- `ecs.queryAny()` → wildcard query.
- `ecs.queryAll(types)` → require all components.
- `ecs.queryNot(types)` → exclude components.
- `ecs.queryOr(a, b)` → union of queries/component sets.

## Systems

All system registrations return the system instance and are auto-unregistered on mod disable.

- `ecs.registerEntityTickingSystem({ name?, query?, parallel?, group?, tick(dt, entityIndex, chunk, store, cmd) })`
- `ecs.registerRefSystem({ name?, query?, onAdd?, onRemove? })`
- `ecs.registerRefChangeSystem({ name?, component, onComponentAdded?, onComponentSet?, onComponentRemoved? })`
- `ecs.registerEntityEventSystem({ name?, event, query?, handle(evt, ref, store, cmd) })`
- `ecs.registerWorldEventSystem({ name?, event, handle(evt, store, cmd) })`
- `ecs.registerTickableSystem({ name?, group?, tick(dt, storeIndex, store) })`
- `ecs.registerRunWhenPausedSystem({ name?, group?, tick(dt, storeIndex, store) })`
- `ecs.registerSystemGroup()` → create a `SystemGroup` for ordering.

### Quick ordering tip
Use groups for related systems and damage pipelines: `const group = ecs.damageGatherGroup() || ecs.registerSystemGroup();`

## Events

- `ecs.events()` → map of builtin ECS event classes keyed by simple name (case-insensitive).
- `ecs.event(id)` → resolve one by id/alias.
- `ecs.invokeEntityEvent(ref, event)` → dispatch an entity-scoped ECS event.
- `ecs.invokeWorldEvent(storeLike, event)` → dispatch a world-scoped ECS event.

## Spatial & Motion Helpers

Mutating helpers accept an optional `commandBuffer` (use the `cmd` passed to systems/events). Without `cmd` they run on the store thread.

- `ecs.getPosition(target)` / `ecs.setPosition(target, pos, cmd?)`
- `ecs.teleport(target, pos, rot?, cmd?)`
- `ecs.getRotation(target)` / `ecs.setRotation(target, rot, cmd?)`
- `ecs.getHeadRotation(target)` / `ecs.setHeadRotation(target, rot, cmd?)`
- `ecs.getVelocity(target)` / `ecs.setVelocity(target, vel, cmd?)`
- `ecs.addForce(target, force, cmd?)`
- `ecs.registerSpatialResource(structure?)` → create a spatial index (default KDTree; accept "octree"/"sap" or a `SpatialStructure`).

### Common actions

**Teleport a player safely (inside a system)**
```js
const Transform = ecs.component("Transform");

ecs.registerEntityTickingSystem({
  query: [Transform],
  tick(dt, idx, chunk, store, cmd) {
    const ref = chunk.getReferenceTo(idx);
    ecs.teleport(ref, { x: 0, y: 150, z: 0 }, { x: 0, y: 0, z: 0 }, cmd);
  },
});
```

**Apply knockback (parallel-safe)**
```js
const Velocity = ecs.component("Velocity");
cmd.ensureAndGetComponent(ref, Velocity);
ecs.addForce(ref, { x: 0.3, y: 0.4, z: 0 }, cmd);
```

## Damage Helpers

- `ecs.damageCauses()` → map of `DamageCause` values.
- `ecs.applyDamage(target, amount | { amount, cause? }, cmd?)` → wraps engine damage systems.
- Ordering helpers: `ecs.damageGatherGroup()`, `ecs.damageFilterGroup()`, `ecs.damageInspectGroup()` (may be `null` if DamageModule absent).

### Common actions

**Deal damage from a system**
```js
ecs.registerEntityTickingSystem({
  query: [ecs.component("PlayerRef")],
  tick(dt, idx, chunk, store, cmd) {
    const ref = chunk.getReferenceTo(idx);
    ecs.applyDamage(ref, { amount: 2, cause: "OUT_OF_WORLD" }, cmd);
  },
});
```

## Reference Utilities

- `ecs.toRef(target)` → convert a `PlayerHandle` or ref-like object to a validated `Ref` (or `null`).

## Data Conversions

Vectors accept `{x, y, z}`, arrays `[x, y, z]`, or a single number (applied to all axes). Use the same shapes across helpers and component setters.

## Threading Reminder

Inside ticking or event systems, always mutate through the provided `cmd` (`CommandBuffer`). Outside the store thread (e.g., commands), you can omit `cmd`, but keep heavy work in systems where possible.
