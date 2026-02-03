---
title: Hytale Plugin Development FAQ
description: Frequently asked questions about creating Hytale server plugins. Learn about Java mods, ECS, commands, UI, and plugin development best practices.
---

Quick answers to common questions about Hytale server plugin development with Java.

## Getting Started

### What do I need to start developing Hytale plugins?

You'll need:
- **Hytale Launcher** (installed and updated)
- **Java 25 SDK** (JDK 25)
- **IntelliJ IDEA** (Community or Ultimate edition)
- A GitHub account (for cloning templates)

See the [Get Started guide](/guides/get-started) for detailed setup instructions.

### Is there a project template I can use?

Yes! Use the official template:
```bash
git clone https://github.com/realBritakee/hytale-template-plugin.git MyPlugin
```

This template includes automatic server setup and proper configuration.

### Do I need to know Java to create Hytale plugins?

For native plugins, yes. However, if you prefer JavaScript, check out [SimpleScripting](/simplescripting/overview) which lets you create mods without Java.

### How long does it take to learn plugin development?

If you already know Java:
- **Basic plugins** (commands, events): 1-2 days
- **Intermediate** (custom UI, data storage): 1-2 weeks
- **Advanced** (ECS systems, complex mechanics): 1-2 months

If you're new to Java, add 2-4 weeks to learn the language basics first.

## Project Configuration

### What should I name my project?

Use a clear, descriptive name in PascalCase (e.g., `MyAwesomePlugin`). Configure it in:
- `settings.gradle`: Set `rootProject.name`
- `gradle.properties`: Set `maven_group` (use reverse domain like `com.yourname`)
- `manifest.json`: Set "Name" and "Main" class path

### Where does my plugin code go?

All code goes in `src/main/java/` following your package structure:
```
src/main/java/com/yourname/myplugin/
├── MyPlugin.java (main class)
├── commands/
├── events/
└── ui/
```

### What is the manifest.json file?

The manifest defines your plugin metadata:
```json
{
  "Main": "com.yourname.MyPlugin",
  "Name": "My Plugin",
  "Version": "1.0.0"
}
```

It must be in `src/main/resources/manifest.json`.

### How do I add dependencies to my plugin?

Add them to `build.gradle`:
```groovy
dependencies {
    implementation 'some.library:artifact:version'
}
```

Then reimport your Gradle project in IntelliJ.

## Commands

### How do I create a custom command?

Register commands in your plugin's main class:

```java
public class MyPlugin extends ServerPlugin {
    @Override
    public void onEnable() {
        // Register command
    }
}
```

See the [Commands guide](/guides/commands) for complete examples.

### Can commands have arguments?

Yes! Hytale supports type-safe command arguments with automatic parsing and validation. You can use integers, strings, players, locations, and more.

### How do I restrict commands to admins only?

Implement permission checks in your command executor:
```java
if (!sender.hasPermission("myplugin.admin")) {
    sender.sendMessage("No permission");
    return;
}
```

### Can I create sub-commands?

Yes! You can build command hierarchies like `/myplugin reload` or `/shop buy item`.

## Events

### How do I listen to game events?

Implement event listeners in your plugin:
```java
@EventHandler
public void onPlayerJoin(PlayerJoinEvent event) {
    Player player = event.getPlayer();
    // Handle event
}
```

Register your listener class during plugin initialization.

### What events are available?

Common events include:
- Player events (join, quit, chat, movement)
- Entity events (spawn, death, damage)
- Block events (place, break, interact)
- World events (load, unload, chunk events)
- ECS events (component changes, system ticks)

### Can I cancel events?

Yes! Many events are cancellable:
```java
@EventHandler
public void onBlockBreak(BlockBreakEvent event) {
    if (someCondition) {
        event.setCancelled(true);
    }
}
```

### How do I create custom events?

Extend the appropriate event base class and dispatch it through the event system. Custom events are useful for cross-plugin communication.

## Custom UI

### Can I create custom menus and interfaces?

Yes! Hytale has a powerful custom UI system. See the [UI Overview](/guides/ui/overview) for details.

**For detailed UI questions**, check the [Custom UI FAQ](/guides/ui/faq) which covers:
- UI files and syntax
- InteractiveCustomUIPage
- Dynamic content and lists
- BuilderCodec
- Styling and troubleshooting

## Entity Component System (ECS)

### What is ECS in Hytale?

ECS (Entity Component System) is Hytale's architecture for game logic. It separates data (components) from behavior (systems), making code more modular and performant.

See [ECS Overview](/guides/ecs/overview) for a complete introduction.

### Do I need to use ECS for my plugin?

