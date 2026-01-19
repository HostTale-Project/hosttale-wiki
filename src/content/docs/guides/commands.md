---
title: Commands
description: Learn how to create custom commands for your Hytale server plugins.
---

Commands are the primary way players and administrators interact with your server plugins. This guide covers everything you need to know to create powerful, type-safe commands.

## Command System Overview

Hytale's command system provides a robust architecture for creating custom commands with automatic argument parsing, permission checking, and async execution support.

### Command Type Hierarchy

```
BaseCommand (Abstract)
    ├── AbstractCommand          → Basic commands (any sender)
    └── AbstractAsyncCommand
        └── AbstractPlayerCommand → Player-only commands
```

### When to Use Each Type

**AbstractCommand** - Use for commands that:
- Can be executed from console or command blocks
- Don't specifically need player context
- Are administrative or utility commands

**AbstractPlayerCommand** - Use for commands that:
- Must be executed by a player
- Need access to player components via ECS
- Require player position, inventory, or other player-specific data

## Creating Your First Command

Let's create a simple greeting command that works for players:

```java
package com.yourplugin.commands;

import com.hypixel.hytale.component.Ref;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.command.system.CommandContext;
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.universe.PlayerRef;
import com.hypixel.hytale.server.core.universe.world.World;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;

import javax.annotation.Nonnull;

public class HelloCommand extends AbstractPlayerCommand {
    
    public HelloCommand() {
        super("hello", "Sends a greeting message");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        // Get the player component
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Send greeting
        player.sendMessage(Message.raw("Hello, " + player.getDisplayName() + "!"));
    }
}
```

### Registering Your Command

In your plugin's main class:

```java
@Override
public void setup() {
    this.getCommandRegistry().registerCommand(new HelloCommand());
    getLogger().atInfo().log("Commands registered!");
}
```

## Working with AbstractCommand

For commands that should work from both console and in-game:

```java
public class ReloadCommand extends AbstractCommand {
    
    public ReloadCommand() {
        super("reload", "Reloads the plugin configuration");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        // Get sender
        CommandSender sender = ctx.sender();
        
        // Reload logic here
        ctx.sendMessage(Message.raw("Configuration reloaded!"));
        
        return CompletableFuture.completedFuture(null);
    }
}
```

### Key Differences

| Feature | AbstractCommand | AbstractPlayerCommand |
|---------|----------------|----------------------|
| Sender type | Any (Player, Console, etc.) | Player only |
| Return type | `CompletableFuture<Void>` | `void` |
| Threading | Main thread | Async (off main thread) |
| Player checking | Manual | Automatic |

## Command Arguments

Arguments allow your commands to accept parameters from users with automatic type validation.

### Defining Arguments

```java
public class TeleportCommand extends AbstractPlayerCommand {
    
    // Define arguments as fields
    RequiredArg<String> playerArg = this.withRequiredArg(
        "player",                    // Name
        "Player to teleport to",     // Description
        ArgTypes.STRING              // Type
    );
    
    OptionalArg<Integer> delayArg = this.withOptionalArg(
        "delay",
        "Delay in seconds (default: 0)",
        ArgTypes.INTEGER
    );
    
    public TeleportCommand() {
        super("tp", "Teleport to another player");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        // Get argument values
        String targetName = playerArg.get(ctx);
        Integer delay = delayArg.get(ctx);
        
        // Use default if optional argument not provided
        if (delay == null) delay = 0;
        
        // Implementation...
    }
}
```

### Available Argument Types

| ArgType | Java Type | Example Values |
|---------|-----------|----------------|
| `ArgTypes.STRING` | `String` | `"hello"`, `"world"` |
| `ArgTypes.INTEGER` | `Integer` | `1`, `42`, `-10` |
| `ArgTypes.BOOLEAN` | `Boolean` | `true`, `false` |
| `ArgTypes.FLOAT` | `Float` | `1.5`, `3.14` |
| `ArgTypes.DOUBLE` | `Double` | `1.5`, `3.14159` |
| `ArgTypes.UUID` | `UUID` | `550e8400-e29b-...` |

### Null Handling for Optional Arguments

Always check for null when using optional arguments:

```java
Integer amount = optionalArg.get(ctx);

// Option 1: Provide default
if (amount == null) amount = 1;

// Option 2: Check before using
if (amount != null && amount > 10) {
    // Use amount
}
```

## Sub-Commands

Create organized, hierarchical command structures for complex features:

```java
// Main command
public class EconomyCommand extends AbstractPlayerCommand {
    
    public EconomyCommand() {
        super("economy", "Economy management commands");
        
        // Register sub-commands
        addSubCommand(new EconomyGiveCommand());
        addSubCommand(new EconomyTakeCommand());
        addSubCommand(new EconomyBalanceCommand());
    }
    
    @Override
    protected void execute(...) {
        // Shows help when /economy is used alone
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Available commands:"));
        player.sendMessage(Message.raw("- /economy give <player> <amount>"));
        player.sendMessage(Message.raw("- /economy take <player> <amount>"));
        player.sendMessage(Message.raw("- /economy balance"));
    }
}

// Sub-command
public class EconomyGiveCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> playerArg = this.withRequiredArg("player", "Target player", ArgTypes.STRING);
    RequiredArg<Double> amountArg = this.withRequiredArg("amount", "Amount", ArgTypes.DOUBLE);
    
    public EconomyGiveCommand() {
        super("give", "Give money to a player");
    }
    
    @Override
    protected void execute(...) {
        String target = playerArg.get(commandContext);
        double amount = amountArg.get(commandContext);
        
        // Implementation...
    }
}
```

