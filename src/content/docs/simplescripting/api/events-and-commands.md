---
title: Events & Commands
description: Listen to server events and register commands from JavaScript using SimpleScripting facades.
---

## Events (`events`)

Wraps `com.hypixel.hytale.event.EventRegistry` and the underlying event classes.

### API

- `events.on(name, handler)` — register a handler; returns a handle id.
- `events.once(name, handler)` — like `on` but auto-unregisters after the first fire.
- `events.off(handle)` — unregister by handle id.
- `events.clear()` — remove all handlers for the current mod.
- `events.knownEvents()` — returns known event keys, e.g. `playerchat`.

:::note[Event names are flexible but lowercase recommended]
Event names are **case-insensitive** and flexible - you can use `PlayerConnect`, `playerConnect`, `player-connect`, etc.
All variations are automatically normalized to a standard format.

**Recommended format**: Use the names returned by `events.knownEvents()` for consistency:
- `playerchat`
- `playerready` (use this for join events - has valid player entity)
- `playerdisconnect`
- `livingentityinventorychange`

:::tip[PlayerConnect vs PlayerReady]
Use `playerready` instead of `playerconnect` for most join logic. `playerconnect` fires very early before the player entity is fully created, while `playerready` fires when the player is fully loaded and has a valid entity reference.
:::

Use `events.knownEvents()` to see all available event names.
:::

### Payload wrappers

- `playerchatevent` (from `PlayerChatEvent`):
  - `type`
  - `getPlayer() / getPlayerRef() / getSender()` → `PlayerHandle`
  - `getTargets()` → `PlayerHandle[]`
  - `getMessage() / setMessage(text)`
  - `isCancelled() / cancel()`
- All other events surface as `GenericEvent` with:
  - `type` (simple class name)
  - `describe()` (`toString()` of the native event)

### Inventory events

:::caution[Current payloads]
Inventory event payloads currently expose raw Hytale types (LivingEntity, ItemContainer, Transaction, ItemStack). Safe handle wrappers are planned for a future update.
:::

**Available now**

- `LivingEntityInventoryChange`:
  - `type`
  - `getLivingEntity()` → raw LivingEntity
  - `getItemContainer()` → raw ItemContainer
  - `getTransaction()` → raw Transaction
- `InteractivelyPickupItem`:
  - `type`
  - `getItemStack()` → raw ItemStack
  - `setItemStack(itemStack)`
  - `isCancelled() / cancel() / allow()`
- `SwitchActiveSlot`:
  - `type`
  - `getPreviousSlot() / getNewSlot() / setNewSlot(slot)`
  - `getInventorySectionId()`
  - `isServerRequest() / isClientRequest()`
  - `isCancelled() / cancel() / allow()`

**Planned wrappers**

- `DropItem`, `CraftRecipe`, `PlayerCraft` (currently surfaced as `GenericEvent`)

### Example

```javascript
events.on("playerchat", function(evt) {
  if (evt.getMessage().startsWith("!stop")) {
    evt.cancel();                       // Prevents the chat from delivering
    evt.getPlayer().sendMessage("Chat command blocked");
  }
});

events.once("bootevent", function(evt) {
  log.info("Server booted: " + evt.describe());
});
```

