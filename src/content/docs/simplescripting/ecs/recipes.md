---
title: ECS Recipes (JS)
description: Copy/paste patterns for common ECS tasks in SimpleScripting.
---

## Bobbing System (parallel-safe)
```js
const Transform = ecs.component("Transform");
const Velocity = ecs.component("Velocity");

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
```

## Give Joining Players a Glow
```js
const PlayerRef = ecs.component("PlayerRef");
const Transform = ecs.component("Transform");
const DynamicLight = ecs.component("DynamicLight");

ecs.registerRefSystem({
  name: "glow-join",
  query: [PlayerRef, Transform],
  onAdd(ref, reason, store, cmd) {
    if (DynamicLight && !cmd.getComponent(ref, DynamicLight)) {
      const light = ecs.createComponent(DynamicLight);
      if (light.setStrength) light.setStrength(12);
      cmd.putComponent(ref, DynamicLight, light);
    }
  },
});
```

## Custom Status Effect (Poison)
```js
const Poison = ecs.registerComponent("poison");

// Apply via command buffer (queue off the store thread)
const queue = [];
commands.register("poison", (ctx) => {
  const target = ctx.isPlayer() ? ctx.sender() : null;
  if (!target) return;
  queue.push({ ref: target.getEntityRef(), dps: 3, every: 0.5, ticks: 8 });
});

// Drain queue on the store thread
ecs.registerEntityTickingSystem({
  name: "poison-queue",
  tick(dt, idx, chunk, store, cmd) {
    if (idx !== 0 || queue.length === 0) return;
    while (queue.length) {
      const job = queue.shift();
      if (!job?.ref?.isValid?.() ) continue;
      const p = ecs.createComponent(Poison);
      p.set("damagePerTick", job.dps);
      p.set("tickInterval", job.every);
      p.set("ticksLeft", job.ticks);
      p.set("elapsed", 0);
      cmd.putComponent(job.ref, Poison, p);
    }
  },
});

ecs.registerEntityTickingSystem({
  name: "poison",
  group: ecs.damageGatherGroup() || null,
  query: [Poison],
  tick(dt, idx, chunk, store, cmd) {
    const ref = chunk.getReferenceTo(idx);
    const p = chunk.getComponent(idx, Poison);
    let elapsed = Number(p.get("elapsed") || 0) + dt;
    let ticksLeft = Number(p.get("ticksLeft") || 0);
    if (elapsed >= Number(p.get("tickInterval") || 1)) {
      elapsed = 0;
      ecs.applyDamage(ref, { amount: Number(p.get("damagePerTick") || 0), cause: "OUT_OF_WORLD" }, cmd);
      ticksLeft -= 1;
    }
    p.set("elapsed", elapsed);
    p.set("ticksLeft", ticksLeft);
    if (ticksLeft <= 0) cmd.removeComponent(ref, Poison);
  },
});
```

## Teleport Using Command Buffer
```js
ecs.registerEntityTickingSystem({
  name: "snap-up",
  query: [ecs.component("Transform")],
  tick(dt, idx, chunk, store, cmd) {
    const ref = chunk.getReferenceTo(idx);
    ecs.teleport(ref, { x: 0, y: 150, z: 0 }, { x: 0, y: 0, z: 0 }, cmd);
  },
});
```

## Listen for Component Changes
```js
const Transform = ecs.component("Transform");

ecs.registerRefChangeSystem({
  name: "transform-watch",
  component: Transform,
  onComponentAdded(ref) { log.info("Transform added to " + ref); },
  onComponentRemoved(ref) { log.info("Transform removed from " + ref); },
});
```

## Run Even When Paused
```js
ecs.registerRunWhenPausedSystem({
  name: "heartbeat",
  tick(dt, storeIndex, store) {
    if (storeIndex === 0) log.info(`Store ${storeIndex} dt=${dt.toFixed(3)}`);
  },
});
```

These snippets are safe to drop into a mod and adapt. Pair them with the concepts in the other ECS pages to build larger systems confidently.
