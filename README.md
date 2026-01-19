# HostTale Wiki

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HostTale Wiki** is a comprehensive documentation resource for Hytale server plugin development. This wiki provides guides, tutorials, and references to help developers create custom plugins for Hytale servers.

## � What's Inside

This documentation covers:

- **Getting Started** - Set up your development environment and create your first plugin
- **Commands** - Build powerful custom commands with type-safe arguments
- **Events** - Respond to game events and player actions
- **Entity Component System** - Work with Hytale's ECS architecture
- **Best Practices** - Learn proven patterns for plugin development

## 🚀 Project Structure

```
.
├── public/              # Static assets (favicons, images)
├── src/
│   ├── assets/          # Images and media
│   ├── content/
│   │   └── docs/        # Documentation pages (.md, .mdx)
│   │       ├── index.mdx
│   │       └── guides/
│   │           ├── get-started.md
│   │           └── commands.md
│   └── content.config.ts
├── astro.config.mjs     # Astro/Starlight configuration
├── package.json
└── tsconfig.json
```

Documentation files are located in `src/content/docs/`. Each file becomes a route based on its file name.

## 🛠️ Development

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/HostTale-Project/hosttale-wiki.git
cd hosttale-wiki

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands



| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fix typos or errors** - Submit a PR with corrections
2. **Add examples** - Share working code examples
3. **Write guides** - Create new tutorials or expand existing ones
4. **Improve clarity** - Make documentation easier to understand

### Adding New Pages

1. Create a new `.md` or `.mdx` file in `src/content/docs/`
2. Add frontmatter with title and description
3. Update `astro.config.mjs` to add the page to the sidebar
4. Write your content using Markdown
5. Submit a pull request

## 📖 Documentation Format

All documentation pages use Markdown with Starlight enhancements:

```markdown
---
title: Page Title
description: Brief description of the page
---

Content goes here...
```

## 🔗 Related Projects

- [Hytale Official Site](https://hytale.com/)
- [Plugin Template](https://github.com/realBritakee/hytale-template-plugin)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🤝 Acknowledgments

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build/) - the modern documentation framework.

---

**Ready to start?** Check out the [Get Started](https://hosttale.wiki/guides/get-started/) guide to create your first Hytale plugin!
