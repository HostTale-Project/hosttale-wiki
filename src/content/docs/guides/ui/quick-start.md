---
title: Quick Start - Your First Custom UI
description: Build a complete custom UI from scratch with a button that responds to player interaction.
---

In this guide, you'll create a simple "Hello World" UI with a button that sends a message when clicked. This will teach you the fundamentals of the Hytale Custom UI system.

## Goal

Create a functional custom UI that:
- Displays a centered panel with a title
- Contains a clickable button
- Sends a message to the player when clicked
- Closes automatically after interaction

## Step 1: Create the UI File

First, create the visual definition file at:

`src/main/resources/Common/UI/Custom/YourPlugin/HelloWorld.ui`

```
Group {
    LayoutMode: Center;
    
    Group #MainPanel {
        Background: #1a2530;
        Anchor: (Width: 400, Height: 200);
        LayoutMode: Top;
        Padding: (Full: 20);
        
        Label #Title {
            Style: (
                FontSize: 24, 
                HorizontalAlignment: Center, 
                VerticalAlignment: Center, 
                TextColor: #ffffff
            );
            Text: "Hello World!";
            Anchor: (Height: 60);
        }
        
        Button #ClickMeBtn {
            Anchor: (Height: 50);
            Style: (
                Default: (Background: #2a5a3a),
                Hovered: (Background: #3a7a4a),
                Pressed: (Background: #1a4a2a)
            );
            
            Label {
                Style: (
                    FontSize: 16, 
                    HorizontalAlignment: Center, 
                    VerticalAlignment: Center, 
                    TextColor: #ffffff
                );
                Text: "Click Me!";
                Anchor: (Full: 0);
            }
        }
    }
}
```

**What this does:**
- Creates a centered 400×200px panel with a dark background
- Adds a title label at the top (60px height)
- Adds a green button that changes color on hover and press
- Uses IDs (`#MainPanel`, `#Title`, `#ClickMeBtn`) so Java can reference them

## Step 2: Create the Java Class

Create `HelloWorldUI.java` in your plugin's UI package:

```java
package com.yourplugin.ui;

import com.hypixel.hytale.codec.Codec;
import com.hypixel.hytale.codec.KeyedCodec;
import com.hypixel.hytale.codec.builder.BuilderCodec;
import com.hypixel.hytale.component.Ref;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.protocol.packets.interface_.CustomPageLifetime;
import com.hypixel.hytale.protocol.packets.interface_.CustomUIEventBindingType;
import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.entity.entities.player.pages.InteractiveCustomUIPage;
import com.hypixel.hytale.server.core.ui.builder.EventData;
import com.hypixel.hytale.server.core.ui.builder.UICommandBuilder;
import com.hypixel.hytale.server.core.ui.builder.UIEventBuilder;
import com.hypixel.hytale.server.core.universe.PlayerRef;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;

import javax.annotation.Nonnull;

public class HelloWorldUI extends InteractiveCustomUIPage<HelloWorldUI.HelloWorldData> {

    private final PlayerRef playerRef;

    public HelloWorldUI(@Nonnull PlayerRef playerRef) {
        super(playerRef, CustomPageLifetime.CanDismiss, HelloWorldData.CODEC);
        this.playerRef = playerRef;
    }

    @Override
    public void build(@Nonnull Ref<EntityStore> ref, 
                      @Nonnull UICommandBuilder uiCommandBuilder,
                      @Nonnull UIEventBuilder uiEventBuilder, 
                      @Nonnull Store<EntityStore> store) {
        
        // Load the UI file
        uiCommandBuilder.append("YourPlugin/HelloWorld.ui");
        
        // Bind the button click event
        uiEventBuilder.addEventBinding(
            CustomUIEventBindingType.Activating,
            "#ClickMeBtn",
            EventData.of("Action", "buttonClicked")
        );
    }

    @Override
    public void handleDataEvent(@Nonnull Ref<EntityStore> ref,
                                @Nonnull Store<EntityStore> store,
                                @Nonnull HelloWorldData data) {
        super.handleDataEvent(ref, store, data);
        
        if ("buttonClicked".equals(data.action)) {
            // Send a success message to the player
            playerRef.sendMessage(
                Message.raw("You clicked the button!").color("#00FF00")
            );
            
            // Close the UI
            var player = store.getComponent(ref, Player.getComponentType());
            player.getPageManager().closeCustomPage();
        }
    }

    // Data class for event binding
    public static class HelloWorldData {
        public static final BuilderCodec<HelloWorldData> CODEC = 
            BuilderCodec.builder(HelloWorldData.class, HelloWorldData::new)
                .append(
                    new KeyedCodec<>("Action", Codec.STRING),
                    (d, v) -> d.action = v,
                    d -> d.action
                ).add()
                .build();

        private String action;
    }
}
```

**What this does:**
- Extends `InteractiveCustomUIPage` with a custom data type
- In `build()`: Loads the .ui file and binds the button click event
- In `handleDataEvent()`: Processes the click, sends a message, and closes the UI
- Defines `HelloWorldData` with a BuilderCodec to receive the "Action" data

## Step 3: Create a Command to Open the UI

Create a command that players can use to open your UI:

```java
package com.yourplugin.commands;

import com.hypixel.hytale.component.Ref;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.server.core.command.system.CommandContext;
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.universe.PlayerRef;
import com.hypixel.hytale.server.core.universe.world.World;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;
import com.yourplugin.ui.HelloWorldUI;

import javax.annotation.Nonnull;

public class HelloCommand extends AbstractPlayerCommand {

    public HelloCommand() {
        super("hello", "Opens the Hello World UI");
    }

    @Override
    protected void execute(@Nonnull CommandContext ctx,
                          @Nonnull Store<EntityStore> store,
                          @Nonnull Ref<EntityStore> ref,
                          @Nonnull PlayerRef playerRef,
                          @Nonnull World world) {
        
        Player player = ctx.senderAs(Player.class);
        
        // Open the custom UI
        player.getPageManager().openCustomPage(
            ref,
            store,
            new HelloWorldUI(playerRef)
        );
    }
}
```

## Step 4: Register the Command

In your plugin's main class, register the command in the `setup()` method:

```java
@Override
protected void setup() {
    super.setup();
    
    // Register the hello command
    this.getCommandRegistry().registerCommand(new HelloCommand());
}
```

## Step 5: Update manifest.json

Ensure your `manifest.json` includes the asset pack flag:

```json
{
  "Main": "com.yourplugin.YourPlugin",
  "Name": "Your Plugin",
  "Version": "1.0.0",
  "IncludesAssetPack": true
}
```

This tells Hytale to load custom UI files from your plugin's resources.

## Step 6: Build and Test

1. Build your plugin:
   ```bash
   ./gradlew build
   ```

2. Copy the generated JAR from `build/libs/` to your server's `mods` folder

3. Start your Hytale server

4. Join the game and run the command:
   ```
   /hello
   ```

5. The UI will appear - click the button!

6. You should see a green message: "You clicked the button!" and the UI will close

## What Just Happened?

Let's trace the flow:

1. **Command Execution**: `/hello` command ran, calling `HelloCommand.execute()`
2. **UI Creation**: A new `HelloWorldUI` instance was created with the player's reference
3. **UI Opening**: `player.getPageManager().openCustomPage()` opened the UI
4. **Building**: The `build()` method:
   - Loaded `HelloWorld.ui`
   - Bound the `#ClickMeBtn` to fire an event with `Action="buttonClicked"`
5. **Player Interaction**: Player clicked the button
6. **Event Fired**: UI sent an `Activating` event with the bound data
7. **Data Deserialization**: BuilderCodec converted the event into `HelloWorldData`
8. **Event Handling**: `handleDataEvent()` received the data and checked the action
9. **Response**: Sent a green message and closed the UI

## Understanding the Code

### The .ui File Structure

```
Group {                         // Outer container
    LayoutMode: Center;         // Centers children
    
    Group #MainPanel {          // The visible panel
        Background: #1a2530;    // Dark blue-gray background
        Anchor: (Width: 400, Height: 200);  // Fixed size
        LayoutMode: Top;        // Stack children vertically
        Padding: (Full: 20);    // 20px padding all sides
        
        // Children go here (Label and Button)
    }
}
```

### The Event Binding

```java
uiEventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,  // Event type (button click)
    "#ClickMeBtn",                         // CSS-like selector
    EventData.of("Action", "buttonClicked") // Data sent with event
);
```

This creates a binding that says: "When the button with ID `ClickMeBtn` is activated (clicked), send an event with `Action='buttonClicked'`"

### The BuilderCodec

```java
BuilderCodec.builder(HelloWorldData.class, HelloWorldData::new)
    .append(
        new KeyedCodec<>("Action", Codec.STRING),  // Key name and type
        (d, v) -> d.action = v,                    // Setter lambda
        d -> d.action                              // Getter lambda
    ).add()  // Important! Completes this field
    .build();
```

This defines the data contract: "I expect a String field named 'Action' that maps to the `action` field"

## Common Issues

### UI File Not Found

```
Error: Could not find UI file: YourPlugin/HelloWorld.ui
```

**Solution**: Verify the file path:
- File: `src/main/resources/Common/UI/Custom/YourPlugin/HelloWorld.ui`
- Code: `uiCommandBuilder.append("YourPlugin/HelloWorld.ui");`
- Both must match exactly (case-sensitive)

### Button Not Clickable

**Problem**: Clicked the button but nothing happens

**Solution**: Check that:
- The selector matches the button ID: `#ClickMeBtn`
- The BuilderCodec key matches: `"Action"`
- You called `.add()` after `.append()` in the codec
- `handleDataEvent()` checks for the correct value: `"buttonClicked"`

### UI Not Opening

**Problem**: Command runs but no UI appears

**Solution**: Check that:
- `manifest.json` has `"IncludesAssetPack": true`
- You rebuilt the project after adding the .ui file
- The .ui file has no syntax errors

### Console Errors About Context

```
Error: No Context associated with current Thread
```

**Solution**: This is unrelated to UI - it's about JavaScript execution. Ignore for now or see [UI Troubleshooting](/guides/ui/troubleshooting).

## Next Steps

Congratulations! You've created your first custom UI. Now you can:

- **[Learn UI File Syntax](/guides/ui/ui-files)** - Understand all elements and properties
- **[Master InteractiveCustomUIPage](/guides/ui/interactive-pages)** - Deep dive into the Java backend
- **[Explore BuilderCodec](/guides/ui/builder-codec)** - Master data binding patterns
- **Add more features** - Try adding multiple buttons, text inputs, or dynamic content

## Experiment and Build

Try modifying your UI:

- Change the panel size and colors
- Add more buttons with different actions
- Add a text input field
- Change the button text when clicked (before closing)
- Make it display the player's name in the title

The best way to learn is by experimenting. Start simple and gradually add complexity!
