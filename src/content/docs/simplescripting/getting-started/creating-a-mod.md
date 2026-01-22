---
title: Creating a Mod
description: Use the /createmod command to generate a new JavaScript mod with the correct structure and manifest.
---

SimpleScripting provides an in-game command to generate a new JavaScript mod from a predefined template.

:::tip
This is the recommended way to create new mods, as it ensures a valid structure, a correct manifest, and IDE type support.
:::

## Using the /createmod Command

```
/createmod <mod-name>
```

**Example:**
```
/createmod my-first-mod
```

## What the Command Does

When executed, SimpleScripting will:

- Create a new folder for the mod
- Generate a `mod.json` manifest
- Generate a `main.js` entry script
- Generate an `index.d.ts` file with type definitions

The mod is created at:

```
<server-root>/mods/SimpleScripting/mods/<mod-name>
```

## Generated Structure

```
<mod-name>/
  mod.json
  main.js
  index.d.ts
```

## Mod Name Rules

:::caution
- Must match `[a-z0-9_-]+`
- Folder name and `mod.json` id will match
- Invalid names cause the command to fail
:::
