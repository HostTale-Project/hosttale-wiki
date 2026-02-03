---
title: Custom UI FAQ - Frequently Asked Questions
description: Common questions about creating custom user interfaces for Hytale mods. Learn about UI files, InteractiveCustomUIPage, BuilderCodec, and troubleshooting UI issues.
---

Get quick answers to common questions about Hytale's custom UI system.

## Getting Started

### What is Hytale's Custom UI system?

Hytale's Custom UI system allows you to create rich, interactive graphical interfaces for your plugins. It uses `.ui` markup files for layout definition and Java classes for logic and interactivity.

### Do I need to learn a special language for UI?

Yes, but it's relatively easy! Hytale uses a custom declarative markup language similar to CSS and HTML. You define elements, layouts, and styles using a syntax that's intuitive once you understand the basics.

See [UI Files](/guides/ui/ui-files) for complete syntax reference.

### Where do UI files go in my project?

UI definition files (`.ui`) must be placed in:
```
src/main/resources/Common/UI/Custom/YourPluginName/
```

For example:
```
src/main/resources/Common/UI/Custom/MyPlugin/MainMenu.ui
```

### Can I create UI without coding?

No. While `.ui` files are declarative markup, you need Java code (`InteractiveCustomUIPage`) to handle logic, data binding, and user interactions.

## UI Files & Syntax

### What elements can I use in UI files?

Common elements include:
- **Group** - Container for other elements
- **Label** - Text display
- **Button** - Clickable button
- **TextInput** - Text entry field
- **Image** - Display images
- **List** - Scrollable list of items
- **Slider** - Value slider control

See [UI Files](/guides/ui/ui-files) for the complete element reference.

### How do I position elements?

Use `LayoutMode` on Groups:
- **Vertical** - Stack children vertically
- **Horizontal** - Stack children horizontally
- **Center** - Center children
- **Grid** - Arrange in grid

Example:
```
Group {
    LayoutMode: Vertical;
    Spacing: 10;
    
    Label { Text: "Title"; }
    Button { Text: "Click Me"; }
}
```

### How do I style elements?

Use the `Style` property with key-value pairs:
```
Label #MyLabel {
    Text: "Hello World";
    Style: (
        FontSize: 24,
        TextColor: #ffffff,
        BackgroundColor: #333333
    );
}
```

### Can I reference elements by ID?

Yes! Use the `#` symbol to assign IDs:
```
Button #SubmitButton {
    Text: "Submit";
}
```

Then reference it in Java code to bind events or update properties.

### How do I include comments in UI files?

Use `//` for single-line comments:
```
// This is a comment
Group {
    // Another comment
    LayoutMode: Vertical;
}
```

## InteractiveCustomUIPage

### What is InteractiveCustomUIPage?

`InteractiveCustomUIPage` is the Java class that powers your UI. It:
- Loads the `.ui` file
- Binds data to UI elements
- Handles user interactions (clicks, input, etc.)
- Updates the UI dynamically

### How do I create an InteractiveCustomUIPage?

Extend the class and implement the `build()` method:

```java
public class MyUI extends InteractiveCustomUIPage<MyUI.MyData> {
    @Override
    public void build(Player player, MyData data, UIBuilder builder) {
        // Load UI file
        builder.loadUI("Common/UI/Custom/MyPlugin/MyUI.ui");
        
        // Bind events and data
    }
    
    public static class MyData {
        // Your data fields
    }
}
```

### How do I bind button clicks?

Use the builder to find elements by ID and bind events:

```java
builder.findButton("SubmitButton").onClick(() -> {
    // Handle button click
    player.sendMessage("Button clicked!");
});
```

### How do I update UI elements dynamically?

Store references to elements and update them:

```java
Label statusLabel = builder.findLabel("StatusLabel");
statusLabel.setText("Updated!");
```

Or rebuild the entire UI with new data.

### Can I pass data to my UI?

Yes! Use the generic type parameter:

```java
public class ShopUI extends InteractiveCustomUIPage<ShopUI.ShopData> {
    public static class ShopData {
        List<Item> items;
        int playerCoins;
    }
    
    @Override
    public void build(Player player, ShopData data, UIBuilder builder) {
        // Use data to populate UI
        builder.findLabel("CoinsLabel").setText("Coins: " + data.playerCoins);
    }
}
```

### How do I show my UI to a player?

Register and open it:

```java
// Register the UI (usually in onEnable)
CustomUIRegistry.register("myui", MyUI.class);

// Show to player
CustomUIRegistry.open(player, "myui", new MyUI.MyData());
```

## Dynamic Content & Lists

### How do I create dynamic lists?

Use `List` elements in your `.ui` file and populate them in Java:

```java
List itemList = builder.findList("ItemList");
for (Item item : items) {
    itemList.addItem(createItemElement(item));
}
```

