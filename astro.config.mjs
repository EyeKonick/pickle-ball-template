// @ts-check
import { defineConfig } from 'astro/config';
import { siteUrl } from './src/data/site-config.ts';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Canonical and Open Graph URLs are built from this. Set the domain in src/data/site-config.ts.
  site: siteUrl,
  output: 'static',
  trailingSlash: 'ignore',
});
