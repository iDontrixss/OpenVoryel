// Paridad Zen con opencode.
// Tabla de referencia: packages/web/src/content/docs/zen.mdx (OpenVoryel)
// y lista de modelos: packages/console/core/src/model.ts -> zenModels.

export const ZEN_API_BASE = "https://opencode.ai/zen/v1"
export const ZEN_PAGE = "https://opencode.ai/zen"
export const STORAGE_KEY = "openvoryel.zen.key"
export const STORAGE_MODEL = "openvoryel.zen.model"

// Modelos gratuitos / contributor vistos en la tabla de docs.
// Se mantienen como fallback cuando /v1/models no responde.
export const CONTRIBUTOR_MODELS = [
  "muse-spark-1.3-contributor-free",
  "mimo-v2.5-free",
  "ling-3.0-flash-fin-free",
  "nemotron-3-ultra-free",
  "nemotron-3.5-lightning-free",
] as const

export type ZenFamily = "responses" | "messages" | "chat" | "gemini"

export interface ZenModel {
  id: string
  name: string
  family: ZenFamily
  contributor: boolean
}

// Mapeo familia -> path Zen deducido de la tabla de docs:
// gpt/grok/muse-spark -> /responses (@ai-sdk/openai)
// claude/qwen        -> /messages  (@ai-sdk/anthropic)
// gemini             -> /models/{id} (@ai-sdk/google)
// resto              -> /chat/completions (@ai-sdk/openai-compatible)
export function familyFor(modelId: string): ZenFamily {
  const id = modelId.toLowerCase()
  if (id.startsWith("gemini-")) return "gemini"
  if (id.startsWith("claude-") || id.startsWith("qwen")) return "messages"
  if (
    id.startsWith("gpt-") ||
    id.startsWith("grok-") ||
    id.startsWith("muse-spark") ||
    id === "big-pickle"
  )
    return "responses"
  return "chat"
}

export function endpointFor(modelId: string): string {
  const family = familyFor(modelId)
  if (family === "responses") return "/responses"
  if (family === "messages") return "/messages"
  if (family === "gemini") return `/models/${modelId}`
  return "/chat/completions"
}

export function isContributor(id: string): boolean {
  const low = id.toLowerCase()
  return (
    low.includes("contributor") ||
    low.endsWith("-free") ||
    (CONTRIBUTOR_MODELS as readonly string[]).includes(id)
  )
}

export function prettyName(id: string): string {
  return id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function normalizeModels(ids: string[]): ZenModel[] {
  const seen = new Set<string>()
  const out: ZenModel[] = []
  for (const id of ids) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push({
      id,
      name: prettyName(id),
      family: familyFor(id),
      contributor: isContributor(id),
    })
  }
  // Contributor primero, como ventaja a mantener.
  out.sort((a, b) => Number(b.contributor) - Number(a.contributor) || a.id.localeCompare(b.id))
  return out
}

export function fallbackModels(): ZenModel[] {
  return normalizeModels([...CONTRIBUTOR_MODELS])
}
