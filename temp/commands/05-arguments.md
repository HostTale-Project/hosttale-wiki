# Command Arguments

[← Player Commands](04-player-commands.md) | [Back to Index](README.md) | [Sub-Commands →](06-subcommands.md)

## Introduction

Command arguments allow commands to accept parameters from users. Hytale's command system provides type-safe arguments with automatic parsing and validation.

## Argument Types

### Required vs Optional

| Type | When to Use | Behavior if Missing |
|------|-------------|-------------------|
| `RequiredArg<T>` | Argument must be provided | Command fails with error |
| `OptionalArg<T>` | Argument is optional | Returns `null` if not provided |

## Available ArgTypes

### Basic Types

```java
// String - any text
ArgTypes.STRING

// Integer - whole numbers
ArgTypes.INTEGER

// Boolean - true/false
ArgTypes.BOOLEAN

// Float - decimal numbers
ArgTypes.FLOAT

// Double - high-precision decimals
ArgTypes.DOUBLE

// UUID - unique identifiers
ArgTypes.UUID
```

### Type Compatibility

| ArgType | Java Type | Example Values |
|---------|-----------|----------------|
| `STRING` | `String` | `"hello"`, `"world"`, `"test 123"` |
| `INTEGER` | `Integer` | `1`, `42`, `-10`, `1000` |
| `BOOLEAN` | `Boolean` | `true`, `false` |
| `FLOAT` | `Float` | `1.5`, `3.14`, `-0.5` |
| `DOUBLE` | `Double` | `1.5`, `3.14159265`, `-0.5` |
| `UUID` | `UUID` | `550e8400-e29b-41d4-a716-446655440000` |

## Defining Arguments

### Required Arguments

```java
public class TeleportCommand extends AbstractPlayerCommand {
    
    // Define as field
    RequiredArg<String> playerArg = this.withRequiredArg(
        "player",              // Argument name
        "Player to teleport to", // Description
        ArgTypes.STRING        // Type
    );
    
    public TeleportCommand() {
        super("tp", "Teleport to player");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        // Get argument value
        String playerName = playerArg.get(ctx);
        
        // Use value...
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Teleporting to: " + playerName));
    }
}
```

**Usage:** `/tp Steve` (required)

### Optional Arguments

```java
public class GiveCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> itemArg = this.withRequiredArg("item", "Item to give", ArgTypes.STRING);
    OptionalArg<Integer> amountArg = this.withOptionalArg("amount", "Amount (default: 1)", ArgTypes.INTEGER);
    
    public GiveCommand() {
        super("give", "Give yourself an item");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        String item = itemArg.get(ctx);
        Integer amount = amountArg.get(ctx);
        
        // Handle null for optional
        if (amount == null) {
            amount = 1;  // Default value
        }
        
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Giving " + amount + "x " + item));
    }
}
```

**Usage:**
- `/give diamond` → 1 diamond (default)
- `/give diamond 64` → 64 diamonds

## Multiple Arguments

### Sequential Arguments

```java
public class TeleportToCommand extends AbstractPlayerCommand {
    
    RequiredArg<Double> xArg = this.withRequiredArg("x", "X coordinate", ArgTypes.DOUBLE);
    RequiredArg<Double> yArg = this.withRequiredArg("y", "Y coordinate", ArgTypes.DOUBLE);
    RequiredArg<Double> zArg = this.withRequiredArg("z", "Z coordinate", ArgTypes.DOUBLE);
    
    public TeleportToCommand() {
        super("tpto", "Teleport to coordinates");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        double x = xArg.get(ctx);
        double y = yArg.get(ctx);
        double z = zArg.get(ctx);
        
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Teleporting to: " + x + ", " + y + ", " + z));
        
        // Teleport logic...
    }
}
```

**Usage:** `/tpto 100 64 -50`

### Mixed Required and Optional

```java
public class KickCommand extends AbstractCommand {
    
    RequiredArg<String> playerArg = this.withRequiredArg("player", "Player to kick", ArgTypes.STRING);
    OptionalArg<String> reasonArg = this.withOptionalArg("reason", "Kick reason", ArgTypes.STRING);
    
    public KickCommand() {
        super("kick", "Kick a player");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        String playerName = playerArg.get(ctx);
        String reason = reasonArg.get(ctx);
        
        if (reason == null) {
            reason = "Kicked by an administrator";
        }
        
        ctx.sendMessage(Message.raw("Kicking " + playerName + ": " + reason));
        // Kick logic...
        
        return CompletableFuture.completedFuture(null);
    }
}
```

