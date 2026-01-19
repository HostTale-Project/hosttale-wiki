---
title: Get started
description: Writing your first Hytale mod.
---

Ready to create your first Hytale server plugin? This guide will help you set up a new mod project that works seamlessly across all operating systems.

## What You'll Need

Before diving in, ensure your development environment is ready:

- Hytale Launcher (installed and updated)
- Java 25 SDK
- IntelliJ IDEA (Community or Ultimate edition)

## Setting Up Your Project

### Downloading the Template

We'll use a specially configured template that includes everything you need, including automatic server setup. Clone it with:

```bash
git clone https://github.com/realBritakee/hytale-template-plugin.git MyAwesomePlugin
cd MyAwesomePlugin
```

Replace `MyAwesomePlugin` with your preferred project name.

### Configuring Before Import

To prevent caching issues, configure these files **before** opening the project in your IDE:

**settings.gradle** - Set your project name:
```groovy
rootProject.name = 'MyAwesomePlugin'
```

**gradle.properties** - Define your maven group and version:
```properties
maven_group = com.yourname
version = 1.0.0
```

**src/main/resources/manifest.json** - Update your plugin details:
```json
{
  "Main": "com.yourname.MyPlugin",
  "Name": "My Awesome Plugin",
  "Version": "1.0.0"
}
```

:::caution
The `"Main"` property must exactly match your entry-point class path, or your plugin won't load!
:::

### Opening in IntelliJ

Now you're ready to import:

1. Launch IntelliJ IDEA
2. Click "Open" and select your template folder
3. Wait for Gradle to sync completely

Gradle will automatically download dependencies, create a `./run` folder, and set up a HytaleServer run configuration for you.

## Running Your First Test

### Server Authentication

Before you can connect to your development server, you need to authenticate:

1. Start the HytaleServer configuration from the run dropdown
2. In the server console, type: `auth login device`
3. Visit the URL shown and log in with your Hytale account
4. Once verified, run: `auth persistence Encrypted`

### Testing In-Game

Now let's verify everything works:

1. Launch your Hytale client
2. Connect to "Local Server" (127.0.0.1)
3. Type `/test` in the chat

If you see your plugin version, congratulations! Your setup is complete.

## Development Workflow

### Running and Debugging

Look for the HytaleServer configuration in the top-right dropdown. Click the green play button to start the server, or use the debug icon to enable breakpoints for troubleshooting.

### Including Assets

Want to add custom models or textures? Place them in:
- `src/main/resources/Common/` - For shared assets
- `src/main/resources/Server/` - For server-only assets

These can be edited in real-time using Hytale's in-game Asset Editor.

## Building Your Plugin

When you're ready to share your creation:

1. Open the Gradle panel on the right side
2. Navigate to Tasks → build → build
3. Find your compiled JAR in `build/libs/`

To test it manually, copy the JAR to `%appdata%/Hytale/UserData/Mods/` (Windows) or the equivalent on your OS.

## Troubleshooting

**Gradle sync fails?** Check that your Project SDK is set to Java 25 in File → Project Structure.

**Can't connect to server?** Make sure you completed the authentication steps.

**Plugin not loading?** Double-check the `"Main"` class path in your manifest.json for typos.

## Next Steps

You're now ready to start building! Explore the code structure, experiment with the example command, and begin implementing your ideas. Check out the rest of our documentation to learn about creating commands, handling events, and more advanced plugin development techniques.
