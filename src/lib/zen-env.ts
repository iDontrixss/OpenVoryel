// Lee vars de entorno en cualquier runtime:
// - Cloudflare Workers: locals.runtime.env (secretos del dashboard)
// - astro dev / node: process.env
// - build-time: import.meta.env
export function runtimeEnv(locals: unknown): Record<string, string | undefined> {
  const runtime = (locals as { runtime?: { env?: Record<string, string> } } | null | undefined)?.runtime
  if (runtime?.env) return runtime.env
  if (typeof process !== "undefined" && process.env) {
    return process.env as Record<string, string | undefined>
  }
  return {}
}

export function serverZenKey(locals: unknown): string | null {
  return runtimeEnv(locals).ZEN_API_KEY ?? import.meta.env.ZEN_API_KEY ?? null
}
