import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	base: '/img-to-pdf/', // для GitHub Pages
	plugins: [react()],
	server: {
		port: 3000,
		open: true,
	},
});
