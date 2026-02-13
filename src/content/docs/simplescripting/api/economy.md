---
title: Economy API (Extension)
description: Economy integration for JS mods via the EconomySS extension plugin
---

:::caution[Extension Plugin Required]
The Economy API is provided by the **EconomySS extension plugin**, not SimpleScripting core. You must install EconomySS separately.
:::

The Economy API provides a unified interface to work with player currency. It automatically detects and works with **VaultUnlocked** (recommended) or **EliteEssentials**.

## Supported Economy Providers

EconomySS supports multiple economy plugins (in priority order):

1. **VaultUnlocked** (recommended) - Universal economy API that works with many economy plugins:
   - Econtale, TheEconomy, DynastyEconomy, Coins, Maiconomy, EcoTale, EasyEcon, and more
   - Install VaultUnlocked + any compatible economy plugin
2. **EliteEssentials** - Built-in economy system with direct integration

:::tip[Recommended Setup]
For maximum compatibility, install **VaultUnlocked** as your economy API layer. This allows you to use any VaultUnlocked-compatible economy plugin without changing your JS mods.
:::

## Installation

### Option 1: Using VaultUnlocked (Recommended)

1. Install SimpleScripting
2. Install **EconomySS** extension plugin
3. Install **VaultUnlocked** plugin
4. Install any VaultUnlocked-compatible economy plugin (Econtale, TheEconomy, etc.)

### Option 2: Using EliteEssentials

1. Install SimpleScripting
2. Install **EconomySS** extension plugin
3. Install **EliteEssentials** plugin

## Availability

Always check if an economy plugin is loaded before using economy features:

```javascript
function onEnable() {
  if (!economy.isAvailable()) {
    console.warn("Economy not available - install EconomySS and an economy provider");
    return;
  }
  
  console.info("Economy provider: " + economy.getName());
  registerEconomyCommands();
}
```

The API uses lazy initialization, so economy plugins can load after SimpleScripting.

## Extension Events

The Economy API emits events via the extension event bus:

