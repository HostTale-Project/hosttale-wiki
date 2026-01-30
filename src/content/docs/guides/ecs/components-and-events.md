---
title: Built-in Components & Events
description: Reuse Hytale's existing ECS components and events instead of reinventing them.
---

Most gameplay systems already expose data through components and events. Reusing them keeps your mods lightweight and compatible with vanilla behavior.

## Core Tags

- **NonTicking** – Skip ticking systems for this entity.
- **NonSerialized** – Prevent persistence while keeping the entity alive.
- **UnknownComponents** – Stores raw BSON for unregistered component IDs when loading saves.
- **FromPrefab / FromWorldGen / WorldGenId** – Provenance markers for spawned entities.

## Spatial & Movement

- **TransformComponent** – Authoritative position and body rotation. Includes helpers like `teleportPosition`, `getChunkRef`, and chunk dirty marking.
- **HeadRotation** – Independent head/aim direction with helpers to derive forward vectors.
- **BoundingBox** – Collision/selection volume (`Box` plus optional detail boxes).
- **EntityScaleComponent** – Scales model and bounding box; recompute collisions if you change it.
- **PositionDataComponent** – Metadata about surrounding block types (inside/standing on).
- **Velocity** – Motion vector plus queued instructions; supports `addForce`, client velocity, and helpers for knockback/launch.
- **PhysicsValues** – Mass/friction/gravity parameters used by physics systems.

## Visuals & Interaction

- **DisplayNameComponent**, **HiddenFromAdventurePlayers**, **Invulnerable**, **Intangible**, **RespondToHit** – Gameplay flags.
- **DynamicLight / PersistentDynamicLight** – Light emitters attached to entities.
- **ModelComponent**, **ActiveAnimationComponent**, **RotateObjectComponent** – Model and animation controls.
- **Interactable / InteractionComponent / PlacedByInteractionComponent** – Interaction hooks for placed objects.
- **SnapshotBuffer** – Likely used for replication/snapshots.

## Spawning & World Data

- **WorldSpawnData**, **ChunkSpawnData**, **SpawnJobData**, **ChunkSpawnedNPCData** – World spawning metadata.
- **SpawnSuppressionComponent / Controller / Queue / Entry** – Control spawn suppression windows.
- **ChunkSavingSystems / ChunkUnloadingSystem** – Components used by world storage systems.

## Projectiles

- **Projectile** and **PredictedProjectile** – Projectile state and client prediction hints.

:::tip[Inspect first]
Field definitions are not public in bytecode, but component names are stable. Prefer reading existing entities and reusing their components over inventing new data shapes.
:::

## ECS Events

ECS events extend `EcsEvent`; many are cancellable via `CancellableEcsEvent`.

**Player & Block Interaction**
- `PlaceBlockEvent` (cancellable) – Item in hand, target `Vector3i`, `RotationTuple`; setters allow retargeting or cancelling placement.
- `BreakBlockEvent` (cancellable) – Target block and type; can redirect the target.
- `UseBlockEvent.Pre/Post` (Pre is cancellable) – Interaction type/context plus target block.
- `DamageBlockEvent` (cancellable) – Current damage and mutable damage value.
- `DropItemEvent` (base cancellable) with `PlayerRequest` and `Drop` variants.
- `InteractivelyPickupItemEvent` (cancellable) – Mutable `ItemStack` being picked up.
- `SwitchActiveSlotEvent` (cancellable) – Hotbar slot changes.
- `ChangeGameModeEvent` (cancellable) – Mutable `GameMode` field.
- `DiscoverZoneEvent` (+ `Display`) – Map discovery UI payloads.

**Crafting**
- `CraftRecipeEvent.Pre/Post` – Wraps `CraftingRecipe` and quantity; Pre is cancellable.

**World Lifecycle**
- `ChunkSaveEvent` (cancellable) – Before a chunk is persisted.
- `ChunkUnloadEvent` (cancellable) – Before unload; `setResetKeepAlive` toggle.
- `MoonPhaseChangeEvent` – Moon cycle notifications.

### Dispatch & Handle

```java
// Dispatching a cancellable block place
a var place = new PlaceBlockEvent(itemStack, target, rotation);
store.invoke(ref, place);

// Listening in an EntityEventSystem
public class GuardPlace extends EntityEventSystem<EntityStore, PlaceBlockEvent> {
    public EntityEventType<EntityStore, PlaceBlockEvent> getEventType() { return PlaceBlockEvent.TYPE; }
    public Query<EntityStore> getQuery() { return Query.and(Player.getComponentType()); }
    public void handle(int idx, ArchetypeChunk<EntityStore> chunk, Store<EntityStore> store, CommandBuffer<EntityStore> cmd, PlaceBlockEvent evt) {
        if (evt.getTargetBlock().getX() >= 0) evt.setCancelled(true);
    }
}
```

Use ECS events when you need authoritative game-state changes. Plugin-bus events exist too, but they don’t carry refs or command buffers.

Next: learn how ECS data is serialized and how to keep your components versioned safely.
