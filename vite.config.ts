import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	server: {
		host: true,
		port: 5500,
	},

	resolve: {
		alias: {
			'@assets': './src/assets',
		},
	},
});