:::tip
Only register the main command in your plugin. Sub-commands are automatically registered through `addSubCommand()`.
:::

## Understanding Threading

### AbstractPlayerCommand Threading

`AbstractPlayerCommand` extends `AbstractAsyncCommand`, meaning it executes **off the main server thread**. This is important for thread safety:

```java
@Override
protected void execute(...) {
    // ❌ Wrong - Unsafe on async thread!
    player.teleport(location);
    
    // ✅ Correct - Schedule on main thread
    server.getScheduler().runTask(() -> {
        player.teleport(location);
    });
}
```

### Thread Safety Rules

When using `AbstractPlayerCommand`:
- Reading data is usually safe
- Modifying game state requires main thread
- Use the scheduler for game-modifying operations

## Accessing Player Components

The Entity Component System (ECS) provides access to player data:

```java
@Override
protected void execute(@Nonnull CommandContext commandContext,
                      @Nonnull Store<EntityStore> store,
                      @Nonnull Ref<EntityStore> ref,
                      @Nonnull PlayerRef playerRef,
                      @Nonnull World world) {
    // Get player component
    Player player = store.getComponent(ref, Player.getComponentType());
    
    // Get transform (position/rotation)
    TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
    
    // Get inventory
    InventoryComponent inventory = store.getComponent(ref, InventoryComponent.getComponentType());
    
    // Get UUID
    UUIDComponent uuid = store.getComponent(ref, UUIDComponent.getComponentType());
}
```

## Sending Messages

Format and send messages to players:

```java
// Simple text
player.sendMessage(Message.raw("Hello, world!"));

// Colored text
player.sendMessage(Message.raw("Success!").color("#00FF00"));

// Combined messages
Message combined = Message.join(
    Message.raw("Welcome, ").color("#FFFFFF"),
    Message.raw(player.getDisplayName()).color("#FFD700"),
    Message.raw("!").color("#FFFFFF")
);
player.sendMessage(combined);
```

## Permissions

Check permissions before executing sensitive operations:

```java
@Override
protected void execute(...) {
    Player player = store.getComponent(ref, Player.getComponentType());
    
    if (!player.hasPermission("yourplugin.command.use")) {
        player.sendMessage(Message.raw("You don't have permission!"));
        return;
    }
    
    // Command logic...
}
```

## Complete Example: Warp System

Here's a production-ready command with all best practices:

```java
public class WarpCommand extends AbstractPlayerCommand {
    
    private final WarpManager warpManager;
    RequiredArg<String> warpArg = this.withRequiredArg("warp", "Warp name", ArgTypes.STRING);
    
    public WarpCommand(WarpManager warpManager) {
        super("warp", "Teleport to a warp point");
        this.warpManager = warpManager;
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String warpName = warpArg.get(commandContext);
        
        // Permission check
        if (!player.hasPermission("warps.use." + warpName.toLowerCase())) {
            player.sendMessage(Message.raw("You don't have access to this warp!").color("#FF0000"));
            return;
        }
        
        // Get warp
        Warp warp = warpManager.getWarp(warpName);
        if (warp == null) {
            player.sendMessage(Message.raw("Warp '" + warpName + "' not found!").color("#FF0000"));
            return;
        }
        
        // Get transform for teleport
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        
        // Schedule teleport on main thread
        commandContext.source().getServer().getScheduler().runTask(() -> {
            transform.setPosition(warp.getLocation());
            player.sendMessage(Message.raw("Teleported to " + warpName + "!").color("#00FF00"));
        });
    }
}
```

## Common Troubleshooting

### Command Not Found

**Problem:** `/mycommand` says "Unknown command"

**Solution:** Verify registration in your plugin's `setup()` method:

```java
@Override
public void setup() {
    this.getCommandRegistry().registerCommand(new MyCommand());
    getLogger().atInfo().log("Commands registered!");
}
```

### NullPointerException with Optional Arguments

**Problem:** Getting NPE when accessing optional argument

**Solution:** Always check for null:

```java
Integer amount = optionalArg.get(ctx);
if (amount == null) amount = 1;  // Provide default
```

### Sub-command Not Working

**Problem:** Sub-command doesn't execute

**Solution:** Only register the main command, not sub-commands:

```java
// ✅ Correct
registry.registerCommand(new MainCommand());

// ❌ Wrong - don't register sub-commands separately
registry.registerCommand(new SubCommand());
```

## Best Practices

1. **Always validate input** - Check permissions and arguments before execution
2. **Use appropriate command type** - `AbstractCommand` for console support, `AbstractPlayerCommand` for player-only
3. **Handle thread safety** - Schedule game-modifying operations on main thread when using `AbstractPlayerCommand`
4. **Provide clear feedback** - Send helpful messages for success and error cases
5. **Use sub-commands** - Organize related commands hierarchically
6. **Check for null** - Always handle null values from optional arguments

## Next Steps

Now that you understand commands, explore:
- Creating custom events to respond to game actions
- Building user interfaces for complex interactions
- Managing persistent data with databases
- Implementing cooldowns and rate limiting