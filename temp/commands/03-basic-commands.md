# Basic Commands with AbstractCommand

[← Quick Start](02-quick-start.md) | [Back to Index](README.md) | [Player Commands →](04-player-commands.md)

## Introduction

`AbstractCommand` is the base class for commands that can be executed by **any sender** - players, console, command blocks, or other sources. Use this when your command doesn't specifically require player context.

## When to Use AbstractCommand

✅ **Use AbstractCommand when:**
- Command can be run from console
- Command doesn't need player-specific data
- Command is administrative/utility
- You want manual sender type control

❌ **Don't use when:**
- Command specifically needs player context
- You need automatic player validation
- You want to use Entity Component System (ECS)
- ↳ Use `AbstractPlayerCommand` instead

## Basic Structure

```java
public class MyCommand extends AbstractCommand {
    
    public MyCommand() {
        super("commandname", "Command description");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        // Command logic here
        return CompletableFuture.completedFuture(null);
    }
}
```

### Key Differences from AbstractPlayerCommand

| Feature | AbstractCommand | AbstractPlayerCommand |
|---------|----------------|----------------------|
| Sender type | Any (Player, Console, etc.) | Player only |
| Return type | `CompletableFuture<Void>` | `void` |
| Threading | Main thread | Async (off main thread) |
| Parameters | `CommandContext` | `CommandContext`, `Store`, `Ref`, `PlayerRef`, `World` |
| Manual type checking | Required | Not needed |

## Constructor Parameters

```java
public MyCommand() {
    super(
        "reload",              // Command name (what users type)
        "Reloads the plugin",  // Description (shown in help)
        false                  // Requires confirmation (optional)
    );
}
```

### Confirmation Flag

When `true`, requires `--confirm` flag:

```java
public DangerousCommand() {
    super("deleteall", "Deletes all data", true);  // Requires confirmation
}
```

**Usage:**
- `/deleteall` → Shows warning
- `/deleteall --confirm` → Executes command

## CommandContext API

The `CommandContext` provides access to execution information:

```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    // Get sender
    CommandSender sender = ctx.sender();
    
    // Send message to sender
    ctx.sendMessage(Message.raw("Command executed!"));
    
    // Check if sender is player
    if (sender instanceof Player) {
        Player player = (Player) sender;
        // Player-specific logic
    }
    
    return CompletableFuture.completedFuture(null);
}
```

### CommandContext Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `sender()` | Get command sender | `CommandSender` |
| `senderAsPlayerRef()` | Get as PlayerRef (if player) | `PlayerRef` |
| `sendMessage(Message)` | Send message to sender | `void` |
| `source()` | Get command source | `CommandSource` |

## Complete Examples

### Example 1: Plugin Reload Command

```java
package com.yourplugin.commands;

import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.command.system.AbstractCommand;
import com.hypixel.hytale.server.core.command.system.CommandContext;

import javax.annotation.Nonnull;
import java.util.concurrent.CompletableFuture;

public class ReloadCommand extends AbstractCommand {
    
    public ReloadCommand() {
        super("reload", "Reloads plugin configuration");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        ctx.sendMessage(Message.raw("Reloading plugin..."));
        
        try {
            // Reload config
            YourPlugin.getInstance().reloadConfig();
            
            ctx.sendMessage(Message.raw("Plugin reloaded successfully!"));
        } catch (Exception e) {
            ctx.sendMessage(Message.raw("Failed to reload: " + e.getMessage()));
        }
        
        return CompletableFuture.completedFuture(null);
    }
}
```

**Usage:**
```
/reload
```

**Output:**
```
Reloading plugin...
Plugin reloaded successfully!
```

### Example 2: Status Command (Console + Player)

```java
public class StatusCommand extends AbstractCommand {
    
    public StatusCommand() {
        super("status", "Shows server status");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        CommandSender sender = ctx.sender();
        
        // Get server info
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024;
        long maxMemory = runtime.maxMemory() / 1024 / 1024;
        
        // Send status
        ctx.sendMessage(Message.raw("========== Server Status =========="));
        ctx.sendMessage(Message.raw("Memory: " + usedMemory + "MB / " + maxMemory + "MB"));
        ctx.sendMessage(Message.raw("Threads: " + Thread.activeCount()));
        
        // Player-specific info
        if (sender instanceof Player) {
            Player player = (Player) sender;
            ctx.sendMessage(Message.raw("Your World: " + player.getWorld().getName()));
        } else {
            ctx.sendMessage(Message.raw("Executed from: Console"));
        }
        
        return CompletableFuture.completedFuture(null);
    }
}
```

