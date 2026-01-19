# Overview of Hytale's Command System

[Back to Index →](README.md) | [Quick Start →](02-quick-start.md)

## Introduction

Hytale's command system provides a powerful, type-safe way to create custom commands for your server plugins. The system is built on top of a robust architecture that handles argument parsing, permission checking, error handling, and async execution automatically.

## Architecture Overview

### Command Hierarchy

```
BaseCommand (Abstract)
    ├── AbstractCommand
    │   └── Your basic commands
    └── AbstractAsyncCommand
        └── AbstractPlayerCommand
            └── Your player commands
```

### Key Classes

| Class | Purpose | Use When |
|-------|---------|----------|
| `AbstractCommand` | Basic command execution | Any command type (console/player) |
| `AbstractPlayerCommand` | Player-only commands | Command needs player context |
| `CommandContext` | Execution context | Accessing sender, arguments |
| `CommandRegistry` | Command registration | Registering commands with server |
| `ArgTypes` | Argument type definitions | Defining command arguments |

## Command Types

### AbstractCommand

**Use for:** Commands that can be executed by any sender (player, console, command blocks)

```java
public class ReloadCommand extends AbstractCommand {
    public ReloadCommand() {
        super("reload", "Reloads plugin configuration");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        // Implementation
        return CompletableFuture.completedFuture(null);
    }
}
```

**Features:**
- ✅ Can be executed from console
- ✅ Manual sender type checking required
- ✅ Returns `CompletableFuture<Void>`
- ✅ Executes on main thread by default

### AbstractPlayerCommand

**Use for:** Commands that require a player context

```java
public class HomeCommand extends AbstractPlayerCommand {
    public HomeCommand() {
        super("home", "Teleport to your home");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        // Implementation - player context automatically provided
    }
}
```

**Features:**
- ✅ Player-only (automatic validation)
- ✅ Direct access to player components via ECS
- ✅ Executes **asynchronously** (off main thread)
- ✅ Access to EntityStore, PlayerRef, World
- ⚠️ Extends `AbstractAsyncCommand`

## Key Concepts

### 1. Threading Model

**Critical:** `AbstractPlayerCommand` extends `AbstractAsyncCommand`, meaning commands execute **off the main server thread**.

```java
// ❌ Wrong - This will cause threading issues!
@Override
protected void execute(...) {
    player.teleport(location);  // Unsafe on async thread!
}

// ✅ Correct - Schedule on main thread
@Override
protected void execute(...) {
    scheduler.runSync(() -> {
        player.teleport(location);
    });
}
```

### 2. Entity Component System (ECS)

Hytale uses an ECS architecture. Commands receive:
- `Store<EntityStore>` - Entity storage system
- `Ref<EntityStore>` - Reference to the entity (player)
- `PlayerRef` - Player reference wrapper

```java
// Get player component
Player player = store.getComponent(ref, Player.getComponentType());

// Get transform (position/rotation)
TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());

// Get UUID
UUIDComponent uuid = store.getComponent(ref, UUIDComponent.getComponentType());
```

### 3. Command Registration

Commands must be registered with the server's `CommandRegistry`:

```java
public class MyPlugin extends JavaPlugin {
    @Override
    public void setup() {
        // Get registry
        CommandRegistry registry = this.getCommandRegistry();
        
        // Register commands
        registry.registerCommand(new HomeCommand());
        registry.registerCommand(new ReloadCommand());
        
        getLogger().atInfo().log("Commands registered!");
    }
}
```

### 4. Command Arguments

Commands can accept typed arguments:

```java
// Required argument
RequiredArg<String> nameArg = this.withRequiredArg("name", "Player name", ArgTypes.STRING);

// Optional argument
OptionalArg<Integer> countArg = this.withOptionalArg("count", "Number of items", ArgTypes.INTEGER);

// Use in execute()
String name = nameArg.get(ctx);
Integer count = countArg.get(ctx);  // May be null!
```

**Available Types:**
- `ArgTypes.STRING` - Text
- `ArgTypes.INTEGER` - Whole numbers
- `ArgTypes.BOOLEAN` - true/false
- `ArgTypes.FLOAT` - Decimal numbers
- `ArgTypes.DOUBLE` - High-precision decimals
- `ArgTypes.UUID` - Unique identifiers

## Command Lifecycle

