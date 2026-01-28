---
title: UI & Messages
description: Build colored chat messages without exposing native Message classes.
---

The `ui` helper builds chat-friendly text objects that all messaging methods accept (`sendMessage`, `broadcast`, `reply`, etc.).

## API

- `ui.raw(text)` → `UiText`
- `ui.color(text, color)` → `UiText` with a hex or named color
- `ui.join(...parts)` → `UiMessage` that stitches strings, `UiText`, or `UiMessage`

Any messaging surface in this API (`players`, `worlds`, `net`, `commands`) accepts `string | UiText | UiMessage`.

## Examples

Single-color message:

```javascript
players.broadcast(ui.color("Server restart in 5m", "#ff8800"));
```

Multi-color message, equivalent to `Message.join(...)`:

```javascript
var shout = ui.join(
  ui.color("Hello ", "#00ff90"),
  ui.color("world", "#ffffff"),
  ui.color("!", "#ff3366")
);

players.require("Alice").sendMessage(shout);
```
