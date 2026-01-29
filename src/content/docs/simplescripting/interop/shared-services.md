---
title: Shared Services
description: Learn how to expose and consume cross-mod APIs using the Shared Services system.
---

Shared Services let mods share plain JavaScript APIs without ever handing raw Java objects to other mods.

## API surface

- `SharedServices.expose(name, apiObject)` — register a service.
- `SharedServices.call(serviceName, methodName, args?)` — invoke another mod's service method.

## Exposing a Service

```javascript
SharedServices.expose("greetings", {
  greet: function(name) {
    return "Hello " + name;
  }
});
```

:::note[Service Registration]
- Service names are global.
- First registration wins; duplicates are rejected.
- Exposed values should be plain JS objects, not native handles.
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
- Provider must be loaded first.
- Consumers should declare dependencies to guarantee load order.
:::

## Service Lifecycle & Safety

- Services are cleared on reload or disable.
- Calls to missing services fail fast; handle absent providers gracefully.
- Services cannot outlive their owning mod.
- Keep APIs narrow and stable to avoid breaking consumers.
