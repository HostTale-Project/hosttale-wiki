# Sub-Commands

[← Command Arguments](05-arguments.md) | [Back to Index](README.md) | [Permissions →](07-permissions.md)

## Introduction

Sub-commands allow you to create hierarchical command structures, like `/economy give` or `/home set`. This creates organized, intuitive command systems for complex features.

## Creating Sub-Commands

### Basic Structure

```java
// Main command
public class EconomyCommand extends AbstractPlayerCommand {
    public EconomyCommand() {
        super("economy", "Economy management commands");
        
        // Add sub-commands
        addSubCommand(new EconomyGiveCommand());
        addSubCommand(new EconomyTakeCommand());
        addSubCommand(new EconomyBalanceCommand());
    }
    
    @Override
    protected void execute(...) {
        // This runs when /economy is used without sub-command
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Available sub-commands:"));
        player.sendMessage(Message.raw("- /economy give <player> <amount>"));
        player.sendMessage(Message.raw("- /economy take <player> <amount>"));
        player.sendMessage(Message.raw("- /economy balance [player]"));
    }
}

// Sub-command
public class EconomyGiveCommand extends AbstractPlayerCommand {
    RequiredArg<String> playerArg = this.withRequiredArg("player", "Target player", ArgTypes.STRING);
    RequiredArg<Double> amountArg = this.withRequiredArg("amount", "Amount to give", ArgTypes.DOUBLE);
    
    public EconomyGiveCommand() {
        super("give", "Give money to a player");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String targetName = playerArg.get(commandContext);
        double amount = amountArg.get(commandContext);
        
        // Give money logic...
        player.sendMessage(Message.raw("Gave $" + amount + " to " + targetName));
    }
}
```

**Usage:**
- `/economy` → Shows help
- `/economy give Steve 1000` → Executes sub-command

### Registration

Only register the **main** command:

```java
@Override
public void setup() {
    // ✓ Only register main command
    this.getCommandRegistry().registerCommand(new EconomyCommand());
    
    // ✗ Don't register sub-commands separately
    // this.getCommandRegistry().registerCommand(new EconomyGiveCommand());
}
```

## Complete Examples

### Example 1: Home Management System

```java
// Main command
public class HomeCommand extends AbstractPlayerCommand {
    public HomeCommand() {
        super("home", "Home management system");
        
        // Add all sub-commands
        addSubCommand(new HomeSetCommand());
        addSubCommand(new HomeDeleteCommand());
        addSubCommand(new HomeListCommand());
        addSubCommand(new HomeTeleportCommand());
    }
    
    @Override
    protected void execute(...) {
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
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String homeName = nameArg.get(commandContext);
        
        // Validate name
        if (!homeName.matches("[a-zA-Z0-9_]+")) {
            player.sendMessage(Message.raw("Home name can only contain letters, numbers, and underscores!"));
            return;
        }
        
        // Get current position
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        Vector3D position = transform.getPosition();
        
        // Save home
        saveHome(player.getUuid(), homeName, position, world.getName());
        player.sendMessage(Message.raw("Home '" + homeName + "' set!"));
    }
}

// Delete sub-command
public class HomeDeleteCommand extends AbstractPlayerCommand {
    RequiredArg<String> nameArg = this.withRequiredArg("name", "Home name", ArgTypes.STRING);
    
    public HomeDeleteCommand() {
        super("delete", "Delete a home");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String homeName = nameArg.get(commandContext);
        
        // Check if home exists
        if (!homeExists(player.getUuid(), homeName)) {
            player.sendMessage(Message.raw("Home '" + homeName + "' not found!"));
            return;
        }
        
        // Delete home
        deleteHome(player.getUuid(), homeName);
        player.sendMessage(Message.raw("Home '" + homeName + "' deleted!"));
    }
}

// List sub-command
public class HomeListCommand extends AbstractPlayerCommand {
    public HomeListCommand() {
        super("list", "List your homes");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        List<String> homes = getHomes(player.getUuid());
        
        if (homes.isEmpty()) {
            player.sendMessage(Message.raw("You don't have any homes set!"));
            return;
        }
        
        player.sendMessage(Message.raw("Your homes: " + String.join(", ", homes)));
    }
}

// Teleport sub-command
public class HomeTeleportCommand extends AbstractPlayerCommand {
    RequiredArg<String> nameArg = this.withRequiredArg("name", "Home name", ArgTypes.STRING);
    
    public HomeTeleportCommand() {
        super("tp", "Teleport to a home");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String homeName = nameArg.get(commandContext);
        
        // Get home data
        HomeData home = getHome(player.getUuid(), homeName);
        if (home == null) {
            player.sendMessage(Message.raw("Home '" + homeName + "' not found!"));
            return;
        }
        
        // Teleport (on main thread)
        world.getScheduler().runSync(() -> {
            TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
            transform.setPosition(home.getPosition());
            player.sendMessage(Message.raw("Teleported to home '" + homeName + "'!"));
        });
    }
}
```