**Usage:**
- `/kick Steve` → Default reason
- `/kick Steve Bad behavior` → Custom reason

## Argument Validation

### Validate After Getting

```java
@Override
protected void execute(@Nonnull CommandContext ctx, ...) {
    Integer amount = amountArg.get(ctx);
    if (amount == null) amount = 1;
    
    // Validate range
    if (amount < 1 || amount > 64) {
        Player player = store.getComponent(ref, Player.getComponentType());
            player.sendMessage(Message.raw("Amount must be between 1 and 64!"));
    // Proceed with valid amount
    giveItems(amount);
}
```

### Validate String Format

```java
@Override
protected void execute(@Nonnull CommandContext ctx, ...) {
    String name = nameArg.get(ctx);
    
    // Validate length
    if (name.length() < 3 || name.length() > 16) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Name must be 3-16 characters!"));
        return;
    }
    
    // Validate characters
    if (!name.matches("[a-zA-Z0-9_]+")) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Name can only contain letters, numbers, and underscores!"));
        return;
    }
    
    // Proceed with valid name
}
```

### Validate Number Range

```java
@Override
protected void execute(@Nonnull CommandContext ctx, ...) {
    Double radius = radiusArg.get(ctx);
    if (radius == null) radius = 10.0;
    
    // Validate range
    if (radius < 1.0) {
        player.sendMessage(Message.raw("Radius must be at least 1!"));
        return;
    }
    
    if (radius > 100.0) {
        player.sendMessage(Message.raw("Radius cannot exceed 100!"));
        return;
    }
    
    // Use valid radius
}
```

## Complete Examples

### Example 1: Time Command

```java
public class TimeCommand extends AbstractCommand {
    
    RequiredArg<String> actionArg = this.withRequiredArg("action", "set/add/query", ArgTypes.STRING);
    OptionalArg<Integer> valueArg = this.withOptionalArg("value", "Time value", ArgTypes.INTEGER);
    
    public TimeCommand() {
        super("time", "Manage world time");
    }
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        String action = actionArg.get(ctx);
        Integer value = valueArg.get(ctx);
        
        // Get world (from player or default)
        World world = getTargetWorld(ctx);
        
        switch (action.toLowerCase()) {
            case "set":
                if (value == null) {
                    ctx.sendMessage(Message.raw("Usage: /time set <value>"));
                    break;
                }
                world.setTime(value);
                ctx.sendMessage(Message.raw("Time set to " + value));
                break;
                
            case "add":
                if (value == null) {
                    ctx.sendMessage(Message.raw("Usage: /time add <value>"));
                    break;
                }
                long newTime = world.getTime() + value;
                world.setTime(newTime);
                ctx.sendMessage(Message.raw("Added " + value + " to time"));
                break;
                
            case "query":
                long currentTime = world.getTime();
                ctx.sendMessage(Message.raw("Current time: " + currentTime));
                break;
                
            default:
                ctx.sendMessage(Message.raw("Invalid action! Use: set, add, or query"));
                break;
        }
        
        return CompletableFuture.completedFuture(null);
    }
}
```

**Usage:**
- `/time set 1000` → Set time to 1000
- `/time add 500` → Add 500 to current time
- `/time query` → Show current time

### Example 2: Money Command

