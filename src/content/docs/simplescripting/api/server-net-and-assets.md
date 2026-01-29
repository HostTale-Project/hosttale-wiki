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
