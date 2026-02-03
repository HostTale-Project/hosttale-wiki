---
title: SimpleScripting Getting Started FAQ
description: Common setup and installation questions for SimpleScripting. Learn how to install, configure, and create your first JavaScript mod for Hytale.
---

Quick answers to help you get started with SimpleScripting.

## Installation

### Where do I download SimpleScripting?

SimpleScripting is currently in pre-release. Download it from GitHub:
[SimpleScripting Releases](https://github.com/HostTale-Project/SimpleScripting/releases)

### What are the requirements?

You need:
- A Hytale server (not client)
- Java 25 or higher
- SimpleScripting plugin JAR

No additional dependencies required.

### How do I install SimpleScripting?

1. Download the SimpleScripting JAR
2. Place it in your server's `plugins/` directory
3. Start or restart your server
4. SimpleScripting will create a `mods/` directory automatically

### Where does SimpleScripting create files?

After first run, you'll see:
```
server/
├── plugins/
│   └── SimpleScripting.jar
└── mods/              (created automatically)
    └── (your mods go here)
```

### Can I use SimpleScripting on a client?

No. SimpleScripting is **server-side only**. It runs on the Hytale server, not the game client.

### Does SimpleScripting work with other plugins?

Yes! SimpleScripting is a standard Hytale plugin and works alongside other native plugins.

## Creating Your First Mod

### What's the minimum structure for a mod?

Every mod needs:
```
mods/
└── my-mod/
    ├── mod.json      (required)
    └── main.js       (or your entry file)
```

### What goes in mod.json?

Minimum required fields:
```json
{
  "name": "my-mod",
  "version": "1.0.0",
  "main": "main.js"
}
```

See [Manifest](/simplescripting/mod-development/manifest) for all available fields.

### What goes in the main JavaScript file?

Your mod's entry point. Define lifecycle hooks:

```javascript
function onEnable() {
  log.info("My mod is loading!");
}

function onDisable() {
  log.info("My mod is unloading!");
}
```

### Do I need build tools (webpack, npm, etc.)?

No! SimpleScripting runs JavaScript files directly. No compilation or bundling needed. Just write `.js` files and restart your server.

### Can I use TypeScript?

Not directly. SimpleScripting executes JavaScript. You'd need to compile TypeScript to JavaScript yourself before placing files in the `mods/` folder.

### How do I test my mod?

1. Place it in `mods/yourmod/`
2. Restart the server
3. Check console logs for errors
4. Test functionality in-game

## File Structure

### Can I organize my code into multiple files?

Yes! Use the `require()` function:

```javascript
// utils.js
module.exports = {
  greet: function(name) {
    return "Hello, " + name;
  }
};

// main.js
const utils = require('./utils.js');

function onEnable() {
  log.info(utils.greet("World"));
}
```

### Where do I put additional JavaScript files?

In your mod's directory:
```
mods/my-mod/
├── mod.json
├── main.js
├── commands.js
└── utils/
    └── helpers.js
```

### Can I have subdirectories?

Yes! Organize however you want:
```javascript
const helper = require('./utils/helpers.js');
```

### What about JSON data files?

Place them in your mod directory and read them using the filesystem API (if available) or embed data in JavaScript.

## Configuration

### Can my mod have a config file?

Yes! Create a `config.json` (or any name) in your mod folder and load it in your code. You'll need to use file reading APIs.

### How do I access mod configuration?

SimpleScripting doesn't have built-in config management. You can:
1. Use JSON files and load them manually
2. Store settings in the database
3. Use hardcoded values in your JavaScript

### Can I create server owner-editable configs?

Yes, by creating a JSON file in your mod directory that server owners can edit before starting the server.

## Debugging

### How do I see console output?

Use `log.info()`, `log.warn()`, `log.error()`:

```javascript
log.info("This is an info message");
log.warn("This is a warning");
log.error("This is an error");
```

Output appears in the server console.

### My mod isn't loading. What do I check?

1. **mod.json syntax** - Must be valid JSON (use a JSON validator)
2. **File names** - Check case sensitivity and spelling
3. **Main field** - Must point to existing file
4. **Server logs** - Read error messages carefully
5. **File location** - Must be in `mods/yourmodname/`

### How do I check if my mod loaded?

Look for log messages in console during server startup. SimpleScripting logs which mods are loaded.

### Can I use browser developer tools?

No. SimpleScripting uses GraalVM's JavaScript engine, not a browser. Use `log.*` for debugging.

### How do I debug logic errors?

Use `log.info()` to print variables:

```javascript
function onEnable() {
  let value = calculateSomething();
  log.info("Calculated value: " + value);
}
```

## Mod Loading

### When does my mod load?

During server startup, after SimpleScripting initializes.

### In what order do mods load?

Based on the `dependencies` field in `mod.json`. Mods with no dependencies load first.

See [Dependencies and Order](/simplescripting/mod-development/dependencies-and-order).

### How do I make my mod load after another?

Add it to `dependencies`:

```json
{
  "name": "my-mod",
  "dependencies": ["other-mod"]
}
```

### Can I reload mods without restarting?

Currently, no. You must restart the server to reload mods.

### What happens if a mod fails to load?

SimpleScripting logs the error and continues loading other mods. The failed mod won't be available.

## Common Errors

### "Cannot find module"

Check:
- File path in `require()` is correct
- File extension is included (`.js`)
- Path is relative to current file (`./` or `../`)

### "SyntaxError" in my JavaScript

Your JavaScript has syntax errors. Common causes:
- Missing closing brackets `}`, `)`, `]`
- Missing semicolons (usually okay, but can cause issues)
- Using unsupported JavaScript features

### "Undefined is not a function"

You're calling a method that doesn't exist:
- Check API documentation for correct method names
- Verify the object has the method
- Check for typos

### "mod.json is not valid JSON"

Common JSON mistakes:
- Trailing comma in last property
- Missing quotes around strings
- Using single quotes instead of double quotes
- Comments (JSON doesn't support comments)

### "Permission denied" or file access errors

Check:
- Server has permission to read `mods/` directory
- Files aren't locked by another program
- File paths are correct for your operating system

## Updating & Maintenance

### How do I update SimpleScripting?

1. Download new version
2. Stop server
3. Replace old JAR with new one
4. Start server

Your mods should continue working (unless breaking changes are announced).

### How do I update my mod?

Edit the files, update `version` in `mod.json`, and restart the server.

### Can players use my mod on their own servers?

Yes! Distribute your mod folder (with `mod.json` and all `.js` files). They just drop it in their `mods/` directory.

### Should I version my mod?

Yes! Update the `version` field in `mod.json` when you make changes:
```json
{
  "version": "1.2.0"
}
```

## Next Steps

### Where do I learn the API?

Start with:
1. [API Overview](/simplescripting/api/overview) - Surface area
2. [Events & Commands](/simplescripting/api/events-and-commands) - Basic functionality
3. [Database](/simplescripting/api/database) - Data persistence

### What should my first mod do?

Start simple:
- A command that responds with a message
- A chat listener that modifies messages
- A welcome message when players join

### Where can I find examples?

Check the [SimpleScripting documentation](/simplescripting/overview) for code examples in each API section.

### Can I contribute to SimpleScripting?

Yes! SimpleScripting is open source:
[SimpleScripting GitHub](https://github.com/HostTale-Project/SimpleScripting)

## Related Documentation

- [Installation Guide](/simplescripting/getting-started/installation) - Detailed setup
- [Folder Structure](/simplescripting/getting-started/folder-structure) - File organization
- [Mod Layout](/simplescripting/mod-development/mod-layout) - Structure requirements
- [Manifest](/simplescripting/mod-development/manifest) - mod.json reference
- [SimpleScripting FAQ](/simplescripting/faq) - General questions
- [API Overview](/simplescripting/api/overview) - Start coding

---

*Last updated: February 2026*