**Usage:**
- `/home` → Shows help
- `/home set spawn` → Set home named "spawn"
- `/home list` → List all homes
- `/home tp spawn` → Teleport to "spawn" home
- `/home delete spawn` → Delete "spawn" home

### Example 2: Admin Tools

```java
public class AdminCommand extends AbstractPlayerCommand {
    public AdminCommand() {
        super("admin", "Admin tools");
        setPermissionGroup(GameMode.OPERATOR);
        
        addSubCommand(new AdminTeleportCommand());
        addSubCommand(new AdminKickCommand());
        addSubCommand(new AdminBanCommand());
        addSubCommand(new AdminMuteCommand());
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("ADMIN TOOLS"));
        player.sendMessage(Message.raw("/admin tp <player> - Teleport to player"));
        player.sendMessage(Message.raw("/admin kick <player> [reason] - Kick player"));
        player.sendMessage(Message.raw("/admin ban <player> [reason] - Ban player"));
        player.sendMessage(Message.raw("/admin mute <player> [duration] - Mute player"));
    }
}

public class AdminTeleportCommand extends AbstractPlayerCommand {
    RequiredArg<String> targetArg = this.withRequiredArg("player", "Target player", ArgTypes.STRING);
    
    public AdminTeleportCommand() {
        super("tp", "Teleport to a player");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String targetName = targetArg.get(commandContext);
        
        // Find target
        PlayerRef targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
        if (targetRef == null) {
            player.sendMessage(Message.raw("Player not found!"));
            return;
        }
        
        // Get target position
        TransformComponent targetTransform = targetRef.getStore().getComponent(
            targetRef.getRef(), TransformComponent.getComponentType()
        );
        
        // Teleport
        world.getScheduler().runSync(() -> {
            TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
            transform.setPosition(targetTransform.getPosition());
            player.sendMessage(Message.raw("Teleported to " + targetName));
        });
    }
}
```

### Example 3: Warp System

```java
public class WarpCommand extends AbstractPlayerCommand {
    public WarpCommand() {
        super("warp", "Warp management system");
        
        addSubCommand(new WarpCreateCommand());
        addSubCommand(new WarpDeleteCommand());
        addSubCommand(new WarpListCommand());
        addSubCommand(new WarpTeleportCommand());
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // If no sub-command, list warps
        List<String> warps = getAllWarps();
        if (warps.isEmpty()) {
            player.sendMessage(Message.raw("No warps available!"));
            return;
        }
        
        player.sendMessage(Message.raw("Available warps: " + String.join(", ", warps)));
        player.sendMessage(Message.raw("Use /warp <name> to teleport"));
    }
}

public class WarpTeleportCommand extends AbstractPlayerCommand {
    RequiredArg<String> nameArg = this.withRequiredArg("name", "Warp name", ArgTypes.STRING);
    
    public WarpTeleportCommand() {
        super("tp", "Teleport to a warp");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String warpName = nameArg.get(commandContext);
        
        WarpData warp = getWarp(warpName);
        if (warp == null) {
            player.sendMessage(Message.raw("Warp '" + warpName + "' not found!"));
            return;
        }
        
        // Teleport
        world.getScheduler().runSync(() -> {
            TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
            transform.setPosition(warp.getPosition());
            player.sendMessage(Message.raw("Teleported to warp '" + warpName + "'!"));
        });
    }
}
```

## Nested Sub-Commands

You can nest sub-commands multiple levels deep:

```java
// Main: /plugin
public class PluginCommand extends AbstractCommand {
    public PluginCommand() {
        super("plugin", "Plugin management");
        
        // Level 1 sub-commands
        addSubCommand(new PluginConfigCommand());
        addSubCommand(new PluginReloadCommand());
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        ctx.sendMessage(Message.raw("Plugin commands: config, reload"));
        return CompletableFuture.completedFuture(null);
    }
}

// Level 1: /plugin config
public class PluginConfigCommand extends AbstractCommand {
    public PluginConfigCommand() {
        super("config", "Configuration management");
        
        // Level 2 sub-commands
        addSubCommand(new PluginConfigSetCommand());
        addSubCommand(new PluginConfigGetCommand());
        addSubCommand(new PluginConfigListCommand());
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        ctx.sendMessage(Message.raw("Config commands: set, get, list"));
        return CompletableFuture.completedFuture(null);
    }
}

// Level 2: /plugin config set
public class PluginConfigSetCommand extends AbstractCommand {
    RequiredArg<String> keyArg = withRequiredArg("key", "Config key", ArgTypes.STRING);
    RequiredArg<String> valueArg = withRequiredArg("value", "Config value", ArgTypes.STRING);
    
    public PluginConfigSetCommand() {
        super("set", "Set a config value");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        String key = keyArg.get(ctx);
        String value = valueArg.get(ctx);
        
        setConfig(key, value);
        ctx.sendMessage(Message.raw("Set " + key + " = " + value));
        return CompletableFuture.completedFuture(null);
    }
}
```

**Usage:**
- `/plugin` → Shows level 1 commands
- `/plugin config` → Shows level 2 commands
- `/plugin config set mykey myvalue` → Executes final command

## Sub-Command from JavaScript

Our JavaScriptCommand supports sub-commands:

