import type { APIRoute } from "astro"
import { ZEN_API_BASE, CONTRIBUTOR_MODELS } from "../../../lib/zen"

export const prerender = false

function userKey(request: Request): string | null {
  return (
    request.headers.get("x-zen-key") ??
    import.meta.env.ZEN_API_KEY ??
    (typeof process !== "undefined" ? process.env.ZEN_API_KEY : undefined) ??
    null
  )
}

// GET /api/zen/models -> reenvia a GET {ZEN}/models con el Bearer del usuario.
// Si Zen falla, devolvemos fallback contributor para no romper la UI.
export const GET: APIRoute = async ({ request }) => {
  const key = userKey(request)
  if (!key) {
    return Response.json(
      { data: CONTRIBUTOR_MODELS.map((id) => ({ id })), fallback: true },
      { status: 200 },
    )
  }
  try {
    const upstream = await fetch(`${ZEN_API_BASE}/models`, {
      headers: { authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15_000),
    })
    const body = await upstream.text()
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "public, max-age=60",
      },
    })
  } catch {
    return Response.json(
      { data: CONTRIBUTOR_MODELS.map((id) => ({ id })), fallback: true },
      { status: 200 },
    )
  }
}