```javascript
// Listen for economy initialization
extensions.on("economy:ready", function(providerName) {
  log.info("Economy ready: " + providerName);
});

// Listen for balance changes
extensions.on("economy:balance-changed", function(event) {
  // event = {playerUuid, amount, type}
  log.info("Balance " + event.type + ": " + event.amount);
});
```

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
  
  events.on("playerready", function(event) {
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

:::tip[See It In Action]
Check out the **[player-shops example](/simplescripting/examples/overview#player-shops)** (EconomySS mod) for a complete player-to-player economy with shop creation, item listing, purchasing, and earnings tracking.
:::

---

## Complete Recipes

### Recipe: Daily Login Rewards with Streaks

Shows: Economy integration + database tracking + streak bonuses

```javascript
function onEnable() {
  if (!economy.isAvailable()) {
    console.warn("Economy not available!");
    return;
  }
  
  db.execute(`
    CREATE TABLE IF NOT EXISTS daily_rewards (
      player_uuid TEXT PRIMARY KEY,
      last_claim INTEGER,
      streak INTEGER DEFAULT 0,
      total_earned REAL DEFAULT 0
    )
  `);
  
  var BASE_REWARD = 100;
  var STREAK_BONUS = 50;
  
  commands.register('daily', function(ctx) {
    if (!ctx.isPlayer()) return;
    
    var player = ctx.sender();
    var uuid = player.getId();
    var now = Date.now();
    
    var row = db.queryOne('SELECT * FROM daily_rewards WHERE player_uuid = ?', [uuid]);
    var lastClaim = row ? row.last_claim : 0;
    var streak = row ? row.streak : 0;
    
    // Check if 24 hours passed
    var hoursSince = (now - lastClaim) / (1000 * 60 * 60);
    
    if (hoursSince < 24) {
      ctx.reply(ui.color('⏱ Next reward in ' + (24 - hoursSince).toFixed(1) + 'h', '#FF6B6B'));
      return;
    }
    
    // Update streak (breaks if missed a day)
    var newStreak = (hoursSince < 48) ? streak + 1 : 1;
    var bonusAmount = newStreak * STREAK_BONUS;
    var totalReward = BASE_REWARD + bonusAmount;
    
    // Give money
    if (economy.deposit(uuid, totalReward)) {
      var totalEarned = (row ? row.total_earned : 0) + totalReward;
      
      db.execute(
        'INSERT INTO daily_rewards (player_uuid, last_claim, streak, total_earned) ' +
        'VALUES (?, ?, ?, ?) ' +
        'ON CONFLICT(player_uuid) DO UPDATE SET last_claim = ?, streak = ?, total_earned = ?',
        [uuid, now, newStreak, totalEarned, now, newStreak, totalEarned]
      );
      
      ctx.reply(ui.color('╔═════════════════════════╗', '#FFD700'));
      ctx.reply(ui.color('║  🎁 Daily Reward! 🎁   ║', '#FFD700'));
      ctx.reply(ui.color('╠═════════════════════════╣', '#FFD700'));
      ctx.reply(ui.color('║  +$' + totalReward + ' (streak: ' + newStreak + ')  ║', '#00FF00'));
      ctx.reply(ui.color('╚═════════════════════════╝', '#FFD700'));
    } else {
      ctx.reply("Failed to give reward!");
    }
  });
}
```

### Recipe: Player Shop System

Shows: Player-to-player trading + permissions + inventory

```javascript
function onEnable() {
  if (!economy.isAvailable()) return;
  
  db.execute(`
    CREATE TABLE IF NOT EXISTS shop_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_uuid TEXT,
      seller_name TEXT,
      item_id TEXT,
      amount INTEGER,
      price REAL,
      created INTEGER
    )
  `);
  
  commands.register('sellitem', function(ctx) {
    if (!ctx.isPlayer()) return;
    
    var args = ctx.args();
    if (args.length < 3) {
      ctx.reply("Usage: /sellitem <itemId> <amount> <price>");
      return;
    }
    
    var itemId = args[0];
    var amount = parseInt(args[1]);
    var price = parseFloat(args[2]);
    
    if (amount <= 0 || price <= 0) {
      ctx.reply("Amount and price must be positive!");
      return;
    }
    
    var player = ctx.sender();
    var inventory = player.getInventory();
    
    // Check if player has items
    if (inventory.getItemAmount(itemId) < amount) {
      ctx.reply("You don't have enough " + itemId);
      return;
    }
    
    // Remove items from inventory
    inventory.removeItem(itemId, amount);
    
    // Create listing
    db.execute(
      'INSERT INTO shop_listings (seller_uuid, seller_name, item_id, amount, price, created) ' +
      'VALUES (?, ?, ?, ?, ?, ?)',
      [player.getId(), player.getUsername(), itemId, amount, price, Date.now()]
    );
    
    ctx.reply(ui.color('✓ Listed ' + amount + 'x ' + itemId + ' for $' + price, '#00FF00'));
  });
  
  commands.register('shoplist', function(ctx) {
    var listings = db.query('SELECT * FROM shop_listings ORDER BY created DESC LIMIT 20');
    
    if (listings.length === 0) {
      ctx.reply("No items for sale");
      return;
    }
    
    ctx.reply(ui.color('=== Player Shop Listings ===', '#FFD700'));
    
    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      ctx.reply(ui.join(
        ui.color('#' + listing.id, '#FFFF00'),
        ' - ',
        listing.amount + 'x ' + listing.item_id,
        ' | $' + listing.price,
        ' | Seller: ' + listing.seller_name
      ));
    }
    
    ctx.reply(ui.color('Use /buyitem <id> to purchase', '#808080'));
  });
  
  commands.register('buyitem', function(ctx) {
    if (!ctx.isPlayer()) return;
    
    var args = ctx.args();
    if (args.length < 1) {
      ctx.reply("Usage: /buyitem <listingId>");
      return;
    }
    
    var listingId = parseInt(args[0]);
    var buyer = ctx.sender();
    var buyerUuid = buyer.getId();
    
    // Get listing
    var listing = db.queryOne('SELECT * FROM shop_listings WHERE id = ?', [listingId]);
    
    if (!listing) {
      ctx.reply("Listing not found!");
      return;
    }
    
    // Can't buy own listing
    if (listing.seller_uuid === buyerUuid) {
      ctx.reply("You can't buy your own listing!");
      return;
    }
    
    // Check buyer has money
    if (!economy.has(buyerUuid, listing.price)) {
      ctx.reply(ui.color("Insufficient funds! Need $" + listing.price, '#FF0000'));
      return;
    }
    
    // Process transaction
    if (economy.withdraw(buyerUuid, listing.price)) {
      // Pay seller
      economy.deposit(listing.seller_uuid, listing.price);
      
      // Give items to buyer
      buyer.getInventory().addItem(listing.item_id, listing.amount);
      
      // Remove listing
      db.execute('DELETE FROM shop_listings WHERE id = ?', [listingId]);
      
      ctx.reply(ui.color('✓ Purchased ' + listing.amount + 'x ' + listing.item_id + ' for $' + listing.price, '#00FF00'));
      
      // Notify seller if online
      var seller = players.find(listing.seller_name);
      if (seller && seller.isOnline()) {
        seller.message(ui.color('Your listing sold! +$' + listing.price, '#00FF00'));
      }
    } else {
      ctx.reply("Transaction failed!");
    }
  });
}
```

### Recipe: Bounty System

Shows: Player-funded rewards + event-based payouts

```javascript
function onEnable() {
  if (!economy.isAvailable()) return;
  
  db.execute(`
    CREATE TABLE IF NOT EXISTS bounties (
      target_uuid TEXT PRIMARY KEY,
      target_name TEXT,
      reward REAL,
      placed_by TEXT,
      created INTEGER
    )
  `);
  
  commands.register('bounty', function(ctx) {
    if (!ctx.isPlayer()) return;
    
    var args = ctx.args();
    if (args.length < 2) {
      ctx.reply("Usage: /bounty <player> <amount>");
      return;
    }
    
    var targetName = args[0];
    var amount = parseFloat(args[1]);
    
    if (amount < 100) {
      ctx.reply("Minimum bounty: $100");
      return;
    }
    
    var target = players.find(targetName);
    if (!target) {
      ctx.reply("Player not found!");
      return;
    }
    
    var placer = ctx.sender();
    var placerUuid = placer.getId();
    var targetUuid = target.getId();
    
    if (placerUuid === targetUuid) {
      ctx.reply("You can't place a bounty on yourself!");
      return;
    }
    
    // Check balance
    if (!economy.has(placerUuid, amount)) {
      ctx.reply(ui.color("Insufficient funds!", '#FF0000'));
      return;
    }
    
    // Withdraw money
    if (economy.withdraw(placerUuid, amount)) {
      // Add or update bounty
      var existing = db.queryOne('SELECT reward FROM bounties WHERE target_uuid = ?', [targetUuid]);
      var newReward = existing ? existing.reward + amount : amount;
      
      db.execute(
        'INSERT INTO bounties (target_uuid, target_name, reward, placed_by, created) ' +
        'VALUES (?, ?, ?, ?, ?) ' +
        'ON CONFLICT(target_uuid) DO UPDATE SET reward = ?',
        [targetUuid, target.getUsername(), newReward, placer.getUsername(), Date.now(), newReward]
      );
      
      ctx.reply(ui.color('✓ Bounty placed on ' + targetName + ': $' + newReward, '#FF6B6B'));
      
      // Announce
      server.broadcast(ui.color('💀 Bounty on ' + targetName + ': $' + newReward + '!', '#FF6B6B'));
    }
  });
  
  commands.register('bounties', function(ctx) {
    var bounties = db.query('SELECT * FROM bounties ORDER BY reward DESC');
    
    if (bounties.length === 0) {
      ctx.reply("No active bounties");
      return;
    }
    
    ctx.reply(ui.color('=== Active Bounties ===', '#FF6B6B'));
    
    for (var i = 0; i < bounties.length; i++) {
      var bounty = bounties[i];
      ctx.reply(ui.join(
        ui.color('💀 ', '#FF0000'),
        bounty.target_name,
        ' - $',
        ui.color(bounty.reward.toFixed(2), '#FFD700')
      ));
    }
  });
  
  // Pay bounty on kill
  events.on('entitykilled', function(event) {
    var victim = event.getVictim();
    var killer = event.getKiller();
    
    if (!victim || !killer) return;
    if (!victim.isPlayer() || !killer.isPlayer()) return;
    
    var victimUuid = victim.getId();
    
    // Check for bounty
    var bounty = db.queryOne('SELECT * FROM bounties WHERE target_uuid = ?', [victimUuid]);
    
    if (bounty) {
      // Pay killer
      economy.deposit(killer.getId(), bounty.reward);
      
      // Remove bounty
      db.execute('DELETE FROM bounties WHERE target_uuid = ?', [victimUuid]);
      
      // Announce
      server.broadcast(ui.color(
        '💀 ' + killer.getUsername() + ' collected the bounty on ' + victim.getUsername() + '! ($' + bounty.reward + ')',
        '#FFD700'
      ));
    }
  });
}
```

---

## Best Practices

### Always Validate Input

```javascript
// Not supported: Bad - no validation
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
// Not supported: Bad - assume success
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
  
  ifEconomySS extension works with:

- **EconomyAPI** (`Economy:EconomySystem`) - Modern economy API for Hytale
- **EliteEssentials** (`com.eliteessentials:EliteEssentials`) - Built-in economy system

Install one of these plugins in your server's `mods` folder.
## Supported Providers

The API works with:

- **VaultUnlocked** - Modern economy API for Hytale (requires economy provider plugin)
- **EliteEssentials** - Built-in economy system with configurable currency

Install one of these plugins in your server's `mods` folder. For EliteEssentials, ensure economy is enabled in `mods/EliteEssentials/config.json`:

```json
{
  "economy": {
    "enabled": true,
    "starEconomySS extension plugin is installed
- Ensure economy provider plugin is installed (EconomyAPI or EliteEssentials)
- Check plugins load in correct order (SimpleScripting → EconomySS → provider)

**Balance always returns 0:**
- Ensure you're using player UUID, not username
- Check player has joined at least once (creates account)
- Verify economy plugin is working with its own commands

**Operations always fail:**
- Validate amounts are positive and not NaN
- Check player has sufficient funds before withdrawing
- Review server logs for economy plugin errors

## See Also

- [Extension System](/simplescripting/api/extensions) - Learn how extensions work
- [Extension Events](/simplescripting/api/extensions#extension-event-bus) - More about extension event
- Ensure you're using player UUID, not username
- Check player has joined at least once (creates account)
- Verify economy plugin is working with its own commands

**Operations always fail:**
- Validate amounts are positive and not NaN
- Check player has sufficient funds before withdrawing
- Review server logs for economy plugin errors
