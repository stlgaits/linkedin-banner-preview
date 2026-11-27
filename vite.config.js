import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Relative base so the build works from any path (GitHub Pages project site, file://, ...).
// `viteSingleFile` inlines JS and CSS: dist/index.html is a standalone file you can double-click.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
});
