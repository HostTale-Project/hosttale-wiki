---
title: Extension System
description: How external plugins can extend SimpleScripting's JavaScript environment
---

The extension system allows external Hytale plugins to add new APIs, events, and functionality to SimpleScripting's JavaScript environment without modifying the core plugin.

## What Are Extensions?

Extensions are Hytale plugins that implement the `SimpleScriptingExtension` interface and register themselves with SimpleScripting during the plugin setup phase. Once registered, extensions can:

- **Register global APIs** that are injected into every JS mod
- **Emit and listen to events** via the extension event bus
- **Access Hytale services** (commands, events, tasks, assets)

## Architecture

### Extension Lifecycle

1. **Setup**: Extension plugins register with SimpleScripting
2. **Initialization**: SimpleScripting calls `onRegister()` for each extension (in priority order)
3. **Mod Loading**: Extension APIs are injected into each mod's scope
4. **Shutdown**: Extensions are disabled in reverse priority order

### Priority System

Extensions load in priority order (lower numbers load first):
- **0-50**: Core extensions (e.g., economy, permissions)
- **50-100**: Third-party extensions
- **100+**: Optional features

## Creating an Extension

### 1. Add SimpleScripting Dependency

In your plugin's `build.gradle`:

```gradle
dependencies {
    compileOnly(project(':SimpleScripting'))
    // or if SimpleScripting is published:
    // compileOnly("com.hosttale:SimpleScripting:1.0.0")
}
```

### 2. Implement the Extension Interface

```java
package com.example.myplugin.extension;

import com.hosttale.simplescripting.extension.ExtensionContext;
import com.hosttale.simplescripting.extension.SimpleScriptingExtension;

public class MyExtension implements SimpleScriptingExtension {
    
    @Override
    public String getExtensionId() {
        return "my-extension";  // Unique ID
    }
    
    @Override
    public int getPriority() {
        return 75;  // Load order
    }
    
    @Override
    public void onRegister(ExtensionContext context) {
        // Register your API
        context.registerGlobalApi("myApi", (modId, runtime, logger) -> {
            return new MyApi(logger, context.getEventBus());
        });
        
        context.getLogger().atInfo().log("My extension registered");
    }
    
    @Override
    public void onDisable() {
        // Cleanup (optional)
    }
}
```

### 3. Register with SimpleScripting

In your main plugin class:

```java
package com.example.myplugin;

import com.hosttale.simplescripting.SimpleScriptingPlugin;
import com.hypixel.hytale.server.core.plugin.JavaPlugin;
import com.hypixel.hytale.server.core.plugin.PluginManager;

public class MyPlugin extends JavaPlugin {
    
    @Override
    protected void setup() {
        // Find SimpleScripting
        PluginManager pm = PluginManager.get();
        if (pm == null) return;
        
        for (var plugin : pm.getLoadedPlugins()) {
            if (plugin instanceof SimpleScriptingPlugin ss) {
                MyExtension extension = new MyExtension();
                ss.getExtensionRegistry().registerExtension(extension);
                getLogger().atInfo().log("Registered with SimpleScripting");
                break;
            }
        }
    }
}
```

### 4. Add Plugin Dependency

In your `manifest.json`:

```json
{
  "Dependencies": {
    "SimpleScripting": "*"
  }
}
```

## Extension Context API

The `ExtensionContext` passed to `onRegister()` provides:

### `registerGlobalApi(name, factory)`

Register an API that will be available as a global variable in every JS mod.

```java
context.registerGlobalApi("myApi", (modId, runtime, logger) -> {
    return new MyApi(logger);
});
```

The factory is called once per mod to create an isolated API instance. This maintains mod isolation.

### `getEventBus()`

Get the extension event bus for cross-extension and extension-to-JS communication.

```java
ExtensionEventBus eventBus = context.getEventBus();

// Emit events
eventBus.emit("myext:something-happened", payload);

// Listen to events
eventBus.on("otherext:event", event -> {
    // Handle event
});
```

### `getPluginServices()`

Access Hytale services (CommandRegistry, EventRegistry, TaskRegistry, AssetRegistry).

```java
JsPluginServices services = context.getPluginServices();
services.getCommandRegistry().registerCommand(myCommand);
```

