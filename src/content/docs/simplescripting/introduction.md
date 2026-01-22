---
title: Introduction
description: Learn why SimpleScripting brings JavaScript to Hytale server modding and its design philosophy.
---

Hytale server modding is traditionally done using Java. While powerful, this approach introduces friction for rapid iteration, experimentation, and onboarding new developers.

SimpleScripting introduces JavaScript as a first-class scripting language for server-side logic while preserving Hytale's native systems.

## Why JavaScript

JavaScript offers fast iteration cycles, lower entry barriers, familiar syntax, and strong suitability for scripting and orchestration.

:::tip[JavaScript Excels At]
SimpleScripting focuses JavaScript where it excels:
- Logic
- Rules
- Events
- Automation
- Mod-to-mod coordination
:::

## Design Philosophy

SimpleScripting is built around the following principles:

### 1. Clear separation of concerns

Java defines assets and engine-level integrations.  
JavaScript defines behavior and logic.

### 2. Explicit contracts

Manifests define identity, dependencies, and intent.  
Lifecycle hooks are opt-in and predictable.

### 3. Safety and isolation

Mods are isolated from each other.  
Errors do not cascade across mods.

### 4. No implicit behavior

Load order is explicit.  
Dependencies are declared and enforced.

## Intended Use Cases

SimpleScripting is ideal for:
- Gameplay rules
- Server automation
- Event-driven logic
- Lightweight feature mods
- Rapid prototyping

:::caution
Asset-heavy content must be implemented using native Hytale mods.
:::