```java
public class MoneyCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> actionArg = this.withRequiredArg("action", "give/take/set", ArgTypes.STRING);
    RequiredArg<String> playerArg = this.withRequiredArg("player", "Target player", ArgTypes.STRING);
    RequiredArg<Double> amountArg = this.withRequiredArg("amount", "Money amount", ArgTypes.DOUBLE);
    
    public MoneyCommand() {
        super("money", "Manage player money");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Check permission
        if (!player.hasPermission("economy.admin")) {
            player.sendMessage(Message.raw("No permission!"));
            return;
        }
        
        String action = actionArg.get(ctx);
        String targetName = playerArg.get(ctx);
        double amount = amountArg.get(ctx);
        
        // Validate amount
        if (amount <= 0) {
            player.sendMessage(Message.raw("Amount must be positive!"));
            return;
        }
        
        // Find target player
        PlayerRef targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
        if (targetRef == null) {
            player.sendMessage(Message.raw("Player not found: " + targetName));
            return;
        }
        
        // Perform action
        switch (action.toLowerCase()) {
            case "give":
                addMoney(targetRef, amount);
                player.sendMessage(Message.raw("Gave $" + amount + " to " + targetName));
                break;
                
            case "take":
                removeMoney(targetRef, amount);
                player.sendMessage(Message.raw("Took $" + amount + " from " + targetName));
                break;
                
            case "set":
                setMoney(targetRef, amount);
                player.sendMessage(Message.raw("Set " + targetName + "'s balance to $" + amount));
                break;
                
            default:
                player.sendMessage(Message.raw("Invalid action! Use: give, take, or set"));
                break;
        }
    }
}
```

**Usage:**
- `/money give Steve 1000` → Give $1000 to Steve
- `/money take Alex 500` → Take $500 from Alex
- `/money set Bob 10000` → Set Bob's balance to $10000

### Example 3: Gamemode Command

```java
public class GamemodeCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> modeArg = this.withRequiredArg("mode", "survival/creative/adventure", ArgTypes.STRING);
    OptionalArg<String> targetArg = this.withOptionalArg("player", "Target player (default: self)", ArgTypes.STRING);
    
    public GamemodeCommand() {
        super("gamemode", "Change gamemode");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        String mode = modeArg.get(ctx);
        String targetName = targetArg.get(ctx);
        
        // Determine target
        PlayerRef targetRef;
        if (targetName == null) {
            // Self
            targetRef = playerRef;
        } else {
            // Check permission for others
            if (!player.hasPermission("gamemode.others")) {
                player.sendMessage(Message.raw("You can't change others' gamemode!"));
                return;
            }
            
            targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
            if (targetRef == null) {
                player.sendMessage(Message.raw("Player not found: " + targetName));
                return;
            }
        }
        
        // Parse gamemode
        GameMode gameMode;
        switch (mode.toLowerCase()) {
            case "survival":
            case "s":
            case "0":
                gameMode = GameMode.SURVIVAL;
                break;
            case "creative":
            case "c":
            case "1":
                gameMode = GameMode.CREATIVE;
                break;
            case "adventure":
            case "a":
            case "2":
                gameMode = GameMode.ADVENTURE;
                break;
            default:
                player.sendMessage(Message.raw("Invalid gamemode: " + mode));
                return;
        }
        
        // Set gamemode
        Player target = targetRef.getStore().getComponent(targetRef.getRef(), Player.getComponentType());
        target.setGameMode(gameMode);
        
        if (targetName == null) {
            player.sendMessage(Message.raw("Gamemode set to " + gameMode.name()));
        } else {
            player.sendMessage(Message.raw("Set " + targetName + "'s gamemode to " + gameMode.name()));
        }
    }
}
```

**Usage:**
- `/gamemode creative` → Set own gamemode to creative
- `/gamemode survival Steve` → Set Steve's gamemode to survival
- `/gamemode c` → Shortcut for creative

## Argument Patterns

### Pattern 1: Flag Arguments

```java
public class TeleportCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> targetArg = this.withRequiredArg("target", "Target player", ArgTypes.STRING);
    OptionalArg<Boolean> silentArg = this.withOptionalArg("silent", "Silent teleport", ArgTypes.BOOLEAN);
    
    @Override
    protected void execute(...) {
        String target = targetArg.get(ctx);
        Boolean silent = silentArg.get(ctx);
        if (silent == null) silent = false;
        
        // Teleport logic...
        
        if (!silent) {
            player.sendMessage(Message.raw("Teleported to " + target));
        }
    }
}
```

**Usage:**
- `/tp Steve` → Normal teleport with message
- `/tp Steve true` → Silent teleport

### Pattern 2: Enum-like String Arguments

```java
public class WeatherCommand extends AbstractCommand {
    
    RequiredArg<String> typeArg = this.withRequiredArg("type", "clear/rain/storm", ArgTypes.STRING);
    
    @Override
    public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
        String type = typeArg.get(ctx).toLowerCase();
        
        // Validate against allowed values
        if (!type.equals("clear") && !type.equals("rain") && !type.equals("storm")) {
            ctx.sendMessage(Message.raw("Invalid weather type! Use: clear, rain, or storm"));
            return CompletableFuture.completedFuture(null);
        }
        
        // Set weather...
        ctx.sendMessage(Message.raw("Weather set to " + type));
        return CompletableFuture.completedFuture(null);
    }
}
```