### `getLogger()`

Get a logger scoped to your extension.

```java
HytaleLogger logger = context.getLogger();
logger.atInfo().log("Extension initialized");
```

## Extension Event Bus

The extension event bus provides a simple pub/sub system for cross-extension and extension-to-JS communication.

### Event Names

Use namespaced event names to avoid conflicts:
- `economy:ready`
- `economy:balance-changed`
- `permissions:group-changed`
- `myext:custom-event`

### Emitting Events from Extensions

```java
public class MyApi {
    private final ExtensionEventBus eventBus;
    
    public MyApi(ExtensionEventBus eventBus) {
        this.eventBus = eventBus;
    }
    
    public void doSomething() {
        // Do work...
        
        // Emit event
        eventBus.emit("myext:work-done", resultData);
    }
}
```

### Listening in JavaScript

JS mods can listen to extension events using the `extensions` API:

```javascript
// Listen to extension events
const handle = extensions.on("economy:balance-changed", payload => {
  log.info(`Balance changed: ${payload.playerUuid} ${payload.amount}`);
});

// Emit extension events
extensions.emit("mymod:custom-event", { data: "value" });

// Unregister
extensions.off(handle);
```

## Example: EconomySS Extension

The EconomySS plugin demonstrates a complete extension implementation with multi-provider support:

### Supported Providers

EconomySS works with multiple economy plugins:
- **VaultUnlocked** - Universal economy API (recommended)
- **EliteEssentials** - Built-in economy system

### Extension Class

```java
public class EconomyExtension implements SimpleScriptingExtension {
    
    @Override
    public String getExtensionId() {
        return "economy-ss";
    }
    
    @Override
    public int getPriority() {
        return 50;
    }
    
    @Override
    public void onRegister(ExtensionContext context) {
        context.registerGlobalApi("economy", (modId, runtime, logger) -> 
            new EconomyApi(logger, context.getEventBus())
        );
    }
    
    @Override
    public void onDisable() {
        // No cleanup needed
    }
}
```

### API with Events

```java
public class EconomyApi {
    private final ExtensionEventBus eventBus;
    
    public boolean deposit(String playerUuid, double amount) {
        if (provider.deposit(playerUuid, amount)) {
            // Emit event
            eventBus.emit("economy:balance-changed", 
                new BalanceChangeEvent(playerUuid, amount, "deposit"));
            return true;
        }
        return false;
    }
}
```

### Usage in JS Mods

```javascript
function onEnable() {
  // Check if economy is available
  if (economy.isAvailable()) {
    log.info("Economy provider: " + economy.getName());
  }
  
  // Listen to economy events
  extensions.on("economy:ready", provider => {
    log.info("Economy ready: " + provider);
  });
  
  extensions.on("economy:balance-changed", event => {
    log.info(`${event.type}: ${event.playerUuid} ${event.amount}`);
  });
}
```

## Best Practices

### API Design

1. **Per-Mod Instances**: Create a new API instance for each mod to maintain isolation
2. **Immutable Payloads**: Use immutable objects for event payloads
3. **Defensive Checks**: Validate inputs and handle errors gracefully
4. **Clear Logging**: Log initialization, errors, and important state changes

### Event Design

1. **Namespaced Names**: Use `extensionId:event-name` format
2. **Document Events**: List available events in your documentation
3. **Stable Payloads**: Don't change event payload structure without versioning
4. **Minimal Data**: Only include necessary data in payloads

### Dependencies

1. **Mark as Optional**: If your extension is optional, mark dependencies as optional
2. **Graceful Degradation**: Check if other extensions are available before using them
3. **Clear Errors**: Log clear messages when dependencies are missing

## Troubleshooting

### Extension Not Loading

**Symptom**: Extension doesn't appear in logs, APIs not available

**Solutions**:
- Ensure SimpleScripting is installed and loads first
- Check `Dependencies` in manifest.json includes `"SimpleScripting": "*"`
- Verify extension ID is unique and valid format (lowercase, hyphens/underscores)
- Check logs for registration errors
- Confirm `getExtensionRegistry().registerExtension()` is called during `setup()` phase

