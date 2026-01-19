# Troubleshooting Common Issues

[← Complete Examples](11-complete-example.md) | [Back to Index](README.md)

## Command Not Found

### Problem: `/mycommand` says "Unknown command"

**Causes:**
1. Command not registered
2. Plugin not loading
3. Typo in command name

**Solutions:**

1. **Check registration:**
   ```java
   @Override
   public void setup() {
       this.getCommandRegistry().registerCommand(new MyCommand());
       getLogger().atInfo().log("MyCommand registered!");  // Check logs
   }
   ```

2. **Verify plugin is loading:**
   ```
   Check server console for:
   [INFO] Loading plugin: YourPlugin
   ```

3. **Match command name:**
   ```java
   // Command class
   public MyCommand() {
       super("mycommand", "Description");  // Must match
   }
   
   // Usage
   /mycommand  // Must match exactly
   ```

### Problem: Sub-command not working

❌ **Wrong:**
```java
// Don't register sub-commands!
registry.registerCommand(new MainCommand());
registry.registerCommand(new SubCommand());
```

✅ **Correct:**
```java
public class MainCommand extends AbstractPlayerCommand {
    public MainCommand() {
        super("main", "Main command");
        addSubCommand(new SubCommand());  // Add, don't register
    }
}

registry.registerCommand(new MainCommand());  // Only register main
```

## Argument Issues

### Problem: NullPointerException when getting argument

**Error:**
```
java.lang.NullPointerException
    at YourCommand.execute(YourCommand.java:25)
```

**Cause:** Optional argument is null

❌ **Wrong:**
```java
Integer amount = optionalArg.get(ctx);
if (amount > 10) {  // NPE if null!
    // ...
}
```

✅ **Correct:**
```java
Integer amount = optionalArg.get(ctx);
if (amount == null) amount = 1;  // Provide default

// Or check before using
if (amount != null && amount > 10) {
    // ...
}
```

### Problem: "Invalid argument type" error

**Cause:** Using wrong ArgType

❌ **Wrong:**
```java
RequiredArg<String> amountArg = withRequiredArg("amount", "Amount", ArgTypes.STRING);
int amount = Integer.parseInt(amountArg.get(ctx));  // Manual parsing!
```

✅ **Correct:**
```java
RequiredArg<Integer> amountArg = withRequiredArg("amount", "Amount", ArgTypes.INTEGER);
int amount = amountArg.get(ctx);  // Automatic parsing
```

### Problem: Argument always null

**Check:**
1. Argument is defined as field, not local variable
2. Using correct context to get value

❌ **Wrong:**
```java
@Override
protected void execute(...) {
    RequiredArg<String> nameArg = withRequiredArg(...);  // Local variable!
    String name = nameArg.get(ctx);  // Will be null
}
```

✅ **Correct:**
```java
// Field
RequiredArg<String> nameArg = this.withRequiredArg("name", "Name", ArgTypes.STRING);

@Override
protected void execute(...) {
    String name = nameArg.get(commandContext);  // Works!
}
```

## Threading Issues

### Problem: "No Context associated with current Thread"

**Cause:** Modifying world on async thread (AbstractPlayerCommand is async!)

❌ **Wrong:**
```java
@Override
protected void execute(...) {  // Async thread!
    TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
    transform.setPosition(newPos);  // Crashes!
}
```

✅ **Correct:**
```java
@Override
protected void execute(...) {
    // Schedule on main thread
    world.getScheduler().runSync(() -> {
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        transform.setPosition(newPos);  // Safe!
    });
}
```

### Problem: ConcurrentModificationException

**Cause:** Modifying collections while iterating

❌ **Wrong:**
```java
for (Player player : players) {
    if (condition) {
        players.remove(player);  // ConcurrentModificationException!
    }
}
```

✅ **Correct:**
```java
players.removeIf(player -> condition);

// Or use iterator
Iterator<Player> it = players.iterator();
while (it.hasNext()) {
    Player player = it.next();
    if (condition) {
        it.remove();  // Safe
    }
}
```

## Player/Sender Issues

### Problem: ClassCastException when casting sender

**Error:**
```
java.lang.ClassCastException: ConsoleCommandSender cannot be cast to Player
```

**Cause:** Console executed player-only command

❌ **Wrong (in AbstractCommand):**
```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    Player player = (Player) ctx.sender();  // Crashes if console!
}
```

✅ **Correct Option 1 - Check type:**
```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    if (!(ctx.sender() instanceof Player)) {
        ctx.sendMessage(Message.raw("Player only!"));
        return CompletableFuture.completedFuture(null);
    }
    Player player = (Player) ctx.sender();
}
```

✅ **Correct Option 2 - Use AbstractPlayerCommand:**
```java
// Extend AbstractPlayerCommand instead - automatic player validation!
public class MyCommand extends AbstractPlayerCommand {
    @Override
    protected void execute(...) {
        // Always a player here
        Player player = store.getComponent(ref, Player.getComponentType());
    }
}
```

### Problem: Can't get Player component

❌ **Wrong:**
```java
Player player = (Player) ctx.sender();  // Wrong in AbstractPlayerCommand
```

✅ **Correct:**
```java
Player player = store.getComponent(ref, Player.getComponentType());
```

## Permission Issues

### Problem: Permission check doesn't work

**Check:**
1. Permission is registered in your permission system
2. Using correct permission string

```java
// Check permission
if (!player.hasPermission("yourplugin.command.use")) {
    player.sendMessage(Message.raw("No permission!"));
    return;
}
```

### Problem: Operators can't use command

**Solution:** Set permission group

```java
public MyCommand() {
    super("mycommand", "Description");
    setPermissionGroup(GameMode.OPERATOR);  // Allow operators
}
```

