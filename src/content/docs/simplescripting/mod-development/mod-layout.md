---
title: Mod Layout
description: Understand the required file structure and purpose of each file in a JavaScript mod.
---

Each JavaScript mod lives inside its own folder.

```
mods/
  <mod-id>/
    mod.json
    main.js
    index.d.ts
```

## Files

### mod.json

Defines the mod identity, dependencies, and configuration.

### main.js

JavaScript entry point. Lifecycle hooks are defined here.

### index.d.ts

Type definitions for SimpleScripting APIs.

:::tip
This file enables IDE autocompletion and validation and is generated automatically when using `/createmod`.
:::
