---
title: UI Files - Structure and Syntax
description: Master the .ui markup language for defining custom UI layouts and styling.
---

UI files (`.ui`) define the visual structure of your interface using a custom markup language. Think of them as a combination of HTML (structure) and CSS (styling) designed specifically for Hytale.

## File Location and Organization

### Standard Path

All custom UI files must be placed under:

```
src/main/resources/Common/UI/Custom/YourPlugin/
```

**Example structure:**
```
src/main/resources/Common/UI/Custom/
  └── MyPlugin/
      ├── MainMenu.ui
      ├── ShopUI.ui
      └── Templates/
          ├── PlayerCard.ui
          └── ItemRow.ui
```

### Loading in Java

The path you use in Java is relative to `Common/UI/Custom/`:

```java
// Loads: Common/UI/Custom/MyPlugin/MainMenu.ui
uiCommandBuilder.append("MyPlugin/MainMenu.ui");

// Loads: Common/UI/Custom/MyPlugin/Templates/PlayerCard.ui
uiCommandBuilder.append("MyPlugin/Templates/PlayerCard.ui");
```

## Basic Syntax

### Element Structure

Elements follow a simple hierarchical structure:

```
ElementType {
    Property: Value;
    
    ChildElement {
        Property: Value;
    }
}
```

**Example:**
```
Group {
    LayoutMode: Top;
    Padding: (Full: 20);
    
    Label {
        Text: "Hello World";
    }
}
```

### Comments

Use comments to document your UI:

```
// Single line comment

/* Multi-line
   comment block */

Group {
    // This label shows the title
    Label #Title {
        Text: "My UI";
    }
}
```

### Element IDs

Assign IDs to elements so you can reference them from Java:

```
Label #Title { }
Button #SaveButton { }
Group #PlayerList { }
```

**Naming conventions:**
- Use `#` prefix for IDs
- Use PascalCase: `#SaveButton` not `#save_button`
- Be descriptive: `#PlayerList` not `#list`
- IDs must be unique within the file

## Core UI Elements

### Group

Container for organizing and laying out other elements.

```
Group {
    LayoutMode: Center;
    Anchor: (Width: 400, Height: 300);
    Background: #1a2530;
    Padding: (Full: 20);
    
    // Child elements here
}
```

**Common properties:**
- `LayoutMode`: Controls child arrangement (Center, Top, Left, Full, etc.)
- `Anchor`: Defines size and position
- `Background`: Color or texture
- `Padding`: Inner spacing
- `Visible`: Show/hide (true/false)

### Label

Displays text content.

```
Label #Title {
    Text: "Welcome to My Server";
    Style: (
        FontSize: 24,
        HorizontalAlignment: Center,
        VerticalAlignment: Center,
        TextColor: #ffffff,
        RenderBold: true
    );
    Anchor: (Height: 50);
}
```

**Key properties:**
- `Text`: The displayed text content
- `Style`: Typography and alignment settings
- `Anchor`: Size constraints

### Button

Interactive clickable element.

```
Button #SaveBtn {
    Anchor: (Width: 200, Height: 40);
    Style: (
        Default: (Background: #3a4a5a),
        Hovered: (Background: #4a5a6a),
        Pressed: (Background: #2a3a4a),
        Disabled: (Background: #666666)
    );
    
    Label {
        Text: "Save";
        Style: (
            FontSize: 16, 
            HorizontalAlignment: Center, 
            VerticalAlignment: Center,
            TextColor: #ffffff
        );
        Anchor: (Full: 0);
    }
}
```

**Button states:**
- `Default`: Normal appearance
- `Hovered`: Mouse over the button
- `Pressed`: Being clicked
- `Disabled`: Not interactive (grayed out)

### TextField

Single-line text input field.

```
TextField #NameInput {
    Style: (FontSize: 14, TextColor: #ffffff);
    PlaceholderStyle: (TextColor: #666666);
    Background: #1a2530;
    Placeholder: "Enter your name...";
    Value: "";
    Anchor: (Height: 35);
}
```

**Properties:**
- `Value`: Current text content
- `Placeholder`: Hint text when empty
- `PlaceholderStyle`: Styling for placeholder text
- `IsReadOnly`: Make non-editable (true/false)

### MultilineTextField

Multi-line text input area.

```
MultilineTextField #Description {
    Style: (FontSize: 12, TextColor: #ffffff);
    Background: #1a2530;
    AutoGrow: false;
    Padding: (Horizontal: 10, Vertical: 8);
    Anchor: (Height: 200);
    IsReadOnly: false;
}
```

**Unique properties:**
- `AutoGrow`: Expand height to fit content
- `IsReadOnly`: Make it view-only

