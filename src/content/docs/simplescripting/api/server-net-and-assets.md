---
title: Server, Net & Assets
description: Schedule tasks, send network messages, and interact with asset helpers from JavaScript.
---

## Server & Tasks (`server`)

Wraps `HytaleServer` and `TaskRegistry`.

### API

- `server.runLater(delayMs, fn)` → task handle `{ id, cancel(), cancelled() }`
- `server.runRepeating(initialDelayMs, periodMs, fn)` → repeating task handle
- `server.shutdown(reason?)`
- `server.isBooted()` → boolean
- `server.name()` → server name

### Run Console Commands

- `server.runCommand(commandLine)` — executes any server command as the **console sender** (full permissions).  
  - Throws `IllegalArgumentException` for empty input.  
  - Throws `IllegalStateException` if the command cannot be executed.  
  - Runs on the calling thread; target commands may still perform async work.

**Usage guidelines**
- Validate user input before concatenating into `commandLine` to avoid unintended commands.
- Because it runs as console, add your own permission checks when exposing this to players.
- Expect delayed feedback if the target command is async.

**Examples**
```js
// Reload another plugin
server.runCommand("pluginmanager:reload MyPlugin");

// Give items using an existing command
server.runCommand(`give Alice diamond 64`);

// Trigger a world save
server.runCommand("save-all");
```

### Example

```javascript
var task = server.runLater(5000, function() {
  log.info("5s passed");
});

server.runRepeating(0, 1000, function() {
  log.info("tick");
});
// task.cancel();
```

## Net (`net`)

Raw packet APIs are not exposed; this is a safe messaging helper.

- `net.broadcast(text)`
- `net.send(username, text)`
- `net.kick(username, reason?)`
- `net.warn(message)` — logs server-side

Messages may be strings or `ui` builders.

### Example

```javascript
net.broadcast("Server restart in 1 minute");
net.send("Bob", "You have mail!");
```

## Assets (`assets`)

The native `AssetRegistry` is not exposed yet. Two helpers are provided:

- `assets.info(message)` — informational log
- `assets.warnUnsupported()` — quick warning that a feature is not supported

### Example

```javascript
assets.warnUnsupported();
```
