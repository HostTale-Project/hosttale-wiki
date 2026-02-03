---
title: ECS Overview
description: Understand Hytale's Entity Component System and how it powers gameplay logic.
---

Hytale's server runtime is built on an Entity Component System (ECS). Instead of putting logic inside game objects, ECS separates data from behavior so you can compose features quickly and keep systems fast.

## Mental Model

- **Entities are IDs** – An entity is just a reference; all meaning comes from the components attached to it.
- **Components are data only** – Small serializable records that describe traits (position, velocity, tags, etc.).
- **Systems are behavior** – They run every tick or when events fire, pulling entities that match their **query** and applying logic.
- **Composition over inheritance** – Adding/removing a component changes which systems will process an entity. No class hierarchies required.
- **Tick-driven** – The server tick schedules systems in dependency order; systems can also be delayed or event-driven.

:::tip[Who should read this?]
New to Hytale modding? Start here to learn the concepts before diving into code. Experienced engine devs can skim for engine-specific nuances.
:::

## Core Building Blocks

- **ComponentRegistry** – The central catalog of component types, resources, systems, and event types.
- **Store** – A per-world ECS store that owns entities, archetypes, and the tick loop.
- **Archetype** – The ordered set of components an entity has; entities with the same set share storage.
- **Query** – A reusable filter built from component requirements (`and`, `or`, `not`, or exact archetypes).
- **System** – Behavior units that declare a query and lifecycle hooks. Includes ticking, event, data, and delayed variants.
- **Event** – Typed payloads that flow through ECS (`EntityEventType` or `WorldEventType`) and can be cancellable.
- **Resource** – Non-entity scoped data registered alongside components (e.g., spatial indices, delayed system state).

## Execution Flow

1. The registry resolves system dependencies into a stable order.
2. Each server tick, the `Store` runs ticking systems; chunk-aware systems iterate matching archetype chunks.
3. Event systems run when `Store.invoke(...)` is called with an ECS event.
4. Delayed systems run on their configured interval; data systems fetch derived data without mutating state.

## Design Principles

- Prefer many focused components over monoliths.
- Keep queries explicit and stable; avoid constructing them inside inner loops.
- Use dependencies (system groups or explicit `Order` constraints) instead of relying on registration order.
- Mutate through `CommandBuffer` inside systems to stay thread-safe during iteration.
- Reuse built-in components and events before inventing new ones—vanilla data already interacts with game systems.

## When to Reach for ECS

- Attaching gameplay behaviors to entities (status effects, AI tweaks, area rules).
- Reacting to world interactions (block place/break, crafting, chunk lifecycle).
- Scheduling logic on a per-tick or delayed cadence.
- Storing mod data in a way the engine can serialize and replicate.

## Next Steps

Dive deeper into ECS development:

- [Registry & Runtime Objects](/guides/ecs/registry-and-runtime-objects) - Learn about ComponentRegistry and Store
- [Systems & Queries](/guides/ecs/systems-and-queries) - Build and register systems
- [Components & Events](/guides/ecs/components-and-events) - Define custom components and events
- [Serialization & Resources](/guides/ecs/serialization-and-resources) - Persist and manage data

## Related Documentation

- [Get Started](/guides/get-started) - Set up your development environment
- [ECS for SimpleScripting](/simplescripting/ecs/overview) - Use ECS with JavaScript
- [Commands Guide](/guides/commands) - Create commands that interact with ECS

---

*Last updated: February 2026*

Next up: learn the runtime objects that make these pieces work in `Registry & Runtime Objects`.
