---
title: Troubleshooting Custom UI Issues
description: Common problems and solutions when building custom UIs for Hytale plugins.
---

This guide covers common issues you may encounter when building custom UIs and how to resolve them.

## UI File Errors

### Failed to Parse or Resolve Document

**Error Message:**
```
Failed to parse or resolve document for Custom UI AppendInline command.
Selector: #MyList
```

**Causes:**
1. Invalid inline UI syntax in `appendInline()`
2. Complex nested elements that can't be parsed inline
3. Invalid property values or typos

**Solutions:**

❌ **Don't use appendInline for complex UI:**
```java
// Too complex for inline!
uiCommandBuilder.appendInline("#List", 
    "Group { Group #Inner { Label { Text: 'Complex'; } } }");
```

✅ **Create a separate template .ui file:**
```java
// Create Templates/ItemRow.ui file
uiCommandBuilder.append("#List", "MyPlugin/Templates/ItemRow.ui");
```

✅ **Keep appendInline simple:**
```java
// Simple inline UI is fine
uiCommandBuilder.appendInline("#List", 
    "Group #Container { LayoutMode: Top; }");
```

### Could Not Resolve Expression for Property

**Error Message:**
```
Could not resolve expression for property Alignment to type LabelAlignment
```

**Cause:** Wrong property name or invalid value

**Common Fixes:**

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `Alignment: Left` | `HorizontalAlignment: Start` |
| `Anchor: (Width: 100%)` | `Anchor: (Width: 540)` |
| `HorizontalAlignment: Left` | `HorizontalAlignment: Start` |
| `TextAlign: Center` | `HorizontalAlignment: Center` |

**Valid alignment values:** `Start`, `Center`, `End`

### Element Has No Compatible Activating Event

**Error Message:**
```
Target element in CustomUI event binding has no compatible Activating event.
Selector: #MyGroup
```

**Cause:** Trying to bind an `Activating` event to a non-clickable element like `Group` or `Label`.

**Solution:**

❌ **Wrong - Groups can't be clicked:**
```
Group #ClickableItem {
    // Groups don't support Activating events
}
```

✅ **Correct - Use Button:**
```
Button #ClickableItem {
    // Buttons support Activating events
    Label { Text: "Click me"; }
}
```

### Expected Comma, Found Percentage

**Error Message:**
```
Expected , found %
```

**Cause:** Percentage widths are not supported in Hytale UI files.

❌ **Wrong:**
```
Anchor: (Width: 100%, Height: 300)
```

✅ **Correct:**
```
Anchor: (Width: 540, Height: 300)
```

Use fixed pixel values for all dimensions.

## Java/Code Errors

### No Context Associated with Current Thread

**Error Message:**
```
java.lang.RuntimeException: No Context associated with current Thread
    at org.mozilla.javascript.Context.getContext(Context.java:2546)
```

**Cause:** Trying to execute JavaScript code without properly entering a Rhino Context. This is specific to JavaScript execution, not UI rendering.

**Solution:**

❌ **Wrong - Reusing context without entering:**
```java
public void executeScript(File file) {
    // Using stored context directly fails
    Object result = currentContext.evaluateString(currentScope, code, file.getName(), 1, null);
}
```

✅ **Correct - Enter context before use:**
```java
public void executeScript(File file) {
    Context context = Context.enter();
    try {
        Object result = context.evaluateString(currentScope, code, file.getName(), 1, null);
    } finally {
        Context.exit();  // Always exit in finally block
    }
}
```

**When this occurs:** If you're mixing JavaScript execution with UI code, make sure JavaScript operations properly enter/exit contexts.

### Cannot Resolve Constructor

**Error Message:**
```
Cannot resolve constructor 'MyUI(PlayerRef)'
Constructor signature doesn't match
```

**Cause:** Constructor parameters don't match what you're passing.

**Solution:**

Make sure your constructor signature matches the call site:

