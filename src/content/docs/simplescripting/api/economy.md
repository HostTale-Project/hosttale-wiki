---
title: Economy
description: Integrate with economy plugins using the unified Economy API.
---

The Economy API provides a simple interface to work with player currency. It automatically detects and works with economy plugins like **VaultUnlocked** and **EliteEssentials**.

## Availability

Always check if an economy plugin is loaded before using economy features:

```javascript
function onEnable() {
  if (!economy.isAvailable()) {
    console.warn("Economy not available - install VaultUnlocked or EliteEssentials");
    return;
  }
  
  console.info("Economy provider: " + economy.getName());
  registerEconomyCommands();
}
```

The API uses lazy initialization, so economy plugins can load after SimpleScripting.

## API Methods

All operations use player UUIDs (not usernames). Methods return `boolean` for success/failure or `number` for balance queries.

- `economy.isAvailable()` → `boolean` - Check if economy plugin is loaded
- `economy.getName()` → `string` - Get provider name (`"VaultUnlocked"`, `"EliteEssentials"`, or `"None"`)
- `economy.balance(playerUuid)` → `number` - Get player's balance (returns `0` on error)
- `economy.has(playerUuid, amount)` → `boolean` - Check if player has at least the amount
- `economy.withdraw(playerUuid, amount)` → `boolean` - Remove money from player
- `economy.deposit(playerUuid, amount)` → `boolean` - Add money to player

## Examples

### Balance Command

```javascript
commands.register("mymod:balance", function(ctx) {
  if (!ctx.isPlayer()) {
    ctx.reply("Players only!");
    return;
  }
  
  var uuid = ctx.sender().getId();
  var balance = economy.balance(uuid);
  ctx.reply("Your balance: $" + balance.toFixed(2));
});
```

### Simple Shop

```javascript
var shopItems = {
  "apple": { name: "Apple", price: 10 },
  "sword": { name: "Iron Sword", price: 50 }
};

commands.register("mymod:buy", function(ctx) {
  if (!ctx.isPlayer()) return;
  
  var args = ctx.args();
  if (args.length === 0) {
    ctx.reply("Usage: /buy <item>");
    return;
  }
  
  var itemId = args[0].toLowerCase();
  var item = shopItems[itemId];
  
  if (!item) {
    ctx.reply("Unknown item: " + itemId);
    return;
  }
  
  var uuid = ctx.sender().getId();
  
  if (!economy.has(uuid, item.price)) {
    ctx.reply("You need $" + item.price + " to buy " + item.name);
    return;
  }
  
  if (economy.withdraw(uuid, item.price)) {
    ctx.reply("You bought " + item.name + " for $" + item.price);
    // Give item to player
  } else {
    ctx.reply("Purchase failed!");
  }
});
```

### Transfer Money

```javascript
commands.register("mymod:pay", function(ctx) {
  if (!ctx.isPlayer()) return;
  
  var args = ctx.args();
  if (args.length < 2) {
    ctx.reply("Usage: /pay <player> <amount>");
    return;
  }
  
  var targetName = args[0];
  var amount = parseFloat(args[1]);
  
  if (isNaN(amount) || amount <= 0) {
    ctx.reply("Invalid amount!");
    return;
  }
  
  var sender = ctx.sender();
  var target = players.find(targetName);
  
  if (!target) {
    ctx.reply("Player not found: " + targetName);
    return;
  }
  
  var senderUuid = sender.getId();
  var targetUuid = target.getId();
  
  if (!economy.has(senderUuid, amount)) {
    ctx.reply("Insufficient funds!");
    return;
  }
  
  // Withdraw then deposit with rollback
  if (economy.withdraw(senderUuid, amount)) {
    if (economy.deposit(targetUuid, amount)) {
      ctx.reply("Sent $" + amount.toFixed(2) + " to " + target.getUsername());
      if (target.isOnline()) {
        target.message("You received $" + amount.toFixed(2) + " from " + sender.getUsername());
      }
    } else {
      // Rollback on failure
      economy.deposit(senderUuid, amount);
      ctx.reply("Transfer failed - money refunded");
    }
  }
});
```

### Daily Login Bonus

```javascript
var dailyBonus = 100;
var lastLogin = {}; // Use database in production

function onEnable() {
  if (!economy.isAvailable()) return;
  
  events.on("PlayerJoin", function(event) {
    var player = event.getPlayer();
    var uuid = player.getId();
    var today = new Date().toDateString();
    
    if (lastLogin[uuid] !== today) {
      if (economy.deposit(uuid, dailyBonus)) {
        lastLogin[uuid] = today;
        player.message("Daily bonus: $" + dailyBonus + "!");
      }
    }
  });
}
```

## Best Practices

### Always Validate Input

```javascript
// ❌ Bad - no validation
economy.withdraw(uuid, parseFloat(args[0]));

// ✅ Good - validate everything
var amount = parseFloat(args[0]);
if (isNaN(amount) || amount <= 0 || amount > 1000000) {
  ctx.reply("Invalid amount");
  return;
}
```

### Check Results

```javascript
// ❌ Bad - assume success
economy.withdraw(uuid, price);
giveItem(player); // Might get free item!

// ✅ Good - check results
if (economy.withdraw(uuid, price)) {
  giveItem(player);
} else {
  ctx.reply("Payment failed");
}
```

### Use Rollback for Complex Operations

```javascript
function complexPurchase(uuid, items) {
  var totalCost = calculateCost(items);
  
  if (!economy.withdraw(uuid, totalCost)) {
    return false;
  }
  
  var success = giveAllItems(uuid, items);
  
  if (!success) {
    economy.deposit(uuid, totalCost); // Rollback
    return false;
  }
  
  return true;
}
```

## Supported Providers

The API works with:

- **VaultUnlocked** - Modern economy API for Hytale (requires economy provider plugin)
- **EliteEssentials** - Built-in economy system with configurable currency

Install one of these plugins in your server's `mods` folder. For EliteEssentials, ensure economy is enabled in `mods/EliteEssentials/config.json`:

```json
{
  "economy": {
    "enabled": true,
    "startingBalance": 100.0
  }
}
```

## Troubleshooting

**Economy not available:**
- Verify economy plugin is installed in `mods` folder
- Check plugin is enabled in config (EliteEssentials)

**Balance always returns 0:**
- Ensure you're using player UUID, not username
- Check player has joined at least once (creates account)
- Verify economy plugin is working with its own commands

**Operations always fail:**
- Validate amounts are positive and not NaN
- Check player has sufficient funds before withdrawing
- Review server logs for economy plugin errors
