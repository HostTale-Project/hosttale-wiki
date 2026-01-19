# Quick Start: Your First Command

[← Back to Overview](01-overview.md) | [Back to Index](README.md) | [Basic Commands →](03-basic-commands.md)

## Goal

In this guide, you'll create a working `/hello` command in under 5 minutes.

## Prerequisites

- Hytale plugin project setup
- Basic Java knowledge
- Access to your plugin's main class

## Step 1: Create Command Class

Create a new file: `HelloCommand.java`

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
        
        // Send greeting message
        player.sendMessage(Message.raw("Hello, " + player.getDisplayName() + "!"));
    }
}
```

## Step 2: Register Command

In your plugin's main class, register the command:

```java
package com.yourplugin;

import com.hypixel.hytale.server.core.plugin.JavaPlugin;
import com.yourplugin.commands.HelloCommand;

public class YourPlugin extends JavaPlugin {
    
    @Override
    public void setup() {
        // Register the hello command
        this.getCommandRegistry().registerCommand(new HelloCommand());
        
        getLogger().atInfo().log("Hello command registered!");
    }
}
```

## Step 3: Build and Test

1. **Build your plugin:**
   ```bash
   ./gradlew build
   ```

2. **Copy to server:**
   ```bash
   cp build/libs/yourplugin.jar run/mods/
   ```

3. **Start server:**
   ```bash
   cd run
   java -jar server.jar
   ```

4. **Test in-game:**
   ```
   /hello
   ```

You should see: `Hello, YourName!` in green text.

## Understanding the Code

### Constructor

```java
public HelloCommand() {
    super("hello", "Sends a greeting message");
}
```

- First parameter: Command name (what players type: `/hello`)
- Second parameter: Description (shown in help)

### Execute Method

```java
@Override
protected void execute(@Nonnull CommandContext commandContext,
                      @Nonnull Store<EntityStore> store,
                      @Nonnull Ref<EntityStore> ref,
                      @Nonnull PlayerRef playerRef,
                      @Nonnull World world) {
```

**Parameters:**
- `commandContext` - Execution context (sender, arguments)
- `store` - Entity component storage
- `ref` - Reference to the player entity
- `playerRef` - Player reference wrapper
- `world` - The world where command was executed

### Getting Player Component

```java
Player player = store.getComponent(ref, Player.getComponentType());
```

This uses Hytale's Entity Component System (ECS) to get the Player component from the entity store.

### Sending Message

```java
player.sendMessage(Message.raw("Hello, " + player.getDisplayName() + "!"));
```

- `Message.raw()` - Creates a raw text message
- `player.getDisplayName()` - Gets the player's name

## Next Steps

### Add an Argument

Let's make the command greet someone else:

```java
public class HelloCommand extends AbstractPlayerCommand {
    
    // Add optional name argument
    OptionalArg<String> nameArg = this.withOptionalArg("name", "Person to greet", ArgTypes.STRING);
    
    public HelloCommand() {
        super("hello", "Sends a greeting message");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext commandContext,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Get the name argument (or use player's name if not provided)
        String name = nameArg.get(commandContext);
        if (name == null) {
            name = player.getDisplayName();
        }
        
        player.sendMessage(Message.raw("Hello, " + name + "!"));
    }
}
```

**Usage:**
- `/hello` - Greets yourself
- `/hello Steve` - Greets Steve

### Add Permission Check

```java
@Override
protected void execute(@Nonnull CommandContext commandContext, ...) {
    Player player = store.getComponent(ref, Player.getComponentType());
    
    // Check permission
    if (!player.hasPermission("yourplugin.hello")) {
        player.sendMessage(Message.raw("You don't have permission!"));
        return;
    }
    
    // Rest of code...
}
```

### Add Color Formatting

```java
// Using .color() method
Message greeting = Message.raw("Hello, " + name + "!").color("#00FF00");
player.sendMessage(greeting);

// Combining multiple colored messages
Message message = Message.join(
    Message.raw("Hello, ").color("#00FF00"),
    Message.raw(name).color("#00FFFF"),
    Message.raw("!").color("#00FF00")
);
player.sendMessage(message);
```

## Common Patterns

### Pattern 1: Simple Notification

```java
public class PingCommand extends AbstractPlayerCommand {
    public PingCommand() {
        super("ping", "Check server response");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        player.sendMessage(Message.raw("Pong! Server is running."));
    }
}
```

### Pattern 2: Player Info Display

```java
public class InfoCommand extends AbstractPlayerCommand {
    public InfoCommand() {
        super("info", "Display your information");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        TransformComponent transform = store.getComponent(ref, TransformComponent.getComponentType());
        
        player.sendMessage(Message.raw("Name: " + player.getDisplayName()));
        player.sendMessage(Message.raw("Position: " + transform.getPosition()));
        player.sendMessage(Message.raw("World: " + world.getName()));
    }
}
```

### Pattern 3: Command with Feedback

```java
public class FlyCommand extends AbstractPlayerCommand {
    public FlyCommand() {
        super("fly", "Toggle flight mode");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, ...) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Toggle flight (pseudo-code)
        boolean flying = toggleFlight(player);
        
        if (flying) {
            player.sendMessage(Message.raw("Flight enabled!"));
        } else {
            player.sendMessage(Message.raw("Flight disabled!"));
        }
    }
}
```

## Troubleshooting

### Command Not Found

**Problem:** `/hello` says "Unknown command"

**Solutions:**
1. Check registration in `setup()` method
2. Verify plugin is loading (check logs)
3. Rebuild plugin: `./gradlew build`
4. Restart server

### NullPointerException

**Problem:** Error when running command

```java
// ❌ Wrong
Player player = (Player) commandContext.sender();

// ✅ Correct
Player player = store.getComponent(ref, Player.getComponentType());
```

### Color Codes Not Working

**Problem:** Colors not showing

```java
// Native Hytale API for colors
Message coloredMessage = Message.raw("Hello!").color("#00FF00"); // Green
player.sendMessage(coloredMessage);
```

## Quick Reference

### Import Statements

```java
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
```

### Command Template

```java
public class MyCommand extends AbstractPlayerCommand {
    
    public MyCommand() {
        super("commandname", "Command description");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        Player player = store.getComponent(ref, Player.getComponentType());
        
        // Your logic here
        
        player.sendMessage(Message.raw("Success!"));
    }
}
```

### Registration Template

```java
@Override
public void setup() {
    this.getCommandRegistry().registerCommand(new MyCommand());
}
```

## What's Next?

- [**Basic Commands →**](03-basic-commands.md) - Learn about AbstractCommand
- [**Player Commands →**](04-player-commands.md) - Deep dive into AbstractPlayerCommand
- [**Command Arguments →**](05-arguments.md) - Add parameters to your commands

---

[← Back to Overview](01-overview.md) | [Back to Index](README.md) | [Basic Commands →](03-basic-commands.md)
