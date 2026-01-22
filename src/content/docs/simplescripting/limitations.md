---
title: Current Limitations
description: Understand the intentional design constraints and limitations of SimpleScripting.
---

SimpleScripting intentionally limits certain capabilities.

## Assets

:::danger[Cannot Define]
JavaScript mods cannot define:
- Blocks
- Items
- UI
- Models
- Textures
- Sounds
:::

Assets must be defined in native Hytale mods and referenced from JavaScript.

## Scope

- Server-side only
- No client scripting
- No asset pipeline

:::note[Design Decision]
These limitations are design decisions, not technical constraints.
:::