### Example 3: Broadcast Command

```java
package com.yourplugin.commands;

import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.command.system.AbstractCommand;
import com.hypixel.hytale.server.core.command.system.CommandContext;
import com.hypixel.hytale.server.core.command.system.arguments.types.ArgTypes;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.universe.Universe;

import javax.annotation.Nonnull;
import java.util.concurrent.CompletableFuture;

public class BroadcastCommand extends AbstractCommand {
    
    RequiredArg<String> messageArg = this.withRequiredArg("message", "Message to broadcast", ArgTypes.STRING);
    
    public BroadcastCommand() {
        super("broadcast", "Broadcast a message to all players");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        String message = messageArg.get(ctx);
        
        // Format broadcast
        String broadcast = "[Broadcast] " + message;
        
        // Send to all online players
        Universe.get().getAllPlayers().forEach(playerRef -> {
            Player player = playerRef.getStore().getComponent(playerRef.getRef(), Player.getComponentType());
            if (player != null) {
                player.sendMessage(Message.raw(broadcast));
            }
        });
        
        // Confirm to sender
        ctx.sendMessage(Message.raw("Broadcast sent to all players!"));
        
        return CompletableFuture.completedFuture(null);
    }
}
```

**Usage:**
```
/broadcast Server will restart in 5 minutes!
```

**Output (all players see):**
```
[Broadcast] Server will restart in 5 minutes!
```

### Example 4: Save All Command (Requires Confirmation)

```java
public class SaveAllCommand extends AbstractCommand {
    
    public SaveAllCommand() {
        super("saveall", "Saves all server data", true);  // Requires --confirm
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        ctx.sendMessage(Message.raw("Saving all data..."));
        
        // Save all worlds
        Universe.get().getWorlds().forEach(world -> {
            try {
                world.save();
                ctx.sendMessage(Message.raw("Saved world: " + world.getName()));
            } catch (Exception e) {
                ctx.sendMessage(Message.raw("Failed to save " + world.getName()));
            }
        });
        
        ctx.sendMessage(Message.raw("All data saved!"));
        return CompletableFuture.completedFuture(null);
    }
}
```

**Usage:**
```
/saveall             → Shows warning
/saveall --confirm   → Executes save
```

## Sender Type Handling

### Check Sender Type

```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    CommandSender sender = ctx.sender();
    
    if (sender instanceof Player) {
        Player player = (Player) sender;
        ctx.sendMessage(Message.raw("Executed by player: " + player.getDisplayName()));
    } else {
        ctx.sendMessage(Message.raw("Executed from console"));
    }
    
    return CompletableFuture.completedFuture(null);
}
```

### Require Player Sender

```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    if (!(ctx.sender() instanceof Player)) {
        ctx.sendMessage(Message.raw("This command can only be used by players!"));
        return CompletableFuture.completedFuture(null);
    }
    
    Player player = (Player) ctx.sender();
    // Player-specific logic...
    
    return CompletableFuture.completedFuture(null);
}
```

**Note:** If you always need a player, use `AbstractPlayerCommand` instead!

## Adding Arguments

Commands can accept arguments even in `AbstractCommand`:

```java
public class KickCommand extends AbstractCommand {
    
    RequiredArg<String> playerArg = this.withRequiredArg("player", "Player to kick", ArgTypes.STRING);
    OptionalArg<String> reasonArg = this.withOptionalArg("reason", "Kick reason", ArgTypes.STRING);
    
    public KickCommand() {
        super("kick", "Kick a player from the server");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        String playerName = playerArg.get(ctx);
        String reason = reasonArg.get(ctx);
        if (reason == null) reason = "Kicked by an administrator";
        
        // Find player
        PlayerRef target = Universe.get().getPlayerByUsername(playerName, NameMatching.EXACT);
        if (target == null) {
            ctx.sendMessage(Message.raw("Player not found: " + playerName));
            return CompletableFuture.completedFuture(null);
        }
        
        // Kick player
        Player targetPlayer = target.getStore().getComponent(target.getRef(), Player.getComponentType());
        targetPlayer.disconnect(Message.raw("Kicked: " + reason));
        
        ctx.sendMessage(Message.raw("Kicked " + playerName + ": " + reason));
        return CompletableFuture.completedFuture(null);
    }
}
```

