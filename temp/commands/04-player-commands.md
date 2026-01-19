# Player Commands with AbstractPlayerCommand

[← Basic Commands](03-basic-commands.md) | [Back to Index](README.md) | [Command Arguments →](05-arguments.md)

## Introduction

`AbstractPlayerCommand` is specifically designed for commands that **must** be executed by a player. It extends `AbstractAsyncCommand`, providing automatic player validation, direct access to player components via ECS, and async execution.

## Why Use AbstractPlayerCommand?

✅ **Use AbstractPlayerCommand when:**
- Command specifically needs player context
- You want to use Entity Component System (ECS)
- You need access to player components (Transform, Inventory, etc.)
- You want automatic "player-only" validation
- You need PlayerRef, World, or entity Store

❌ **Don't use when:**
- Command should work from console
- Command is purely administrative
- ↳ Use `AbstractCommand` instead

## Key Features

| Feature | Description |
|---------|-------------|
| **Player-only** | Automatically rejects non-player senders |
| **Async execution** | Runs off main server thread (extends AbstractAsyncCommand) |
| **ECS access** | Direct access to EntityStore, Ref, PlayerRef |
| **World access** | Get the world where command was executed |
| **Component access** | Easy access to player components |

## Basic Structure

```java
public class MyPlayerCommand extends AbstractPlayerCommand {
    
    public MyPlayerCommand() {
        super("commandname", "Command description");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        // Command logic here
        // No return statement needed!
    }
}
```

## Execute Method Parameters

Understanding what each parameter provides:

```java
@Override
protected void execute(
    @Nonnull CommandContext commandContext,  // 1. Execution context
    @Nonnull Store<EntityStore> store,       // 2. Entity component store
    @Nonnull Ref<EntityStore> ref,           // 3. Entity reference (player)
    @Nonnull PlayerRef playerRef,            // 4. Player reference wrapper
    @Nonnull World world                     // 5. World instance
) {
```

### 1. CommandContext

Access to command information:

```java
// Send message to player
commandContext.sendMessage(Message.raw("Hello!"));

// Get command source
CommandSource source = commandContext.source();

// Get argument values (if defined)
String arg = myArgument.get(commandContext);
```

### 2. Store<EntityStore>

The entity component storage system:

```java
// Get player component
Player player = store.getComponent(ref, Player.getComponentType());

// Get transform component (position/rotation)
TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());

// Get UUID component
UUIDComponent uuid = store.getComponent(ref, UUIDComponent.getComponentType());

// Get inventory component
InventoryComponent inventory = store.getComponent(ref, InventoryComponent.getComponentType());
```

### 3. Ref<EntityStore>

Reference to the player entity:

```java
// Used with store to get components
Player player = store.getComponent(ref, Player.getComponentType());
```

### 4. PlayerRef

Player reference wrapper with utility methods:

```java
// Get store from PlayerRef
Store<EntityStore> refStore = playerRef.getStore();

// Get ref from PlayerRef
Ref<EntityStore> refEntity = playerRef.getRef();

// Check if player is still valid
if (playerRef.isValid()) {
    // Player is online
}
```

### 5. World

The world where command was executed:

```java
// Get world name
String worldName = world.getName();

// Spawn entity in world
world.spawnEntity(entityType, position);

// Get world time
long time = world.getTime();
```

## Complete Examples

### Example 1: Position Command

```java
package com.yourplugin.commands;

import com.hypixel.hytale.component.Ref;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.component.components.TransformComponent;
import com.hypixel.hytale.math.Vector3D;
import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.command.system.CommandContext;
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.universe.PlayerRef;
import com.hypixel.hytale.server.core.universe.world.World;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;

import javax.annotation.Nonnull;

public class PositionCommand extends AbstractPlayerCommand {
    
    public PositionCommand() {
        super("pos", "Show your current position");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        // Get player component
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Get transform component for position
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        Vector3D position = transform.getPosition();
        
        // Format position
        String pos = String.format("X: %.1f, Y: %.1f, Z: %.1f", 
            position.getX(), position.getY(), position.getZ());
        
        // Send to player
        player.sendMessage(Message.raw("Your position: " + pos));
        player.sendMessage(Message.raw("World: " + world.getName()));
    }
}
```

### Example 2: Heal Command

```java
public class HealCommand extends AbstractPlayerCommand {
    
    public HealCommand() {
        super("heal", "Restore your health");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Check permission
        if (!player.hasPermission("yourplugin.heal")) {
            player.sendMessage(Message.raw("You don't have permission!"));
            return;
        }
        
        // Get health component
        HealthComponent health = store.getComponent(ref, HealthComponent.getComponentType());
        
        // Heal player (schedule on main thread if needed)
        float maxHealth = health.getMaxHealth();
        health.setHealth(maxHealth);
        
        player.sendMessage(Message.raw("You have been healed!"));
    }
}
```

