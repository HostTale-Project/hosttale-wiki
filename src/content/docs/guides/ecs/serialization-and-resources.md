---
title: Serialization & Resources
description: Persist ECS data safely and evolve your components over time.
---

ECS data is serialized through the registry so entities and resources survive reloads and cross-version changes.

## Component Serialization

- Register components with an ID and optional `BuilderCodec`; the registry uses this codec when saving/loading holders.
- `UnknownComponents` captures BSON payloads for IDs missing at load time, keeping saves forward-compatible.
- Tagging an entity with **NonSerialized** removes it from persistence without removing it from runtime systems.
- `Holder.cloneSerializable(registryData)` and `Store.copySerializableEntity` strip non-serializable components for safe duplication.
- Use `ComponentRegistry.serialize(holder)` / `deserialize(bson)` for registry-scoped persistence helpers.

## Resource Storage

Resources follow the same registration pattern as components and can be persisted asynchronously via `IResourceStorage`:

- `load(store, registryData, resourceType)` → `CompletableFuture<T>`
- `save(store, registryData, resourceType, instance)`
- `remove(store, registryData, resourceType)`

Built-in resource types include spatial resources for `SpatialSystem` and delayed system state (`DelayedSystem$Data`, `DelayedEntitySystem$Data`).

## Command Buffers & Persistence

Use `CommandBuffer` inside systems to queue component mutations; the store reconciles them after iteration, preserving serialization invariants and avoiding cross-thread writes.

## Versioning Tips for Mod Authors

- Give each custom component/resource a stable lowercase ID (e.g., `poison`, `my_mod/cache`).
- Pair components with a `BuilderCodec` so you can evolve fields without breaking saves.
- For breaking changes, teach the codec to read legacy fields and emit the new structure.
- Expose tooling to inspect or migrate `UnknownComponents` when you drop old fields.

With serialization handled, you can move to the SimpleScripting ECS pages to see how to use the same systems from JavaScript.
