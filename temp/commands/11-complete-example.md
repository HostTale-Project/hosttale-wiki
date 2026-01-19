# Complete Command Examples

[← Sending Messages](10-messages.md) | [Back to Index](README.md) | [Troubleshooting →](12-troubleshooting.md)

## Real-World Command Implementations

This guide shows complete, production-ready command implementations using common patterns.

## Example 1: Warp List Command

Complete command that lists available warps:

```java
package com.yourplugin.commands;

import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.command.system.AbstractCommand;
import com.hypixel.hytale.server.core.command.system.CommandContext;
import com.hypixel.hytale.server.core.entity.entities.Player;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Command to list available warps.
 * Shows all warps that the player has permission to use.
 */
public class WarpListCommand extends AbstractCommand {
    
    private final WarpManager warpManager;
    
    public WarpListCommand(WarpManager warpManager) {
        super("warps", "Lists all available warps");
        this.warpManager = warpManager;
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        // Check if sender is a player
        if (!(ctx.sender() instanceof Player)) {
            ctx.sendMessage(Message.raw("This command can only be used by players!"));
            return CompletableFuture.completedFuture(null);
        }
        
        Player player = (Player) ctx.sender();
        
        // Get all warps
        List<Warp> warps = warpManager.getAllWarps();
        
        if (warps.isEmpty()) {
            player.sendMessage(Message.raw("No warps are currently available."));
            return CompletableFuture.completedFuture(null);
        }
        
        // Filter warps by permission
        List<Warp> accessibleWarps = warps.stream()
            .filter(warp -> player.hasPermission("warps.use." + warp.getName().toLowerCase()))
            .toList();
        
        if (accessibleWarps.isEmpty()) {
            player.sendMessage(Message.raw("You don't have access to any warps."));
            return CompletableFuture.completedFuture(null);
        }
        
        // Display warp list
        player.sendMessage(Message.raw("========== Available Warps =========="));
        for (Warp warp : accessibleWarps) {
            Message warpInfo = Message.join(
                Message.raw(warp.getName()).color("#00FF00"),
                Message.raw(" - " + warp.getDescription())
            );
            player.sendMessage(warpInfo);
        }
        player.sendMessage(Message.raw("Use /warp <name> to teleport"));
        
        return CompletableFuture.completedFuture(null);
    }
}
```

**Key Features:**
- Player validation
- Permission filtering
- Formatted output with colors
- User-friendly messages

**Usage:** `/warps`

## Example 2: Teleport System

Complete teleport command with cooldowns and validation:

```java
package com.yourplugin.commands;

import com.hypixel.hytale.component.Ref;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.component.components.TransformComponent;
import com.hypixel.hytale.math.Vector3D;
import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.NameMatching;
import com.hypixel.hytale.server.core.command.system.CommandContext;
import com.hypixel.hytale.server.core.command.system.arguments.types.ArgTypes;
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.universe.PlayerRef;
import com.hypixel.hytale.server.core.universe.Universe;
import com.hypixel.hytale.server.core.universe.world.World;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TeleportCommand extends AbstractPlayerCommand {
    
    // Cooldown tracking (player UUID -> last teleport time)
    private static final Map<UUID, Long> cooldowns = new HashMap<>();
    private static final long COOLDOWN_MS = 5000; // 5 seconds
    
    RequiredArg<String> targetArg = this.withRequiredArg(
        "player", 
        "Player to teleport to", 
        ArgTypes.STRING
    );
    
    public TeleportCommand() {
        super("tp", "Teleport to another player");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String targetName = targetArg.get(commandContext);
        
        // Permission check
        if (!player.hasPermission("yourplugin.tp")) {
            player.sendMessage(Message.raw("You don't have permission to teleport!"));
            return;
        }
        
        // Cooldown check (unless bypass permission)
        if (!player.hasPermission("yourplugin.tp.bypass")) {
            UUID playerId = player.getUuid();
            long now = System.currentTimeMillis();
            
            if (cooldowns.containsKey(playerId)) {
                long lastUse = cooldowns.get(playerId);
                long timeLeft = COOLDOWN_MS - (now - lastUse);
                
                if (timeLeft > 0) {
                    player.sendMessage(Message.raw(
                        "Teleport is on cooldown! Wait " + (timeLeft / 1000) + " seconds."
                    ));
                    return;
                }
            }
        }
        
        // Find target player
        PlayerRef targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
        if (targetRef == null) {
            player.sendMessage(Message.raw("Player not found: " + targetName));
            return;
        }
        
        // Can't teleport to self
        if (targetRef.equals(playerRef)) {
            player.sendMessage(Message.raw("You can't teleport to yourself!"));
            return;
        }
        
        // Check if target is in same world
        Player targetPlayer = targetRef.getStore().getComponent(
            targetRef.getRef(), 
            Player.getComponentType()
        );
        
        if (!targetPlayer.getWorld().equals(player.getWorld())) {
            player.sendMessage(Message.raw("Target player is in a different world!"));
            return;
        }
        
        // Get target position
        TransformComponent targetTransform = targetRef.getStore().getComponent(
            targetRef.getRef(), 
            TransformComponent.getComponentType()
        );
        Vector3D targetPos = targetTransform.getPosition();
        
        // Teleport (on main thread)
        world.getScheduler().runSync(() -> {
            TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
            transform.setPosition(targetPos);
            
            // Send success message
            player.sendMessage(Message.raw("Teleported to " + targetName + "!"));
            
            // Notify target
            targetPlayer.sendMessage(Message.raw("" + player.getDisplayName() + " teleported to you."));
            
            // Set cooldown
            if (!player.hasPermission("yourplugin.tp.bypass")) {
                cooldowns.put(player.getUuid(), System.currentTimeMillis());
            }
        });
    }
}
```

**Key Features:**
- Cooldown system
- Permission checks with bypass
- Player validation
- World check
- Thread-safe teleportation
- Notifications to both players

## Example 3: Home Management System

Complete multi-command system with data persistence:

```java
// Main command
public class HomeCommand extends AbstractPlayerCommand {
    public HomeCommand() {
        super("home", "Home management system");
        
        addSubCommand(new HomeSetCommand());
        addSubCommand(new HomeDeleteCommand());
        addSubCommand(new HomeListCommand());
        addSubCommand(new HomeTeleportCommand());
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("========== Home Commands =========="));
        player.sendMessage(Message.raw("/home set <name> - Set a home"));
        player.sendMessage(Message.raw("/home delete <name> - Delete a home"));
        player.sendMessage(Message.raw("/home list - List your homes"));
        player.sendMessage(Message.raw("/home tp <name> - Teleport to home"));
    }
}

// Set sub-command
public class HomeSetCommand extends AbstractPlayerCommand {
    RequiredArg<String> nameArg = this.withRequiredArg("name", "Home name", ArgTypes.STRING);
    
    public HomeSetCommand() {
        super("set", "Set a home at your location");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String homeName = nameArg.get(commandContext);
        
        // Validate name
        if (!homeName.matches("[a-zA-Z0-9_]+")) {
            player.sendMessage(Message.raw("Home name can only contain letters, numbers, and underscores!"));
            return;
        }
        
        if (homeName.length() < 2 || homeName.length() > 16) {
            player.sendMessage(Message.raw("Home name must be 2-16 characters!"));
            return;
        }
        
        // Check home limit
        int maxHomes = player.hasPermission("homes.unlimited") ? Integer.MAX_VALUE : 5;
        HomeManager homeManager = YourPlugin.getInstance().getHomeManager();
        
        if (homeManager.getHomeCount(player.getUuid()) >= maxHomes) {
            player.sendMessage(Message.raw("You've reached your home limit! (" + maxHomes + ")"));
            return;
        }
        
        // Get current position
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        Vector3D position = transform.getPosition();
        
        // Save home
        HomeData home = new HomeData(
            player.getUuid(),
            homeName,
            position,
            world.getName(),
            System.currentTimeMillis()
        );
        
        homeManager.saveHome(home);
        player.sendMessage(Message.raw("Home '" + homeName + "' set at your location!"));
    }
}

// Teleport sub-command
public class HomeTeleportCommand extends AbstractPlayerCommand {
    RequiredArg<String> nameArg = this.withRequiredArg("name", "Home name", ArgTypes.STRING);
    
    // Teleport cooldown
    private static final Map<UUID, Long> cooldowns = new HashMap<>();
    private static final long COOLDOWN_MS = 3000;
    
    public HomeTeleportCommand() {
        super("tp", "Teleport to a home");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String homeName = nameArg.get(commandContext);
        
        // Cooldown check
        if (!player.hasPermission("homes.bypass")) {
            UUID playerId = player.getUuid();
            long now = System.currentTimeMillis();
            
            if (cooldowns.containsKey(playerId)) {
                long timeLeft = COOLDOWN_MS - (now - cooldowns.get(playerId));
                if (timeLeft > 0) {
                    player.sendMessage(Message.raw("Wait " + (timeLeft / 1000) + "s before teleporting again!"));
                    return;
                }
            }
        }
        
        // Get home
        HomeManager homeManager = YourPlugin.getInstance().getHomeManager();
        HomeData home = homeManager.getHome(player.getUuid(), homeName);
        
        if (home == null) {
            player.sendMessage(Message.raw("Home '" + homeName + "' not found!"));
            player.sendMessage(Message.raw("Use /home list to see your homes."));
            return;
        }
        
        // Teleport with warmup
        player.sendMessage(Message.raw("Teleporting to '" + homeName + "' in 3 seconds..."));
        player.sendMessage(Message.raw("Don't move!"));
        
        Vector3D startPos = store.getComponent(ref, TransformComponent.getComponentType()).getPosition();
        
        // Schedule warmup
        world.getScheduler().runDelayed(() -> {
            // Check if player moved
            Vector3D currentPos = store.getComponent(ref, TransformComponent.getComponentType()).getPosition();
            double distance = startPos.distanceTo(currentPos);
            
            if (distance > 0.5) {
                player.sendMessage(Message.raw("Teleport cancelled! You moved."));
                return;
            }
            
            // Teleport
            TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
            transform.setPosition(home.getPosition());
            player.sendMessage(Message.raw("Teleported to home '" + homeName + "'!"));
            
            // Set cooldown
            if (!player.hasPermission("homes.bypass")) {
                cooldowns.put(player.getUuid(), System.currentTimeMillis());
            }
        }, 60); // 60 ticks = 3 seconds
    }
}

// Delete sub-command
public class HomeDeleteCommand extends AbstractPlayerCommand {
    RequiredArg<String> nameArg = this.withRequiredArg("name", "Home name", ArgTypes.STRING);
    
    public HomeDeleteCommand() {
        super("delete", "Delete a home");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String homeName = nameArg.get(commandContext);
        
        HomeManager homeManager = YourPlugin.getInstance().getHomeManager();
        
        if (!homeManager.hasHome(player.getUuid(), homeName)) {
            player.sendMessage(Message.raw("Home '" + homeName + "' not found!"));
            return;
        }
        
        homeManager.deleteHome(player.getUuid(), homeName);
        player.sendMessage(Message.raw("Home '" + homeName + "' deleted!"));
    }
}

// List sub-command
public class HomeListCommand extends AbstractPlayerCommand {
    public HomeListCommand() {
        super("list", "List your homes");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        HomeManager homeManager = YourPlugin.getInstance().getHomeManager();
        List<HomeData> homes = homeManager.getHomes(player.getUuid());
        
        if (homes.isEmpty()) {
            player.sendMessage(Message.raw("You don't have any homes set!"));
            player.sendMessage(Message.raw("Use /home set <name> to create one."));
            return;
        }
        
        player.sendMessage(Message.raw("========== Your Homes =========="));
        for (HomeData home : homes) {
            Vector3D pos = home.getPosition();
            String location = String.format("%.0f, %.0f, %.0f", pos.getX(), pos.getY(), pos.getZ());
            player.sendMessage(Message.raw("" + home.getName() + " (" + location + ")"));
        }
        player.sendMessage(Message.raw("Use /home tp <name> to teleport."));
    }
}
```

