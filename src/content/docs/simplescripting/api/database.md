---
title: Database
description: Persist data with the per-mod SQLite database provided by SimpleScripting.
---

SimpleScripting gives every mod its own SQLite database at a fixed, validated path:

```
<server-root>/universe/SimpleScripting/<mod-id>/db/mod.sqlite
```

Directories are created automatically. Mods cannot override the location.

## Lifecycle

- The database opens on first use and stays open for the mod.
- Connections close on mod disable or reload.
- Data persists across reloads and uninstall.

## Isolation & Guardrails

- `ATTACH`, `DETACH`, `PRAGMA`, `VACUUM`, and `load_extension` are blocked.
- Connections run in WAL mode with `busy_timeout` and `foreign_keys` enabled.
- Default row limit: **10k rows** per query (errors if exceeded).
- Statement timeout: **5s**; busy timeout: **5s**.
- Optional size cap (~50MB) configurable via `simplescripting.db.*` system properties.
- Access is serialized per mod to prevent cross-thread contention.

## API

- `db.execute(sql, params?)` → `{ changes, lastInsertRowid? }`
- `db.query(sql, params?)` → `row[]`
- `db.queryOne(sql, params?)` → `row | null`
- `db.transaction(fn)` → result of `fn` (rolled back on throw)

### Parameters and row shape

- Use `?` placeholders; values may be `string | number | boolean | null | byte[] | Uint8Array | number[]` (for BLOB).
- Rows are plain JS objects keyed by column label.
- BLOB columns surface as byte arrays.

## Examples

```javascript
db.execute("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, coins INTEGER)");
db.execute("INSERT INTO users (id, coins) VALUES (?, ?)", [playerId, 100]);

const top = db.query("SELECT id, coins FROM users WHERE coins > ?", [50]);
const one = db.queryOne("SELECT coins FROM users WHERE id = ?", [playerId]);
```

Transactional updates:

```javascript
db.transaction(() => {
  const row = db.queryOne("SELECT coins FROM users WHERE id = ?", [playerId]);
  const coins = row ? row.coins : 0;
  db.execute("UPDATE users SET coins = ? WHERE id = ?", [coins + 10, playerId]);
});
```