## Layout System

Layout modes control how child elements are positioned within their parent.

### Center

Centers all children in the middle of the container.

```
Group {
    LayoutMode: Center;
    
    // Child will be centered
    Button #MyBtn { }
}
```

### Top

Stacks children vertically from top to bottom.

```
Group {
    LayoutMode: Top;
    
    // These will stack vertically
    Label { Text: "First"; }
    Label { Text: "Second"; }
    Button { }
}
```

### Left

Arranges children horizontally from left to right.

```
Group {
    LayoutMode: Left;
    
    // These will be horizontal
    Button #BackBtn { }
    Button #NextBtn { }
}
```

### Full

Child fills the entire parent space.

```
Group {
    LayoutMode: Full;
    
    // This label fills the entire group
    Label { }
}
```

### CenterMiddle

Centers children both horizontally and vertically (alias for Center).

```
Group {
    LayoutMode: CenterMiddle;
    
    // Perfectly centered
    Label { Text: "Centered"; }
}
```

## Anchor System

The anchor system defines element size and position.

### Width and Height

Set fixed dimensions in pixels:

```
Anchor: (Width: 400, Height: 300)   // Fixed size
Anchor: (Width: 400)                 // Just width, height auto
Anchor: (Height: 300)                // Just height, width auto
```

### Positioning

Position relative to parent edges:

```
Anchor: (Left: 10, Top: 20)          // 10px from left, 20px from top
Anchor: (Right: 10, Bottom: 20)      // 10px from right, 20px from bottom
Anchor: (Width: 200, Top: 50, Left: 100)  // Combined positioning
```

### Fill Parent

Fill parent container with optional margin:

```
Anchor: (Full: 0)      // Fill entire parent, no margin
Anchor: (Full: 10)     // Fill with 10px margin all around
Anchor: (Full: 20)     // Fill with 20px margin
```

### Mixed Anchoring

Combine different anchor properties:

```
Anchor: (Width: 500, Height: 400, Top: 50, Left: 100)
```

## Padding and Spacing

### Padding (Inner Spacing)

Add space inside an element:

```
Padding: (Full: 20)                              // All sides 20px
Padding: (Horizontal: 20, Vertical: 10)          // H=20px, V=10px
Padding: (Left: 10, Right: 15, Top: 5, Bottom: 8)  // Individual sides
```

### Margin (Via Anchor)

Create space outside an element using anchor positioning:

```
// 10px margin top and bottom
Anchor: (Width: 400, Top: 10, Bottom: 10)

// 20px margin all sides via Full
Anchor: (Full: 20)
```

## Colors and Backgrounds

### Solid Colors

Use hexadecimal color codes:

```
Background: #1a2530;           // Dark blue-gray
TextColor: #ffffff;            // White
TextColor: #ff0000;            // Red
```

### Colors with Transparency

Add alpha/opacity value:

```
Background: #1a2530(0.75);     // 75% opacity
TextColor: #ffffff(0.5);       // 50% opacity
```

### Texture Backgrounds

Use texture images with optional nine-slice borders:

```
Background: (TexturePath: "Common/ContainerFullPatch.png", Border: 20);
```

The `Border` value defines the stretchable region for nine-slice scaling.

### No Background

Simply omit the `Background` property for transparent backgrounds:

```
Group {
    // No background = transparent
    Label { Text: "Text only"; }
}
```

## Styling

### Inline Styles

Define styles directly on elements:

```
Label {
    Style: (
        FontSize: 24,
        TextColor: #ffffff,
        HorizontalAlignment: Center,
        VerticalAlignment: Center,
        RenderBold: true
    );
}
```

**Available style properties:**
- `FontSize`: Text size in pixels
- `TextColor`: Text color
- `HorizontalAlignment`: Start, Center, End
- `VerticalAlignment`: Start, Center, End
- `RenderBold`: Bold text (true/false)

### Referenced Styles

Reference styles from other files:

```
$C = "Common.ui";           // Reference Common.ui

Label {
    Style: $C.@DefaultLabelStyle;
}

Button {
    Style: $C.@DefaultButtonStyle;
}
```

## File References

### Importing Files

Reference other .ui files for reusable styles:

```
$Common = "Common.ui";              // Reference file
$Styles = "../MyStyles.ui";         // Relative path

// Use referenced styles
Background: $Common.@PanelBackground;
Label { Style: $Styles.@TitleStyle; }
```

## Common Patterns

### Centered Panel

A standard centered container for UI content:

```
Group {
    LayoutMode: Center;
    
    Group #MainPanel {
        Background: (TexturePath: "Common/ContainerFullPatch.png", Border: 20);
        Anchor: (Width: 600, Height: 500);
        LayoutMode: Top;
        Padding: (Full: 20);
        
        // Content here
    }
}
```

