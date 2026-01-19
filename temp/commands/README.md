# Hytale Commands Documentation

Complete guide to creating custom commands in Hytale plugins.

## 📚 Table of Contents

### Getting Started
1. [**Overview**](01-overview.md) - Introduction to Hytale's command system
2. [**Quick Start**](02-quick-start.md) - Create your first command in 5 minutes

### Core Concepts
3. [**Basic Commands**](03-basic-commands.md) - `AbstractCommand` fundamentals
4. [**Player Commands**](04-player-commands.md) - `AbstractPlayerCommand` for player-only commands
5. [**Command Arguments**](05-arguments.md) - Required and optional arguments with types
6. [**Sub-Commands**](06-subcommands.md) - Creating hierarchical command structures
7. [**Permissions**](07-permissions.md) - Permission system and authorization
8. [**Async Commands**](08-async-commands.md) - Understanding threading and async execution

### Advanced Topics
9. [**CommandContext Deep Dive**](09-command-context.md) - Understanding the context object
10. [**Sending Messages**](10-messages.md) - Formatting and sending player messages
11. [**Complete Examples**](11-complete-example.md) - Real-world command implementations
12. [**Troubleshooting**](12-troubleshooting.md) - Common issues and solutions

## 🎯 What You'll Learn

This guide covers everything you need to create powerful commands for your Hytale plugin:

- **Command Types**: Basic commands vs player-only commands
- **Arguments**: String, Integer, Boolean, Float, Double, UUID, and more
- **Threading**: Understanding async vs sync command execution
- **Entity Component System**: Accessing player data using ECS
- **Permissions**: Controlling who can use your commands
- **Messages**: Sending formatted messages to players
- **Sub-Commands**: Creating complex command hierarchies
- **Error Handling**: Proper error handling and user feedback

## 💡 Quick Example

Here's a complete player command:

```java
public class TeleportCommand extends AbstractPlayerCommand {
    
    RequiredArg<String> playerArg = this.withRequiredArg("player", "Player to teleport to", ArgTypes.STRING);
    
    public TeleportCommand() {
        super("teleport", "Teleport to another player");
    }
    
    @Override
    protected void execute(@Nonnull CommandContext ctx, 
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref, 
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        String targetName = playerArg.get(ctx);
        // Implementation...
    }
}
```

## 🔗 Related Documentation

- [Hytale Entity Component System](https://hytalemodding.dev/en/docs/guides/ecs/hytale-ecs-theory)
- [Creating Events](https://hytalemodding.dev/en/docs/guides/plugin/creating-events)
- [Custom UI Documentation](../ui/README.md)

## 📖 How to Use This Guide

1. **New to Hytale?** Start with [Overview](01-overview.md) and [Quick Start](02-quick-start.md)
2. **Basic commands?** Check [Basic Commands](03-basic-commands.md) and [Arguments](05-arguments.md)
3. **Player-specific?** Read [Player Commands](04-player-commands.md)
4. **Complex commands?** See [Sub-Commands](06-subcommands.md) and [Complete Examples](11-complete-example.md)
5. **Having issues?** Jump to [Troubleshooting](12-troubleshooting.md)

Each guide includes:
- ✅ Complete code examples
- ✅ Common patterns and best practices
- ✅ Anti-patterns to avoid
- ✅ Real-world use cases

---

**Ready to start?** Begin with the [Overview →](01-overview.md)
