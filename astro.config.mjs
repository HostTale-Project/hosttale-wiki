// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'HostTale',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/HostTale-Project/hosttale-wiki' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Get started', slug: 'guides/get-started' },
						{ label: 'Commands', slug: 'guides/commands'},
						{
							label: 'Custom UI',
							collapsed: false,
							items: [
								{ label: 'Overview', slug: 'guides/ui/overview' },
								{ label: 'Quick Start', slug: 'guides/ui/quick-start' },
								{ label: 'UI Files', slug: 'guides/ui/ui-files' },
								{ label: 'Interactive Pages', slug: 'guides/ui/interactive-pages' },
								{ label: 'BuilderCodec', slug: 'guides/ui/builder-codec' },
								{ label: 'Troubleshooting', slug: 'guides/ui/troubleshooting' },
							],
						},
						{
							label: 'ECS (Native)',
							collapsed: false,
							items: [
								{ label: 'Overview', slug: 'guides/ecs/overview' },
								{ label: 'Registry & Runtime Objects', slug: 'guides/ecs/registry-and-runtime-objects' },
								{ label: 'Systems & Queries', slug: 'guides/ecs/systems-and-queries' },
								{ label: 'Components & Events', slug: 'guides/ecs/components-and-events' },
								{ label: 'Serialization & Resources', slug: 'guides/ecs/serialization-and-resources' },
							],
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
								{ label: 'Installation', slug: 'simplescripting/getting-started/installation' },
								{ label: 'Folder Structure', slug: 'simplescripting/getting-started/folder-structure' },
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
								{ label: 'Players & Worlds', slug: 'simplescripting/api/players-and-worlds' },
								{ label: 'Server, Net & Assets', slug: 'simplescripting/api/server-net-and-assets' },
								{ label: 'UI & Messages', slug: 'simplescripting/api/ui-and-messages' },
								{ label: 'Modules & Shared Services', slug: 'simplescripting/api/modules-and-shared-services' },
								{ label: 'Database', slug: 'simplescripting/api/database' },
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
						{ label: 'limitations', slug: 'simplescripting/limitations' },
					]
				}
			],
		}),
	],
});
