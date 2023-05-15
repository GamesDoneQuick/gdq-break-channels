import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	optimizeDeps: {
		esbuildOptions: {
			target: 'es2020',
		},
	},
	plugins: [
		react({
			babel: {
				plugins: ['babel-plugin-macros', '@emotion/babel-plugin'],
			},
			jsxImportSource: '@emotion/react',
		}),
	],
	build: {
		rollupOptions: {
			input: {
				index: fileURLToPath(new URL('./src/test/index.html', import.meta.url)),
			},
		},
		outDir: '../../test',
		emptyOutDir: true,
		sourcemap: true,
	},
	root: 'src/test',
	base: './',
	resolve: {
		alias: {
			'@gdq': path.resolve(__dirname, './src'),
		},
	},
});
