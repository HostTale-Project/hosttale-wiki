---
title: Custom UI System Overview
description: Learn about Hytale's custom UI system for creating interactive graphical interfaces.
---

Hytale's Custom UI system empowers server plugins to create rich, interactive graphical interfaces that players can interact with. Unlike chat-based commands, custom UIs provide a visual experience similar to in-game menus, making your plugins more intuitive and user-friendly.

## System Architecture

The Hytale UI system consists of three interconnected components that work together to create interactive experiences:

### 1. UI Definition Files (.ui)

These markup files define the visual structure and layout of your interface using a custom syntax similar to CSS and HTML.

**Location:**
```
src/main/resources/Common/UI/Custom/YourPlugin/YourUI.ui
```

**Example:**
```
Group {
    LayoutMode: Center;
    
    Label #Title {
        Text: "Hello World";
        Style: (FontSize: 24, TextColor: #ffffff);
    }
}
```

UI files are declarative - they describe what your interface looks like, including elements, layouts, styles, and visual properties.

### 2. InteractiveCustomUIPage Class

This is the Java backend that powers your UI. It handles:
- Loading the UI file
- Populating dynamic content
- Processing user interactions
- Managing state updates

**Example:**
```java
public class MyUI extends InteractiveCustomUIPage<MyUI.MyData> {
    @Override
    public void build(...) {
        // Load UI and set up event bindings
    }
    
    @Override
    public void handleDataEvent(...) {
        // Handle user interactions
    }
}
```

### 3. BuilderCodec (Data Layer)

Defines the data contract between the UI and your Java code, specifying what information flows in both directions.

**Example:**
```java
public static class MyData {
    public static final BuilderCodec<MyData> CODEC = 
        BuilderCodec.builder(MyData.class, MyData::new)
            .append(new KeyedCodec<>("Action", Codec.STRING), ...)
            .build();
    
    private String action;
}
```

## How It Works

The UI system follows a clear event flow:

```
Player Opens UI → build() loads .ui file → Player Interacts
                                                ↓
sendUpdate() refreshes UI ← Java processes event ← handleDataEvent() receives data
```

### The Complete Flow

1. **Opening the UI**: Plugin calls `player.getPageManager().openCustomPage()`
2. **Building**: The `build()` method loads the .ui file and sets initial values
3. **User Interaction**: Player clicks buttons, types text, or changes selections
4. **Event Triggered**: UI fires events like `Activating` or `ValueChanged`
5. **Data Transfer**: BuilderCodec deserializes the event data
6. **Event Handling**: `handleDataEvent()` receives and processes the interaction
7. **UI Update**: Call `sendUpdate()` to refresh the UI if needed

## Key Concepts

### CustomPageLifetime

Controls how the UI can be closed:

```java
CustomPageLifetime.CanDismiss    // Player can press ESC to close
CustomPageLifetime.CantClose     // Stays open until code closes it
```

Use `CantClose` for critical dialogs or required confirmations.

### UI Selectors

Target UI elements using CSS-like selectors to set values or bind events:

```java
"#ElementId"              // Element by ID
"#ParentId #ChildId"      // Nested element
"#ListId[0]"              // First item in list
"#ListId[2] #Button"      // Button in third list item
```

### Event Binding Types

Different interaction types trigger different events:

```java
CustomUIEventBindingType.Activating    // Button clicks
CustomUIEventBindingType.ValueChanged  // Text input, dropdown changes
CustomUIEventBindingType.MouseEntered  // Hover start
CustomUIEventBindingType.MouseExited   // Hover end
```

## Advantages of Custom UIs

Using custom UIs over chat-based commands provides several benefits:

✅ **Visual Feedback**: Rich graphical interface with immediate visual response  
✅ **Interactive**: Real-time updates and dynamic content  
✅ **Intuitive**: Familiar game-like controls that players already understand  
✅ **Organized**: Group related controls and information logically  
✅ **Validatable**: Check and validate input before submission  
✅ **Professional**: Creates a polished, game-integrated experience  

## Common Use Cases

Custom UIs are perfect for a wide variety of plugin features:

- **Admin Panels**: Server management and moderation tools
- **Shop Systems**: Item browsing and trading interfaces
- **Teleportation**: Warp point and home selection menus
- **Configuration**: In-game settings and preferences
- **Custom Inventories**: Specialized item displays and management
- **Content Editors**: Script or configuration editing interfaces
- **Dialog Systems**: Confirmation prompts and input dialogs
- **Quest Systems**: Quest tracking and interaction interfaces
- **Minigame Lobbies**: Game selection and team management
- **Player Profiles**: Statistics and achievement displays

## Prerequisites

Before building custom UIs, you should have:

- Basic Java programming knowledge
- Understanding of Hytale plugin development fundamentals
- Familiarity with the Hytale server API
- Basic understanding of UI/UX concepts

If you're new to Hytale plugin development, start with the [Get Started](/guides/get-started) guide.

## Example: Simple Button UI

Here's a minimal example showing all three components working together:

**HelloWorld.ui:**
```
Group {
    LayoutMode: Center;
    
    Button #ClickMe {
        Anchor: (Width: 200, Height: 50);
        
        Label {
            Text: "Click Me!";
            Anchor: (Full: 0);
        }
    }
}
```

**HelloWorldUI.java:**
```java
public class HelloWorldUI extends InteractiveCustomUIPage<HelloWorldUI.HelloData> {
    
    public HelloWorldUI(@Nonnull PlayerRef playerRef) {
        super(playerRef, CustomPageLifetime.CanDismiss, HelloData.CODEC);
    }
    
    @Override
    public void build(...) {
        uiCommandBuilder.append("MyPlugin/HelloWorld.ui");
        uiEventBuilder.addEventBinding(
            CustomUIEventBindingType.Activating,
            "#ClickMe",
            EventData.of("Action", "clicked")
        );
    }
    
    @Override
    public void handleDataEvent(..., HelloData data) {
        super.handleDataEvent(ref, store, data);
        if ("clicked".equals(data.action)) {
            playerRef.sendMessage(Message.raw("Button clicked!"));
        }
    }
    
    public static class HelloData {
        public static final BuilderCodec<HelloData> CODEC = 
            BuilderCodec.builder(HelloData.class, HelloData::new)
                .append(new KeyedCodec<>("Action", Codec.STRING), 
                    (d, v) -> d.action = v, d -> d.action).add()
                .build();
        private String action;
    }
}
```

## Next Steps

Ready to create your first custom UI? Follow these guides in order:

1. **[Quick Start](/guides/ui/quick-start)** - Build your first working UI
2. **[UI Files](/guides/ui/ui-files)** - Learn the .ui markup language
3. **[Interactive Pages](/guides/ui/interactive-pages)** - Master the Java backend
4. **[BuilderCodec](/guides/ui/builder-codec)** - Understand data binding
5. **[Troubleshooting](/guides/ui/troubleshooting)** - Common issues and solutions

## Best Practices

As you build custom UIs, keep these principles in mind:

- **Keep it simple**: Start with basic layouts and add complexity gradually
- **Test frequently**: Build and test incrementally rather than all at once
- **Use templates**: Create reusable .ui templates for common patterns
- **Handle errors**: Always check for null values and validate input
- **Think responsive**: Consider different UI scales and player experiences
- **Optimize performance**: Limit dynamic list sizes and minimize full rebuilds

Custom UIs open up endless possibilities for creating engaging, professional plugin experiences. Let's get started!
