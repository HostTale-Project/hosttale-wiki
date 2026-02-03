---
title: ECS FAQ - Entity Component System Questions
description: Frequently asked questions about Hytale's Entity Component System (ECS). Learn about components, systems, queries, events, and ECS architecture for plugin development.
---

Get quick answers to common questions about working with Hytale's Entity Component System.

## Understanding ECS

### What is ECS?

Entity Component System (ECS) is an architectural pattern that separates data (components) from behavior (systems). Instead of using inheritance hierarchies, ECS composes entities from small, reusable components and processes them with specialized systems.

### Why does Hytale use ECS?

ECS provides:
- **Performance** - Cache-friendly data layout, efficient iteration
- **Flexibility** - Compose entities from any combination of components
- **Maintainability** - Small, focused systems instead of monolithic classes
- **Scalability** - Easy to parallelize and optimize

### Do I need to use ECS for my plugin?

Not always! For simple plugins (commands, basic events), you don't need ECS. Use ECS when:
- Creating custom entity behaviors
- Implementing per-tick logic
- Building complex game mechanics
- Storing serializable game state

### What's the difference between ECS and traditional OOP?

**Traditional OOP:**
```java
class Monster extends Entity {
    // All data and behavior mixed together
}
```

**ECS:**
```java
// Data only
class HealthComponent { int health; }

// Behavior only
class DamageSystem {
    void update(Query<HealthComponent> entities) {
        // Process all entities with HealthComponent
    }
}
```

## Components

### What is a Component?

A component is a small, data-only structure that describes a single aspect of an entity. Examples: `PositionComponent`, `HealthComponent`, `InventoryComponent`.

### How do I create a custom component?

Implement the `Component` interface:

```java
public class MyComponent implements Component {
    public int value;
    public String data;
}
```

Then register it with the `ComponentRegistry`.

### Should components contain logic?

No! Components should be pure data. Put all logic in Systems.

### Can components reference other entities?

Yes, but use entity IDs (references), not direct object references:

```java
public class OwnerComponent implements Component {
    public long ownerId; // Entity ID, not Entity object
}
```

### How many components should an entity have?

Keep it focused! An entity might have 3-10 components typically. Too many components can indicate over-engineering.

### Can I add/remove components at runtime?

Yes! Use the `CommandBuffer` within systems:

```java
commandBuffer.addComponent(entityId, new MyComponent());
commandBuffer.removeComponent(entityId, MyComponent.class);
```

## Systems

### What is a System?

A system is behavior that operates on entities matching specific component requirements. Systems run every tick, on events, or on intervals.

### What types of systems exist?

- **Ticking Systems** - Run every server tick
- **Event Systems** - Run when specific events fire
- **Delayed Systems** - Run on intervals (e.g., every 5 seconds)
- **Data Systems** - Provide derived data without mutating state

### How do I create a system?

Extend the appropriate system base class:

```java
public class MyTickingSystem extends TickingSystem {
    @Override
    public void tick(Store store, float deltaTime) {
        Query query = Query.with(MyComponent.class);
        store.forEach(query, entity -> {
            // Process entity
        });
    }
}
```

### How do I control system execution order?

Use dependencies or system groups:

```java
@DependsOn(OtherSystem.class)
public class MySystem extends TickingSystem {
    // This runs after OtherSystem
}
```

### Can systems run in parallel?

Some systems can be parallelized, but be careful with shared state. Use the `CommandBuffer` to safely queue changes during iteration.

### How often do systems run?

- **Ticking systems** - Every server tick (~20 times per second)
- **Event systems** - When their event fires
- **Delayed systems** - Based on configured interval

## Queries

### What is a Query?

A query is a filter that selects entities based on component requirements. It's how systems find entities to process.

### How do I create a query?

Use the builder pattern:

```java
Query query = Query.builder()
    .with(PositionComponent.class)
    .with(HealthComponent.class)
    .without(DeadComponent.class)
    .build();
```

### What query operators are available?

- **with()/all()** - Entity must have these components
- **without()/none()** - Entity must NOT have these
- **or()** - Entity must have at least one of these
- **exact()** - Match exact archetype

### Should I create queries inside systems?

No! Create queries once (e.g., in constructor) and reuse them:

```java
public class MySystem extends TickingSystem {
    private final Query query;
    
    public MySystem() {
        this.query = Query.with(MyComponent.class);
    }
    
    @Override
    public void tick(Store store, float deltaTime) {
        store.forEach(query, entity -> {
            // Use cached query
        });
    }
}
```

### How performant are queries?

Very! Hytale's ECS uses archetypes, so queries are basically array iterations. Don't worry about query performance unless you have millions of entities.

### Can I query across worlds?

No. Each world has its own `Store`. Queries operate on a single store.

## Entities

### What is an Entity?

An entity is just an ID (long integer). All meaning comes from the components attached to it.

### How do I create an entity?

Use the `CommandBuffer`:

