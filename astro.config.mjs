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
			],
		}),
	],
});
