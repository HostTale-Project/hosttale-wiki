---
title: InteractiveCustomUIPage - Java Backend
description: Master the Java class that powers your custom UI with dynamic content and event handling.
---

`InteractiveCustomUIPage` is the Java class that brings your UI to life. It loads the .ui file, populates dynamic content, handles user events, and manages state updates.

## Class Structure

Every custom UI extends `InteractiveCustomUIPage` with a generic data type:

```java
public class MyUI extends InteractiveCustomUIPage<MyUI.MyData> {
    
    // Constructor
    public MyUI(@Nonnull PlayerRef playerRef) {
        super(playerRef, CustomPageLifetime.CanDismiss, MyData.CODEC);
    }
    
    // Build UI structure and event bindings
    @Override
    public void build(@Nonnull Ref<EntityStore> ref,
                      @Nonnull UICommandBuilder uiCommandBuilder,
                      @Nonnull UIEventBuilder uiEventBuilder,
                      @Nonnull Store<EntityStore> store) {
        // Load .ui file and configure
    }
    
    // Handle user interactions
    @Override
    public void handleDataEvent(@Nonnull Ref<EntityStore> ref,
                                @Nonnull Store<EntityStore> store,
                                @Nonnull MyData data) {
        // Process events
    }
    
    // Data class with BuilderCodec
    public static class MyData {
        public static final BuilderCodec<MyData> CODEC = ...;
        private String someField;
    }
}
```

## Constructor

The constructor initializes your UI and sets its lifetime behavior.

### Basic Pattern

```java
public class MyUI extends InteractiveCustomUIPage<MyUI.MyData> {
    
    private final PlayerRef playerRef;
    
    public MyUI(@Nonnull PlayerRef playerRef) {
        super(playerRef, CustomPageLifetime.CanDismiss, MyData.CODEC);
        this.playerRef = playerRef;
    }
}
```

**Always store the `PlayerRef`** - you'll need it to send messages to the player.

### With Additional State

You can pass and store additional data needed for your UI:

```java
public class ItemShopUI extends InteractiveCustomUIPage<ItemShopUI.ShopData> {
    
    private final PlayerRef playerRef;
    private final String shopId;
    private final List<ShopItem> items;
    
    public ItemShopUI(@Nonnull PlayerRef playerRef, String shopId) {
        super(playerRef, CustomPageLifetime.CanDismiss, ShopData.CODEC);
        this.playerRef = playerRef;
        this.shopId = shopId;
        this.items = loadShopItems(shopId);
    }
    
    private List<ShopItem> loadShopItems(String shopId) {
        // Load items from database/config
        return DatabaseService.getShopItems(shopId);
    }
}
```

### CustomPageLifetime Options

Control how players can close your UI:

```java
// Player can press ESC to close
CustomPageLifetime.CanDismiss

// Stays open until code explicitly closes it
CustomPageLifetime.CantClose
```

Use `CantClose` for:
- Critical confirmation dialogs
- Forced choices
- Mandatory forms
- Tutorial steps

## build() Method

The `build()` method is called when the UI opens and whenever `sendUpdate()` is called. This is where you load the .ui file, set values, and configure event bindings.

### Load UI File

Always start by loading your .ui file:

```java
@Override
public void build(@Nonnull Ref<EntityStore> ref,
                  @Nonnull UICommandBuilder uiCommandBuilder,
                  @Nonnull UIEventBuilder uiEventBuilder,
                  @Nonnull Store<EntityStore> store) {
    
    // Load the main UI file
    uiCommandBuilder.append("MyPlugin/MyUI.ui");
}
```

### Set Static Values

Set text, visibility, and other properties:

```java
@Override
public void build(...) {
    uiCommandBuilder.append("MyPlugin/ShopUI.ui");
    
    // Set text content
    uiCommandBuilder.set("#Title.Text", "Welcome to My Shop");
    
    // Set visibility
    uiCommandBuilder.set("#ErrorMessage.Visible", false);
    
    // Set input values
    uiCommandBuilder.set("#SearchBox.Value", "");
    
    // Set button enabled state
    uiCommandBuilder.set("#SaveBtn.Enabled", true);
}
```

### Set Dynamic Values

Use instance variables to make content dynamic:

```java
public class ShopUI extends InteractiveCustomUIPage<ShopUI.ShopData> {
    
    private final PlayerRef playerRef;
    private final String shopName;
    private int playerBalance;
    
    public ShopUI(@Nonnull PlayerRef playerRef, String shopName) {
        super(playerRef, CustomPageLifetime.CanDismiss, ShopData.CODEC);
        this.playerRef = playerRef;
        this.shopName = shopName;
        this.playerBalance = getPlayerBalance(playerRef);
    }
    
    @Override
    public void build(...) {
        uiCommandBuilder.append("MyPlugin/ShopUI.ui");
        
        // Use instance variables
        uiCommandBuilder.set("#Title.Text", "Shop: " + shopName);
        uiCommandBuilder.set("#Balance.Text", "Balance: $" + playerBalance);
    }
}
```

