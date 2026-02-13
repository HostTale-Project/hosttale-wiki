---
title: Learning Path
description: Your complete roadmap to mastering SimpleScripting. From absolute beginner to advanced mod developer with step-by-step guides tailored to your experience level.
---

Choose your learning path based on your experience and goals. Each path is designed to take you from where you are to where you want to be.

---

## Choose Your Path

<div class="sl-flex" style="gap: 1rem; flex-wrap: wrap;">
  <a href="#path-1-complete-beginner" class="card" style="flex: 1; min-width: 250px;">
    <strong>Complete Beginner</strong>
    <br/>New to modding? Start here!
  </a>
  
  <a href="#path-2-javascript-developer" class="card" style="flex: 1; min-width: 250px;">
    <strong>JavaScript Developer</strong>
    <br/>Know JS? Fast track!
  </a>
  
  <a href="#path-3-java-mod-developer" class="card" style="flex: 1; min-width: 250px;">
    <strong>Java Mod Developer</strong>
    <br/>Already know Hytale modding?
  </a>
</div>

<br/>

<div class="sl-flex" style="gap: 1rem; flex-wrap: wrap;">
  <a href="#i-want-to-build" class="card" style="flex: 1; min-width: 250px;">
    <strong>I Want To Build...</strong>
    <br/>Jump to specific projects
  </a>
  
  <a href="#reference-quick-access" class="card" style="flex: 1; min-width: 250px;">
    <strong>Reference / Quick Access</strong>
    <br/>Know what you need?
    <br/><em>Direct links to docs</em>
  </a>
</div>

---

## Path 1: Complete Beginner

**Perfect for:** First time modding, basic programming knowledge  
**Goal:** Create your own working server mods with confidence

### Foundations

#### Setup & First Mod
1. [Install SimpleScripting](/simplescripting/getting-started/installation)
2. [Understand folder structure](/simplescripting/getting-started/folder-structure)
3. [**Your First Mod Tutorial**](/simplescripting/tutorials/your-first-mod) - BUILD THIS!
4. [Understand the mod manifest](/simplescripting/mod-development/manifest)

**Exercise:** Create a `/greet` command that says "Hello [player]!"

**You'll know:** How to create, edit, and reload mods

---

