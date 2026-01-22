---
title: Shared Services
description: Learn how to expose and consume cross-mod APIs using the Shared Services system.
---

Shared Services allow mods to expose and consume APIs in a controlled way.

## Exposing a Service

```javascript
SharedServices.expose("greetings", {
  greet: function(name) {
    return "Hello " + name;
  }
});
```

:::note[Service Registration]
- Service names are global
- First registration wins
- Duplicate names are rejected
:::

## Consuming a Service

```javascript
var result = SharedServices.call(
  "greetings",
  "greet",
  ["Traveler"]
);
```

:::caution
- Provider must be loaded first
- Consumers should declare dependencies
:::

## Service Lifecycle

- Services are cleared on reload or disable
- Calls to missing services fail
- Services cannot outlive their owning mod