```java
long entityId = commandBuffer.createEntity();
commandBuffer.addComponent(entityId, new PositionComponent());
commandBuffer.addComponent(entityId, new HealthComponent());
```

### How do I destroy an entity?

```java
commandBuffer.destroyEntity(entityId);
```

### Can I get all components of an entity?

Yes, but prefer querying for specific components:

```java
PositionComponent pos = store.getComponent(entityId, PositionComponent.class);
```

### How do I find an entity by ID?

```java
if (store.hasEntity(entityId)) {
    // Entity exists
    PositionComponent pos = store.getComponent(entityId, PositionComponent.class);
}
```

## Events

### What are ECS events?

ECS events are typed payloads that flow through the ECS system. They're different from regular Hytale events.

### What types of ECS events exist?

- **EntityEventType** - Events targeting specific entities
- **WorldEventType** - Events affecting the entire world

### How do I listen to ECS events?

Create an event system:

```java
public class MyEventSystem extends EventSystem<MyEvent> {
    @Override
    public void handle(Store store, MyEvent event) {
        // Process event
    }
}
```

### Can I cancel ECS events?

Some events are cancellable. Check the event type:

```java
if (event instanceof CancellableEvent) {
    ((CancellableEvent) event).cancel();
}
```

### How do I fire custom ECS events?

Register your event type and invoke it:

```java
store.invoke(new MyCustomEvent(data));
```

## Archetypes

### What is an Archetype?

An archetype is the unique set of components an entity has. Entities with the same components share an archetype.

Example: All entities with `[Position, Health, Inventory]` components share one archetype.

### Why do archetypes matter?

Performance! Entities in the same archetype are stored contiguously in memory, making iteration very fast.

### Can I query by exact archetype?

Yes:

```java
Query query = Query.exactArchetype(PositionComponent.class, HealthComponent.class);
```

### Do I need to manage archetypes manually?

No! Archetypes are created and managed automatically when you add/remove components.

## Registry & Store

### What is the ComponentRegistry?

The central catalog that holds:
- Component types
- System definitions
- Event types
- Resources

Usually registered during plugin initialization.

### What is a Store?

A per-world ECS instance that owns entities, archetypes, and runs the tick loop. Each world has its own Store.

### How do I access the Store?

Usually passed to your system methods:

```java
@Override
public void tick(Store store, float deltaTime) {
    // Use store
}
```

### Can I have multiple Stores?

Yes! Each world has its own Store. Don't share data between stores without explicit coordination.

## CommandBuffer

### What is the CommandBuffer?

A buffer for queuing ECS changes (create/destroy entities, add/remove components). Changes are applied after the current system finishes to avoid iteration corruption.

### Why use CommandBuffer instead of direct changes?

**Thread safety!** Direct changes during iteration can corrupt data structures. CommandBuffer ensures safe mutation.

### When are CommandBuffer changes applied?

After the current system completes its tick/event handling.

### Can I read CommandBuffer changes immediately?

No. Changes are pending until applied. Design systems to handle this delay.

## Performance

### How many entities can ECS handle?

Thousands to tens of thousands efficiently. Performance depends on system complexity and component count.

### What's the most common ECS performance mistake?

Creating queries inside loops:

```java
// BAD!
for (Entity e : entities) {
    Query q = Query.with(MyComponent.class); // Don't do this!
}

// GOOD!
Query q = Query.with(MyComponent.class); // Create once
for (Entity e : entities) {
    // Use cached query
}
```

### Should I cache component lookups?

For tight loops, yes:

```java
PositionComponent pos = store.getComponent(entityId, PositionComponent.class);
// Use pos multiple times
```

### How do I profile ECS performance?

Use Java profilers (JProfiler, YourKit) to identify slow systems. Focus on systems that run every tick.

## Best Practices

### Should I use many small components or fewer large ones?

Many small components! This enables better reusability and flexibility:

```java
// Good
class PositionComponent { Vector3 pos; }
class VelocityComponent { Vector3 vel; }

// Less flexible
class MovementComponent { Vector3 pos; Vector3 vel; }
```

### How do I share data between systems?

Use **Resources** - non-entity data registered with the registry:

```java
registry.registerResource(new MySharedData());
```

### Should I mutate components directly?

In ticking systems, yes (but use CommandBuffer for structural changes). In event systems, check if mutation is allowed.

### How do I debug ECS issues?

- Log entity IDs and component values
- Check system execution order
- Verify queries match expected entities
- Use CommandBuffer correctly

## Related Documentation

- [ECS Overview](/guides/ecs/overview) - Introduction to ECS concepts
- [Registry & Runtime Objects](/guides/ecs/registry-and-runtime-objects) - ComponentRegistry and Store
- [Systems & Queries](/guides/ecs/systems-and-queries) - Creating systems and queries
- [Components & Events](/guides/ecs/components-and-events) - Defining components and events
- [Serialization & Resources](/guides/ecs/serialization-and-resources) - Data persistence
- [ECS for SimpleScripting](/simplescripting/ecs/overview) - Using ECS with JavaScript

---

*Last updated: February 2026*