:::tip[See It In Action]
Check out the **[welcome-rewards example](/simplescripting/examples/overview#welcome-rewards)** for production-ready database usage including CREATE TABLE, INSERT, UPDATE, and SELECT queries with playtime tracking.

For multi-table databases, see **[home-warps example](/simplescripting/examples/overview#home-warps)** which uses separate tables for homes and warps with composite primary keys.
:::

---

## Complete Recipes

### Recipe: Player Statistics with Leaderboard

Shows: Database schema design + ranking queries + incremental updates

```javascript
function onEnable() {
  // Create comprehensive stats table
  db.execute(`
    CREATE TABLE IF NOT EXISTS player_stats (
      player TEXT PRIMARY KEY,
      joins INTEGER DEFAULT 0,
      playtime INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      last_seen INTEGER
    )
  `);
  
  // Track joins
  events.on('playerready', function(event) {
    var name = event.player.getUsername();
    db.execute(
      'INSERT INTO player_stats (player, joins, last_seen) VALUES (?, 1, ?) ' +
      'ON CONFLICT(player) DO UPDATE SET joins = joins + 1, last_seen = ?',
      [name, Date.now(), Date.now()]
    );
  });
  
  // Track chat messages
  events.on('playerchat', function(event) {
    var name = event.getPlayer().getUsername();
    db.execute(
      'UPDATE player_stats SET messages = messages + 1 WHERE player = ?',
      [name]
    );
  });
  
  // Leaderboard command
  commands.register('top', function(context) {
    var args = context.args();
    var stat = args.length > 0 ? args[0] : 'joins';
    
    // Validate stat column
    var validStats = ['joins', 'playtime', 'messages'];
    if (validStats.indexOf(stat) === -1) {
      context.reply("Valid stats: " + validStats.join(', '));
      return;
    }
    
    // Get top 10
    var query = 'SELECT player, ' + stat + ' FROM player_stats ' +
                'WHERE ' + stat + ' > 0 ' +
                'ORDER BY ' + stat + ' DESC LIMIT 10';
    
    var top = db.query(query);
    
    context.reply(ui.color('=== Top 10 by ' + stat + ' ===', '#FFD700'));
    
    for (var i = 0; i < top.length; i++) {
      var rank = i + 1;
      var entry = top[i];
      context.reply(ui.join(
        ui.color('#' + rank + ' ', '#FFFF00'),
        entry.player + ' - ' + entry[stat]
      ));
    }
  }, { description: "View leaderboards" });
}
```

### Recipe: Achievement System

Shows: BLOB storage + JSON serialization + complex queries

```javascript
function onEnable() {
  db.execute(`
    CREATE TABLE IF NOT EXISTS achievements (
      player TEXT PRIMARY KEY,
      unlocked_json TEXT,
      progress_json TEXT,
      points INTEGER DEFAULT 0
    )
  `);
  
  var ACHIEVEMENTS = {
    'first_join': { name: 'Welcome!', points: 10 },
    'chat_100': { name: 'Chatterbox', points: 25 },
    'playtime_1h': { name: 'Regular', points: 50 }
  };
  
  function getPlayerData(playerName) {
    var row = db.queryOne('SELECT * FROM achievements WHERE player = ?', [playerName]);
    if (!row) {
      return {
        unlocked: [],
        progress: {},
        points: 0
      };
    }
    return {
      unlocked: JSON.parse(row.unlocked_json || '[]'),
      progress: JSON.parse(row.progress_json || '{}'),
      points: row.points
    };
  }
  
  function unlockAchievement(playerName, achievementId) {
    var data = getPlayerData(playerName);
    
    // Check if already unlocked
    if (data.unlocked.indexOf(achievementId) !== -1) {
      return false;
    }
    
    // Add achievement
    data.unlocked.push(achievementId);
    data.points += ACHIEVEMENTS[achievementId].points;
    
    // Save
    db.execute(
      'INSERT INTO achievements (player, unlocked_json, progress_json, points) ' +
      'VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(player) DO UPDATE SET unlocked_json = ?, points = ?',
      [playerName, JSON.stringify(data.unlocked), JSON.stringify(data.progress), data.points,
       JSON.stringify(data.unlocked), data.points]
    );
    
    // Notify player
    var player = players.find(playerName);
    if (player && player.isOnline()) {
      player.sendMessage(ui.color(
        '🏆 Achievement Unlocked: ' + ACHIEVEMENTS[achievementId].name + 
        ' (+' + ACHIEVEMENTS[achievementId].points + ' points)',
        '#FFD700'
      ));
    }
    
    return true;
  }
  
  // Track first join
  events.on('playerready', function(event) {
    var name = event.player.getUsername();
    unlockAchievement(name, 'first_join');
  });
  
  // View achievements command
  commands.register('achievements', function(context) {
    var player = context.sender();
    var name = player.getUsername();
    var data = getPlayerData(name);
    
    context.reply(ui.color('=== Your Achievements (' + data.points + ' points) ===', '#FFD700'));
    
    for (var id in ACHIEVEMENTS) {
      var ach = ACHIEVEMENTS[id];
      var unlocked = data.unlocked.indexOf(id) !== -1;
      var status = unlocked ? '✓' : '✗';
      var color = unlocked ? '#00FF00' : '#808080';
      
      context.reply(ui.color(status + ' ' + ach.name + ' (' + ach.points + ' pts)', color));
    }
  });
}
```

### Recipe: Economy with Transactions Log

Shows: Multi-table relationships + transaction history + rollback patterns

```javascript
function onEnable() {
  // Main balance table
  db.execute(`
    CREATE TABLE IF NOT EXISTS balances (
      player TEXT PRIMARY KEY,
      balance REAL DEFAULT 0,
      created INTEGER,
      updated INTEGER
    )
  `);
  
  // Transaction log table
  db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player TEXT,
      amount REAL,
      type TEXT,
      reason TEXT,
      timestamp INTEGER
    )
  `);
  
  // Create index for faster queries
  db.execute('CREATE INDEX IF NOT EXISTS idx_transactions_player ON transactions(player)');
  
  function getBalance(playerName) {
    var row = db.queryOne('SELECT balance FROM balances WHERE player = ?', [playerName]);
    return row ? row.balance : 0;
  }
  
  function setBalance(playerName, amount, reason) {
    var now = Date.now();
    var oldBalance = getBalance(playerName);
    var change = amount - oldBalance;
    var type = change > 0 ? 'deposit' : 'withdraw';
    
    // Update balance
    db.transaction(function() {
      db.execute(
        'INSERT INTO balances (player, balance, created, updated) VALUES (?, ?, ?, ?) ' +
        'ON CONFLICT(player) DO UPDATE SET balance = ?, updated = ?',
        [playerName, amount, now, now, amount, now]
      );
      
      // Log transaction
      db.execute(
        'INSERT INTO transactions (player, amount, type, reason, timestamp) VALUES (?, ?, ?, ?, ?)',
        [playerName, Math.abs(change), type, reason, now]
      );
    });
  }
  
  function addMoney(playerName, amount, reason) {
    var balance = getBalance(playerName);
    setBalance(playerName, balance + amount, reason);
  }
  
  function removeMoney(playerName, amount, reason) {
    var balance = getBalance(playerName);
    if (balance < amount) {
      return false;
    }
    setBalance(playerName, balance - amount, reason);
    return true;
  }
  
  // Commands
  commands.register('balance', function(context) {
    var player = context.sender();
    var balance = getBalance(player.getUsername());
    context.reply("Your balance: $" + balance.toFixed(2));
  });
  
  commands.register('transactions', function(context) {
    var player = context.sender();
    var name = player.getUsername();
    
    var logs = db.query(
      'SELECT type, amount, reason, timestamp FROM transactions WHERE player = ? ORDER BY timestamp DESC LIMIT 10',
      [name]
    );
    
    context.reply(ui.color('=== Recent Transactions ===', '#FFD700'));
    
    for (var i = 0; i < logs.length; i++) {
      var log = logs[i];
      var sign = log.type === 'deposit' ? '+' : '-';
      var color = log.type === 'deposit' ? '#00FF00' : '#FF0000';
      var date = new Date(log.timestamp).toLocaleString();
      
      context.reply(ui.join(
        ui.color(sign + '$' + log.amount.toFixed(2), color),
        ' - ' + log.reason + ' (' + date + ')'
      ));
    }
  });
}
```

---

## Migrations & Best Practices

- Track schema versions in a `meta` table and run numbered upgrades during `onEnable`.
- Keep transactions short; avoid long-running queries.
- Index hot columns and avoid `SELECT *` inside loops.
- Store complex objects as JSON strings if needed.
- Monitor the row/size limits and adjust queries accordingly.
