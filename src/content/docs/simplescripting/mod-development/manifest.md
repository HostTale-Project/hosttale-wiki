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

## Validation Rules

A mod is rejected if:

- Required fields are missing
- `id` does not match `[a-z0-9_-]+`
- `version` is not semver-like
- `entrypoint` contains `..`
- Entrypoint file does not exist
- Dependency names are invalid or blank
- The mod depends on itself