```java
// Constructor
public MyUI(@Nonnull PlayerRef playerRef) {
    super(playerRef, CustomPageLifetime.CanDismiss, MyData.CODEC);
    this.playerRef = playerRef;
}

// Opening UI (must match constructor)
player.getPageManager().openCustomPage(
    ref,
    store,
    new MyUI(playerRef)  // Pass exactly what constructor expects
);
```

### NullPointerException in handleDataEvent

**Symptom:** Crashes when handling events

**Cause:** Not checking if data fields are null before using them.

**Solution:**

❌ **Wrong - Assumes non-null:**
```java
@Override
public void handleDataEvent(..., MyData data) {
    super.handleDataEvent(ref, store, data);
    
    if (data.action.equals("save")) {  // NPE if action is null!
        handleSave();
    }
}
```

✅ **Correct - Check for null:**
```java
@Override
public void handleDataEvent(..., MyData data) {
    super.handleDataEvent(ref, store, data);
    
    // String literal first (null-safe)
    if ("save".equals(data.action)) {
        handleSave();
    }
    
    // Or explicit null check
    if (data.action != null && data.action.equals("save")) {
        handleSave();
    }
}
```

**Remember:** Fields that aren't sent with an event will be `null`.

### Missing super.handleDataEvent() Call

**Symptom:** Events not processing correctly, unexpected behavior

**Cause:** Forgetting to call the superclass method.

**Solution:**

❌ **Wrong - Missing super call:**
```java
@Override
public void handleDataEvent(..., MyData data) {
    // Missing super.handleDataEvent()!
    if (data.action != null) {
        handleAction(data.action);
    }
}
```

✅ **Correct - Always call super first:**
```java
@Override
public void handleDataEvent(..., MyData data) {
    super.handleDataEvent(ref, store, data);  // Must be first!
    
    if (data.action != null) {
        handleAction(data.action);
    }
}
```

## Event Binding Issues

### Events Not Firing

**Symptoms:** Click button, type in field, but nothing happens.

**Debugging Checklist:**

1. **Check selector matches element ID:**
   ```java
   // UI file
   Button #SaveBtn { }
   
   // Java - must match exactly (case-sensitive)!
   uiEventBuilder.addEventBinding(..., "#SaveBtn", ...)
   ```

2. **Verify element type supports the event:**
   - `Activating` → Button, ItemSlotButton only
   - `ValueChanged` → TextField, MultilineTextField, Dropdown, Checkbox

3. **Check KeyedCodec key matches EventData key:**
   ```java
   // Event binding
   EventData.of("Action", "save")
   
   // BuilderCodec - key name must match exactly!
   new KeyedCodec<>("Action", Codec.STRING)
   ```

4. **Ensure `.add()` was called:**
   ```java
   .append(
       new KeyedCodec<>("Action", Codec.STRING),
       (d, v) -> d.action = v,
       d -> d.action
   ).add()  // Don't forget this!
   ```

5. **Verify event binding was added in build():**
   ```java
   @Override
   public void build(...) {
       uiCommandBuilder.append("MyUI.ui");
       
       // Event binding must be here
       uiEventBuilder.addEventBinding(...);
   }
   ```

### Receiving Wrong or Null Data

**Symptom:** `data.field` is null or has unexpected value.

**Solutions:**

1. **Check key names match exactly:**
   ```java
   // Binding
   EventData.of("MyAction", "clicked")
   
   // Codec - must match "MyAction" exactly
   new KeyedCodec<>("MyAction", Codec.STRING)
   ```

2. **For UI element values, use `@` prefix:**
   ```java
   // Get current value from UI element
   EventData.of("@SearchQuery", "#SearchBox.Value")
   
   // Codec
   new KeyedCodec<>("@SearchQuery", Codec.STRING)
   ```

3. **Verify codec type matches field type:**
   ```java
   // String value
   EventData.of("Count", "5")
   new KeyedCodec<>("Count", Codec.STRING)  // Match!
   
   // Integer value
   EventData.of("Count", 5)
   new KeyedCodec<>("Count", Codec.INT)  // Match!
   ```

