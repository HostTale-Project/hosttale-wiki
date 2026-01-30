---
title: Systems, Queries & Scheduling
description: Build queries, pick the right system type, and control execution order in Hytale ECS.
---

Systems are where behavior lives. They declare the components they need, iterate matching entities, and mutate through command buffers.

## Building Queries

Queries describe which archetypes a system should see:

- **Basic filters:** `Query.and(...)`, `Query.or(...)`, `Query.not(...)` combine component requirements.
- **Archetype shortcuts:** `Archetype.of(Position, Velocity)` builds a query from a component set.
- **Exact matches:** `ExactArchetypeQuery` targets entities with exactly that component set.
- **Read/write intent:** `ReadWriteQuery` (present in the jar) can express access intent when needed.

Validate queries against the registry once and reuse them; avoid rebuilding them inside inner loops.

## Choosing a System Type

| System | Entry point | Typical use |
| --- | --- | --- |
| `TickableSystem` | `tick(dt, threadIndex, store)` | Store-wide updates without per-entity iteration. |
| `ArchetypeTickingSystem` | `tick(dt, chunk, store, cmd)` | Chunk-level logic with command buffer access. |
| `EntityTickingSystem` | `tick(dt, entityIndex, chunk, store, cmd)` | Per-entity logic; set `isParallel` if safe to run across threads. |
| `DelayedSystem` / `DelayedEntitySystem` | `delayedTick` / `tick` | Run every N seconds using built-in delayed data resources. |
| `SpatialSystem` | `tick(dt, chunk, store, cmd)` + `getPosition` | Systems that need spatial indexing. |
| `EventSystem` | `handle(...)` | React to ECS events (entity or world level). |
| `DataSystem` | `fetch(...)` | Batch, read-only data gathering without mutations. |

:::tip[Parallel ticks]
Mark an `EntityTickingSystem` as parallel when per-entity work is independent and components touched are thread-safe. Use command buffers for all mutations.
:::

## Event Systems

- **Entity events:** `EntityEventSystem` runs per matching entity when `Store.invoke(ref, event)` or `Store.invoke(entityEventType, ref, event)` is called.
- **World events:** `WorldEventSystem` runs once per store on `Store.invoke(event)` or `Store.invoke(worldEventType, event)`.
- Events can be cancellable by extending `CancellableEcsEvent`.

## Ordering and Dependencies

Control execution order explicitly instead of relying on registration order:

- Systems can return a set of `Dependency` objects targeting a system class, system type, or system group.
- `Order.BEFORE`/`AFTER` and `OrderPriority` (`CLOSEST`..`FURTHEST`) fine-tune placement.
- `SystemGroup` lets related systems share ordering; groups themselves can declare dependencies.
- The registry validates references and topologically sorts the graph before ticking.

## Command Buffers in Systems

- Iterate over `ArchetypeChunk` or entity indices, but buffer mutations through the provided `CommandBuffer`.
- Use `fork()`/`mergeParallel()` if you build your own parallel loops inside a system.
- Keep queries stable; avoid adding/removing component types mid-iteration unless buffered.

## Best Practices

- Model each concern as a small system with a narrow query.
- Prefer component tags (e.g., `NonTicking`) to toggle behavior without branching in systems.
- Keep system names and dependencies explicit so future mods can compose with yours.
- Use data systems when you need snapshots without mutating state (e.g., exporting entity lists).

Next: explore the built-in components and ECS events you can reuse.
