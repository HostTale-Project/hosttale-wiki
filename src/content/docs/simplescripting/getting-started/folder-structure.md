---
title: Folder Structure
description: Understand the directory structure for SimpleScripting mods within your Hytale server.
---

All SimpleScripting data lives inside the Hytale server root.

```
<server-root>/
  mods/
    SimpleScripting/
      mods/
```

JavaScript mods are stored inside the `mods` directory.

## Typical Mod Structure

```
mods/
  SimpleScripting/
    mods/
      my-mod/
        mod.json
        main.js
        index.d.ts
```

:::note
This directory is scanned automatically during server startup and reloads.
:::
