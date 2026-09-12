import type { APIRoute } from "astro"
import { ZEN_API_BASE, CONTRIBUTOR_MODELS } from "../../../lib/zen"
import { serverZenKey } from "../../../lib/zen-env"

export const prerender = false

function userKey(request: Request, locals: unknown): string | null {
  return request.headers.get("x-zen-key") ?? serverZenKey(locals)
}

// GET /api/zen/models -> reenvia a GET {ZEN}/models con el Bearer del usuario
// (o la key del servidor en modo personal).
// Si no hay key o Zen falla, devolvemos fallback contributor para no romper la UI.
export const GET: APIRoute = async ({ request, locals }) => {
  const key = userKey(request, locals)
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
