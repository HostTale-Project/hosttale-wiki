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
```