#### Commands
1. [Commands API reference](/simplescripting/api/events-and-commands#commands)
2. **Tutorial: Commands with Arguments** (coming soon)
3. Study: [welcome-rewards example](/simplescripting/examples/overview#welcome-rewards) (focus on `/playtime` command)

**Exercise:** Create `/heal` and `/feed` commands

**You'll know:** How to get command arguments and validate input

---

#### Events
1. [Events API reference](/simplescripting/api/events-and-commands#events)
2. Run `events.knownEvents()` to see all events
3. Study: [welcome-rewards example](/simplescripting/examples/overview#welcome-rewards) (focus on join/leave events)

**Exercise:** Make a mod that logs when players chat

**You'll know:** How to listen to game events

---

#### Database Basics
1. [Database API reference](/simplescripting/api/database)
2. Study: [welcome-rewards database code](/simplescripting/examples/overview#welcome-rewards)
3. **Tutorial: Persistent Data** (coming soon)

**Exercise:** Create a `/note <text>` command that saves notes per player

**You'll know:** How to save and load data

---

### Intermediate Skills

#### Players & Worlds
1. [Players & Worlds API](/simplescripting/api/players-and-worlds)
2. [UI & Messages](/simplescripting/api/ui-and-messages) - Make colorful messages
3. Study: [welcome-rewards starter kit code](/simplescripting/examples/overview#welcome-rewards)

**Exercise:** Create `/broadcast <message>` with colors

**You'll know:** How to find players and send formatted messages

---

#### Timers & Automation
1. [Server API (timers)](/simplescripting/api/server-net-and-assets)
2. Study: [afk-manager example](/simplescripting/examples/overview#afk-manager)

**Exercise:** Create a mod that announces "Server restart in X" every 10 minutes

**You'll know:** How to schedule repeating tasks

---

#### ECS Basics
1. [ECS Overview](/simplescripting/ecs/overview)
2. [Components & Queries](/simplescripting/ecs/components-and-queries)
3. Study: [home-warps teleportation code](/simplescripting/examples/overview#home-warps)

**Exercise:** Create `/tphere <player>` to teleport someone to you

**You'll know:** How to work with entity positions

---

#### Final Project
**Build a complete feature:**

Pick one:
- **Quest System**: Track player quests with database, give rewards on completion
- **Event System**: Scheduled mini-games or competitions
- **Leaderboard System**: Track player stats and display rankings

**Use:**
- Commands
- Events
- Database
- UI messages
- One example mod as reference

**You'll know:** How to combine all concepts into a working system!

---

### What's Next?
- Explore [Advanced Topics](#advanced-topics)
- Study [example mods in detail](/simplescripting/examples/overview)
- Join the community and share your mods!

---

## Path 2: JavaScript Developer

**Perfect for:** Already comfortable with JavaScript  
**Goal:** Translate JS skills to Hytale mods quickly

### Crash Course

**Skip the basics, focus on differences:**

1. [Installation](/simplescripting/getting-started/installation) - Quick setup
2. [Mod Layout](/simplescripting/mod-development/mod-layout) - File structure
3. [Your First Mod](/simplescripting/tutorials/your-first-mod) - 10-minute walkthrough
4. [API Overview](/simplescripting/api/overview) - What's available

**Key Differences from Node.js/Browser:**
- No npm/package.json - direct `.js` files
- Use `require('./file.js')` for local modules only
- Global APIs instead of imports: `commands`, `events`, `db`, etc.
- ES5 syntax (no arrow functions, destructuring, async/await)

**Exercise: Quick Test:** Create `/ping` command

---

### API Deep Dive

**Study the APIs you'll use most:**

1. [Events & Commands](/simplescripting/api/events-and-commands)
2. [Database](/simplescripting/api/database)
3. [Players & Worlds](/simplescripting/api/players-and-worlds)
4. [welcome-rewards full source](/simplescripting/examples/overview#welcome-rewards)

**Mental Model:**
```javascript
// You write:
function onEnable() {
  commands.register('test', handler);
  events.on('playerready', handler);
  db.execute('CREATE TABLE...');
}

// Mods are isolated - each gets own:
// - Database (SQLite)
// - Rhino JavaScript context
// - Command/event registrations
```

**Exercise: Quick Test:** Build a `/coin` command with database to track flips

---

### Production Patterns

1. [Modules & Shared Services](/simplescripting/api/modules-and-shared-services)
2. [simple-stats example](/simplescripting/examples/overview#simple-stats) - See require() usage
3. [ECS Overview](/simplescripting/ecs/overview) - Optional but powerful

**Code Organization Pattern:**
```javascript
// main.js
var utils = require('./utils.js');
var commands = require('./commands.js');

function onEnable() {
  commands.registerAll();
}

// commands.js
module.exports = {
  registerAll: function() {
    commands.register('help', helpCommand);
    commands.register('stats', statsCommand);
  }
};
```

**Exercise: Build This:** Multi-file mod with command router pattern

---

### You're Done!

You now know:
- ✅ How to create and structure mods
- ✅ All major APIs (commands, events, DB, players)
- ✅ Code organization with require()
- ✅ Production patterns from examples

**Next:** Pick a project from ["I Want To Build..."](#i-want-to-build) and go!

---

## Path 3: Java Mod Developer

**Perfect for:** Already developing Hytale mods in Java  
**Time commitment:** 1 day (concepts only)  
**Goal:** Understand how SimpleScripting complements Java mods

### What You Need to Know

**SimpleScripting is NOT a replacement for Java mods. It's complementary.**

| Feature | Java Mod | SimpleScripting |
|---------|----------|-----------------|
| Custom blocks/items | Java only | Not supported: Cannot define |
| Assets (models, textures) | Java only | Not supported: Cannot define |
| Server logic | Java | JavaScript |
| Commands | Java | JavaScript |
| Events | Java | JavaScript |
| Database | Manual | Built-in SQLite |
| Rapid iteration | Recompile | Edit & reload |

### Crash Course

1. [Introduction - Design Philosophy](/simplescripting/introduction)
2. [API Overview - How wrappers work](/simplescripting/api/overview)
3. [welcome-rewards example](/simplescripting/examples/overview#welcome-rewards) - See full implementation
4. [Extensions System](/simplescripting/api/extensions) - **Important!** How to extend JS from Java

**Key Concept - Wrapper Architecture:**

```java
// Java side (what you build)
public class MyExtension implements SimpleScriptingExtension {
    @Override
    public void onRegister(ExtensionContext context) {
        // Register your Java API for JS mods to use
        context.registerGlobalApi("myapi", (modId, runtime, logger) -> 
            new MyJavaApi(logger)
        );
    }
}

// JavaScript side (what mod developers use)
function onEnable() {
    var result = myapi.doSomething("test"); // Your Java method
}
```

### When to Use Each

**Use Java When:**
- Defining assets (blocks, items, models, UI files)
- Core gameplay mechanics
- Performance-critical operations
- Deep engine integration needed

**Use SimpleScripting (JS) When:**
- Server automation/logic
- Custom commands/events
- Rapid prototyping
- Non-developers need to customize

**Use Both:**
- Java defines the items/blocks/assets
- JS defines the gameplay logic using those assets

### Practical Example: Shop System

```java
// Java mod: Defines shop block, UI assets
public class ShopBlockMod extends JavaPlugin {
    // Register shop block, UI files
}
```

```javascript
// JS mod: Shop logic/economy/transactions
function onEnable() {
  commands.register('shop', function(ctx) {
    // Open shop UI using Java-defined assets
    // Handle purchase logic in JS
    if (economy.withdraw(uuid, price)) {
      // Give item (defined in Java)
    }
  });
}
```

### Creating Extensions

If you want JS mods to use your Java plugin:

1. Read: [Extension System Guide](/simplescripting/api/extensions)
2. Study: [EconomySS source code](https://github.com/HostTale-Project/EconomySS)
3. Implement: `SimpleScriptingExtension` interface

---

## I Want To Build...

Jump directly to project-specific guides:

### Economy/Shop System
**Requirements:** **EconomySS extension plugin** + economy provider (VaultUnlocked/EliteEssentials)  
**Study:**
- [player-shops example](/simplescripting/examples/overview#player-shops-economyss-extension)
- ✅ [Economy API (Extension)](/simplescripting/api/economy)
- ✅ [Database for prices](/simplescripting/api/database)

**Pattern:**
```javascript
// 1. Check economy availability
if (!economy.isAvailable()) return;

// 2. Get prices from DB
var price = db.queryOne('SELECT price FROM items WHERE id = ?', [itemId]).price;

// 3. Validate and transact
if (economy.withdraw(uuid, price)) {
  // Give item
}
```

---

### Teleportation System (Homes/Warps)
**Study:**
- [home-warps example](/simplescripting/examples/overview#home-warps)
- ✅ [ECS Position/Teleport](/simplescripting/ecs/spatial-and-helpers)
- ✅ [Database for locations](/simplescripting/api/database)

**Pattern:**
```javascript
// Save location
var pos = ecs.getPosition(player);
db.execute('INSERT INTO homes VALUES (?, ?, ?, ?)', [name, pos.x, pos.y, pos.z]);

// Teleport to location
var home = db.queryOne('SELECT * FROM homes WHERE name = ?', [name]);
ecs.teleport(player, [home.x, home.y, home.z], [0, 0, 0]);
```

---

### Statistics/Leaderboards
**Study:**
- [simple-stats example](/simplescripting/examples/overview#simple-stats)
- ✅ [Database queries](/simplescripting/api/database)
- ✅ [Shared Services](/simplescripting/api/modules-and-shared-services)

**Pattern:**
```javascript
// Track stat
db.execute('UPDATE stats SET kills = kills + 1 WHERE player = ?', [name]);

// Leaderboard
var top = db.query('SELECT player, kills FROM stats ORDER BY kills DESC LIMIT 10');
```

---

### Mini-Games/Events
**Study:**
- [welcome-rewards (timers)](/simplescripting/examples/overview#welcome-rewards)
- ✅ [Server timers](/simplescripting/api/server-net-and-assets)
- ✅ [Events](/simplescripting/api/events-and-commands)
- ✅ [ECS (for gameplay)](/simplescripting/ecs/overview)

**Pattern:**
```javascript
var gameActive = false;
var participants = [];

commands.register('startgame', function() {
  gameActive = true;
  players.broadcast("Game starting in 30 seconds!");
  
  server.runLater(30000, function() {
    // Start game logic
  });
});
```

---

### Reward Systems (Daily/Playtime)
**Study:**
- [welcome-rewards (playtime tracking)](/simplescripting/examples/overview#welcome-rewards)
- ✅ [Events (playerready)](/simplescripting/api/events-and-commands)
- ✅ [Database](/simplescripting/api/database)

**Pattern:**
```javascript
events.on('playerready', function(event) {
  var lastClaim = db.queryOne('SELECT last_daily FROM rewards WHERE player = ?', [name]);
  var today = new Date().toDateString();
  
  if (lastClaim.last_daily !== today) {
    // Give daily reward
    db.execute('UPDATE rewards SET last_daily = ? WHERE player = ?', [today, name]);
  }
});
```

---

### Custom Commands Suite
**Study:**
- ⭐ [Your First Mod tutorial](/simplescripting/tutorials/your-first-mod)
- ✅ [Commands API](/simplescripting/api/events-and-commands#commands)
- [simple-stats (command routing)](/simplescripting/examples/overview#simple-stats)

**Pattern:**
```javascript
// Multiple related commands
commands.register('heal', healCommand, { description: "Heal yourself" });
commands.register('feed', feedCommand, { description: "Feed yourself" });
commands.register('fly', flyCommand, { description: "Toggle fly" });

// Or subcommand routing
commands.register('admin', function(ctx) {
  var sub = ctx.args()[0];
  if (sub === 'heal') healCommand(ctx);
  else if (sub === 'tp') tpCommand(ctx);
});
```

---

## Reference / Quick Access

**I know what I need, take me there:**

### Core Concepts
- [Mod Manifest (mod.json)](/simplescripting/mod-development/manifest)
- [Lifecycle Hooks](/simplescripting/mod-development/lifecycle)
- [Dependencies & Load Order](/simplescripting/mod-development/dependencies-and-order)

### APIs
- [Commands & Events](/simplescripting/api/events-and-commands)
- [Database (SQLite)](/simplescripting/api/database)
- [Players & Worlds](/simplescripting/api/players-and-worlds)
- [Inventory & Items](/simplescripting/api/inventory-and-items)
- [Server, Net & Assets](/simplescripting/api/server-net-and-assets)
- [UI & Messages](/simplescripting/api/ui-and-messages)
- [Economy (extension)](/simplescripting/api/economy)
- [Extensions System](/simplescripting/api/extensions)

### ECS
- [ECS Overview](/simplescripting/ecs/overview)
- [Components & Queries](/simplescripting/ecs/components-and-queries)
- [Systems & Events](/simplescripting/ecs/systems-and-events)
- [Spatial & Helpers](/simplescripting/ecs/spatial-and-helpers)

### Advanced
- [Modules & Shared Services](/simplescripting/api/modules-and-shared-services)
- [Example Mods Source Code](/simplescripting/examples/overview)
- [Current Limitations](/simplescripting/limitations)

### Help
- [FAQ](/simplescripting/faq)
- [Getting Started FAQ](/simplescripting/getting-started/faq)
- [Troubleshooting](/simplescripting/getting-started/faq#troubleshooting)

---

## Advanced Topics

Once you've mastered the basics:

### Cross-Mod Communication
- [Shared Services](/simplescripting/api/modules-and-shared-services)
- [Extension Events](/simplescripting/api/extensions#extension-event-bus)
- Study: [simple-stats SharedServices](/simplescripting/examples/overview#simple-stats)

### Extension Development
- [Creating Extensions](/simplescripting/api/extensions#creating-an-extension)
- Provide TypeScript definitions
- Bundle example mods with extensions

### Performance Optimization
- Database indexing
- Caching strategies
- Efficient event handlers
- Batch operations

### Production Best Practices
- Error handling patterns
- Migration strategies
- Testing approaches
- Version management

---

## Need Help?

- **Stuck?** Check the [FAQ](/simplescripting/faq)
- **Errors?** See [Troubleshooting](/simplescripting/getting-started/faq#troubleshooting)
- **Examples?** Study [example mods](/simplescripting/examples/overview)
- **Community:** Join discussions on GitHub

---

**Ready to start? Pick your path above and begin building!**
