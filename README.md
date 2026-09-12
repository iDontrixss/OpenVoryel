# OpenVoryel web

Web con la misma integracion Zen que la app, adaptada al navegador.
UI copiada de OpenVoryel (`packages/web` tokens + copy `app.lander.*` y `provider.connect.opencodeZen.*`).

## Stack

GitHub + Cloudflare + Astro + Solid (`output:server`, adapter `@astrojs/cloudflare`).
Igual que `packages/web/astro.config.mjs`. Nada de GitHub Pages: necesitamos `/api/*` server-side.

## Dev

```bash
bun install
cp .dev.vars.example .dev.vars  # opcional: ZEN_API_KEY para probar sin pegar key
bun run dev
```

- Landing: `http://localhost:4321/`
- App: `http://localhost:4321/app`

## Paridad Zen

- `src/components/ConnectZen.tsx` = clon web de `dialog-connect-provider.tsx` (line1/line2/visit + API key).
  Guarda en `localStorage[openvoryel.zen.key]` (antes `window.api.store*`).
- `src/lib/zen.ts` = familias y endpoints deducidos de `packages/web/src/content/docs/zen.mdx`:
  `responses | messages | chat | gemini`, contributor primero.
- `GET /api/zen/models` -> `https://opencode.ai/zen/v1/models` con fallback contributor si Zen falla.
- `POST /api/zen/invoke` traduce `{ model, messages }` al endpoint que toca y devuelve `{ text }`.
- `ANY /api/zen/[...path]` proxy allowlist solo a `opencode.ai/zen/v1`. La key viaja como
  `x-zen-key` y el servidor la convierte en `Authorization: Bearer`. El navegador nunca toca Zen directo.
- `GET /api/zen/status` dice si el servidor tiene key propia (sin exponerla).

## Modo personal (usar sin pegar key)

1. Cloudflare Dashboard -> Workers & Pages -> `openvoryel-web` -> Settings -> Variables ->
   añade secreto `ZEN_API_KEY` con tu key de `opencode.ai/zen` (redeploy automatico).
2. `/app` muestra badge Directo y el chat funciona sin pegar nada. Una key personal
   pegada abajo sigue teniendo prioridad (tu propia cuota).

Ojo: con key del servidor, cualquiera con la URL gasta tu cuota. Para uso personal
activa **Protect with Cloudflare Access** en Settings -> Deployment protection.

Sin Electron a proposito: sin `opencode://` deep-links (usamos `/app` https),
sin sidecar (`packages/desktop/src/main/server.ts`), sin `window.api`.

## Deploy (Cloudflare Pages)

1. Cloudflare Dashboard -> Pages -> Connect to Git -> `iDontrixss/OpenVoryel`.
2. Build: `bun install && bun run build`, output `dist`.
3. Secrets (nunca en el repo): `ZEN_API_KEY` solo si quieres demo sin key propia.
4. Custom domain opcional desde Pages -> Custom domains.

## Estado

MVP sin streaming (respuestas completas). Siguiente: SSE en `/api/zen/invoke` + historial en KV/D1.