## Message Issues

### Problem: Colors not working

**Solution:** Use `.color()` method with hex values

```java
// Basic colored message
Message message = Message.raw("Success!").color("#00FF00"); // Green
player.sendMessage(message);

// Combining multiple colored parts
Message combined = Message.join(
    Message.raw("Error: ").color("#FF0000"),  // Red
    Message.raw("Player not found").color("#FFFFFF")  // White
);
player.sendMessage(combined);
```

### Problem: Message not sent

**Cause:** Trying to send to wrong recipient

✅ **Correct patterns:**
```java
// In AbstractPlayerCommand
Player player = store.getComponent(ref, Player.getComponentType());
player.sendMessage(Message.raw("Message"));

// In AbstractCommand
ctx.sendMessage(Message.raw("Message"));

// To specific player
PlayerRef targetRef = Universe.get().getPlayerByUsername(name, NameMatching.EXACT);
Player target = targetRef.getStore().getComponent(targetRef.getRef(), Player.getComponentType());
target.sendMessage(Message.raw("Message"));
```

## Return Value Issues

### Problem: Missing return statement

**Error:**
```
java.lang.Error: Missing return statement
```

**Cause:** Forgot to return CompletableFuture in AbstractCommand

❌ **Wrong:**
```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    ctx.sendMessage(Message.raw("Done!"));
    // Missing return!
}
```

✅ **Correct:**
```java
@Override
public CompletableFuture<Void> execute(@Nonnull CommandContext ctx) {
    ctx.sendMessage(Message.raw("Done!"));
    return CompletableFuture.completedFuture(null);
}
```

**Note:** `AbstractPlayerCommand` doesn't need return (void execute)

## Component Access Issues

### Problem: Component is null

**Cause:** Component doesn't exist on entity

```java
// Always check for null
HealthComponent health = store.getComponent(ref, HealthComponent.getComponentType());
if (health == null) {
    player.sendMessage(Message.raw("No health component!"));
    return;
}

// Use component
float currentHealth = health.getHealth();
```

### Problem: Can't access other player's components

**Solution:** Get their Store and Ref

```java
// Find target player
PlayerRef targetRef = Universe.get().getPlayerByUsername(targetName, NameMatching.EXACT);
if (targetRef == null) {
    player.sendMessage(Message.raw("Player not found!"));
    return;
}

// Get their components
Player targetPlayer = targetRef.getStore().getComponent(
    targetRef.getRef(), 
    Player.getComponentType()
);
TransformComponent targetTransform = targetRef.getStore().getComponent(
    targetRef.getRef(),
    TransformComponent.getComponentType()
);
```

## Common Anti-Patterns

### ❌ Storing Player Component

```java
// ❌ Don't do this
private final Player player;

public MyCommand(Player player) {
    this.player = player;  // Don't store Player!
}
```

**Why:** Player component may become invalid

✅ **Correct:**
```java
// ✅ Store PlayerRef instead
private final PlayerRef playerRef;

public MyUI(PlayerRef playerRef) {
    this.playerRef = playerRef;
}

// Get Player when needed
Player player = playerRef.getStore().getComponent(
    playerRef.getRef(), 
    Player.getComponentType()
);
```

### ❌ Blocking Operations on Main Thread

```java
// ❌ Don't block main thread
@Override
protected void execute(...) {
    // This is async, but scheduling sync:
    world.getScheduler().runSync(() -> {
        loadFromDatabase();  // Blocks main thread!
        player.sendMessage(Message.raw("Done"));
    });
}
```

✅ **Correct:**
```java
@Override
protected void execute(...) {
    // Do database work on async thread (here)
    Data data = loadFromDatabase();
    
    // Only schedule world modifications on main thread
    world.getScheduler().runSync(() -> {
        applyData(data);
        player.sendMessage(Message.raw("Done!"));
    });
}
```

### ❌ Not Validating Input

```java
// ❌ No validation
double radius = radiusArg.get(ctx);
performAction(radius);  // Could be negative, too large, etc.
```

✅ **Correct:**
```java
double radius = radiusArg.get(ctx);

// Validate
if (radius < 1 || radius > 100) {
    player.sendMessage(Message.raw("Radius must be 1-100!"));
    return;
}

performAction(radius);  // Safe
```

## Debug Checklist

When command doesn't work:

- [ ] Command registered in setup()
- [ ] Plugin loading successfully
- [ ] Command name matches (no typos)
- [ ] Arguments defined as fields (not local variables)
- [ ] Null checks for optional arguments
- [ ] Using correct ArgType for each argument
- [ ] World modifications scheduled on main thread
- [ ] Using store.getComponent() to get Player (not casting)
- [ ] Returning CompletableFuture in AbstractCommand
- [ ] Color codes in Message.raw()
- [ ] Permission checks done correctly
- [ ] Sub-commands added (not registered separately)

## Getting Help

If still stuck:

1. **Check logs:** Look for error messages in server console
2. **Enable debug:** Add print statements
3. **Simplify:** Remove complexity until it works
4. **Compare:** Look at working examples in this documentation
5. **Verify versions:** Ensure using correct Hytale server version

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Unknown command" | Not registered | Check setup() method |
| NullPointerException | Null optional arg | Add null check |
| ClassCastException | Wrong sender type | Use AbstractPlayerCommand or check type |
| ConcurrentModificationException | Modifying during iteration | Use removeIf() or iterator |
| "Missing return statement" | No return in AbstractCommand | Add return CompletableFuture.completedFuture(null) |
| "No Context associated" | World modification on async | Schedule with world.getScheduler().runSync() |

---

[← Complete Examples](11-complete-example.md) | [Back to Index](README.md)