```java
public class JavaScriptCommand extends AbstractPlayerCommand {
    // ... existing code ...
    
    public void addJavaScriptSubCommand(JavaScriptCommand subCommand) {
        addSubCommand(subCommand);
    }
}
```

**JavaScript usage:**
```javascript
// Main command
const mainCmd = commands.create('economy', 'Economy system');

// Sub-commands
const giveCmd = commands.create('give', 'Give money');
giveCmd.addRequiredStringArg('player', 'Target player');
giveCmd.addRequiredIntArg('amount', 'Money amount');
giveCmd.setHandler((ctx) => {
    const target = ctx.args.player;
    const amount = ctx.args.amount;
    ctx.player.sendMessage(`Gave $${amount} to ${target}`);
});

// Add sub-command to main
mainCmd.addSubCommand(giveCmd);

// Register only main command
commands.register(mainCmd);
```

## Common Patterns

### Pattern 1: Help Sub-Command

```java
public class MyCommand extends AbstractPlayerCommand {
    public MyCommand() {
        super("mycommand", "My command system");
        
        addSubCommand(new MyActionCommand());
        addSubCommand(new MyHelpCommand());  // Explicit help
    }
    
    @Override
    protected void execute(...) {
        // Default shows help
        Player player = store.getComponent(ref, Player.getComponentType());
        showHelp(player);
    }
}

public class MyHelpCommand extends AbstractPlayerCommand {
    public MyHelpCommand() {
        super("help", "Show help");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        showHelp(player);
    }
}
```

### Pattern 2: Permission Per Sub-Command

```java
public class EconomyGiveCommand extends AbstractPlayerCommand {
    public EconomyGiveCommand() {
        super("give", "Give money");
        setPermissionGroup(GameMode.OPERATOR);  // Only operators
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Additional check
        if (!player.hasPermission("economy.admin.give")) {
            player.sendMessage(Message.raw("No permission!"));
            return;
        }
        
        // Give money logic...
    }
}
```

### Pattern 3: Shared Arguments

```java
public abstract class BaseEconomyCommand extends AbstractPlayerCommand {
    protected RequiredArg<String> playerArg = this.withRequiredArg("player", "Target player", ArgTypes.STRING);
    protected RequiredArg<Double> amountArg = this.withRequiredArg("amount", "Money amount", ArgTypes.DOUBLE);
    
    public BaseEconomyCommand(String name, String description) {
        super(name, description);
    }
    
    protected Player findPlayer(CommandContext ctx, Store<EntityStore> store, Ref<EntityStore> ref) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String targetName = playerArg.get(ctx);
        
        PlayerRef targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
        if (targetRef == null) {
            player.sendMessage(Message.raw("Player not found!"));
            return null;
        }
        
        return targetRef.getStore().getComponent(targetRef.getRef(), Player.getComponentType());
    }
}

public class EconomyGiveCommand extends BaseEconomyCommand {
    public EconomyGiveCommand() {
        super("give", "Give money");
    }
    
    @Override
    protected void execute(...) {
        Player sender = store.getComponent(ref, Player.getComponentType());
        Player target = findPlayer(commandContext, store, ref);
        if (target == null) return;
        
        double amount = amountArg.get(commandContext);
        // Give money...
    }
}
```

## Best Practices

### ✅ Do

1. **Provide help in main command:**
   ```java
   @Override
   protected void execute(...) {
       showHelp(player);  // When no sub-command used
   }
   ```

2. **Use consistent naming:**
   ```java
   // ✓ Good
   /home set
   /home delete
   /home list
   
   // ✗ Bad
   /home set
   /home remove  // Should be "delete" to match pattern
   /home show    // Should be "list"
   ```

3. **Group related functionality:**
   ```java
   /economy give
   /economy take
   /economy balance
   ```

4. **Set appropriate permissions:**
   ```java
   public AdminSubCommand() {
       super("admin", "Admin action");
       setPermissionGroup(GameMode.OPERATOR);
   }
   ```

### ❌ Don't

1. **Don't register sub-commands:**
   ```java
   // ❌ Wrong
   registry.registerCommand(new MainCommand());
   registry.registerCommand(new SubCommand());  // Don't do this!
   
   // ✅ Correct
   registry.registerCommand(new MainCommand());  // Only main
   ```

2. **Don't create too many levels:**
   ```java
   // ❌ Too deep
   /plugin config database mysql settings connection timeout
   
   // ✅ Better
   /plugin db timeout <value>
   ```

3. **Don't forget help:**
   ```java
   // ❌ No help
   @Override
   protected void execute(...) {
       // Nothing here!
   }
   
   // ✅ Provide help
   @Override
   protected void execute(...) {
       showAvailableCommands(player);
   }
   ```

## What's Next?

- [**Permissions →**](07-permissions.md) - Control command access
- [**Complete Examples →**](11-complete-example.md) - Full implementations
- [**Troubleshooting →**](12-troubleshooting.md) - Common issues

---

[← Command Arguments](05-arguments.md) | [Back to Index](README.md) | [Permissions →](07-permissions.md)
