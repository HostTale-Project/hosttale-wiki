---
title: JavaScript API Overview
description: See how SimpleScripting wraps native Hytale classes and where to find each runtime surface.
---

SimpleScripting exposes Hytale server capabilities through **safe JavaScript facades**. Native classes stay private; mods interact with wrappers that enforce isolation and predictable behavior.

:::caution[No Raw Native Objects]
If you need more native functionality, extend the provided wrappers in Java. Do not pass raw Java objects directly into JavaScript mods.
:::

## Wrapper Map

Each wrapper sits on top of a native system:

- `events` → `com.hypixel.hytale.event.EventRegistry` + event classes
- `commands` → `CommandRegistry`, `CommandContext`
- `players` / `PlayerHandle` → `PlayerRef` (not exposed directly)
- `worlds` / `WorldHandle` → `World`
- `server` → `HytaleServer`, `TaskRegistry`
- `net` → networking helpers (no raw packet APIs)
- `assets` → `AssetRegistry` (limited helper surface)
- `ui` → safe message builders (no native `Message` class)
- `require` → module loader for `.js` files inside a mod
- `SharedServices` → cross-mod API bridge
- `db` → SQLite database per mod under the SimpleScripting data folder
- `inventory` → ItemStack creation, ItemContainerHandle for managing inventories
- `economy` → **Extension API** (requires EconomySS plugin) - unified economy interface for VaultUnlocked/EliteEssentials

## Reading the API docs

Each API page lists the wrapper methods, their native counterpart, and usage examples:

- [Events & Commands](./events-and-commands)
- [Inventory & Items](./inventory-and-items)
- [Players & Worlds](./players-and-worlds)
- [Server, Net & Assets](./server-net-and-assets)
- [UI & Messages](./ui-and-messages)
- [Modules & Shared Services](./modules-and-shared-services)
- [Database](./database)
- [Economy (Extension)](./economy)
- [Example Packs](./examples)

You can mix these surfaces freely within a mod. All messaging methods accept plain strings or the `ui` builders documented below.