4. **Add debug logging:**
   ```java
   @Override
   public void handleDataEvent(..., MyData data) {
       super.handleDataEvent(ref, store, data);
       
       System.out.println("Received: action=" + data.action + 
                         ", itemId=" + data.itemId);
       
       // Your handler code
   }
   ```

## UI Not Updating

### Changes Not Visible

**Symptoms:** Called `uiCommandBuilder.set()` but UI doesn't update.

**Solutions:**

1. **Call `sendUpdate()` after state changes:**
   ```java
   @Override
   public void handleDataEvent(..., MyData data) {
       super.handleDataEvent(ref, store, data);
       
       if (data.searchQuery != null) {
           this.currentQuery = data.searchQuery;
           sendUpdate();  // Rebuild UI with new data
       }
   }
   ```

2. **Set values in `build()`, not constructor:**
   ```java
   // ✅ Correct
   @Override
   public void build(...) {
       uiCommandBuilder.append("MyUI.ui");
       uiCommandBuilder.set("#Title.Text", titleText);  // Set here
   }
   
   // ❌ Wrong
   public MyUI(...) {
       super(...);
       // Can't set UI values in constructor!
   }
   ```

3. **Use correct property syntax:**
   ```java
   // ✅ Correct - specify property
   uiCommandBuilder.set("#Label.Text", "New Text");
   uiCommandBuilder.set("#Panel.Visible", true);
   
   // ❌ Wrong - missing property
   uiCommandBuilder.set("#Label", "New Text");
   ```

### Dynamic List Not Updating

**Symptom:** List shows old items or duplicates.

**Solution:** Clear the list before rebuilding:

```java
@Override
public void build(...) {
    uiCommandBuilder.append("MyUI.ui");
    
    // Clear old items first
    uiCommandBuilder.clear("#ItemList");
    
    // Now add current items
    for (Item item : items) {
        uiCommandBuilder.append("#ItemList", "ItemRow.ui");
        // Set item values...
    }
}
```

## File Not Found Errors

### UI File Not Found

**Error:**
```
Could not find UI file: MyPlugin/MyUI.ui
```

**Checklist:**

1. **Verify file location:**
   ```
   src/main/resources/Common/UI/Custom/MyPlugin/MyUI.ui
   ```

2. **Check path in code matches:**
   ```java
   // Path is relative to Common/UI/Custom/
   uiCommandBuilder.append("MyPlugin/MyUI.ui");
   ```

3. **Ensure manifest.json is configured:**
   ```json
   {
     "Main": "com.yourplugin.YourPlugin",
     "Name": "Your Plugin",
     "Version": "1.0.0",
     "IncludesAssetPack": true
   }
   ```
   
   The `"IncludesAssetPack": true` is required!

4. **Rebuild the project:**
   ```bash
   ./gradlew build
   ```
   
   UI files are included during build - changes require rebuild.

5. **Check file name case:**
   - File: `MyUI.ui`
   - Code: `"MyPlugin/MyUI.ui"`
   - Must match exactly (case-sensitive on some systems)

## Performance Issues

### UI Feels Slow or Laggy

**Causes:**
1. Too many elements (hundreds of list items)
2. Rebuilding entire UI on every keystroke
3. Heavy computation in `build()` or `handleDataEvent()`

**Solutions:**

1. **Limit list size:**
   ```java
   // Show only first 50 items
   List<Item> displayed = items.stream()
       .limit(50)
       .toList();
   
   // Or use pagination
   int page = currentPage;
   int pageSize = 20;
   List<Item> displayed = items.subList(
       page * pageSize,
       Math.min((page + 1) * pageSize, items.size())
   );
   ```

