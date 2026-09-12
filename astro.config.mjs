// @ts-check
import { defineConfig } from "astro/config"
import solidJs from "@astrojs/solid-js"
import cloudflare from "@astrojs/cloudflare"
import config from "./config.mjs"

// Copiado de packages/web/astro.config.mjs (OpenVoryel):
// output server + adapter cloudflare para tener SSR y /api/*
// sin Starlight/docs-theme: esta web es app (landing + /app), no docs.
export default defineConfig({
  site: config.url,
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  devToolbar: {
    enabled: false,
  },
  server: {
    host: "0.0.0.0",
  },
  integrations: [solidJs(), assetsIgnore()],
})

// El adapter emite el worker como directorio dist/_worker.js/ y wrangler se
// niega a subirlo como asset estatico. Este hook escribe dist/.assetsignore
// en cada build (local y Cloudflare) para excluirlo; el worker se sube via
// `main` en wrangler.jsonc y los estaticos (dist/_astro) siguen como assets.
function assetsIgnore() {
  return {
    name: "assetsIgnore",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const { writeFile } = await import("node:fs/promises")
        await writeFile(new URL(".assetsignore", dir), "_worker.js\n")
      },
    },
  }
}
