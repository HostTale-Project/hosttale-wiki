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
