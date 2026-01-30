---
title: Components, Resources & Queries
description: Resolve built-in ECS types, register your own, and target entities with queries in JavaScript.
---

## Working with Components

- **List built-ins:** `const all = ecs.components();` // map of aliases → `ComponentType`
- **Resolve one:** `const Transform = ecs.component("Transform");` // aliases are case-insensitive, with/without `Component`
- **Create an instance:** `const t = ecs.createComponent(Transform);`

### Custom Components

```js
// ID must match /[a-z0-9_-]/
const Poison = ecs.registerComponent("poison");
// Optional supplier lets you return a custom Java object
const Custom = ecs.registerComponent("custom", () => new MyComponent());
```

- Without a supplier, SimpleScripting uses a dynamic map-backed component (`JsDynamicComponent`) with `get/set` methods.
- Custom components are fully serializable; pair them with codecs on the Java side if you need schema control.

### Archetypes & Spawning

- Build a queryable archetype: `const movers = ecs.archetype([Transform, Velocity]);`
- Spawn entities with any component list:

```js
const ref = ecs.spawn(worldRef, [t, v], "SPAWN");
```

### Resources

Register global data that hangs off the registry, not specific entities:

```js
const Cache = ecs.registerResource("my_cache", () => new MyCache());
```

Resources persist through `IResourceStorage` when configured on the Java side.

## Building Queries

You can pass either arrays of component types or prebuilt `Query` objects into system options:

- `ecs.queryAll([Transform, Velocity])`
- `ecs.queryNot([Sleeping])`
- `ecs.queryOr([TeamA], [TeamB])`
- `ecs.queryAny()` // wildcard
- `ecs.archetype([Transform, Velocity])` // acts as a `Query`

:::tip[Reuse queries]
Create queries once at module scope and reuse them across systems to avoid allocations inside ticks.
:::

## Data Conversions

Vector-like inputs accept `{x,y,z}`, arrays `[x,y,z]`, or a single number (applied to all axes). This applies to helpers like `setPosition`, `addForce`, and component setters.

Next: wire those components into systems and listen to ECS events.