**Verify registration**:
```
[SimpleScripting] Extension 'my-extension' registered with priority 75
```

### API Not Available in JS

**Symptom**: `ReferenceError: myApi is not defined`

**Solutions**:
- Confirm extension registered successfully (check logs for registration message)
- Ensure `registerGlobalApi()` was called during `onRegister()`
- Check that API factory doesn't throw exceptions (add try-catch logging)
- Verify JS mod is loaded **after** extension initialization
- Test API in another mod to isolate the issue

**Debug API factory**:
```java
context.registerGlobalApi("myApi", (modId, runtime, logger) -> {
    logger.atInfo().log("Creating myApi for mod: " + modId);
    try {
        return new MyApi(logger);
    } catch (Exception e) {
        logger.atSevere().log("Failed to create API: " + e.getMessage());
        throw e;
    }
});
```

### Events Not Firing

**Symptom**: Event listeners never called, no event logs

**Solutions**:
- Check event name spelling (case-sensitive, use namespace like `myext:event`)
- Ensure event bus is passed to API constructor and stored
- Verify listeners are registered **before** events are emitted
- Check logs for event handling errors
- Test with simple event first: `extensions.on("myext:test", data => log.info("Got: " + data))`

**Debug events**:
```java
eventBus.emit("myext:event", payload);
logger.atInfo().log("Emitted myext:event with payload: " + payload);
```

### Types Not Showing in JS Mods

**Symptom**: TypeScript definitions missing for extension APIs

**Solutions**:
- Verify `getTypeDefinitions()` returns non-null string
- Check .d.ts file is in `src/main/resources/` and readable
- Ensure extension is registered **before** `/createmod` or `/updatetypes`
- Run `/updatetypes <modname>` to refresh type definitions
- Check file encoding is UTF-8
- Look for IOException in logs during type collection

**Test type loading**:
```java
@Override
public String getTypeDefinitions() {
    String types = /* load from resources */;
    getLogger().atInfo().log("Loaded " + types.length() + " bytes of types");
    return types;
}
```

### Example Mods Not Installing

**Symptom**: Example mods missing after first run

**Solutions**:
- Verify `getExampleModPaths()` returns correct resource paths
- Check paths are relative from `src/main/resources/` (e.g., `"examples/my-mod"`)
- Ensure example folders contain `mod.json` and `main.js`
- Look for installation errors in logs
- Manually verify resources are in the built JAR: `jar tf your-plugin.jar | grep examples`
- Delete `mods/SimpleScripting/mods-js/` and restart to trigger reinstall

**Check example structure**:
```
jar tf your-plugin.jar | grep examples
examples/my-shop/mod.json
examples/my-shop/main.js
```

### Extension Initialization Order Issues

**Symptom**: Extension can't access another extension's API

**Solutions**:
- Use priority system: lower priority loads first (0-50 for core features)
- Don't assume other extensions are loaded in `onRegister()`
- Use events to communicate when dependencies are ready
- Check availability at runtime: `if (typeof otherApi !== 'undefined')`
- Document extension dependencies clearly

**Example dependency pattern**:
```java
// In your extension
@Override
public int getPriority() {
    return 60;  // Load after economy (priority 50)
}

@Override
public void onRegister(ExtensionContext context) {
    // Don't access economy here, emit ready event instead
    context.getEventBus().on("economy:ready", event -> {
        // Now safe to use economy
    });
}
```

### Plugin Load Order Issues

**Symptom**: Extension tries to register before SimpleScripting is ready

**Solutions**:
- Only register extensions during `setup()` phase, not in constructor
- Check if SimpleScripting plugin exists before registering
- Use `PluginManager.get().getLoadedPlugins()` to find SimpleScripting
- Add SimpleScripting to `Dependencies` in manifest.json (loads first)

**Correct registration timing**:
```java
@Override
protected void setup() {
    // ✓ Correct: Register in setup()
    findAndRegisterWithSimpleScripting();
}

// ✗ Wrong: Don't register in constructor
public MyPlugin() {
    // SimpleScripting might not be loaded yet!
}
```

### Memory Leaks from Listeners

**Symptom**: Server slows down over time, memory grows with mod reloads

