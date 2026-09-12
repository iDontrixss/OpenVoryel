import type { APIRoute } from "astro"
import { ZEN_API_BASE } from "../../../lib/zen"

export const prerender = false

// Proxy generico SOLO hacia opencode.ai/zen/v1 (allowlist de host).
// La key viaja como x-zen-key y aqui se convierte en Authorization Bearer,
// asi el navegador nunca toca Zen directo y la key no queda en logs del server.
const ALLOWED = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])

async function proxy(request: Request, path: string | undefined): Promise<Response> {
  const key =
    request.headers.get("x-zen-key") ??
    import.meta.env.ZEN_API_KEY ??
    (typeof process !== "undefined" ? process.env.ZEN_API_KEY : undefined) ??
    null
  if (!key) return Response.json({ error: "Missing Zen key. Connect it in /app first." }, { status: 401 })

  const url = new URL(request.url)
  const target = `${ZEN_API_BASE}/${path ?? ""}${url.search}`
  const headers = new Headers()
  headers.set("authorization", `Bearer ${key}`)
  const ct = request.headers.get("content-type")
  if (ct) headers.set("content-type", ct)

  const init: RequestInit = { method: request.method, headers, signal: AbortSignal.timeout(60_000) }
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer()
  }
  const upstream = await fetch(target, init)
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  })
}

export const ALL: APIRoute = async ({ request, params }) => {
  if (!ALLOWED.has(request.method)) {
    return Response.json({ error: "Method not allowed." }, { status: 405 })
  }
  try {
    return await proxy(request, params.path)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upstream request failed" },
      { status: 502 },
    )
  }
}
