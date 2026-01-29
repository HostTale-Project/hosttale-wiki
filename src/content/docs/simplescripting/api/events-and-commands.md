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
- `events.knownEvents()` — returns known event keys, e.g. `PlayerChat`.

### Payload wrappers

- `PlayerChat` (from `PlayerChatEvent`):
  - `type`
  - `getPlayer() / getPlayerRef() / getSender()` → `PlayerHandle`
  - `getTargets()` → `PlayerHandle[]`
  - `getMessage() / setMessage(text)`
  - `isCancelled() / cancel()`
- All other events surface as `GenericEvent` with:
  - `type` (simple class name)
  - `describe()` (`toString()` of the native event)

### Example

```javascript
events.on("PlayerChat", function(evt) {
  if (evt.getMessage().startsWith("!stop")) {
    evt.cancel();                       // Prevents the chat from delivering
    evt.getPlayer().sendMessage("Chat command blocked");
  }
});

events.once("Boot", function(evt) {
  log.info("Server booted: " + evt.describe());
});
```

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