### Build Dynamic Lists

Create lists of items dynamically:

```java
@Override
public void build(...) {
    uiCommandBuilder.append("MyPlugin/ShopUI.ui");
    
    // Clear any existing items first
    uiCommandBuilder.clear("#ItemList");
    
    // Add items dynamically
    for (int i = 0; i < items.size(); i++) {
        ShopItem item = items.get(i);
        
        // Append template for each item
        uiCommandBuilder.append("#ItemList", "MyPlugin/ItemCard.ui");
        
        // Set values for this specific item
        uiCommandBuilder.set("#ItemList[" + i + "] #ItemName.Text", item.getName());
        uiCommandBuilder.set("#ItemList[" + i + "] #Price.Text", "$" + item.getPrice());
        uiCommandBuilder.set("#ItemList[" + i + "] #Icon.Visible", item.hasIcon());
        
        // Bind click event with item-specific data
        uiEventBuilder.addEventBinding(
            CustomUIEventBindingType.Activating,
            "#ItemList[" + i + "] #BuyButton",
            EventData.of("Action", "buy").append("ItemId", String.valueOf(item.getId()))
        );
    }
}
```

**Important**: Always use `clear()` before rebuilding dynamic lists to remove old items.

## Event Binding

Event bindings connect UI interactions to your Java code.

### Button Click

Bind a button's click event:

```java
uiEventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,  // Event type
    "#SaveButton",                         // CSS selector
    EventData.of("Action", "save")         // Data sent with event
);
```

### Text Input Change

Bind to text field value changes:

```java
uiEventBuilder.addEventBinding(
    CustomUIEventBindingType.ValueChanged,
    "#SearchBox",
    EventData.of("@SearchQuery", "#SearchBox.Value"),
    false  // Don't trigger on initial page load
);
```

The `@` prefix means "get the current value from this UI element."

### Multiple Data Points

Send multiple pieces of data with one event:

```java
uiEventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,
    "#BuyButton",
    EventData.of("Action", "buy")
        .append("ItemId", "sword_001")
        .append("Quantity", "5")
        .append("Source", "shop")
);
```

### Dynamic List Item Events

When building lists, each item needs unique event data:

```java
for (int i = 0; i < players.size(); i++) {
    Player player = players.get(i);
    
    uiCommandBuilder.append("#PlayerList", "MyPlugin/PlayerCard.ui");
    uiCommandBuilder.set("#PlayerList[" + i + "] #Name.Text", player.getName());
    
    // Each button gets unique player data
    uiEventBuilder.addEventBinding(
        CustomUIEventBindingType.Activating,
        "#PlayerList[" + i + "] #KickBtn",
        EventData.of("Action", "kick").append("PlayerId", player.getUuid().toString())
    );
}
```

## handleDataEvent() Method

This method is called when the player interacts with the UI. It receives the deserialized event data.

### Basic Pattern

```java
@Override
public void handleDataEvent(@Nonnull Ref<EntityStore> ref,
                            @Nonnull Store<EntityStore> store,
                            @Nonnull MyData data) {
    super.handleDataEvent(ref, store, data);  // Always call this first!
    
    // Check which action occurred
    if (data.action != null) {
        switch (data.action) {
            case "save" -> handleSave(ref, store);
            case "cancel" -> handleCancel(ref, store);
            case "delete" -> handleDelete(ref, store);
        }
    }
}

private void handleSave(Ref<EntityStore> ref, Store<EntityStore> store) {
    // Save logic
    playerRef.sendMessage(Message.raw("Saved!").color("#00FF00"));
}

private void handleCancel(Ref<EntityStore> ref, Store<EntityStore> store) {
    // Cancel logic
    var player = store.getComponent(ref, Player.getComponentType());
    player.getPageManager().closeCustomPage();
}
```

**Critical**: Always call `super.handleDataEvent(ref, store, data)` first!

### With Text Input Handling

Handle text input changes and update the UI:

```java
@Override
public void handleDataEvent(..., MyData data) {
    super.handleDataEvent(ref, store, data);
    
    // Update search query when text changes
    if (data.searchQuery != null) {
        this.currentSearchQuery = data.searchQuery;
        // Refresh the list with filtered results
        sendUpdate();
        return;
    }
    
    // Handle button clicks
    if (data.action != null) {
        switch (data.action) {
            case "clear" -> {
                this.currentSearchQuery = "";
                sendUpdate();
            }
            case "search" -> performSearch();
        }
    }
}
```

### Navigate to Another Page

Open a different custom UI:

```java
private void openDetailPage(Ref<EntityStore> ref, Store<EntityStore> store, String itemId) {
    var player = store.getComponent(ref, Player.getComponentType());
    player.getPageManager().openCustomPage(
        ref,
        store,
        new ItemDetailUI(playerRef, itemId)
    );
}
```

### Close the UI

Close the current custom page:

```java
private void closeUI(Ref<EntityStore> ref, Store<EntityStore> store) {
    var player = store.getComponent(ref, Player.getComponentType());
    player.getPageManager().closeCustomPage();
}
```

## Updating the UI

### Full Rebuild with sendUpdate()

Call `sendUpdate()` to trigger a full rebuild (calls `build()` again):

```java
@Override
public void handleDataEvent(..., MyData data) {
    super.handleDataEvent(ref, store, data);
    
    if (data.searchQuery != null) {
        this.searchQuery = data.searchQuery;
        sendUpdate();  // Rebuild entire UI with new search results
        return;
    }
}
```

Use this when:
- Filter or search criteria change
- Data changes require rebuilding lists
- Multiple elements need updates

### Selective Updates

For small changes, create targeted updates without full rebuild:

```java
// Create builders
UICommandBuilder commandBuilder = new UICommandBuilder();
UIEventBuilder eventBuilder = new UIEventBuilder();

// Make specific changes
commandBuilder.set("#Status.Text", "Processing...");
commandBuilder.set("#Progress.Visible", true);

// Send partial update
this.sendUpdate(commandBuilder, eventBuilder, false);
```

Use this when:
- Only one or two values change
- Performance is critical
- Full rebuild is unnecessary

## Working with Player Data

### Get Player Component

```java
@Override
public void handleDataEvent(Ref<EntityStore> ref, Store<EntityStore> store, MyData data) {
    super.handleDataEvent(ref, store, data);
    
    // Get the player component
    var player = store.getComponent(ref, Player.getComponentType());
    
    // Access player information
    String playerName = player.getName();
    boolean isOp = player.isOp();
    World world = player.getWorld();
}
```

### Send Messages to Player

```java
// Success message (green)
playerRef.sendMessage(Message.raw("Success!").color("#00FF00"));

// Error message (red)
playerRef.sendMessage(Message.raw("Error occurred!").color("#FF0000"));

// Warning message (yellow)
playerRef.sendMessage(Message.raw("Warning!").color("#FFFF00"));

// Formatted message with multiple colors
playerRef.sendMessage(
    Message.raw("You purchased ")
        .append(Message.raw(itemName).color("#FFD700"))
        .append(Message.raw(" for "))
        .append(Message.raw("$" + price).color("#00FF00"))
);
```

## Complete Example: Shop UI

Here's a complete example showing all concepts together:

```java
package com.myplugin.ui;

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
import java.util.ArrayList;
import java.util.List;

public class ShopUI extends InteractiveCustomUIPage<ShopUI.ShopData> {
    
    private final PlayerRef playerRef;
    private final List<ShopItem> items;
    private String searchQuery = "";
    private String selectedCategory = "all";
    
    public ShopUI(@Nonnull PlayerRef playerRef) {
        super(playerRef, CustomPageLifetime.CanDismiss, ShopData.CODEC);
        this.playerRef = playerRef;
        this.items = loadShopItems();
    }
    
    private List<ShopItem> loadShopItems() {
        // Load from database or config
        List<ShopItem> items = new ArrayList<>();
        items.add(new ShopItem("sword", "Diamond Sword", 100));
        items.add(new ShopItem("shield", "Iron Shield", 50));
        items.add(new ShopItem("potion", "Health Potion", 20));
        return items;
    }
    
    @Override
    public void build(@Nonnull Ref<EntityStore> ref,
                      @Nonnull UICommandBuilder cmd,
                      @Nonnull UIEventBuilder evt,
                      @Nonnull Store<EntityStore> store) {
        
        cmd.append("MyPlugin/Shop.ui");
        cmd.set("#Title.Text", "Item Shop");
        
        // Search box
        cmd.set("#SearchBox.Value", searchQuery);
        evt.addEventBinding(
            CustomUIEventBindingType.ValueChanged,
            "#SearchBox",
            EventData.of("@Search", "#SearchBox.Value"),
            false
        );
        
        // Category dropdown
        cmd.set("#CategoryDropdown.Value", selectedCategory);
        evt.addEventBinding(
            CustomUIEventBindingType.ValueChanged,
            "#CategoryDropdown",
            EventData.of("@Category", "#CategoryDropdown.Value"),
            false
        );
        
        // Filter and display items
        List<ShopItem> filteredItems = items.stream()
            .filter(item -> item.getName().toLowerCase().contains(searchQuery.toLowerCase()))
            .filter(item -> selectedCategory.equals("all") || item.getCategory().equals(selectedCategory))
            .toList();
        
        cmd.clear("#ItemList");
        for (int i = 0; i < filteredItems.size(); i++) {
            ShopItem item = filteredItems.get(i);
            
            cmd.append("#ItemList", "MyPlugin/ItemRow.ui");
            cmd.set("#ItemList[" + i + "] #ItemName.Text", item.getName());
            cmd.set("#ItemList[" + i + "] #Price.Text", "$" + item.getPrice());
            
            evt.addEventBinding(
                CustomUIEventBindingType.Activating,
                "#ItemList[" + i + "] #BuyBtn",
                EventData.of("Action", "buy")
                    .append("ItemId", item.getId())
                    .append("Price", String.valueOf(item.getPrice()))
            );
        }
        
        // Close button
        evt.addEventBinding(
            CustomUIEventBindingType.Activating,
            "#CloseBtn",
            EventData.of("Action", "close")
        );
    }
    
    @Override
    public void handleDataEvent(@Nonnull Ref<EntityStore> ref,
                                @Nonnull Store<EntityStore> store,
                                @Nonnull ShopData data) {
        super.handleDataEvent(ref, store, data);
        
        // Update search query
        if (data.search != null) {
            this.searchQuery = data.search;
            sendUpdate();
            return;
        }
        
        // Update category filter
        if (data.category != null) {
            this.selectedCategory = data.category;
            sendUpdate();
            return;
        }
        
        // Handle actions
        if (data.action != null) {
            var player = store.getComponent(ref, Player.getComponentType());
            
            switch (data.action) {
                case "buy" -> handlePurchase(data.itemId, data.price);
                case "close" -> player.getPageManager().closeCustomPage();
            }
        }
    }
    
    private void handlePurchase(String itemId, String priceStr) {
        int price = Integer.parseInt(priceStr);
        
        // Check if player can afford it
        if (canAfford(price)) {
            deductMoney(price);
            giveItem(itemId);
            playerRef.sendMessage(
                Message.raw("Purchase successful!").color("#00FF00")
            );
        } else {
            playerRef.sendMessage(
                Message.raw("Insufficient funds!").color("#FF0000")
            );
        }
    }
    
    // Helper methods
    private boolean canAfford(int price) { return true; }
    private void deductMoney(int amount) { }
    private void giveItem(String itemId) { }
    
    // Data class
    public static class ShopData {
        public static final BuilderCodec<ShopData> CODEC =
            BuilderCodec.builder(ShopData.class, ShopData::new)
                .append(new KeyedCodec<>("Action", Codec.STRING), 
                    (d, v) -> d.action = v, d -> d.action).add()
                .append(new KeyedCodec<>("ItemId", Codec.STRING), 
                    (d, v) -> d.itemId = v, d -> d.itemId).add()
                .append(new KeyedCodec<>("Price", Codec.STRING), 
                    (d, v) -> d.price = v, d -> d.price).add()
                .append(new KeyedCodec<>("@Search", Codec.STRING), 
                    (d, v) -> d.search = v, d -> d.search).add()
                .append(new KeyedCodec<>("@Category", Codec.STRING), 
                    (d, v) -> d.category = v, d -> d.category).add()
                .build();
        
        private String action;
        private String itemId;
        private String price;
        private String search;
        private String category;
    }
    
    // Helper class
    private static class ShopItem {
        private final String id;
        private final String name;
        private final int price;
        
        public ShopItem(String id, String name, int price) {
            this.id = id;
            this.name = name;
            this.price = price;
        }
        
        public String getId() { return id; }
        public String getName() { return name; }
        public int getPrice() { return price; }
        public String getCategory() { return "weapon"; }
    }
}
```

## Best Practices

### Do's ✅

- **Store PlayerRef**: Always keep reference for sending messages
- **Check for null**: Event data fields can be null
- **Call super first**: Always call `super.handleDataEvent()` at the start
- **Return early**: After handling specific events, return to avoid processing others
- **Clear before rebuild**: Use `clear()` before rebuilding dynamic lists
- **Track indices carefully**: When binding events to list items, index must match

### Don'ts ❌

- **Don't store Player component**: Store PlayerRef instead
- **Don't block threads**: Keep event handlers fast and non-blocking
- **Don't forget sendUpdate()**: Call it after state changes
- **Don't assume data exists**: Always check for null
- **Don't skip super call**: Missing `super.handleDataEvent()` causes issues

## Next Steps

Now that you understand the Java backend:

- **[BuilderCodec Deep Dive](/guides/ui/builder-codec)** - Master data binding
- **[Troubleshooting](/guides/ui/troubleshooting)** - Fix common issues
- Build a complete feature combining all concepts

You now have the knowledge to create powerful, dynamic custom UIs!
