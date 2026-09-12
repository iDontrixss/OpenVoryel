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
  integrations: [solidJs()],
})