**Key Features:**
- Complete CRUD operations
- Data persistence (HomeManager)
- Validation (name format, limits)
- Cooldowns
- Teleport warmup with movement check
- Permission-based limits
- User-friendly messages

## Example 4: Economy Command System

```java
public class EconomyCommand extends AbstractPlayerCommand {
    public EconomyCommand() {
        super("economy", "Economy management system");
        setPermissionGroup(GameMode.OPERATOR);
        
        addSubCommand(new EconomyGiveCommand());
        addSubCommand(new EconomyTakeCommand());
        addSubCommand(new EconomySetCommand());
        addSubCommand(new EconomyBalanceCommand());
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("========== Economy =========="));
        player.sendMessage(Message.raw("/economy give <player> <amount>"));
        player.sendMessage(Message.raw("/economy take <player> <amount>"));
        player.sendMessage(Message.raw("/economy set <player> <amount>"));
        player.sendMessage(Message.raw("/economy balance [player]"));
    }
}

public class EconomyGiveCommand extends AbstractPlayerCommand {
    RequiredArg<String> targetArg = this.withRequiredArg("player", "Target player", ArgTypes.STRING);
    RequiredArg<Double> amountArg = this.withRequiredArg("amount", "Amount to give", ArgTypes.DOUBLE);
    
    public EconomyGiveCommand() {
        super("give", "Give money to a player");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String targetName = targetArg.get(commandContext);
        double amount = amountArg.get(commandContext);
        
        // Validate amount
        if (amount <= 0) {
            player.sendMessage(Message.raw("Amount must be positive!"));
            return;
        }
        
        if (amount > 1000000) {
            player.sendMessage(Message.raw("Amount too large! Max: 1,000,000"));
            return;
        }
        
        // Find target
        PlayerRef targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
        if (targetRef == null) {
            player.sendMessage(Message.raw("Player not found: " + targetName));
            return;
        }
        
        // Give money
        EconomyManager economy = YourPlugin.getInstance().getEconomyManager();
        UUID targetId = targetRef.getStore().getComponent(
            targetRef.getRef(), 
            Player.getComponentType()
        ).getUuid();
        
        economy.addMoney(targetId, amount);
        
        // Format amount
        String formattedAmount = String.format("$%.2f", amount);
        
        // Notify sender
        player.sendMessage(Message.raw("Gave " + formattedAmount + " to " + targetName));
        
        // Notify target if online
        Player targetPlayer = targetRef.getStore().getComponent(
            targetRef.getRef(),
            Player.getComponentType()
        );
        if (targetPlayer != null) {
            targetPlayer.sendMessage(Message.raw("You received " + formattedAmount + "!"));
        }
        
        // Log transaction
        YourPlugin.getInstance().getLogger().atInfo().log(
            "Economy: " + player.getDisplayName() + " gave " + formattedAmount + " to " + targetName
        );
    }
}
```

## Registration Pattern

```java
@Override
public void setup() {
    CommandRegistry registry = this.getCommandRegistry();
    
    // Register all commands
    registry.registerCommand(new WarpListCommand(warpManager));
    registry.registerCommand(new TeleportCommand());
    registry.registerCommand(new HomeCommand());
    registry.registerCommand(new EconomyCommand());
    
    getLogger().atInfo().log("All commands registered!");
}
```

## What's Next?

- [**Troubleshooting →**](12-troubleshooting.md) - Fix common issues
- [**Back to Index**](README.md) - Explore other topics

---

[← Sending Messages](10-messages.md) | [Back to Index](README.md) | [Troubleshooting →](12-troubleshooting.md)