### Pattern 3: Coordinate Arguments

```java
public class SetSpawnCommand extends AbstractPlayerCommand {
    
    OptionalArg<Double> xArg = this.withOptionalArg("x", "X coordinate", ArgTypes.DOUBLE);
    OptionalArg<Double> yArg = this.withOptionalArg("y", "Y coordinate", ArgTypes.DOUBLE);
    OptionalArg<Double> zArg = this.withOptionalArg("z", "Z coordinate", ArgTypes.DOUBLE);
    
    @Override
    protected void execute(...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        
        // Get coordinates (use current position if not provided)
        Vector3D currentPos = transform.getPosition();
        double x = xArg.get(ctx) != null ? xArg.get(ctx) : currentPos.getX();
        double y = yArg.get(ctx) != null ? yArg.get(ctx) : currentPos.getY();
        double z = zArg.get(ctx) != null ? zArg.get(ctx) : currentPos.getZ();
        
        // Set spawn...
        player.sendMessage(Message.raw("Spawn set to: " + x + ", " + y + ", " + z));
    }
}
```

**Usage:**
- `/setspawn` → Use current position
- `/setspawn 100 64 -50` → Use specified coordinates
- `/setspawn 100` → X=100, use current Y and Z

## Best Practices

### ✅ Do

1. **Provide clear descriptions:**
   ```java
   withRequiredArg("amount", "Number of items (1-64)", ArgTypes.INTEGER)
   ```

2. **Validate all inputs:**
   ```java
   if (amount < 1 || amount > 64) {
       player.sendMessage(Message.raw("Invalid amount!"));
       return;
   }
   ```

3. **Handle null for optional arguments:**
   ```java
   Integer amount = amountArg.get(ctx);
   if (amount == null) amount = 1;  // Default
   ```

4. **Use appropriate types:**
   ```java
   // ✓ Use INTEGER for whole numbers
   RequiredArg<Integer> countArg = this.withRequiredArg("count", "Item count", ArgTypes.INTEGER);
   
   // ✓ Use DOUBLE for decimals
   RequiredArg<Double> radiusArg = this.withRequiredArg("radius", "Effect radius", ArgTypes.DOUBLE);
   ```

5. **Provide usage hints on error:**
   ```java
   if (value == null) {
       ctx.sendMessage(Message.raw("Usage: /command <required> [optional]"));
       return;
   }
   ```

### ❌ Don't

1. **Don't forget null checks:**
   ```java
   // ❌ Wrong - will throw NullPointerException
   Integer amount = optionalArg.get(ctx);
   if (amount > 10) { ... }
   
   // ✅ Correct
   Integer amount = optionalArg.get(ctx);
   if (amount != null && amount > 10) { ... }
   ```

2. **Don't use wrong types:**
   ```java
   // ❌ Wrong - use INTEGER
   RequiredArg<String> amountArg = withRequiredArg("amount", "...", ArgTypes.STRING);
   int amount = Integer.parseInt(amountArg.get(ctx));  // Manual parsing!
   
   // ✅ Correct
   RequiredArg<Integer> amountArg = withRequiredArg("amount", "...", ArgTypes.INTEGER);
   int amount = amountArg.get(ctx);  // Automatic parsing
   ```

3. **Don't skip validation:**
   ```java
   // ❌ Wrong - no validation
   double radius = radiusArg.get(ctx);
   performAction(radius);  // Could be negative or too large!
   
   // ✅ Correct
   double radius = radiusArg.get(ctx);
   if (radius < 0 || radius > 100) {
       player.sendMessage(Message.raw("Invalid radius!"));
       return;
   }
   performAction(radius);
   ```

## What's Next?

- [**Sub-Commands →**](06-subcommands.md) - Create command hierarchies
- [**Permissions →**](07-permissions.md) - Control command access
- [**Complete Examples →**](11-complete-example.md) - See full implementations

---

[← Player Commands](04-player-commands.md) | [Back to Index](README.md) | [Sub-Commands →](06-subcommands.md)
