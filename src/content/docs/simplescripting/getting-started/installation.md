---
title: Installation
description: Learn how to install SimpleScripting as a Hytale server plugin and use its management commands.
---

SimpleScripting is installed as a standard Hytale server plugin.

Once installed and the server is started, SimpleScripting automatically prepares its required folder structure and registers its management commands.

## Available Commands

### /createmod <mod-name>

Creates a new JavaScript mod using a predefined template.

- **Permission:** `simplescripting.commands.createmod`
**Usage:**
```
/createmod <mod-name>
```

### /updatetypes <mod-name>

Updates the types file of a specific mod to get the latest definitions.

- **Permission:** `simplescripting.commands.updatetypes`
**Usage:**
```
/updatetypes <mod-name>
```

:::tip
Use this command when SimpleScripting is updated to get the latest type definitions.
:::

### /scripts

Opens the SimpleScripting file manager GUI so admins can browse mods, edit files, and reload changes in-game.

- **Permission:** `simplescripting.commands.scripts`
**Usage:**
```
/scripts
```
