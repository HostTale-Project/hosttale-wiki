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
						{ label: 'Commands', slug: 'guides/commands'}
					],
				},
			],
		}),
	],
});
