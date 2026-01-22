---
title: Dependencies and Load Order
description: Learn how to declare dependencies and understand the deterministic load order for JavaScript mods.
---

Mods can declare dependencies in `mod.json`.

```json
{
  "dependencies": ["other-mod"]
}
```

## Rules

- Dependencies load before dependent mods
- Circular dependencies are not allowed
- Mods without dependencies may load in any order
- `preload` may prioritize loading when order is unconstrained