### Can I update lists without rebuilding the entire UI?

Yes! Keep a reference to the list and modify it:

```java
itemList.clear();
itemList.addItem(newItem);
```

### How do I handle list item clicks?

Bind click handlers when creating list items:

```java
ListItem item = createListItem();
item.onClick(() -> {
    handleItemClick(itemData);
});
itemList.addItem(item);
```

## BuilderCodec

### What is BuilderCodec?

BuilderCodec is a utility system for programmatically generating UI elements without writing `.ui` files. It's useful for dynamic UIs that can't be predetermined.

See [BuilderCodec](/guides/ui/builder-codec) for details.

### Should I use BuilderCodec or UI files?

**Use UI files when:**
- Layout is mostly static
- You want easier maintenance and tweaking
- Designers need to modify layouts

**Use BuilderCodec when:**
- UI structure is completely dynamic
- Generated based on runtime data
- Need programmatic control over every aspect

### Can I mix BuilderCodec with UI files?

Yes! Load a base UI file and then add dynamic elements with BuilderCodec.

## Styling & Theming

### How do I make my UI match Hytale's style?

Use Hytale's built-in color schemes and fonts:
```
Style: (
    FontSize: 16,
    TextColor: #e0e0e0,
    BackgroundColor: #2a2a2a
)
```

Study existing Hytale UIs for color schemes.

### Can I use custom fonts?

Check the Hytale asset system for available fonts. Custom font loading may require asset registration.

### How do I make responsive UIs?

Use relative sizing and layout modes:
- Percentage-based widths
- Dynamic spacing
- Flexible containers (Vertical/Horizontal)
- Avoid hardcoded pixel values

### Can I animate UI elements?

Hytale's UI system may support animations through style properties. Check the official documentation for animation support.

## Text Input & Forms

### How do I get text input from users?

Use `TextInput` elements:

```
TextInput #PlayerName {
    Placeholder: "Enter name...";
    MaxLength: 20;
}
```

Then read the value in Java:

```java
TextInput input = builder.findTextInput("PlayerName");
String name = input.getText();
```

### How do I validate input?

Implement validation in your event handlers:

```java
button.onClick(() -> {
    String input = textInput.getText();
    if (input.isEmpty()) {
        errorLabel.setText("Input required!");
        return;
    }
    // Process valid input
});
```

### Can I create multi-field forms?

Yes! Group multiple TextInput elements and process them together:

```java
String name = builder.findTextInput("Name").getText();
String email = builder.findTextInput("Email").getText();
int age = Integer.parseInt(builder.findTextInput("Age").getText());
```

## Performance & Best Practices

### How often should I rebuild UIs?

Minimize full rebuilds. Instead:
- Update specific elements when data changes
- Use dynamic lists efficiently
- Cache UI references
- Only rebuild when structure changes

### Should I close UIs automatically?

Depends on context:
- **Yes** for confirmation dialogs
- **No** for main menus or persistent interfaces
- **Optional** for forms (close on submit, keep open on error)

### How do I handle UI closing?

Override the close handler:

```java
@Override
public void onClose(Player player, MyData data) {
    // Cleanup, save state, etc.
}
```

### Can multiple players view the same UI instance?

No! Each player needs their own UI instance with their own data. Never share UI instances between players.

## Troubleshooting

### My UI file isn't loading

Check:
1. **File path** - Must be exactly `Common/UI/Custom/PluginName/file.ui`
2. **Syntax errors** - Missing braces, semicolons, etc.
3. **Resource folder** - Must be in `src/main/resources/`
4. **Build** - Make sure file is included in JAR

### Elements aren't appearing

Common causes:
- Element is outside the viewport
- Parent Group has wrong LayoutMode
- Size is set to 0 or very small
- Z-index issues (elements behind others)

### Buttons aren't clickable

Verify:
1. Button ID is correct
2. Click handler is bound properly
3. Button isn't obscured by other elements
4. Button has proper size (not 0x0)

### Text is cut off or not visible

Check:
- Container size is large enough
- Font size isn't too large
- TextColor isn't same as BackgroundColor
- Text wrapping settings

### UI looks different for different players

Possible reasons:
- Different screen resolutions
- UI scale settings
- Client-side rendering differences

Use relative sizing and test on multiple resolutions.

## Related Documentation

- [UI Overview](/guides/ui/overview) - Introduction to the UI system
- [Quick Start](/guides/ui/quick-start) - Your first custom UI
- [UI Files](/guides/ui/ui-files) - Complete syntax reference
- [Interactive Pages](/guides/ui/interactive-pages) - Java backend guide
- [BuilderCodec](/guides/ui/builder-codec) - Programmatic UI generation
- [Troubleshooting](/guides/ui/troubleshooting) - Detailed troubleshooting guide

---

*Last updated: February 2026*