## CompletableFuture Return

`AbstractCommand` requires returning `CompletableFuture<Void>`:

### Simple Return

```java
return CompletableFuture.completedFuture(null);
```

### Async Operations

```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    return CompletableFuture.runAsync(() -> {
        // Long-running operation
        loadDataFromDatabase();
        
        ctx.sendMessage(Message.raw("Data loaded!"));
    });
}
```

### Error Handling

```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    return CompletableFuture.runAsync(() -> {
        try {
            performOperation();
            ctx.sendMessage(Message.raw("Success!"));
        } catch (Exception e) {
            ctx.sendMessage(Message.raw("Error: " + e.getMessage()));
        }
    });
}
```

## Best Practices

### ✅ Do

1. **Handle both player and console:**
   ```java
   if (sender instanceof Player) {
       // Player logic
   } else {
       // Console logic
   }
   ```

2. **Return CompletableFuture properly:**
   ```java
   return CompletableFuture.completedFuture(null);
   ```

3. **Validate permissions:**
   ```java
   if (sender instanceof Player) {
       Player player = (Player) sender;
       if (!player.hasPermission("plugin.admin")) {
           ctx.sendMessage(Message.raw("No permission!"));
           return CompletableFuture.completedFuture(null);
       }
   }
   ```

4. **Use clear descriptions:**
   ```java
   super("reload", "Reloads plugin configuration and settings");
   ```

### ❌ Don't

1. **Don't forget return statement:**
   ```java
   // ❌ Wrong
   public CompletableFuture<Void> execute(...) {
       ctx.sendMessage(Message.raw("Done!"));
       // Missing return!
   }
   ```

2. **Don't assume player sender:**
   ```java
   // ❌ Wrong - will crash if console runs it
   Player player = (Player) ctx.sender();
   
   // ✅ Correct
   if (ctx.sender() instanceof Player) {
       Player player = (Player) ctx.sender();
   }
   ```

3. **Don't use for player-only commands:**
   ```java
   // ❌ Wrong - use AbstractPlayerCommand instead
   public class TeleportCommand extends AbstractCommand {
       // Always requires player...
   }
   ```

## Common Patterns

### Pattern 1: Admin Command Template

```java
public class AdminCommand extends AbstractCommand {
    public AdminCommand() {
        super("admincmd", "Admin-only command");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        // Check if player (console always has permission)
        if (ctx.sender() instanceof Player) {
            Player player = (Player) ctx.sender();
            if (!player.hasPermission("plugin.admin")) {
                ctx.sendMessage(Message.raw("No permission!"));
                return CompletableFuture.completedFuture(null);
            }
        }
        
        // Admin logic...
        ctx.sendMessage(Message.raw("Admin command executed!"));
        return CompletableFuture.completedFuture(null);
    }
}
```

### Pattern 2: Info Display Command

```java
public class InfoCommand extends AbstractCommand {
    public InfoCommand() {
        super("info", "Display server information");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        ctx.sendMessage(Message.raw("===== Server Info ====="));
        ctx.sendMessage(Message.raw("Players: " + getOnlineCount()));
        ctx.sendMessage(Message.raw("Version: " + getVersion()));
        return CompletableFuture.completedFuture(null);
    }
}
```

### Pattern 3: Console-Safe Toggle

```java
public class MaintenanceCommand extends AbstractCommand {
    public MaintenanceCommand() {
        super("maintenance", "Toggle maintenance mode");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        boolean enabled = toggleMaintenance();
        
        String status = enabled ? "enabled" : "disabled";
        ctx.sendMessage(Message.raw("Maintenance mode " + status));
        
        return CompletableFuture.completedFuture(null);
    }
}
```

## What's Next?

- [**Player Commands →**](04-player-commands.md) - Learn about AbstractPlayerCommand
- [**Command Arguments →**](05-arguments.md) - Add parameters to commands
- [**Permissions →**](07-permissions.md) - Control command access

---

[← Quick Start](02-quick-start.md) | [Back to Index](README.md) | [Player Commands →](04-player-commands.md)