Not always! Simple plugins (commands, basic events) don't require ECS. But for:
- Custom entity behaviors
- Per-tick logic
- Complex game mechanics
- Data serialization

...you'll want to use ECS.

### How do I create a custom component?

Define a component class and register it:Use it for custom entity behaviors, per-tick logic, complex game mechanics, and data serialization.

**For detailed ECS questions**, check the [ECS FAQ](/guides/ecs/faq) which covers:
- Components, systems, and queries in depth
- Entities and archetypes
- ECS events and CommandBuffer
- Performance optimization
- Best practices

### Does SimpleScripting have database support?

Yes! SimpleScripting provides a per-mod SQLite database. See [Database API](/simplescripting/api/database).

### How do I save data per-player?

Store player data using UUIDs as keys:
- In config files: `players.yml` with UUID keys
- In databases: UUID column as primary key
- In memory: `Map<UUID, PlayerData>` (remember to serialize on shutdown)

### Is player data automatically saved?

No. You must implement saving/loading:
- Save on `PlayerQuitEvent` or periodically
- Load on `PlayerJoinEvent`
- Serialize on server shutdown

## Performance & Best Practices

### How can I optimize my plugin?

**Key tips:**
- Cache expensive operations (don't recalculate every tick)
- Use efficient data structures (Maps instead of Lists for lookups)
- Batch operations when possible
- Avoid object creation in hot paths
- Use async tasks for heavy operations
- Profile your code to find bottlenecks

### Should I use async tasks?

Yes, for:
- Database queries
- File I/O
- HTTP requests
- Heavy calculations

No, for:
- Anything that modifies game state (must be on main thread)
- Fast operations (< 1ms)

### How many features should one plugin have?

Follow the **single responsibility principle**: each plugin should do one thing well. Multiple small, focused plugins are better than one giant plugin.

### Should I use Kotlin or Java?

Both work! Kotlin offers:
- Cleaner syntax
- Null safety
- Extension functions
- Coroutines

Java offers:
- Wider community support
- More examples
- Slightly better IDE support

Choose based on your team's expertise.

## Testing & Debugging

### How do I test my plugin?

1. **Local server**: Use the template's auto-setup to test locally
2. **Console logging**: Add debug statements
3. **Breakpoints**: Use IntelliJ's debugger
4. **Unit tests**: Write tests for complex logic

### My plugin won't load. What should I check?

Common issues:
1. **manifest.json**: Verify "Main" class path is correct
2. **Package structure**: Ensure classes are in the right packages
3. **Dependencies**: Check all required libraries are included
4. **Build errors**: Look at build output for compilation errors
5. **Server logs**: Read the full error message

### How do I see plugin errors?

Check the server console and log files. Exceptions will show:
- The error type
- The stack trace
- The line number where it occurred

### Can I debug with breakpoints?

Yes! IntelliJ supports attaching the debugger to your test server. Set breakpoints in your code and they'll pause execution.

## Distribution & Updates

### How do I share my plugin with others?

1. Build your plugin: `./gradlew build`
2. Find the JAR in `build/libs/`
3. Share the JAR file
4. Users place it in their `plugins/` folder

### Should I publish my plugin on GitHub?

Yes! GitHub provides:
- Version control
- Issue tracking
- Release distribution
- Community contributions

### How do I handle plugin updates?

Include version checking in your plugin:
1. Store current version in manifest.json
2. Check for config/data migrations needed
3. Handle backwards compatibility
4. Provide changelog for users

### Can plugins auto-update?

Not built-in, but you can implement update checking by:
- Querying GitHub releases API
- Notifying admins of new versions
- Consider using a plugin manager system

## Interoperability

### Can my plugin work with other plugins?

Yes! Use:
- **Events**: Other plugins can listen to your events
- **APIs**: Expose public methods/interfaces
- **Shared Services** (SimpleScripting): Cross-plugin communication
- **Dependencies**: Declare required plugins in manifest

### How do I make my plugin API-friendly?

Create a public API package:
```
com.yourname.myplugin.api/
├── MyPluginAPI.java
├── events/
└── data/
```

Document it well and maintain backwards compatibility.

### Can Java plugins interact with JavaScript mods?

Yes, through SimpleScripting's Shared Services system. Both can register and consume services.

## Related Documentation

- [Get Started](/guides/get-started) - Setup and first plugin
- [Commands Guide](/guides/commands) - Creating custom commands
- [UI Overview](/guides/ui/overview) - Custom user interfaces
- [ECS Overview](/guides/ecs/overview) - Entity Component System
- [SimpleScripting FAQ](/simplescripting/faq) - JavaScript mod questions

---

*Last updated: February 2026*
