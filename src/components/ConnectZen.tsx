import { createSignal, Show } from "solid-js"
import { STORAGE_KEY, ZEN_PAGE } from "../lib/zen"

// Copia adaptada a web de packages/app/src/components/dialog-connect-provider.tsx
// (vista OpenCode Zen, line1/line2/visit + apiKey label/placeholder).
// Diferencia con desktop: sin window.api/store; la key vive en localStorage
// y se valida contra nuestro proxy /api/zen/models (nunca directa a Zen).
export default function ConnectZen(props: { onConnected?: (key: string) => void }) {
  const [value, setValue] = createSignal("")
  const [error, setError] = createSignal<string | undefined>()
  const [busy, setBusy] = createSignal(false)
  const [connected, setConnected] = createSignal(
    typeof localStorage !== "undefined" && !!localStorage.getItem(STORAGE_KEY),
  )

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const key = value().trim()
    if (!key) {
      setError("API key is required")
      return
    }
    setBusy(true)
    setError(undefined)
    try {
      const res = await fetch("/api/zen/models", {
        headers: { "x-zen-key": key },
      })
      if (!res.ok) throw new Error(`Zen rejected the key (HTTP ${res.status})`)
      localStorage.setItem(STORAGE_KEY, key)
      setConnected(true)
      setValue("")
      props.onConnected?.(key)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setBusy(false)
    }
  }

  function disconnect() {
    localStorage.removeItem(STORAGE_KEY)
    setConnected(false)
  }

  return (
    <div class="ov-card">
      <h2>OpenCode Zen</h2>
      <Show
        when={!connected()}
        fallback={
          <div class="ov-row">
            <span class="ov-muted">Connected to Zen. Models with the Contributor badge keep your edge.</span>
            <button class="ov-btn" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        }
      >
        <p>OpenCode Zen gives you access to a curated set of reliable optimized models for coding agents.</p>
        <p>With a single API key you&apos;ll get access to models such as Claude, GPT, Gemini, GLM and more.</p>
        <p>
          Visit <a href={ZEN_PAGE} target="_blank" rel="noreferrer">opencode.ai/zen</a> to collect your API key.
        </p>
        <form onSubmit={handleSubmit} class="ov-row" style={{ "align-items": "flex-end" }}>
          <label style={{ flex: "1", "min-width": "220px" }}>
            OpenCode Zen API key
            <input
              class="ov-input"
              name="apiKey"
              type="password"
              placeholder="API key"
              autocomplete="off"
              spellcheck={false}
              value={value()}
              onInput={(e) => setValue(e.currentTarget.value)}
            />
          </label>
          <button class="ov-btn primary" type="submit" disabled={busy()}>
            {busy() ? "Connecting..." : "Continue"}
          </button>
        </form>
        <Show when={error()}>
          <p class="ov-error" role="alert">
            {error()}
          </p>
        </Show>
      </Show>
    </div>
  )
}