### Title Bar

A header section with centered text:

```
Label #Title {
    Style: (
        FontSize: 24, 
        HorizontalAlignment: Center, 
        VerticalAlignment: Center, 
        TextColor: #b4c8c9
    );
    Text: "My Custom UI";
    Anchor: (Height: 60);
    Padding: (Full: 15);
}
```

### Button Row

Horizontal row of action buttons:

```
Group #ButtonRow {
    LayoutMode: Left;
    Anchor: (Height: 50);
    Padding: (Horizontal: 10);
    
    Button #CancelBtn {
        Anchor: (Width: 120, Height: 40, Right: 10);
        // Button styling...
    }
    
    Button #SaveBtn {
        Anchor: (Width: 120, Height: 40);
        // Button styling...
    }
}
```

### Scrollable List Container

Container for dynamic content lists:

```
Group #ListContainer {
    Anchor: (Height: 400);
    LayoutMode: Top;
    Padding: (Horizontal: 20, Vertical: 10);
    
    // Dynamic items added here from Java
}
```

### Input Form Field

Labeled text input:

```
Group {
    LayoutMode: Top;
    Anchor: (Height: 60);
    
    Label {
        Text: "Username:";
        Anchor: (Height: 20);
    }
    
    TextField #UsernameInput {
        Anchor: (Height: 35);
        Placeholder: "Enter username...";
    }
}
```

## Validation and Best Practices

### Common Mistakes

**❌ Using percentages (not supported):**
```
Anchor: (Width: 100%, Height: 300)  // ERROR
```

**✅ Use fixed pixels:**
```
Anchor: (Width: 540, Height: 300)   // CORRECT
```

**❌ Wrong alignment property:**
```
Style: (Alignment: Left)             // ERROR
```

**✅ Use HorizontalAlignment/VerticalAlignment:**
```
Style: (HorizontalAlignment: Start, VerticalAlignment: Center)  // CORRECT
```

**❌ Trying to click a Group:**
```
Group #ClickMe { }                   // Can't bind Activating event
```

**✅ Use Button for clickable elements:**
```
Button #ClickMe { }                  // Can bind Activating event
```

### Valid Alignment Values

Always use these exact values:
- `Start` - Left/Top alignment
- `Center` - Center alignment  
- `End` - Right/Bottom alignment

### Size Guidelines

- Most buttons: 40-50px height
- Text inputs: 30-35px height
- Title labels: 50-60px height
- Main panels: 400-800px width, 300-600px height

## Multi-File Organization

### Simple UI (Single File)

For simple interfaces, one file is sufficient:

```
MyUI.ui
```

### Complex UI (Multiple Files)

For complex interfaces, split into multiple templates:

```
MyUI/
  Main.ui          // Main container
  PlayerCard.ui    // Reusable player card template
  ItemRow.ui       // Reusable item row template
```

**Load in Java:**
```java
// Load main
uiCommandBuilder.append("MyPlugin/MyUI/Main.ui");

// Append templates dynamically
uiCommandBuilder.append("#PlayerList", "MyPlugin/MyUI/PlayerCard.ui");
uiCommandBuilder.append("#ItemList", "MyPlugin/MyUI/ItemRow.ui");
```

## Debugging Tips

### Check Syntax

Make sure you:
- Close all curly braces `{ }`
- End property lines with semicolons `;`
- Use correct property names (case-sensitive)
- Use valid values for each property type

### Test Incrementally

Build your UI step by step:
1. Start with a simple Group
2. Add one element at a time
3. Test after each addition
4. Debug issues immediately

### View in Game

The best way to debug layout issues is to see the UI in-game. Make small changes and rebuild to see the effects.

## Element Reference Summary

| Element | Purpose | Can Bind Activating | Can Bind ValueChanged |
|---------|---------|---------------------|----------------------|
| Group | Container | ❌ | ❌ |
| Label | Text display | ❌ | ❌ |
| Button | Clickable action | ✅ | ❌ |
| TextField | Single-line input | ❌ | ✅ |
| MultilineTextField | Multi-line input | ❌ | ✅ |

## Next Steps

Now that you understand UI file structure and syntax:

- **[Interactive Pages](/guides/ui/interactive-pages)** - Connect UI to Java code
- **[BuilderCodec](/guides/ui/builder-codec)** - Handle user interactions
- **[Troubleshooting](/guides/ui/troubleshooting)** - Fix common issues

Master the .ui syntax, and you'll be able to create beautiful, professional custom interfaces for your Hytale plugins!