### Example 3: Teleport to Player Command

```java
public class TeleportCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> targetArg = this.withRequiredArg("player", "Player to teleport to", ArgTypes.STRING);
    
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
        
        // Find target player
        PlayerRef targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
        if (targetRef == null) {
            player.sendMessage(Message.raw("Player not found: " + targetName));
            return;
        }
        
        // Get target position
        TransformComponent targetTransform = targetRef.getStore().getComponent(
            targetRef.getRef(), 
            TransformComponent.getComponentType()
        );
        Vector3D targetPos = targetTransform.getPosition();
        
        // Get own transform
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        
        // Teleport (needs main thread!)
        world.getScheduler().runSync(() -> {
            transform.setPosition(targetPos);
            player.sendMessage(Message.raw("Teleported to " + targetName + "!"));
        });
    }
}
```

### Example 4: Give Item Command

```java
public class GiveCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> itemArg = this.withRequiredArg("item", "Item to give", ArgTypes.STRING);
    OptionalArg<Integer> amountArg = this.withOptionalArg("amount", "Amount", ArgTypes.INTEGER);
    
    public GiveCommand() {
        super("give", "Give yourself an item");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        String itemName = itemArg.get(commandContext);
        Integer amount = amountArg.get(commandContext);
        if (amount == null) amount = 1;
        
        // Validate amount
        if (amount < 1 || amount > 64) {
            player.sendMessage(Message.raw("Amount must be between 1 and 64!"));
            return;
        }
        
        // Get inventory component
        InventoryComponent inventory = store.getComponent(ref, InventoryComponent.getComponentType());
        
        // Create and give item (pseudo-code)
        ItemStack item = createItem(itemName, amount);
        if (item == null) {
            player.sendMessage(Message.raw("Invalid item: " + itemName));
            return;
        }
        
        inventory.addItem(item);
        player.sendMessage(Message.raw("Given " + amount + "x " + itemName));
    }
}
```

## Accessing Player Components

### Common Components

```java
// Player component - player-specific data
Player player = store.getComponent(ref, Player.getComponentType());
String name = player.getDisplayName();
UUID uuid = player.getUuid();

// Transform component - position/rotation
TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
Vector3D position = transform.getPosition();
Rotation rotation = transform.getRotation();

// UUID component - entity UUID
UUIDComponent uuidComp = store.getComponent(ref, UUIDComponent.getComponentType());
UUID entityUuid = uuidComp.getUuid();

// Inventory component - player inventory
InventoryComponent inventory = store.getComponent(ref, InventoryComponent.getComponentType());

// Health component - player health
HealthComponent health = store.getComponent(ref, HealthComponent.getComponentType());
float currentHealth = health.getHealth();
float maxHealth = health.getMaxHealth();
```

### Component Pattern

```java
@Override
protected void execute(...) {
    // 1. Get Player component for messaging
    Player player = store.getComponent(ref, Player.getComponentType());
    
    // 2. Get other components as needed
    TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
    
    // 3. Use components
    Vector3D pos = transform.getPosition();
    player.sendMessage(Message.raw("Position: " + pos));
}
```

## Threading Considerations

**CRITICAL:** `AbstractPlayerCommand` extends `AbstractAsyncCommand`, meaning commands execute **off the main server thread**.

### Safe Operations (Async)

✅ These are safe to do directly:
- Read component data
- Send messages to players
- Database queries
- File I/O
- Math calculations
- Data processing

```java
@Override
protected void execute(...) {
    Player player = store.getComponent(ref, Player.getComponentType());
    TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
    
    // ✅ Safe - reading data
    Vector3D pos = transform.getPosition();
    
    // ✅ Safe - sending message
    player.sendMessage(Message.raw("Position: " + pos));
    
    // ✅ Safe - database query
    loadPlayerDataFromDatabase(player.getUuid());
}
```

### Unsafe Operations (Need Main Thread)

❌ These need to be scheduled on main thread:
- Modifying world
- Teleporting players
- Spawning entities
- Changing blocks
- Inventory modifications

```java
@Override
protected void execute(...) {
    Player player = store.getComponent(ref, Player.getComponentType());
    TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
    
    // ❌ Wrong - modifying world on async thread
    transform.setPosition(newPosition);
    
    // ✅ Correct - schedule on main thread
    world.getScheduler().runSync(() -> {
        transform.setPosition(newPosition);
        player.sendMessage(Message.raw("Teleported!"));
    });
}
```

