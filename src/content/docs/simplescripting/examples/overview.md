---
title: Example Mods
description: Learn from complete, production-ready example mods included with SimpleScripting. Study working implementations of commands, events, database, economy, and more.
---

SimpleScripting includes 5 complete example mods that demonstrate real-world features and best practices. These mods are installed automatically on first server run and serve as learning resources and starting points for your own projects.

:::tip[Examples are Disabled by Default]
All example mods have `"enabled": false` in their `mod.json`. This prevents them from auto-loading. You can enable them individually to study how they work or use them on your server.
:::

---

## Quick Reference

| Example | Features Demonstrated | Complexity | Source |
|---------|---------------------|------------|---------|
| [welcome-rewards](#welcome-rewards) | Events, Database, Commands, UI | Intermediate | [View](https://github.com/HostTale-Project/SimpleScripting/tree/main/src/main/resources/examples/welcome-rewards) |
| [home-warps](#home-warps) | Teleportation, ECS, Multi-table DB | Intermediate | [View](https://github.com/HostTale-Project/SimpleScripting/tree/main/src/main/resources/examples/home-warps) |
| [simple-stats](#simple-stats) | require(), Shared Services, Leaderboards | Advanced | [View](https://github.com/HostTale-Project/SimpleScripting/tree/main/src/main/resources/examples/simple-stats) |
| [afk-manager](#afk-manager) | Timers, Player tracking, Automated actions | Intermediate | [View](https://github.com/HostTale-Project/SimpleScripting/tree/main/src/main/resources/examples/afk-manager) |
| [player-shops](#player-shops-economyss-extension) | Economy API, Pagination, Item management | Advanced | [View](https://github.com/HostTale-Project/EconomySS/tree/main/src/main/resources/examples/player-shops) |

---

## welcome-rewards

**Complete welcome system with first-join rewards, join/leave broadcasts, and playtime tracking.**

### What It Demonstrates
- ✅ Event handling (`playerready`, `playerdisconnect`)
- ✅ Database operations (CREATE, INSERT, UPDATE, SELECT)
- ✅ Inventory management with item stacks
- ✅ Scheduled tasks with `server.runRepeating()`
- ✅ UI colored messages
- ✅ Command registration with arguments

### Features
- **Starter Kit**: New players receive 64 wood, 32 cobblestone, 1 pickaxe, 16 bread
- **Join/Leave Messages**: Broadcasts when players connect/disconnect
- **Playtime Tracking**: Tracks total play time per player
- **Commands**: 
  - `/playtime [player]` - View play time
  - `/online` - List online players

### Key Code Patterns

**First-join detection:**
```javascript
events.on('playerready', function(event) {
  var player = event.player;
  var name = player.getUsername();
  var result = db.query('SELECT first_join FROM player_data WHERE name = ?', [name]);
  
  if (result.length === 0) {
    // New player - give starter kit
    db.execute('INSERT INTO player_data (name, first_join, total_playtime) VALUES (?, ?, ?)', 
      [name, Date.now(), 0]);
    giveStarterKit(player);
  }
});
```

**Giving items to players:**
```javascript
function giveStarterKit(player) {
  var inv = player.getInventory();
  for (var i = 0; i < STARTER_KIT.length; i++) {
    var item = STARTER_KIT[i];
    var stack = inventory.createStack(item.itemId, item.quantity);
    inv.addItem(stack);
  }
}
```

**Scheduled playtime saves:**
```javascript
server.runRepeating(60000, 60000, function() {
  // Every minute, save playtime for online players
  for (var name in playtimeTrackers) {
    if (playtimeTrackers[name].joinTime) {
      var sessionTime = Math.floor((Date.now() - playtimeTrackers[name].joinTime) / 1000);
      var total = playtimeTrackers[name].totalSeconds + sessionTime;
      db.execute('UPDATE player_data SET total_playtime = ? WHERE name = ?', [total, name]);
    }
  }
});
```

### How to Enable

1. Navigate to: `mods/SimpleScripting/mods-js/welcome-rewards/`
2. Edit `mod.json`
3. Change: `"enabled": false` → `"enabled": true`
4. Restart server

### Learning Path
- **Best for**: Understanding database basics and event handling
- **Next steps**: Adapt the starter kit items for your server
- **Related docs**: [Events & Commands](/simplescripting/api/events-and-commands), [Database](/simplescripting/api/database), [Inventory API](/simplescripting/api/inventory-and-items)

---

## home-warps

**Teleportation system with personal homes and server warps.**

### What It Demonstrates
- ✅ ECS position and teleportation
- ✅ Multi-table database design
- ✅ Per-player limits (max 3 homes)
- ✅ Admin permission checks
- ✅ List commands with dynamic output

### Features
- **Player Homes**: Set up to 3 personal homes
- **Server Warps**: Admins create public warp points
- **Commands**:
  - `/sethome [name]` - Save current location
  - `/home [name]` - Teleport to home (lists all if no name)
  - `/delhome <name>` - Delete a home
  - `/setwarp <name>` - (Admin) Create server warp
  - `/warp <name>` - Teleport to warp (lists all if no name)
  - `/delwarp <name>` - (Admin) Delete warp

### Key Code Patterns

**Setting a home with position:**
```javascript
commands.register('sethome', function(context) {
  var player = context.sender();
  var homeName = args.length > 0 ? args[0] : 'home';
  var name = player.getUsername();
  
  // Check limit
  var count = db.query('SELECT COUNT(*) as cnt FROM homes WHERE player = ?', [name])[0].cnt;
  if (count >= MAX_HOMES) {
    // Only allow if replacing existing
  }
  
  // Get player position
  var pos = ecs.getPosition(player);
  var world = player.getWorldName();
  
  // Save to database
  db.execute('INSERT OR REPLACE INTO homes VALUES (?, ?, ?, ?, ?, ?)', 
    [name, homeName, world, pos.x, pos.y, pos.z]);
});
```

**Teleporting to location:**
```javascript
commands.register('home', function(context) {
  var home = db.queryOne('SELECT * FROM homes WHERE player = ? AND name = ?', [name, homeName]);
  
  if (home) {
    ecs.teleport(player, [home.x, home.y, home.z], [0, 0, 0]);
    context.reply("Teleported to " + homeName);
  }
});
```

**Dynamic list command:**
```javascript
if (args.length === 0) {
  // No args - list all homes
  var homes = db.query('SELECT name FROM homes WHERE player = ?', [name]);
  context.reply('=== Your Homes ===');
  for (var i = 0; i < homes.length; i++) {
    context.reply('  ' + homes[i].name);
  }
  return;
}
```

### Database Schema
```sql
CREATE TABLE homes (
  player TEXT, 
  name TEXT, 
  world TEXT, 
  x REAL, 
  y REAL, 
  z REAL, 
  PRIMARY KEY (player, name)
);

CREATE TABLE warps (
  name TEXT PRIMARY KEY, 
  world TEXT, 
  x REAL, 
  y REAL, 
  z REAL
);
```

### How to Enable

1. Navigate to: `mods/SimpleScripting/mods-js/home-warps/`
2. Edit `mod.json`
3. Change: `"enabled": false` → `"enabled": true`
4. Restart server

### Learning Path
- **Best for**: Learning ECS integration and multi-table databases
- **Next steps**: Add cooldowns, costs, or cross-world teleportation
- **Related docs**: [ECS API](/simplescripting/ecs/overview), [Database](/simplescripting/api/database)

---

## simple-stats

**Player statistics tracker with leaderboards and modular code structure.**

### What It Demonstrates
- ✅ `require()` for code organization
- ✅ Shared Services API for cross-mod communication
- ✅ Modular API design
- ✅ Leaderboard queries with ORDER BY
- ✅ Exposing mod functionality to other mods

### Features
- **Stats Tracking**: Records player join counts (extensible to other stats)
- **Leaderboards**: View top players by any stat
- **Shared API**: Other mods can use the stats system
- **Commands**:
  - `/stats [player]` - View player statistics
  - `/top [stat]` - View leaderboard

### Project Structure
```
simple-stats/
├── mod.json
├── main.js       # Entry point, command registration
└── stats-api.js  # Core stats logic (required by main.js)
```

### Key Code Patterns

**Using require() for modules:**
```javascript
// main.js
var statsApi = require('./stats-api.js');

function onEnable() {
  statsApi.init();
  
  events.on('playerready', function(event) {
    statsApi.incrementStat(event.player.getUsername(), 'joins');
  });
}
```

**Module exports:**
```javascript
// stats-api.js
module.exports = {
  init: function() {
    db.execute('CREATE TABLE IF NOT EXISTS player_stats (...)');
  },
  
  incrementStat: function(playerName, statName) {
    // ...
  },
  
  getStats: function(playerName) {
    // ...
  },
  
  getTopPlayers: function(statName, limit) {
    var rows = db.query(
      'SELECT player_name, ' + statName + ' FROM player_stats ORDER BY ' + statName + ' DESC LIMIT ?',
      [limit]
    );
    return rows;
  }
};
```

**Exposing Shared Services:**
```javascript
SharedServices.expose('simple-stats', {
  getStats: statsApi.getStats,
  incrementStat: statsApi.incrementStat,
  getTopPlayers: statsApi.getTopPlayers
});
```

**Other mods using the shared service:**
```javascript
// In a different mod
var playerStats = SharedServices.call('simple-stats', 'getStats', ['PlayerName']);
```

### How to Enable

1. Navigate to: `mods/SimpleScripting/mods-js/simple-stats/`
2. Edit `mod.json`
3. Change: `"enabled": false` → `"enabled": true`
4. Restart server

### Learning Path
- **Best for**: Understanding code organization and mod interoperability
- **Next steps**: Add more stats (blocks broken, mobs killed, etc.)
- **Related docs**: [Modules & Shared Services](/simplescripting/api/modules-and-shared-services)

---

## afk-manager

**Auto-detect and manage idle players with configurable timeouts.**

### What It Demonstrates
- ✅ Activity tracking with timers
- ✅ Event-driven state management
- ✅ Automated player actions
- ✅ Manual override commands
- ✅ Broadcast notifications

### Features
- **AFK Detection**: Marks players AFK after 5 minutes of inactivity
- **Auto-Kick**: (Optional) Kicks AFK players after extended period
- **Manual Toggle**: `/afk` command to manually set AFK status
- **AFK List**: `/afklist` shows all currently AFK players
- **Activity Events**: Tracks movement, chat, combat to detect activity

### Key Code Patterns

**Activity tracking:**
```javascript
var playerActivity = {}; // {playerName: lastActivityTime}

function updateActivity(playerName) {
  playerActivity[playerName] = Date.now();
}

events.on('playerchat', function(event) {
  updateActivity(event.getPlayer().getUsername());
});

events.on('playerready', function(event) {
  playerActivity[event.player.getUsername()] = Date.now();
});
```

**Periodic AFK check:**
```javascript
var AFK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

server.runRepeating(30000, 30000, function() {
  var now = Date.now();
  var onlinePlayers = players.all();
  
  for (var i = 0; i < onlinePlayers.length; i++) {
    var player = onlinePlayers[i];
    var name = player.getUsername();
    var lastActivity = playerActivity[name] || now;
    
    if (now - lastActivity > AFK_TIMEOUT) {
      // Mark as AFK
      if (!afkPlayers[name]) {
        afkPlayers[name] = true;
        players.broadcast(name + " is now AFK");
      }
    }
  }
});
```

### How to Enable

1. Navigate to: `mods/SimpleScripting/mods-js/afk-manager/`
2. Edit `mod.json`
3. Change: `"enabled": false` → `"enabled": true`
4. Restart server

### Learning Path
- **Best for**: Understanding timers and state management
- **Next steps**: Add custom AFK messages, integration with permissions
- **Related docs**: [Server API](/simplescripting/api/server-net-and-assets), [Events](/simplescripting/api/events-and-commands)

---

## player-shops (EconomySS Extension)

**Economy-integrated shop system for buying and selling items.**

:::caution[Requires EconomySS Extension]
This example requires the **EconomySS extension plugin** to be installed. It demonstrates how to use the economy API provided by extensions.
:::

### What It Demonstrates
- ✅ Economy API integration
- ✅ Paginated lists
- ✅ Complex command routing (subcommands)
- ✅ Transaction validation
- ✅ Item trading with currency

### Features
- **Buy Items**: Purchase items from server shop with currency
- **Sell Items**: Sell items to server for money
- **Price Management**: Database-driven pricing
- **Paginated Catalog**: Browse items across multiple pages
- **Commands**:
  - `/shop` - Show help
  - `/shop list [page]` - Browse items
  - `/shop info <item>` - View item prices
  - `/shop buy <item> <qty>` - Purchase items
  - `/shop sell <item> <qty>` - Sell items

### Key Code Patterns

**Economy integration:**
```javascript
function onEnable() {
  if (!economy.isAvailable()) {
    log.warn("Economy not available! Install EconomySS and an economy provider.");
    return;
  }
  
  log.info("Economy provider: " + economy.getName());
}
```

**Buying items with validation:**
```javascript
function buyItem(player, context, itemId, quantity) {
  var uuid = player.getId();
  var priceData = db.queryOne('SELECT buy_price FROM shop_prices WHERE item_id = ?', [itemId]);
  
  if (!priceData || priceData.buy_price <= 0) {
    context.reply("This item cannot be purchased!");
    return;
  }
  
  var totalCost = priceData.buy_price * quantity;
  
  if (!economy.has(uuid, totalCost)) {
    context.reply("Not enough money! Need $" + totalCost);
    return;
  }
  
  if (economy.withdraw(uuid, totalCost)) {
    // Give items to player
    var inv = player.getInventory();
    var stack = inventory.createStack(itemId, quantity);
    inv.addItem(stack);
    
    context.reply("Purchased " + quantity + "x " + itemId + " for $" + totalCost);
  }
}
```

**Paginated list:**
```javascript
var ITEMS_PER_PAGE = 10;

function listShopItems(context, page) {
  var allItems = db.query('SELECT item_id, buy_price, sell_price FROM shop_prices ORDER BY item_id');
  var totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  page = Math.max(1, Math.min(page, totalPages));
  
  var startIdx = (page - 1) * ITEMS_PER_PAGE;
  var endIdx = Math.min(startIdx + ITEMS_PER_PAGE, allItems.length);
  
  context.reply('=== Server Shop (Page ' + page + '/' + totalPages + ') ===');
  
  for (var i = startIdx; i < endIdx; i++) {
    var item = allItems[i];
    context.reply(item.item_id + ': Buy $' + item.buy_price + ' | Sell $' + item.sell_price);
  }
  
  if (page < totalPages) {
    context.reply('[Next: /shop list ' + (page + 1) + ']');
  }
}
```

**Subcommand routing:**
```javascript
commands.register('shop', function(context) {
  var args = context.args();
  
  if (args.length === 0) {
    // Show help
    return;
  }
  
  var sub = String(args[0]).toLowerCase();
  
  if (sub === 'list') {
    listShopItems(context, args[1] || 1);
  } else if (sub === 'buy') {
    buyItem(context.sender(), context, args[1], parseInt(args[2]));
  } else if (sub === 'sell') {
    sellItem(context.sender(), context, args[1], parseInt(args[2]));
  }
});
```

### How to Enable

1. **Install EconomySS**: Download and install the EconomySS extension plugin
2. **Install Economy Provider**: Install VaultUnlocked or EliteEssentials
3. Navigate to: `mods/SimpleScripting/mods-js/player-shops/`
4. Edit `mod.json`
5. Change: `"enabled": false` → `"enabled": true`
6. Restart server

### Learning Path
- **Best for**: Understanding extension APIs and complex command systems
- **Next steps**: Add player-to-player shops, auctions, trade logs
- **Related docs**: [Economy API](/simplescripting/api/economy), [Extensions](/simplescripting/api/extensions)

---

## Using Examples as Templates

All example mods are production-ready and can be used as starting points for your own features:

### Method 1: Copy and Modify
1. Copy an example folder
2. Rename it (update `id` in `mod.json`)
3. Modify the code for your needs
4. Enable and test

### Method 2: Study and Adapt
1. Read the source code
2. Understand the patterns used
3. Apply similar patterns in your own mods

### Method 3: Extend with Dependencies
1. Keep the example enabled
2. Create a new mod that depends on it
3. Use its SharedServices API if exposed

---

## Related Resources

- **[Your First Mod Tutorial](/simplescripting/tutorials/your-first-mod)** - Step-by-step mod creation
- **[API Reference](/simplescripting/api/overview)** - Complete API documentation
- **[Learning Path](/simplescripting/getting-started/learning-path)** - Structured learning guide
- **[GitHub Repository](https://github.com/HostTale-Project/SimpleScripting)** - View full source code
