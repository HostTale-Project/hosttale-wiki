---
title: ECS Overview for SimpleScripting
description: Learn what ECS unlocks for JavaScript mods and how to start using it.
---

SimpleScripting exposes Hytale's ECS directly to JavaScript so you can compose gameplay behaviors with the same components and systems used by the engine.

## Why Use ECS from JS

- Faster iteration than Java while keeping authoritative server behavior.
- Compose features by adding/removing components instead of subclassing.
- React to authoritative ECS events (block place, chunk save) with full access to refs and command buffers.
- Share data safely through resources or components that serialize with the world.

## Core Ideas (JS Edition)

- **Entities are refs** – Resolved via `ecs.toRef` or directly from player handles.
- **Components are data** – Use built-ins like `Transform` or register your own with `ecs.registerComponent`.
- **Systems are functions** – Register ticking, ref, ref-change, or event systems directly from JS; SimpleScripting tracks and unloads them per mod.
- **Queries filter work** – Pass component arrays or prebuilt `Query` objects to limit which entities a system processes.

## Quick Start

```js
// 1) Resolve builtin components
const Transform = ecs.component("Transform");
const Velocity = ecs.component("Velocity");

// 2) Register a parallel per-entity system
ecs.registerEntityTickingSystem({
  name: "bob",
  query: [Transform, Velocity],
  parallel: true,
  tick(dt, idx, chunk, store, cmd) {
    const ref = chunk.getReferenceTo(idx);
    cmd.ensureAndGetComponent(ref, Velocity);
    ecs.addForce(ref, { x: 0, y: 0.02, z: 0 }, cmd);
  },
});

// 3) Spawn an entity that the system will affect
const t = ecs.createComponent(Transform);
t.setPosition({ x: 0, y: 100, z: 0 });
const v = ecs.createComponent(Velocity);
ecs.spawn(players.all()[0].getEntityRef(), [t, v], "SPAWN");
```

:::caution
ECS events are **not** the same as plugin-bus events (`events.on`). Use `ecs.registerEntityEventSystem` / `ecs.registerWorldEventSystem` when you need refs, stores, and command buffers.
:::

## What to Read Next

- **Components & Resources** – Resolve built-ins or register your own.
- **Systems & Events** – Pick the right system type and stay thread-safe.
- **Spatial, Damage & Helpers** – Use the motion and damage helpers without reimplementing physics.
- **API Reference** – Fast lookup of every `ecs.*` method.
- **Recipes** – Copy/paste patterns for common tasks.
