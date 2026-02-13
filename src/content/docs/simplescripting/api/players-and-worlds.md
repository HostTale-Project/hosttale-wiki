---
title: Players & Worlds
description: Work with online players and worlds through SimpleScripting handles.
---

## Players (`players`) and `PlayerHandle`

Wraps the native `PlayerRef` surface (not exposed directly).

### API

- `players.all()` → `PlayerHandle[]`
- `players.find(username)` → `PlayerHandle | null`
- `players.require(username)` → `PlayerHandle` (throws if missing)
- `players.names()` → lowercase usernames
- `players.count()` → online player count
- `players.message(username, text)` → send to one player
- `players.broadcast(text)` → send to everyone
- `players.disconnect(username, reason?)`

All message arguments accept plain text or `ui` builders (`UiText` / `UiMessage`).

### `PlayerHandle` surface

- `getUsername()`
- `getId()` → UUID string
- `getLanguage() / setLanguage(lang)`
- `isOnline()`
- `sendMessage(text)`
- `kick(reason?)`
- `getWorldName()`

### Example

```javascript
players.broadcast("Welcome adventurers!");
var player = players.find("Alice");
if (player) {
  player.sendMessage("Hello " + player.getUsername());
}
```

## Worlds (`worlds`) and `WorldHandle`

Wraps the native `World` class.

### API

- `worlds.list()` → string[] of world names
- `worlds.get(name)` → `WorldHandle | null`
- `worlds.getDefaultWorld()` → `WorldHandle | null`
- `worlds.message(worldName, text)` → send to one world
- `worlds.hasWorld(name)` → boolean
- `worlds.runOnWorldThread(worldName, callback)` → execute callback on world thread (required for ECS operations)

### `WorldHandle` surface

- `getName()`
- `isLoaded()`
- `players()` → `PlayerHandle[]`
- `playerNames()` → string[]
- `sendMessage(text)` → accepts string or `UiText/UiMessage`

### Example

```javascript
var world = worlds.getDefaultWorld();
if (world) {
  world.sendMessage("A new dawn rises over " + world.getName());
}

// Execute ECS operations safely from scheduler threads
server.runRepeating(30000, function() {
  worlds.runOnWorldThread(null, function() {
    var onlinePlayers = players.all();
    onlinePlayers.forEach(function(player) {
      var pos = ecs.getPosition(player.getId());
      console.log(player.getUsername() + " at " + pos.x + ", " + pos.y + ", " + pos.z);
    });
  });
});
```

## Thread Safety

**Important**: ECS operations like `ecs.getPosition()`, `ecs.teleport()`, etc. must run on the **world thread**. Scheduler callbacks (`server.runRepeating`, `server.runLater`) execute on a separate thread, so wrap ECS calls in `worlds.runOnWorldThread()`:

```javascript
// Not supported: WRONG - will throw IllegalStateException
server.runRepeating(5000, function() {
  var pos = ecs.getPosition(entityId); // Crashes!
});

// ✅ CORRECT - wrapped in world thread
server.runRepeating(5000, function() {
  worlds.runOnWorldThread(null, function() {
    var pos = ecs.getPosition(entityId); // Safe
  });
});
```