2. **Debounce search input:**
   ```java
   private long lastSearchTime = 0;
   private static final long SEARCH_DEBOUNCE_MS = 300;
   
   @Override
   public void handleDataEvent(..., MyData data) {
       super.handleDataEvent(ref, store, data);
       
       if (data.searchQuery != null) {
           long now = System.currentTimeMillis();
           if (now - lastSearchTime > SEARCH_DEBOUNCE_MS) {
               this.searchQuery = data.searchQuery;
               sendUpdate();
               lastSearchTime = now;
           }
       }
   }
   ```

3. **Use selective updates instead of full rebuild:**
   ```java
   // Instead of full sendUpdate()
   UICommandBuilder cmd = new UICommandBuilder();
   UIEventBuilder evt = new UIEventBuilder();
   
   cmd.set("#StatusLabel.Text", "Updated!");
   cmd.set("#Progress.Visible", false);
   
   sendUpdate(cmd, evt, false);  // Partial update
   ```

4. **Move heavy work to background:**
   ```java
   // Don't block UI with expensive operations
   CompletableFuture.supplyAsync(() -> {
       return loadExpensiveData();
   }).thenAccept(data -> {
       this.loadedData = data;
       sendUpdate();
   });
   ```

## Common Mistakes Summary

### Forgetting `.add()` in BuilderCodec

❌ **Wrong:**
```java
.append(
    new KeyedCodec<>("Action", Codec.STRING),
    (d, v) -> d.action = v,
    d -> d.action
)  // Missing .add()!
.build();
```

✅ **Correct:**
```java
.append(
    new KeyedCodec<>("Action", Codec.STRING),
    (d, v) -> d.action = v,
    d -> d.action
).add()  // Don't forget!
.build();
```

### Storing Player Component Instead of PlayerRef

❌ **Wrong:**
```java
private final Player player;  // Don't store component!

public MyUI(Player player) {
    this.player = player;  // Wrong!
}
```

✅ **Correct:**
```java
private final PlayerRef playerRef;  // Store PlayerRef

public MyUI(@Nonnull PlayerRef playerRef) {
    this.playerRef = playerRef;  // Correct!
}
```

### Not Using Anchor on Elements

❌ **Wrong:**
```
Button #MyBtn {
    // Button has no size!
}
```

✅ **Correct:**
```
Button #MyBtn {
    Anchor: (Width: 200, Height: 40);
}
```

### Missing Label Inside Button

❌ **Wrong:**
```
Button #MyBtn {
    Text: "Click";  // Buttons don't have Text property
}
```

✅ **Correct:**
```
Button #MyBtn {
    Label {
        Text: "Click";
        Anchor: (Full: 0);
    }
}
```

## Debug Checklist

When something doesn't work, check:

- [ ] UI file exists at correct path
- [ ] Path in `append()` matches file location (case-sensitive)
- [ ] Element IDs match between .ui and Java (`#ElementId`)
- [ ] Event binding keys match BuilderCodec keys exactly
- [ ] Called `.add()` after each `.append()` in BuilderCodec
- [ ] Checked for `null` before using data fields
- [ ] Called `super.handleDataEvent()` first
- [ ] Called `sendUpdate()` after state changes
- [ ] manifest.json has `"IncludesAssetPack": true`
- [ ] Rebuilt project after changes (`./gradlew build`)
- [ ] Element type supports the event type you're binding

## Getting More Help

If you're still stuck after trying these solutions:

1. **Check the examples:** Look at working code in successful plugins
2. **Simplify:** Remove complexity until it works, then add back piece by piece
3. **Add logging:** Print debug information to understand what's happening
4. **Test incrementally:** Build and test after each small change

Most UI issues fall into one of the categories above. Work through the checklist systematically, and you'll find the problem!

## Additional Resources

Related guides:
- [UI Files](/guides/ui/ui-files) - UI syntax reference
- [Interactive Pages](/guides/ui/interactive-pages) - Java backend guide
- [BuilderCodec](/guides/ui/builder-codec) - Data binding system
- [Quick Start](/guides/ui/quick-start) - Complete working example

Remember: Custom UI development is iterative. Don't get discouraged by errors - they're part of the learning process!
