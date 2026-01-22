---
title: SimpleScripting Overview
description: A server-side scripting framework for Hytale that enables JavaScript-based mod development.
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
