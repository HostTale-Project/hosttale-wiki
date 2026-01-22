---
title: Mod Lifecycle
description: Understand the optional lifecycle hooks available for JavaScript mods and their execution behavior.
---

Mods may define lifecycle hooks in their entry script.

:::note
All hooks are optional.
:::

## Supported Hooks

```javascript
function onEnable() {}
function onDisable() {}
function onReload() {}
```

## Hook Behavior

- Hooks are invoked only if defined
- Execution is isolated per mod
- Errors do not affect other mods

### onEnable

Called when the mod is loaded.

### onDisable

Called when the mod is unloaded.

### onReload

Called when the mod is reloaded.
