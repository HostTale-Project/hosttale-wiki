---
title: SimpleScripting FAQ - Frequently Asked Questions
description: Common questions and answers about using SimpleScripting for Hytale mod development. Learn about JavaScript mods, API limitations, performance, and best practices.
---

Get quick answers to common questions about SimpleScripting, the JavaScript framework for Hytale server mods.

## Getting Started

### What is SimpleScripting?

SimpleScripting is a server-side scripting framework for Hytale that allows you to create mods using JavaScript instead of Java. It provides a JavaScript execution layer embedded into the Hytale server with a safe interoperability layer between mods.

**Key benefits:**
- No Java compilation required - edit and reload
- Lower barrier to entry for modding
- Full compatibility with native Hytale mods
- Access to most server-side functionality

### Do I need to know Java to use SimpleScripting?

No! SimpleScripting is designed specifically for developers who want to use JavaScript. However, understanding basic programming concepts (variables, functions, objects) is essential.

### Can SimpleScripting mods run alongside Java mods?

Yes! SimpleScripting mods run alongside native Hytale mods. They can interact through Shared Services and both types of mods can coexist on the same server.

### Where do I download SimpleScripting?

SimpleScripting is currently in pre-release and available on GitHub:
[Download SimpleScripting](https://github.com/HostTale-Project/SimpleScripting)

## Installation & Setup

**For installation and setup questions**, see the [Getting Started FAQ](/simplescripting/getting-started/faq) which covers:
- Installation steps
- File structure and organization
- Creating your first mod
- Configuration
- Debugging and common errors
- Testing your mod

## API & Capabilities

### What can I do with SimpleScripting?

You can:
- ✅ Create custom commands
- ✅ Listen to game events
- ✅ Manage player data
- ✅ Store data in per-mod SQLite databases
- ✅ Send messages and UI to players
- ✅ Schedule tasks
- ✅ Work with the ECS (Entity Component System)
- ✅ Integrate with economy plugins
- ✅ Share APIs between mods via Shared Services

See [API Overview](/simplescripting/api/overview) for the complete surface.

### What can't I do with SimpleScripting?

SimpleScripting cannot:
- Not supported: Define custom blocks, items, or models (use native mods for assets)
- Not supported: Run client-side code (server-only)
- Not supported: Access low-level Java APIs directly
- Not supported: Modify core game mechanics without native mod support

See [Current Limitations](/simplescripting/limitations) for details.

### How do I create a command?

Use the global `commands` API:

```javascript
function onEnable() {
  commands.register('mycommand', function(ctx) {
    ctx.reply('Hello from JavaScript!');
  }, { description: 'Does something cool' });
}
```

See [Events & Commands](/simplescripting/api/events-and-commands) for more.

### How do I store persistent data?

Each mod gets a SQLite database. Use the global `db` variable:

```javascript
// Create table
db.execute(`
  CREATE TABLE IF NOT EXISTS players (
    uuid TEXT PRIMARY KEY,
    coins INTEGER DEFAULT 0
  )
`);

// Query data
const result = db.query('SELECT coins FROM players WHERE uuid = ?', [uuid]);
```

See [Database API](/simplescripting/api/database) for complete examples.

### How do I listen to game events?

Register event listeners using the global `events` API:

```javascript
function onEnable() {
  events.on('PlayerChat', function(evt) {
    const player = evt.getPlayer();
    player.sendMessage('Welcome to the server!');
  });
}
```

See [Events & Commands](/simplescripting/api/events-and-commands) for available events.

## Performance & Best Practices

### Is JavaScript slower than Java for mods?

JavaScript has some overhead compared to compiled Java, but for typical mod logic (commands, event handlers, data storage) the difference is negligible. SimpleScripting is optimized for server-side use.

**Best practices:**
- Avoid heavy computation in event handlers
- Use efficient database queries
- Cache data when possible
- Don't create objects in tight loops

### How many mods can I run at once?

There's no hard limit, but like any modded server, performance depends on what your mods do. Well-written JavaScript mods should have minimal impact.

### Should I use SimpleScripting or native Java mods?

**Use SimpleScripting when:**
- You want rapid development and testing
- You're comfortable with JavaScript
- You're building server logic, commands, or automation
- You don't need custom assets

**Use native Java mods when:**
- You need custom blocks, items, or models
- You require maximum performance
- You need low-level engine access
- You're building complex client-side features

Many projects use both! SimpleScripting for flexible server logic, Java for assets and core systems.

## Interoperability

### How do mods communicate with each other?

Use Shared Services:

```javascript
// Provide a service
SharedServices.expose("MyService", {
  getValue: () => 42,
  doSomething: (data) => { /* ... */ }
});

// Consume a service
const value = SharedServices.call("MyService", "getValue", []);
const result = SharedServices.call("MyService", "doSomething", [someData]);
```

See [Shared Services](/simplescripting/interop/shared-services) for details.

### Can SimpleScripting mods interact with Java mods?

Yes, through Shared Services. Java mods can register services that JavaScript mods consume, and vice versa.

## Working with ECS

### Do I need to understand ECS to use SimpleScripting?

Not for basic mods! Commands, events, and database operations don't require ECS knowledge. However, for advanced gameplay logic (custom behaviors, systems, components), understanding ECS is beneficial.

### Can I create custom components in JavaScript?

Yes! SimpleScripting provides ECS APIs for registering components, creating systems, and querying entities.

See [ECS for SimpleScripting](/simplescripting/ecs/overview) for the complete guide.

### How do I query entities?

Use the global ECS API:

```javascript
// Note: Refer to the ECS documentation for the exact query API
// as SimpleScripting provides wrappers for the native ECS system
const entities = ecs.query({
  all: ['PositionComponent', 'HealthComponent']
});

entities.forEach(entity => {
  const health = entity.getComponent('HealthComponent');
  // Do something with health...
});
```

See [Components & Queries](/simplescripting/ecs/components-and-queries).

## Troubleshooting

### My mod isn't loading. What should I check?

1. **Verify mod.json syntax** - Must be valid JSON
2. **Check the "Main" field** - Should point to your entry file
3. **Look at server logs** - Error messages will show what's wrong
4. **Verify dependencies** - Make sure required mods are installed
5. **Check file locations** - Mod must be in `mods/yourmod/` directory

### I'm getting "undefined is not a function" errors

This usually means:
- You're trying to use a method that doesn't exist in the API
- You're calling a method on an undefined object
- You have a typo in the method name

Check the [API documentation](/simplescripting/api/overview) for correct method names.

### How do I report bugs or request features?

- **GitHub Issues**: [SimpleScripting Issues](https://github.com/HostTale-Project/SimpleScripting/issues)
- **Documentation Issues**: [HostTale Wiki Issues](https://github.com/HostTale-Project/hosttale-wiki/issues)

## Related Documentation

- [SimpleScripting Overview](/simplescripting/overview) - Introduction and concepts
- [Installation Guide](/simplescripting/getting-started/installation) - Setup instructions
- [API Overview](/simplescripting/api/overview) - Complete API reference
- [ECS for SimpleScripting](/simplescripting/ecs/overview) - Entity Component System
- [Current Limitations](/simplescripting/limitations) - Design constraints

---

*Last updated: February 2026*
