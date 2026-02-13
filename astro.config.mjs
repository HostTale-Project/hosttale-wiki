// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://wiki.hosttale.com',
	integrations: [
		sitemap({
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date(),
		}),
		starlight({
			title: 'HostTale',
			description: 'Comprehensive documentation for Hytale server plugin development. Learn to create custom mods, commands, UI, and ECS systems for Hytale servers.',
			favicon: '/favicon.svg',
			head: [
				// Enhanced SEO and OpenGraph meta tags
				{
					tag: 'meta',
					attrs: {
						property: 'og:type',
						content: 'website',
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:locale',
						content: 'en_US',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:card',
						content: 'summary_large_image',
					},
				},
				// Schema.org structured data for Agentic SEO
				{
					tag: 'script',
					attrs: {
						type: 'application/ld+json',
					},
					content: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'TechArticle',
						'name': 'HostTale Documentation',
						'description': 'Comprehensive documentation for Hytale server plugin development',
						'about': {
							'@type': 'SoftwareApplication',
							'name': 'HostTale',
							'applicationCategory': 'DeveloperApplication',
							'operatingSystem': 'Cross-platform',
							'offers': {
								'@type': 'Offer',
								'price': '0',
								'priceCurrency': 'USD',
							}
						},
						'audience': {
							'@type': 'Audience',
							'audienceType': 'Developers'
						},
						'inLanguage': 'en-US',
					}),
				},
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/HostTale-Project/hosttale-wiki' }],
			sidebar: [
				{
					label: 'Guides',
					collapsed: true,
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Get started', slug: 'guides/get-started' },
						{ label: 'Commands', slug: 'guides/commands'},
						{ label: 'FAQ', slug: 'guides/faq'},
						{
							label: 'Custom UI',
							collapsed: false,
							items: [
								{ label: 'Overview', slug: 'guides/ui/overview' },
								{ label: 'Quick Start', slug: 'guides/ui/quick-start' },
								{ label: 'UI Files', slug: 'guides/ui/ui-files' },
								{ label: 'Interactive Pages', slug: 'guides/ui/interactive-pages' },
								{ label: 'BuilderCodec', slug: 'guides/ui/builder-codec' },
								{ label: 'Troubleshooting', slug: 'guides/ui/troubleshooting' },							{ label: 'FAQ', slug: 'guides/ui/faq' },							],
						},
						{
							label: 'ECS',
							collapsed: false,
							items: [
								{ label: 'Overview', slug: 'guides/ecs/overview' },
								{ label: 'Registry & Runtime Objects', slug: 'guides/ecs/registry-and-runtime-objects' },
								{ label: 'Systems & Queries', slug: 'guides/ecs/systems-and-queries' },
								{ label: 'Components & Events', slug: 'guides/ecs/components-and-events' },
								{ label: 'Serialization & Resources', slug: 'guides/ecs/serialization-and-resources' },							{ label: 'FAQ', slug: 'guides/ecs/faq' },							],
						},
					],
				},
				{
					label: 'SimpleScripting',
					items: [
						{ label: 'Overview', slug: 'simplescripting/overview' },
						{ label: 'Introduction', slug: 'simplescripting/introduction' },
						{
							label: 'Getting Started',
							collapsed: false,
							items: [
								{ label: 'Learning Path', slug: 'simplescripting/getting-started/learning-path' },
								{ label: 'Installation', slug: 'simplescripting/getting-started/installation' },
								{ label: 'Folder Structure', slug: 'simplescripting/getting-started/folder-structure' },							{ label: 'FAQ', slug: 'simplescripting/getting-started/faq' },							]
						},
						{
							label: 'Tutorials',
							collapsed: false,
							items: [
								{ label: 'Your First Mod', slug: 'simplescripting/tutorials/your-first-mod' },
							]
						},
						{
							label: 'Examples',
							collapsed: false,
							items: [
								{ label: 'Example Mods Overview', slug: 'simplescripting/examples/overview' },
							]
						},
						{
							label: 'Mod Development',
							collapsed: false,
							items: [
								{ label: 'Mod Layout', slug: 'simplescripting/mod-development/mod-layout' },
								{ label: 'Manifest', slug: 'simplescripting/mod-development/manifest' },
								{ label: 'Lifecycle', slug: 'simplescripting/mod-development/lifecycle' },
								{ label: 'Dependencies and Order', slug: 'simplescripting/mod-development/dependencies-and-order' },
							]
						},
						{
							label: 'Runtime API',
							collapsed: false,
							items: [
								{ label: 'API Overview', slug: 'simplescripting/api/overview' },
								{ label: 'Events & Commands', slug: 'simplescripting/api/events-and-commands' },
								{ label: 'Inventory & Items', slug: 'simplescripting/api/inventory-and-items' },
								{ label: 'Players & Worlds', slug: 'simplescripting/api/players-and-worlds' },
								{ label: 'Server, Net & Assets', slug: 'simplescripting/api/server-net-and-assets' },
								{ label: 'UI & Messages', slug: 'simplescripting/api/ui-and-messages' },
								{ label: 'Modules & Shared Services', slug: 'simplescripting/api/modules-and-shared-services' },
								{ label: 'Database', slug: 'simplescripting/api/database' },
								{ label: 'Extensions', slug: 'simplescripting/api/extensions' },
								{ label: 'Economy (Extension)', slug: 'simplescripting/api/economy' },
							],
						},
						{
							label: 'ECS',
							collapsed: false,
							items: [
								{ label: 'ECS Overview', slug: 'simplescripting/ecs/overview' },
								{ label: 'Components & Queries', slug: 'simplescripting/ecs/components-and-queries' },
								{ label: 'Systems & Events', slug: 'simplescripting/ecs/systems-and-events' },
								{ label: 'ECS API Reference', slug: 'simplescripting/ecs/api-reference' },
								{ label: 'Spatial, Motion & Damage', slug: 'simplescripting/ecs/spatial-and-helpers' },
								{ label: 'ECS Recipes', slug: 'simplescripting/ecs/recipes' },
							],
						},
						{
							label: 'Interop',
							collapsed: false,
							items: [
								{ label: 'Shared Services', slug: 'simplescripting/interop/shared-services' },
							]
						},
						{ label: 'FAQ', slug: 'simplescripting/faq' },
						{ label: 'Limitations', slug: 'simplescripting/limitations' },
					]
				}
			],
		}),
	],
});