```
1. Player executes command: /home spawn
        ↓
2. Server parses command name and arguments
        ↓
3. Registry finds matching command
        ↓
4. Permission check (if configured)
        ↓
5. Argument validation and parsing
        ↓
6. execute() method called
        ↓
7. Command logic runs
        ↓
8. Response sent to player
```

## Permissions

Commands can require specific permissions:

```java
// Check permission manually
if (!player.hasPermission("myplugin.home")) {
    ctx.sendMessage(Message.raw("No permission!"));
    return;
}

// Or set permission group
public HomeCommand() {
    super("home", "Teleport home");
    setPermissionGroup(GameMode.OPERATOR);  // Operator only
}
```

## Message Handling

Send messages to command sender:

```java
// Simple message
ctx.sendMessage(Message.raw("Hello!"));

// Colored message using .color()
ctx.sendMessage(Message.raw("Success! Teleported home").color("#00FF00"));

// Error message
ctx.sendMessage(Message.raw("Error: Home not found!").color("#FF0000"));
```

**Message API:**
- `Message.raw(text)` - Create plain text message
- `.color(hexColor)` - Apply color (e.g., "#FF0000" for red)
- `Message.join()` - Combine multiple messages
- `Message.empty()` - Create empty message

## Command Patterns

### Pattern 1: Simple Player Command

```java
public class PingCommand extends AbstractPlayerCommand {
    public PingCommand() {
        super("ping", "Check your latency");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Pong!"));
    }
}
```

### Pattern 2: Command with Arguments

```java
public class GiveCommand extends AbstractPlayerCommand {
    RequiredArg<String> itemArg = withRequiredArg("item", "Item to give", ArgTypes.STRING);
    OptionalArg<Integer> amountArg = withOptionalArg("amount", "Amount", ArgTypes.INTEGER);
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        String item = itemArg.get(ctx);
        Integer amount = amountArg.get(ctx);
        if (amount == null) amount = 1;
        
        // Give item logic...
    }
}
```

### Pattern 3: Console-Safe Command

```java
public class ReloadCommand extends AbstractCommand {
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        // Reload logic...
        ctx.sendMessage(Message.raw("Plugin reloaded!"));
        return CompletableFuture.completedFuture(null);
    }
}
```

## Best Practices

### ✅ Do

1. **Use appropriate base class**
   - `AbstractPlayerCommand` for player-only commands
   - `AbstractCommand` for universal commands

2. **Handle null values**
   ```java
   String name = optionalArg.get(ctx);
   if (name == null) name = "default";
   ```

3. **Provide clear descriptions**
   ```java
   super("home", "Teleport to your home location");
   ```

4. **Use proper threading**
   - Schedule world modifications on main thread
   - Keep command logic async-safe

5. **Validate input**
   ```java
   if (amount < 1 || amount > 64) {
       ctx.sendMessage(Message.raw("Amount must be 1-64!"));
       return;
   }
   ```

### ❌ Don't

1. **Don't modify world on async thread**
   ```java
   // ❌ Wrong in AbstractPlayerCommand
   player.teleport(location);
   ```

2. **Don't forget null checks**
   ```java
   // ❌ Wrong
   String name = optionalArg.get(ctx);
   name.toLowerCase();  // NullPointerException!
   ```

3. **Don't use vague descriptions**
   ```java
   // ❌ Wrong
   super("cmd", "Does stuff");
   
   // ✅ Correct
   super("teleport", "Teleport to a specific location");
   ```

4. **Don't ignore permissions**
   ```java
   // ❌ Wrong - no permission check
   @Override
   protected void execute(...) {
       // Dangerous admin action...
   }
   ```

## Common Use Cases

| Use Case | Command Type | Features Needed |
|----------|--------------|-----------------|
| Teleportation | `AbstractPlayerCommand` | Arguments, World access |
| Admin tools | `AbstractPlayerCommand` | Permissions, Sub-commands |
| Plugin reload | `AbstractCommand` | Console access |
| Player info | `AbstractPlayerCommand` | ECS components |
| Economy | `AbstractPlayerCommand` | Arguments, Data storage |

## What's Next?

Now that you understand the basics, try creating your first command:

- [**Quick Start →**](02-quick-start.md) - Create a command in 5 minutes
- [**Basic Commands →**](03-basic-commands.md) - Deep dive into AbstractCommand
- [**Player Commands →**](04-player-commands.md) - Master AbstractPlayerCommand

---

[Back to Index](README.md) | [Quick Start →](02-quick-start.md)
