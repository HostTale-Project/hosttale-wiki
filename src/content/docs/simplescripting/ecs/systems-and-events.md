---
title: Systems & Events in JS
description: Register ECS systems from JavaScript, keep them ordered, and react to authoritative events.
---

## Picking the Right System

```js
ecs.registerEntityTickingSystem({ name?, query?, parallel?, group?, tick(dt, idx, chunk, store, cmd) })
```
- Per-entity logic with chunk + command buffer. Set `parallel: true` when safe.

```js
ecs.registerRefSystem({ name?, query?, onAdd?, onRemove? })
```
- Run when entities matching the query enter/leave the store; great for initialization/cleanup.

```js
ecs.registerRefChangeSystem({ name?, component, onComponentAdded?, onComponentSet?, onComponentRemoved? })
```
- React when a specific component is added/updated/removed.

```js
ecs.registerTickableSystem({ name?, group?, tick(dt, storeIndex, store) })
```
- Store-level tick without per-entity iteration.

```js
ecs.registerRunWhenPausedSystem({ name?, group?, tick(dt, storeIndex, store) })
```
- Same as above, but still runs when the world is paused.

### Ordering with Groups

Create a group once and reuse it to keep related systems together:

```js
const damageGather = ecs.damageGatherGroup() || ecs.registerSystemGroup();

ecs.registerEntityTickingSystem({ group: damageGather, ... });
```

Groups can also depend on other groups on the Java side when you need tighter ordering.

## Handling ECS Events

ECS events run on the store thread and carry refs plus a command buffer.

```js
ecs.registerEntityEventSystem({
  name: "build-guard",
  event: "PlaceBlockEvent",   // string or class from ecs.events()
  query: [ecs.component("PlayerRef")],
  handle(evt, ref, store, cmd) {
    if (evt.getTargetBlock().getX() >= 0) evt.setCancelled(true);
  },
});

ecs.registerWorldEventSystem({
  event: "ChunkSaveEvent",
  handle(evt, store, cmd) {
    // inspect or enqueue work
  },
});
```

Fire events from JS when you want to go through vanilla pipelines:

```js
const PlaceBlock = ecs.events().PlaceBlockEvent;
const evt = new PlaceBlock(itemStack, pos, rotation);
ecs.invokeEntityEvent(ref, evt);
```

:::caution
Plugin-bus events (`events.on(...)`) do **not** carry ECS refs or command buffers. Prefer ECS event systems for authoritative changes.
:::

## Command Buffer Best Practices

- Inside systems/event handlers, mutate via the provided `cmd` (`putComponent`, `removeComponent`, `invoke`, `ensureAndGetComponent`).
- When calling helpers like `setPosition`, `addForce`, or `applyDamage` inside systems, pass `cmd` as the last argument.
- Outside the store thread (e.g., commands), you can omit `cmd` and helpers will run on the store thread, but avoid heavy work there.

## Safety Checklist

- Keep queries stable; define them once at module scope.
- Validate IDs: `registerComponent` and `registerResource` expect lowercase `[a-z0-9_-]`.
- Unregistration is automatic on mod disable; name systems to make logs readable.
- Need a signature or option you forgot? Jump to the [ECS API Reference](/simplescripting/ecs/api-reference).

Ready for movement, spatial queries, and damage helpers? Continue to `Spatial, Damage & Helpers`.