:::tip[See It In Action]
Check out the **[welcome-rewards example](/simplescripting/examples/overview#welcome-rewards)** for a complete implementation using events (`playerready`, `playerdisconnect`) and commands (`/playtime`, `/online`) with database integration.
:::

---

## Complete Recipes

### Recipe: Command That Saves to Database

Shows: commands + db + validation + error handling

```javascript
function onEnable() {
  // Create table
  db.execute('CREATE TABLE IF NOT EXISTS notes (player TEXT PRIMARY KEY, note TEXT, updated INTEGER)');
  
  // Command to save note
  commands.register('note', function(context) {
    var player = context.sender();
    
    if (!player) {
      context.reply("Players only!");
      return;
    }
    
    var args = context.args();
    
    // Show current note if no args
    if (args.length === 0) {
      var result = db.queryOne('SELECT note, updated FROM notes WHERE player = ?', 
        [player.getUsername()]);
      
      if (result) {
        var date = new Date(result.updated).toLocaleDateString();
        context.reply("Your note: " + result.note);
        context.reply("Updated: " + date);
      } else {
        context.reply("No note saved. Use /note <text> to save one.");
      }
      return;
    }
    
    // Save new note
    var noteText = context.rawInput(); // Full text after command
    var name = player.getUsername();
    
    db.execute(
      'INSERT INTO notes (player, note, updated) VALUES (?, ?, ?) ' +
      'ON CONFLICT(player) DO UPDATE SET note = ?, updated = ?',
      [name, noteText, Date.now(), noteText, Date.now()]
    );
    
    context.reply("Note saved!");
  }, { 
    description: "Save or view your personal note",
    allowExtraArgs: true 
  });
}
```

### Recipe: Event-Driven Reward System

Shows: events + players + database + timers

```javascript
var REWARD_AMOUNT = 100;
var PLAY_TIME_REQUIRED = 60 * 60 * 1000; // 1 hour in milliseconds

function onEnable() {
  // Track join times
  var joinTimes = {};
  
  // Database for rewards
  db.execute('CREATE TABLE IF NOT EXISTS rewards (player TEXT PRIMARY KEY, total_time INTEGER, last_reward INTEGER)');
  
  // Track joins
  events.on('playerready', function(event) {
    var player = event.player;
    var name = player.getUsername();
    joinTimes[name] = Date.now();
    player.sendMessage("Welcome! Play for 1 hour to earn a reward!");
  });
  
  // Track disconnects
  events.on('playerdisconnect', function(event) {
    var player = event.player;
    var name = player.getUsername();
    
    if (joinTimes[name]) {
      var sessionTime = Date.now() - joinTimes[name];
      
      // Update total playtime
      db.execute(
        'INSERT INTO rewards (player, total_time, last_reward) VALUES (?, ?, 0) ' +
        'ON CONFLICT(player) DO UPDATE SET total_time = total_time + ?',
        [name, sessionTime, sessionTime]
      );
      
      delete joinTimes[name];
    }
  });
  
  // Check for rewards every 5 minutes
  server.runRepeating(5 * 60 * 1000, 5 * 60 * 1000, function() {
    var now = Date.now();
    
    for (var name in joinTimes) {
      var sessionTime = now - joinTimes[name];
      var playerData = db.queryOne('SELECT total_time, last_reward FROM rewards WHERE player = ?', [name]);
      
      if (playerData) {
        var totalTime = playerData.total_time + sessionTime;
        var timeSinceReward = totalTime - playerData.last_reward;
        
        // Give reward if enough time played
        if (timeSinceReward >= PLAY_TIME_REQUIRED) {
          var player = players.find(name);
          if (player && player.isOnline()) {
            player.sendMessage("You've earned a reward for playing 1 hour!");
            // Give reward here (coins, items, etc)
            
            db.execute('UPDATE rewards SET last_reward = ? WHERE player = ?', 
              [totalTime, name]);
          }
        }
      }
    }
  });
}
```

### Recipe: Scheduled Announcements

Shows: server.runRepeating + ui + players.broadcast

```javascript
var ANNOUNCEMENTS = [
  "Remember to vote for the server!",
  "Join our Discord community!",
  "Check out /shop for items!",
  "Use /help to see all commands"
];

var currentIndex = 0;

function onEnable() {
  // Announce every 5 minutes
  server.runRepeating(5 * 60 * 1000, 5 * 60 * 1000, function() {
    var message = ANNOUNCEMENTS[currentIndex];
    
    // Broadcast with color
    players.broadcast(ui.join(
      ui.color('[Server] ', '#FFD700'),
      ui.color(message, '#FFFF00')
    ));
    
    // Next announcement
    currentIndex = (currentIndex + 1) % ANNOUNCEMENTS.length;
  });
  
  log.info("Announcements enabled - broadcasting every 5 minutes");
}
```

---

## Commands (`commands`)

Wraps the native `CommandRegistry` and `CommandContext`.

### API

- `commands.register(name, handler, options?)` → handle id  
  Options: `description`, `permission`, `allowExtraArgs`.
- `commands.unregister(handle)` — remove a previously registered command.
- `commands.clear()` — remove all commands registered by the current mod.

### Command handler surface (`JsCommandContext`)

- `isPlayer()` → boolean
- `sender()` → `PlayerHandle | null`
- `senderName()` → string
- `args()` → string array; parsed natively with `withListOptionalArg`.
- `rawInput()` → full input string from the parsed args onward.
- `reply(text)` → send a message (string or `UiText/UiMessage`) to the caller.

### Examples

```javascript
commands.register("ping", function(ctx) {
  ctx.reply("pong " + ctx.senderName());
}, { description: "Ping command" });
```

```javascript
commands.register("modid:echo", function(ctx) {
  ctx.reply("You said: " + ctx.rawInput());
}, { allowExtraArgs: true });
```