### Thread-Safe Pattern

```java
@Override
protected void execute(...) {
    Player player = store.getComponent(ref, Player.getComponentType());
    
    // 1. Do async work first (database, calculations)
    PlayerData data = loadFromDatabase(player.getUuid());
    Vector3D targetPos = calculatePosition(data);
    
    // 2. Schedule world modifications on main thread
    world.getScheduler().runSync(() -> {
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        transform.setPosition(targetPos);
        player.sendMessage(Message.raw("Teleported!"));
    });
}
```

## Permission Checking

### Basic Permission Check

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

### Permission with GameMode

```java
public class AdminCommand extends AbstractPlayerCommand {
    public AdminCommand() {
        super("admin", "Admin command");
        setPermissionGroup(GameMode.OPERATOR);  // Operator only
    }
    
    @Override
    protected void execute(...) {
        // Only operators can reach here
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Admin command executed!"));
    }
}
```

### Multiple Permission Levels

```java
@Override
protected void execute(...) {
    Player player = store.getComponent(ref, Player.getComponentType());
    
    if (player.hasPermission("plugin.admin")) {
        // Admin features
        player.sendMessage(Message.raw("Admin mode enabled!"));
    } else if (player.hasPermission("plugin.vip")) {
        // VIP features
        player.sendMessage(Message.raw("VIP mode enabled!"));
    } else if (player.hasPermission("plugin.basic")) {
        // Basic features
        player.sendMessage(Message.raw("Basic mode enabled!"));
    } else {
        player.sendMessage(Message.raw("No permission!"));
        return;
    }
}
```

## Best Practices

### ✅ Do

1. **Always get Player component first:**
   ```java
   Player player = store.getComponent(ref, Player.getComponentType());
   ```

2. **Check permissions when needed:**
   ```java
   if (!player.hasPermission("plugin.use")) {
       player.sendMessage(Message.raw("No permission!"));
       return;
   }
   ```

3. **Schedule world modifications:**
   ```java
   world.getScheduler().runSync(() -> {
       // Modify world here
   });
   ```

4. **Validate arguments:**
   ```java
   if (amount < 1 || amount > 64) {
       player.sendMessage(Message.raw("Invalid amount!"));
       return;
   }
   ```

5. **Provide clear feedback:**
   ```java
   player.sendMessage(Message.raw("Success!"));
   ```

### ❌ Don't

1. **Don't modify world on async thread:**
   ```java
   // ❌ Wrong
   transform.setPosition(newPos);  // On async thread!
   ```

2. **Don't forget to get Player component:**
   ```java
   // ❌ Wrong
   commandContext.sender().sendMessage(...);  // Use Player component instead
   ```

3. **Don't cast sender:**
   ```java
   // ❌ Wrong
   Player player = (Player) commandContext.sender();
   
   // ✅ Correct
   Player player = store.getComponent(ref, Player.getComponentType());
   ```

4. **Don't use for console commands:**
   ```java
   // ❌ Wrong - use AbstractCommand if console should work
   public class ReloadCommand extends AbstractPlayerCommand { ... }
   ```

## Common Patterns

### Pattern 1: Simple Player Command

```java
public class PingCommand extends AbstractPlayerCommand {
    public PingCommand() {
        super("ping", "Check server response");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Pong!"));
    }
}
```

### Pattern 2: Command with Validation

```java
public class FlyCommand extends AbstractPlayerCommand {
    public FlyCommand() {
        super("fly", "Toggle flight");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Permission check
        if (!player.hasPermission("plugin.fly")) {
            player.sendMessage(Message.raw("No permission!"));
            return;
        }
        
        // Toggle flight
        boolean flying = toggleFlight(player);
        player.sendMessage(Message.raw(flying ? "Flight enabled!" : "Flight disabled!"));
    }
}
```

### Pattern 3: Command with World Modification

```java
public class SpawnCommand extends AbstractPlayerCommand {
    public SpawnCommand() {
        super("spawn", "Teleport to spawn");
    }
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        Vector3D spawnPos = getSpawnPosition(world);
        
        // Schedule on main thread
        world.getScheduler().runSync(() -> {
            TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
            transform.setPosition(spawnPos);
            player.sendMessage(Message.raw("Teleported to spawn!"));
        });
    }
}
```

## What's Next?

- [**Command Arguments →**](05-arguments.md) - Add typed parameters
- [**Sub-Commands →**](06-subcommands.md) - Create command hierarchies
- [**Async Commands →**](08-async-commands.md) - Deep dive into threading

---

[← Basic Commands](03-basic-commands.md) | [Back to Index](README.md) | [Command Arguments →](05-arguments.md)
