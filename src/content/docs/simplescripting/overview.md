---
title: SimpleScripting for Hytale - JavaScript Mod Development Framework
description: A comprehensive server-side scripting framework for Hytale that enables JavaScript-based mod development. Build Hytale mods with familiar JavaScript syntax and a powerful runtime API.
---

:::danger[Pre-Release Version]
This documentation is for the **pre-release version** of SimpleScripting. The plugin is currently only available for download from GitHub:

[Download SimpleScripting on GitHub](https://github.com/HostTale-Project/SimpleScripting)
:::

SimpleScripting is a server-side scripting framework for Hytale that allows developers to create mods using JavaScript instead of Java.

It is designed to lower the barrier of entry for server modding, enable fast iteration without recompilation, and preserve full compatibility with Hytale's native modding and asset pipeline.

SimpleScripting runs JavaScript mods alongside native Hytale mods and focuses on server-side logic, rules, automation, and mod interoperability.

## What SimpleScripting Is

SimpleScripting provides:

- A JavaScript execution layer embedded into the Hytale server
- A mod loader and lifecycle manager for JavaScript-based mods
- A safe interoperability layer between JavaScript mods

## JavaScript Runtime API

SimpleScripting wraps native Hytale classes with safe JavaScript facades for events, commands, players, worlds, tasks, networking, UI, module loading, shared services, and per-mod databases. If you need deeper native behavior, extend these wrappers in Java instead of passing raw objects into scripts.

See the [API Overview](./api/overview) for the full surface and examples.

## What SimpleScripting Is Not

:::caution
SimpleScripting is not:

- A replacement for native Hytale mods
- A system for defining assets (blocks, items, models, UI)
- A client-side scripting solution

**Assets must always be defined in native Hytale mods.**
:::

## Current Feature Set

- JavaScript mod discovery and loading
- Strict mod manifests (`mod.json`)
- Validated mod lifecycle hooks
- Deterministic dependency-based load order
- Cross-mod APIs via Shared Services

:::note[Documentation Scope]
This documentation covers only implemented functionality. Future features will be documented once finalized and released.
:::

## Getting Started with SimpleScripting

Ready to start building JavaScript mods?

1. [Installation Guide](/simplescripting/getting-started/installation) - Set up SimpleScripting on your server
2. [Folder Structure](/simplescripting/getting-started/folder-structure) - Understand the mod directory layout
3. [Mod Layout](/simplescripting/mod-development/mod-layout) - Learn the structure of a JavaScript mod
4. [API Overview](/simplescripting/api/overview) - Explore the runtime API

## Related Documentation

- [JavaScript API Overview](/simplescripting/api/overview) - Complete API reference
- [Events & Commands](/simplescripting/api/events-and-commands) - Handle game events and create commands
- [Database API](/simplescripting/api/database) - Persist data with SQLite
- [ECS for SimpleScripting](/simplescripting/ecs/overview) - Work with the Entity Component System
- [Current Limitations](/simplescripting/limitations) - Understand design constraints

---

*Last updated: February 2026*
