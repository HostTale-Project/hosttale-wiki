---
title: Modules & Shared Services
description: Load local modules safely and exchange APIs between mods.
---

## Module Imports (`require`)

SimpleScripting ships its own `require` that is scoped to each mod.

- Paths are relative to the mod root.
- `.js` extension is implied.
- `..` traversal and absolute paths are rejected.
- Modules are cached after the first load.
- Circular dependencies are detected.

### Example

```javascript
const math = require("./util/math");
log.info("2 + 3 = " + math.sum(2, 3));
```

## Shared Services (`SharedServices`)

Expose plain JavaScript APIs to other mods and consume theirs without sharing native objects.

- `SharedServices.expose(name, apiObject)` — registers a service for other mods.
- `SharedServices.call(serviceName, methodName, args?)` — invokes another mod's exposed API.

### Example

```javascript
SharedServices.expose("greetings", { hello: n => "hi " + n });
var msg = SharedServices.call("greetings", "hello", ["Traveler"]);
log.info(msg);
```

### Behavior and guardrails

- Service names are global; the first registration wins and duplicates are rejected.
- Providers should load before consumers; declare dependencies to guarantee order.
- Services are cleared on reload or disable and cannot outlive their owning mod.
- Calls to missing services fail fast; handle missing providers defensively.
