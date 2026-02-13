---
title: Your First Mod - Hello World
description: Create your first SimpleScripting mod with step-by-step instructions showing how to create a command, handle events, and test your mod.
---

In this tutorial, you'll create a working JavaScript mod that responds to a command and tracks player joins. No prior Hytale modding experience required!

:::tip[Prerequisites]
- SimpleScripting installed on your server
- Access to server console or in-game commands
- A text editor (VS Code, Notepad++, or any editor)
:::

## What You'll Build

A mod called `hello-world` that:
- Responds to `/hello` command with a personalized message
- Announces when you join the server
- Tracks how many times players have used the command

---

## Step 1: Create the Mod

Start your Hytale server and run this command in the console or as an admin:

```
/createmod hello-world
```

You'll see a confirmation message:
```
Created mod 'hello-world' at hello-world.
```

The command created this structure:
```
<server-root>/mods/SimpleScripting/mods-js/
└── hello-world/
    ├── mod.json       # Mod configuration
    ├── main.js        # Your code goes here
    └── index.d.ts     # TypeScript definitions for IDE autocomplete
```

---

## Step 2: Write Your First Command

Open `mods/SimpleScripting/mods-js/hello-world/main.js` in your text editor.

Replace the entire file with this code:

```javascript
// Hello World - My first SimpleScripting mod!

function onEnable() {
  log.info("Hello World mod enabled!");
  
  // Register the /hello command
  commands.register('hello', function(context) {
    var playerName = context.senderName();
    context.reply("Hello, " + playerName + "! Welcome to SimpleScripting!");
  }, { 
    description: "Says hello to you" 
  });
}

function onDisable() {
  log.info("Hello World mod disabled");
}
```

**What this code does:**
- `onEnable()` - Runs when the mod loads
- `commands.register('hello', ...)` - Creates the `/hello` command
- `context.senderName()` - Gets the name of who ran the command
- `context.reply()` - Sends a message back to the player
- `onDisable()` - Runs when the mod unloads (cleanup)

---

## Step 3: Test Your Mod

### Option A: Reload the Server
Restart your Hytale server. Watch the console for:
```
[SimpleScripting] Loaded mod: hello-world
[hello-world] Hello World mod enabled!
```

### Option B: Use /scripts Command (if available)
If your server has the scripts GUI enabled, use `/scripts` to reload without restarting.

### Try the Command
Join your server and type:
```
/hello
```

You should see:
```
Hello, YourName! Welcome to SimpleScripting!
```

**Congratulations!** You've created your first mod!

---

## Step 4: Add Event Handling

Let's make the mod announce when you join. Add this event listener inside `onEnable()`:

```javascript
function onEnable() {
  log.info("Hello World mod enabled!");
  
  // Register the /hello command
  commands.register('hello', function(context) {
    var playerName = context.senderName();
    context.reply("Hello, " + playerName + "! Welcome to SimpleScripting!");
  }, { 
    description: "Says hello to you" 
  });
  
  // NEW: Listen for player joins
  events.on('playerready', function(event) {
    var player = event.player;
    player.sendMessage("Welcome, " + player.getUsername() + "!");
    log.info(player.getUsername() + " joined the server");
  });
}
```

**What's new:**
- `events.on('playerready', ...)` - Runs when a player fully joins
- `event.player` - Gets the player object
- `player.sendMessage()` - Sends a message to that specific player
- `player.getUsername()` - Gets the player's name

**Test it:** Restart your server and rejoin. You'll see a welcome message!

---

## Step 5: Add a Database (Track Usage)

Let's count how many times players use the `/hello` command. Update your code:

```javascript
// Hello World - My first SimpleScripting mod!

function onEnable() {
  log.info("Hello World mod enabled!");
  
  // Create a database table for tracking
  db.execute('CREATE TABLE IF NOT EXISTS hello_counts (player TEXT PRIMARY KEY, count INTEGER DEFAULT 0)');
  
  // Register the /hello command
  commands.register('hello', function(context) {
    var playerName = context.senderName();
    
    // Increment the count for this player
    db.execute('INSERT INTO hello_counts (player, count) VALUES (?, 1) ON CONFLICT(player) DO UPDATE SET count = count + 1', 
      [playerName]);
    
    // Get the current count
    var result = db.queryOne('SELECT count FROM hello_counts WHERE player = ?', [playerName]);
    var count = result ? result.count : 1;
    
    // Reply with personalized message
    context.reply("Hello, " + playerName + "! You've said hello " + count + " times!");
  }, { 
    description: "Says hello and tracks your hellos" 
  });
  
  // Listen for player joins
  events.on('playerready', function(event) {
    var player = event.player;
    player.sendMessage("Welcome, " + player.getUsername() + "!");
    log.info(player.getUsername() + " joined the server");
  });
}

function onDisable() {
  log.info("Hello World mod disabled");
}
```

**What's new:**
- `db.execute('CREATE TABLE...')` - Creates a database table
- `db.execute('INSERT...')` - Saves data to the database
- `db.queryOne('SELECT...')` - Retrieves data from the database
- Uses `?` placeholders for safe SQL queries

**Test it:** 
```
/hello
# "Hello, YourName! You've said hello 1 times!"

/hello
# "Hello, YourName! You've said hello 2 times!"
```

---

## Complete Code

Here's the final version of `main.js`:

```javascript
// Hello World - My first SimpleScripting mod!

function onEnable() {
  log.info("Hello World mod enabled!");
  
  // Create a database table for tracking
  db.execute('CREATE TABLE IF NOT EXISTS hello_counts (player TEXT PRIMARY KEY, count INTEGER DEFAULT 0)');
  
  // Register the /hello command
  commands.register('hello', function(context) {
    var playerName = context.senderName();
    
    // Increment the count for this player
    db.execute('INSERT INTO hello_counts (player, count) VALUES (?, 1) ON CONFLICT(player) DO UPDATE SET count = count + 1', 
      [playerName]);
    
    // Get the current count
    var result = db.queryOne('SELECT count FROM hello_counts WHERE player = ?', [playerName]);
    var count = result ? result.count : 1;
    
    // Reply with personalized message
    context.reply("Hello, " + playerName + "! You've said hello " + count + " times!");
  }, { 
    description: "Says hello and tracks your hellos" 
  });
  
  // Listen for player joins
  events.on('playerready', function(event) {
    var player = event.player;
    player.sendMessage("Welcome, " + player.getUsername() + "!");
    log.info(player.getUsername() + " joined the server");
  });
}

function onDisable() {
  log.info("Hello World mod disabled");
}
```

---

## What You Learned

- How to create a mod with `/createmod`  
- How to register commands with `commands.register()`  
- How to handle events with `events.on()`  
- How to save data with the database (`db.execute`, `db.queryOne`)  
- How to send messages to players  
- How to reload and test your mod  

---

## Next Steps

Now that you've built your first mod, try these tutorials:

- **[Commands with Arguments](/simplescripting/tutorials/command-with-args)** - Build commands that accept player input
- **[Persistent Player Data](/simplescripting/tutorials/persistent-data)** - Track complex player statistics
- **[Event Handlers Deep Dive](/simplescripting/tutorials/event-handlers)** - Listen to more game events

Or explore the **[example mods](/simplescripting/examples/overview)** for complete, production-ready code.

---

## Troubleshooting

### Mod doesn't load

Check `mod.json` has `"enabled": true`:
```json
{
  "id": "hello-world",
  "name": "Hello World",
  "version": "1.0.0",
  "enabled": true
}
```

### Command doesn't work

- Make sure you restarted the server after editing
- Check console logs for JavaScript errors
- Verify command name doesn't conflict with other plugins

### Database errors

- Ensure table creation runs in `onEnable()`
- Check SQL syntax (use single quotes for strings)
- Use `?` placeholders for parameters

### Need help?

- Check the [FAQ](/simplescripting/faq)
- Review the [API documentation](/simplescripting/api/overview)
- Study the [example mods](/simplescripting/examples/overview)
