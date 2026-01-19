---
title: BuilderCodec - Data Binding System
description: Understand BuilderCodec for serializing data between custom UIs and Java code.
---

`BuilderCodec` is Hytale's serialization mechanism that defines the data contract between your UI and Java code. It specifies what information can flow from UI events to your event handlers and ensures type-safe data transfer.

## Why BuilderCodec?

When a player interacts with your UI, the system needs to know:
- What data to send from the UI
- How to serialize it for network transfer
- How to deserialize it into your Java objects
- What fields your code expects to receive

BuilderCodec handles all of this automatically.

## The Data Flow

```
Player Clicks Button → UI Event → BuilderCodec Serializes → Network Transfer
                                                                    ↓
Your Code Processes ← Data Object Created ← BuilderCodec Deserializes
```

## Basic Structure

Every `InteractiveCustomUIPage` needs a data class with a `BuilderCodec`:

```java
public static class MyData {
    // The codec definition
    public static final BuilderCodec<MyData> CODEC = 
        BuilderCodec.builder(MyData.class, MyData::new)
            .append(
                new KeyedCodec<>("KeyName", Codec.STRING),  // Key and type
                (data, value) -> data.fieldName = value,    // Setter
                data -> data.fieldName                       // Getter
            ).add()  // Finalize this field
            .build();
    
    // The actual field
    private String fieldName;
}
```

## Simple Example: Single Field

Let's create a simple data class with one field:

```java
public static class ButtonData {
    public static final BuilderCodec<ButtonData> CODEC =
        BuilderCodec.builder(ButtonData.class, ButtonData::new)
            .append(
                new KeyedCodec<>("Action", Codec.STRING),
                (d, v) -> d.action = v,
                d -> d.action
            ).add()
            .build();
    
    private String action;
}
```

**Usage in event binding:**
```java
EventData.of("Action", "buttonClicked")
```

**Usage in handler:**
```java
if ("buttonClicked".equals(data.action)) {
    // Handle button click
}
```

## Multiple Fields

Most UIs need multiple data fields:

```java
public static class ShopData {
    public static final BuilderCodec<ShopData> CODEC =
        BuilderCodec.builder(ShopData.class, ShopData::new)
            // Button action field
            .append(
                new KeyedCodec<>("Action", Codec.STRING),
                (d, v) -> d.action = v,
                d -> d.action
            ).add()
            // Item ID field
            .append(
                new KeyedCodec<>("ItemId", Codec.STRING),
                (d, v) -> d.itemId = v,
                d -> d.itemId
            ).add()
            // Quantity field
            .append(
                new KeyedCodec<>("Quantity", Codec.INT),
                (d, v) -> d.quantity = v,
                d -> d.quantity
            ).add()
            // Search query field
            .append(
                new KeyedCodec<>("@Search", Codec.STRING),
                (d, v) -> d.searchQuery = v,
                d -> d.searchQuery
            ).add()
            .build();
    
    private String action;
    private String itemId;
    private Integer quantity;
    private String searchQuery;
}
```

**Critical**: Always call `.add()` after each `.append()` to finalize that field!

## Supported Data Types

BuilderCodec supports various data types through different codec types:

### String

```java
new KeyedCodec<>("Name", Codec.STRING)
```

**Example:**
```java
.append(
    new KeyedCodec<>("PlayerName", Codec.STRING),
    (d, v) -> d.playerName = v,
    d -> d.playerName
).add()

private String playerName;
```

### Integer

```java
new KeyedCodec<>("Count", Codec.INT)
```

**Example:**
```java
.append(
    new KeyedCodec<>("Amount", Codec.INT),
    (d, v) -> d.amount = v,
    d -> d.amount
).add()

private Integer amount;
```

### Boolean

```java
new KeyedCodec<>("Enabled", Codec.BOOLEAN)
```

**Example:**
```java
.append(
    new KeyedCodec<>("IsEnabled", Codec.BOOLEAN),
    (d, v) -> d.isEnabled = v,
    d -> d.isEnabled
).add()

private Boolean isEnabled;
```

### Double

```java
new KeyedCodec<>("Price", Codec.DOUBLE)
```

**Example:**
```java
.append(
    new KeyedCodec<>("Price", Codec.DOUBLE),
    (d, v) -> d.price = v,
    d -> d.price
).add()

private Double price;
```

### UUID

```java
new KeyedCodec<>("PlayerId", Codec.UUID)
```

**Example:**
```java
.append(
    new KeyedCodec<>("PlayerId", Codec.UUID),
    (d, v) -> d.playerId = v,
    d -> d.playerId
).add()

private UUID playerId;
```

## Key Naming Conventions

### Action Keys (Static Values)

For static values like button clicks, use simple descriptive names **without** the `@` prefix:

```java
EventData.of("Action", "save")
EventData.of("Action", "delete")
EventData.of("Action", "confirm")
EventData.of("ButtonClick", "submit")
```

These send predefined string values.

### Value Keys (Dynamic UI Values)

For values that come from UI elements (text fields, dropdowns, etc.), use the `@` prefix:

```java
EventData.of("@InputField", "#InputBox.Value")
EventData.of("@SearchQuery", "#SearchBox.Value")
EventData.of("@Category", "#CategoryDropdown.Value")
EventData.of("@Enabled", "#EnableCheckbox.Checked")
```

The `@` tells the system to extract the current value from the specified UI element.

## Connecting Event Bindings to BuilderCodec

The key names in your event bindings must exactly match the key names in your BuilderCodec.

### Button Click Example

**UI File:**
```
Button #SaveBtn { ... }
```

**Event Binding:**
```java
uiEventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,
    "#SaveBtn",
    EventData.of("Action", "save")  // Key: "Action", Value: "save"
);
```

**BuilderCodec:**
```java
.append(
    new KeyedCodec<>("Action", Codec.STRING),  // Key must match: "Action"
    (d, v) -> d.action = v,
    d -> d.action
).add()

private String action;
```

**Handler:**
```java
if ("save".equals(data.action)) {  // Check the value "save"
    handleSave();
}
```

### Text Input Example

**UI File:**
```
TextField #NameInput { ... }
```

**Event Binding:**
```java
uiEventBuilder.addEventBinding(
    CustomUIEventBindingType.ValueChanged,
    "#NameInput",
    EventData.of("@Name", "#NameInput.Value"),  // @ = get value from element
    false  // Don't trigger on initial page load
);
```

**BuilderCodec:**
```java
.append(
    new KeyedCodec<>("@Name", Codec.STRING),  // Key must match: "@Name"
    (d, v) -> d.name = v,
    d -> d.name
).add()

private String name;
```

**Handler:**
```java
if (data.name != null) {
    this.currentName = data.name;
    sendUpdate();  // Refresh UI with new name
}
```

## Sending Multiple Data Points

You can send multiple pieces of data with a single event:

**Event Binding:**
```java
uiEventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,
    "#BuyButton",
    EventData.of("Action", "buy")
        .append("ItemId", "diamond_sword")
        .append("Quantity", "5")
        .append("Category", "weapons")
);
```

**BuilderCodec:**
```java
public static class PurchaseData {
    public static final BuilderCodec<PurchaseData> CODEC =
        BuilderCodec.builder(PurchaseData.class, PurchaseData::new)
            .append(new KeyedCodec<>("Action", Codec.STRING), 
                (d, v) -> d.action = v, d -> d.action).add()
            .append(new KeyedCodec<>("ItemId", Codec.STRING), 
                (d, v) -> d.itemId = v, d -> d.itemId).add()
            .append(new KeyedCodec<>("Quantity", Codec.STRING), 
                (d, v) -> d.quantity = v, d -> d.quantity).add()
            .append(new KeyedCodec<>("Category", Codec.STRING), 
                (d, v) -> d.category = v, d -> d.category).add()
            .build();
    
    private String action;
    private String itemId;
    private String quantity;
    private String category;
}
```

**Handler:**
```java
if ("buy".equals(data.action)) {
    String item = data.itemId;      // "diamond_sword"
    String qty = data.quantity;     // "5"
    String cat = data.category;     // "weapons"
    processPurchase(item, qty, cat);
}
```

## Dynamic List Item Events

When building dynamic lists, each item can send unique data:

**Build Method:**
```java
for (int i = 0; i < items.size(); i++) {
    Item item = items.get(i);
    
    uiCommandBuilder.append("#ItemList", "MyPlugin/ItemRow.ui");
    uiCommandBuilder.set("#ItemList[" + i + "] #Name.Text", item.getName());
    
    // Each item's button sends its unique ID
    uiEventBuilder.addEventBinding(
        CustomUIEventBindingType.Activating,
        "#ItemList[" + i + "] #SelectBtn",
        EventData.of("Action", "select")
            .append("ItemId", item.getId())
            .append("ItemName", item.getName())
    );
}
```

**Handler:**
```java
if ("select".equals(data.action)) {
    String selectedId = data.itemId;       // ID of clicked item
    String selectedName = data.itemName;   // Name of clicked item
    handleSelection(selectedId, selectedName);
}
```

## Common Patterns

### Simple Action Handler

For UIs with just button actions:

```java
public static class SimpleData {
    public static final BuilderCodec<SimpleData> CODEC =
        BuilderCodec.builder(SimpleData.class, SimpleData::new)
            .append(new KeyedCodec<>("Action", Codec.STRING), 
                (d, v) -> d.action = v, d -> d.action).add()
            .build();
    
    private String action;
}

// Handler
@Override
public void handleDataEvent(..., SimpleData data) {
    super.handleDataEvent(ref, store, data);
    
    if (data.action != null) {
        switch (data.action) {
            case "save" -> handleSave();
            case "cancel" -> handleCancel();
            case "delete" -> handleDelete();
        }
    }
}
```

### Form with Multiple Inputs

For forms collecting multiple fields:

```java
public static class FormData {
    public static final BuilderCodec<FormData> CODEC =
        BuilderCodec.builder(FormData.class, FormData::new)
            .append(new KeyedCodec<>("Action", Codec.STRING), 
                (d, v) -> d.action = v, d -> d.action).add()
            .append(new KeyedCodec<>("@Name", Codec.STRING), 
                (d, v) -> d.name = v, d -> d.name).add()
            .append(new KeyedCodec<>("@Age", Codec.INT), 
                (d, v) -> d.age = v, d -> d.age).add()
            .append(new KeyedCodec<>("@Email", Codec.STRING), 
                (d, v) -> d.email = v, d -> d.email).add()
            .build();
    
    private String action;
    private String name;
    private Integer age;
    private String email;
}

// Handler
@Override
public void handleDataEvent(..., FormData data) {
    super.handleDataEvent(ref, store, data);
    
    // Update fields as they change
    if (data.name != null) {
        this.currentName = data.name;
    }
    if (data.age != null) {
        this.currentAge = data.age;
    }
    if (data.email != null) {
        this.currentEmail = data.email;
    }
    
    // Handle form submission
    if ("submit".equals(data.action)) {
        if (validateForm()) {
            saveForm();
            playerRef.sendMessage(Message.raw("Form saved!").color("#00FF00"));
        } else {
            playerRef.sendMessage(Message.raw("Invalid form data!").color("#FF0000"));
        }
    }
}
```

### Search and Filter

For searchable lists with filters:

```java
public static class SearchData {
    public static final BuilderCodec<SearchData> CODEC =
        BuilderCodec.builder(SearchData.class, SearchData::new)
            .append(new KeyedCodec<>("@Query", Codec.STRING), 
                (d, v) -> d.query = v, d -> d.query).add()
            .append(new KeyedCodec<>("@Category", Codec.STRING), 
                (d, v) -> d.category = v, d -> d.category).add()
            .append(new KeyedCodec<>("@ShowOnlineOnly", Codec.BOOLEAN), 
                (d, v) -> d.showOnlineOnly = v, d -> d.showOnlineOnly).add()
            .append(new KeyedCodec<>("Action", Codec.STRING), 
                (d, v) -> d.action = v, d -> d.action).add()
            .build();
    
    private String query;
    private String category;
    private Boolean showOnlineOnly;
    private String action;
}

// Handler
@Override
public void handleDataEvent(..., SearchData data) {
    super.handleDataEvent(ref, store, data);
    
    boolean needsRefresh = false;
    
    // Update search parameters
    if (data.query != null) {
        this.searchQuery = data.query;
        needsRefresh = true;
    }
    
    if (data.category != null) {
        this.selectedCategory = data.category;
        needsRefresh = true;
    }
    
    if (data.showOnlineOnly != null) {
        this.showOnlineOnly = data.showOnlineOnly;
        needsRefresh = true;
    }
    
    // Refresh results if any search param changed
    if (needsRefresh) {
        sendUpdate();
        return;
    }
    
    // Handle actions
    if (data.action != null) {
        handleAction(data.action);
    }
}
```

## Null Safety

**Important**: Fields that aren't included in an event will be `null`. Always check before using!

```java
// ✅ Good - Null-safe
if (data.action != null && "save".equals(data.action)) {
    handleSave();
}

// ✅ Good - String literal first (null-safe)
if ("save".equals(data.action)) {
    handleSave();
}

// ❌ Bad - NullPointerException if action is null!
if (data.action.equals("save")) {
    handleSave();
}
```

**Best practice**: Put the string literal first in comparisons, or check for null explicitly.

## Debugging BuilderCodec

### Log Received Data

Add logging to see what data you're receiving:

```java
@Override
public void handleDataEvent(..., MyData data) {
    super.handleDataEvent(ref, store, data);
    
    // Debug logging
    System.out.println("=== UI Event Received ===");
    System.out.println("action: " + data.action);
    System.out.println("itemId: " + data.itemId);
    System.out.println("query: " + data.searchQuery);
    System.out.println("========================");
    
    // Your handler code
}
```

### Common Issues

**No data received (field is always null)?**

Check:
- Key names match exactly between `EventData` and `KeyedCodec`
- You called `.add()` after each `.append()`
- The field is actually defined in the codec

**Wrong type errors?**

