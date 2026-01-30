---
title: Registry & Runtime Objects
description: Learn how ComponentRegistry, stores, archetypes, and command buffers fit together in Hytale's ECS.
---

Everything in ECS flows through the `ComponentRegistry` and the per-world `Store`. Understanding these objects will help you wire your own systems safely.

## ComponentRegistry

- Registers component types, resources, systems, and event types.
- Creates stores via `addStore`, which binds the registry to a world/context.
- Provides helpers for serialization (`getEntityCodec`, `serialize`, `deserialize`).
- Holds built-in types like `UnknownComponents`, `NonTicking`, and `NonSerialized` so data stays forwards-compatible.

## Store (per world)

- Owns entities, archetype chunks, and the tick loop (`tick`, `pausedTick`).
- Dispatches ECS events through `invoke(...)` and reconciles command buffers after each system.
- Exposes add/remove/mutate methods that mirror those on `CommandBuffer` for deferred, thread-safe writes.

## Entities, Refs, and Holders

- **Ref<E>** – Lightweight, validated handle to an entity inside a store.
- **Holder<E>** – In-memory container of an entity’s components. Used when spawning or cloning entities; supports serialization-friendly cloning.
- **Archetype<E>** – Immutable ordered set of component types; implements `Query` so it can act as a filter.
- **ArchetypeChunk<E>** – Packed storage for entities sharing the same archetype. Systems iterate chunks for cache-friendly access.

## CommandBuffer

Use `CommandBuffer` for mutations during system execution to avoid concurrent modifications:

- Add/remove entities or components
- Invoke events
- `fork()`/`mergeParallel()` to collect writes across threads
- Mirrors most `Store` mutators; reconciled after the system finishes.

:::caution
Inside ticking or event systems, mutate via the provided `CommandBuffer`, not the `Store`, to pass thread checks (`assertThread`/`assertWriteProcessing`).
:::

## Resources

Resources are registry-wide data objects separate from entities:

- Register with `registerResource(id, codec?, supplier?)` alongside components.
- Implement persistence via `IResourceStorage` (`load`, `save`, `remove`).
- Built-ins include spatial resources for `SpatialSystem` and delayed system state (`DelayedSystem$Data`).

## Special Components

- **NonTicking** – Excludes an entity from ticking systems.
- **NonSerialized** – Skips persistence while keeping the entity alive.
- **UnknownComponents** – Holds raw BSON for unknown component IDs on load; keeps saves forward-compatible.

With these building blocks in mind, the next step is learning how systems query and schedule work.