**Solutions**:
- Store listener handles returned by `extensions.on()`
- Unregister listeners in `onDisable()` hook
- Clean up timers, tasks, and other resources
- Use weak references for long-lived callbacks if needed

**Proper cleanup**:
```javascript
let handles = [];

function onEnable() {
  handles.push(extensions.on("economy:update", handleUpdate));
  handles.push(extensions.on("shop:purchase", handlePurchase));
}

function onDisable() {
  handles.forEach(h => extensions.off(h));
  handles = [];
}
```

## Providing TypeScript Definitions

Extensions can provide TypeScript type definitions that will be automatically merged when JS mods are created or updated.

### 1. Create Type Definition File

Create a `.d.ts` file in your plugin's resources:

```typescript
// src/main/resources/myapi.d.ts

/**
 * My custom API for JavaScript mods
 */
interface MyApi {
  doSomething(param: string): boolean;
  getValue(): number;
  onEvent(callback: (data: any) => void): void;
}

/** My API - provided by MyPlugin extension */
declare const myApi: MyApi;
```

### 2. Implement `getTypeDefinitions()`

Override the method in your extension:

```java
@Override
public String getTypeDefinitions() {
    try (InputStream in = getClass().getClassLoader()
            .getResourceAsStream("myapi.d.ts")) {
        if (in == null) {
            return null;
        }
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    } catch (IOException e) {
        return null;
    }
}
```

### 3. Types Are Automatically Merged

When developers create or update JS mods:

```bash
/createmod my-mod       # Creates mod with merged types
/updatetypes my-mod     # Updates types from all extensions
```

The generated `index.d.ts` will contain:
- SimpleScripting core types
- All extension types (from registered extensions)
- Properly namespaced and documented

### Best Practices

- **Match runtime API**: Ensure TypeScript definitions match your Java API exactly
- **Document everything**: Use JSDoc comments for all interfaces and methods
- **Namespace globals**: Use unique names to avoid conflicts (e.g., `myApi` not `api`)
- **Include examples**: Add usage examples in comments
- **Version compatibility**: Update types when API changes

## Providing Example Mods

Extensions can bundle example mods that demonstrate how to use their APIs. Example mods are automatically installed on first server run.

### 1. Create Example Mod

Place your example mod in `src/main/resources/examples/`:

```
src/main/resources/
  examples/
    my-shop-example/
      mod.json
      main.js
```

**Important**: Set `"enabled": false` so examples don't auto-load:

```json
{
  "id": "my-shop-example",
  "name": "My Shop Example",
  "version": "1.0.0",
  "enabled": false,
  "description": "Example showing how to use MyAPI"
}
```

### 2. Implement `getExampleModPaths()`

Return the resource paths to your example mods:

```java
@Override
public String[] getExampleModPaths() {
    return new String[] {
        "examples/my-shop-example",
        "examples/my-other-example"
    };
}
```

### 3. Automatic Installation

On first server run:
1. Core SimpleScripting examples are installed
2. Extensions register themselves
3. Extension examples are installed with **complete type definitions** (core + all extensions)

### Example: EconomySS Shop

```javascript
// examples/player-shops/main.js

function onEnable() {
  commands.register({
    name: "shop",
    executor: (sender, args) => {
      if (!economy.isAvailable()) {
        sender.sendMessage("§cEconomy not available!");
        return;
      }
      
      const price = 100;
      if (economy.withdraw(sender.getUuid(), price)) {
        // Give item
        sender.sendMessage("§aPurchased for $" + price);
      } else {
        sender.sendMessage("§cNot enough money!");
      }
    }
  });
}
```

### Best Practices

- **Disabled by default**: Always set `"enabled": false` in example manifests
- **Clear comments**: Explain what the example demonstrates
- **Simple code**: Keep examples focused and easy to understand
- **Error handling**: Show proper error handling patterns
- **Documentation**: Include a README.md in the example folder if needed

## Future Extensions

Potential extensions that could be built:

- **PermissionsExtension**: Permission checks and group management
- **DatabaseExtension**: Advanced database features (migrations, ORM)
- **WebhooksExtension**: HTTP webhooks for external integrations
- **MetricsExtension**: Performance monitoring and metrics collection
- **SecurityExtension**: Rate limiting and sandboxing

