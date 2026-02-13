---
title: Mod Manifest (mod.json)
description: Learn how to configure your mod's identity, dependencies, and validation rules in mod.json.
---

The manifest defines the identity, configuration, and dependencies of a mod.

## Example

```json
{
  "id": "my-mod",
  "name": "My Mod",
  "version": "1.0.0",
  "entrypoint": "main.js",
  "preload": false,
  "enabled": true,
  "dependencies": [],
  "requiredAssetPacks": [],
  "permissions": [],
  "description": "What this mod does"
}
```

## Required Fields

:::danger[Required]
- `id`
- `name`
- `version`
:::

## Optional Fields

### enabled
- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Controls whether the mod should be loaded by SimpleScripting

When set to `false`, the mod is skipped during server startup and will not be loaded. Useful for temporarily disabling a mod without deleting it.

```json
{
  "id": "my-mod",
  "enabled": false
}
```

### entrypoint
- **Type:** `string`
- **Default:** `"main.js"`
- **Purpose:** Path to the JavaScript entry file relative to the mod folder

```json
{
  "id": "my-mod",
  "entrypoint": "src/index.js"
}
```

### preload
- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Load this mod earlier when dependency order permits

Preload mods are loaded before non-preload mods when topological ordering allows. Useful for mods that provide APIs to other mods.

```json
{
  "id": "api-mod",
  "preload": true
}
```

### dependencies
- **Type:** `array of strings`
- **Default:** `[]`
- **Purpose:** List of mod IDs that must be loaded before this mod

Ensures dependency mods are loaded first. The loader automatically orders mods based on their dependencies.

```json
{
  "id": "my-mod",
  "dependencies": ["core-api", "utilities"]
}
```

### requiredAssetPacks
- **Type:** `array of strings`
- **Default:** `[]`
- **Purpose:** Asset packs that must be installed for this mod to function

```json
{
  "id": "custom-items-mod",
  "requiredAssetPacks": ["CustomTextures"]
}
```

### permissions
- **Type:** `array of strings`
- **Default:** `[]`
- **Purpose:** Permission nodes that players need to use this mod's features

```json
{
  "id": "admin-tools",
  "permissions": ["admin.teleport", "admin.give"]
}
```

### description
- **Type:** `string`
- **Default:** `null`
- **Purpose:** Brief description of what the mod does

```json
{
  "id": "my-mod",
  "description": "Adds custom commands for server administration"
}
```

## Validation Rules

A mod is rejected if:

- Required fields are missing
- `id` does not match `[a-z0-9_-]+`
- `version` is not semver-like
- `entrypoint` contains `..`
- Entrypoint file does not exist
- Dependency names are invalid or blank
- The mod depends on itself
