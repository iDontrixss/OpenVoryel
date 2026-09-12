import type { APIRoute } from "astro"
import { ZEN_API_BASE, endpointFor, familyFor } from "../../../lib/zen"

export const prerender = false

interface InMsg {
  role: string
  content: string
}

function userKey(request: Request): string | null {
  return (
    request.headers.get("x-zen-key") ??
    import.meta.env.ZEN_API_KEY ??
    (typeof process !== "undefined" ? process.env.ZEN_API_KEY : undefined) ??
    null
  )
}

function textOfChat(json: unknown): string {
  const c = (json as { choices?: { message?: { content?: unknown } }[] }).choices?.[0]?.message?.content
  if (typeof c === "string") return c
  if (Array.isArray(c)) {
    return c.map((p) => (typeof p === "string" ? p : (p as { text?: string }).text ?? "")).join("")
  }
  return ""
}

function textOfResponses(json: unknown): string {
  const j = json as { output_text?: string; output?: { content?: { text?: string }[] }[] }
  if (typeof j.output_text === "string" && j.output_text) return j.output_text
  const parts: string[] = []
  for (const item of j.output ?? []) {
    for (const c of item.content ?? []) {
      if (c.text) parts.push(c.text)
    }
  }
  return parts.join("")
}

function textOfMessages(json: unknown): string {
  const c = (json as { content?: { text?: string }[] }).content ?? []
  return c.map((b) => b.text ?? "").join("")
}

// POST /api/zen/invoke { model, messages: [{role, content}] }
// Traduce al endpoint Zen que toca segun la familia del modelo
// (ver tabla packages/web/src/content/docs/zen.mdx) y devuelve { text }.
export const POST: APIRoute = async ({ request }) => {
  const key = userKey(request)
  if (!key) {
    return Response.json(
      { error: "Missing Zen key. Connect it in /app first." },
      { status: 401 },
    )
  }

  let body: { model?: string; messages?: InMsg[]; maxTokens?: number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const model = body.model?.trim()
  const messages = (body.messages ?? [])
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
  if (!model) return Response.json({ error: "Missing model." }, { status: 400 })
  if (messages.length === 0) return Response.json({ error: "Missing messages." }, { status: 400 })

  const family = familyFor(model)
  const endpoint = endpointFor(model)
  const maxTokens = body.maxTokens ?? 1024
  const auth = { authorization: `Bearer ${key}`, "content-type": "application/json" }

  try {
    if (family === "chat") {
      const upstream = await fetch(`${ZEN_API_BASE}${endpoint}`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify({ model, messages, stream: false }),
        signal: AbortSignal.timeout(60_000),
      })
      const json = await upstream.json()
      if (!upstream.ok) {
        return Response.json(
          { error: (json as { error?: unknown }).error ?? `Zen error (HTTP ${upstream.status})` },
          { status: upstream.status },
        )
      }
      return Response.json({ text: textOfChat(json), family, endpoint })
    }

    if (family === "responses") {
      const upstream = await fetch(`${ZEN_API_BASE}${endpoint}`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify({ model, input: messages, stream: false }),
        signal: AbortSignal.timeout(60_000),
      })
      const json = await upstream.json()
      if (!upstream.ok) {
        return Response.json(
          { error: (json as { error?: unknown }).error ?? `Zen error (HTTP ${upstream.status})` },
          { status: upstream.status },
        )
      }
      return Response.json({ text: textOfResponses(json), family, endpoint })
    }

    if (family === "messages") {
      const upstream = await fetch(`${ZEN_API_BASE}${endpoint}`, {
        method: "POST",
        headers: { ...auth, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
        signal: AbortSignal.timeout(60_000),
      })
      const json = await upstream.json()
      if (!upstream.ok) {
        return Response.json(
          { error: (json as { error?: unknown }).error ?? `Zen error (HTTP ${upstream.status})` },
          { status: upstream.status },
        )
      }
      return Response.json({ text: textOfMessages(json), family, endpoint })
    }

    return Response.json(
      { error: `Modelo ${model}: la familia gemini necesita su endpoint nativo. Usa un modelo chat/responses/messages por ahora.` },
      { status: 400 },
    )
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upstream request failed" },
      { status: 502 },
    )
  }
}