Check:
- Codec type matches field type (`Codec.STRING` for `String`, `Codec.INT` for `Integer`)
- You're not mixing up types

**Event not firing at all?**

Check:
- Element selector matches ID in .ui file: `#ButtonId`
- Element type supports that event (Button for `Activating`, TextField for `ValueChanged`)
- Event binding was added in `build()` method

## Complete Example

Here's a complete example showing everything together:

```java
public class PlayerManagerUI extends InteractiveCustomUIPage<PlayerManagerUI.ManagerData> {
    
    private final PlayerRef playerRef;
    private String searchQuery = "";
    private boolean showOnlineOnly = false;
    
    public PlayerManagerUI(@Nonnull PlayerRef playerRef) {
        super(playerRef, CustomPageLifetime.CanDismiss, ManagerData.CODEC);
        this.playerRef = playerRef;
    }
    
    @Override
    public void build(@Nonnull Ref<EntityStore> ref,
                      @Nonnull UICommandBuilder cmd,
                      @Nonnull UIEventBuilder evt,
                      @Nonnull Store<EntityStore> store) {
        
        cmd.append("MyPlugin/PlayerManager.ui");
        
        // Search box
        cmd.set("#SearchBox.Value", searchQuery);
        evt.addEventBinding(
            CustomUIEventBindingType.ValueChanged,
            "#SearchBox",
            EventData.of("@Search", "#SearchBox.Value"),
            false
        );
        
        // Online-only checkbox
        cmd.set("#OnlineCheckbox.Checked", showOnlineOnly);
        evt.addEventBinding(
            CustomUIEventBindingType.ValueChanged,
            "#OnlineCheckbox",
            EventData.of("@OnlineOnly", "#OnlineCheckbox.Checked"),
            false
        );
        
        // Action buttons
        evt.addEventBinding(
            CustomUIEventBindingType.Activating,
            "#KickBtn",
            EventData.of("Action", "kick")
        );
        
        evt.addEventBinding(
            CustomUIEventBindingType.Activating,
            "#BanBtn",
            EventData.of("Action", "ban")
        );
    }
    
    @Override
    public void handleDataEvent(@Nonnull Ref<EntityStore> ref,
                                @Nonnull Store<EntityStore> store,
                                @Nonnull ManagerData data) {
        super.handleDataEvent(ref, store, data);
        
        // Update search
        if (data.search != null) {
            this.searchQuery = data.search;
            sendUpdate();
            return;
        }
        
        // Update filter
        if (data.onlineOnly != null) {
            this.showOnlineOnly = data.onlineOnly;
            sendUpdate();
            return;
        }
        
        // Handle actions
        if ("kick".equals(data.action)) {
            handleKick(ref, store);
        } else if ("ban".equals(data.action)) {
            handleBan(ref, store);
        }
    }
    
    private void handleKick(Ref<EntityStore> ref, Store<EntityStore> store) {
        playerRef.sendMessage(Message.raw("Player kicked!").color("#FFAA00"));
    }
    
    private void handleBan(Ref<EntityStore> ref, Store<EntityStore> store) {
        playerRef.sendMessage(Message.raw("Player banned!").color("#FF0000"));
    }
    
    // BuilderCodec Data Class
    public static class ManagerData {
        public static final BuilderCodec<ManagerData> CODEC =
            BuilderCodec.builder(ManagerData.class, ManagerData::new)
                .append(new KeyedCodec<>("Action", Codec.STRING), 
                    (d, v) -> d.action = v, d -> d.action).add()
                .append(new KeyedCodec<>("@Search", Codec.STRING), 
                    (d, v) -> d.search = v, d -> d.search).add()
                .append(new KeyedCodec<>("@OnlineOnly", Codec.BOOLEAN), 
                    (d, v) -> d.onlineOnly = v, d -> d.onlineOnly).add()
                .build();
        
        private String action;
        private String search;
        private Boolean onlineOnly;
    }
}
```

## Best Practices

✅ **Match key names exactly** between event bindings and codec  
✅ **Always call `.add()`** after each `.append()`  
✅ **Check for null** before using data fields  
✅ **Use `@` prefix** for UI element values  
✅ **Use descriptive key names** like "Action", "ItemId", "@SearchQuery"  
✅ **Match types correctly** - `Codec.STRING` for String fields, etc.  

❌ **Don't forget `.add()`** - common mistake!  
❌ **Don't assume non-null** - always check  
❌ **Don't mix up key names** - they must match exactly  
❌ **Don't use wrong codec types** - match your field types  

## Next Steps

Now that you understand BuilderCodec:

- **[Troubleshooting](/guides/ui/troubleshooting)** - Debug common issues
- Build complete UIs combining all the concepts
- Experiment with different data types and patterns

BuilderCodec is the bridge between your UI and code. Master it, and you'll create seamless, responsive custom interfaces!
