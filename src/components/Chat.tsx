import { createSignal, For, Show } from "solid-js"
import { STORAGE_KEY, STORAGE_MODEL, CONTRIBUTOR_MODELS } from "../lib/zen"

interface Msg {
  role: "user" | "assistant"
  content: string
}

// Chat minimo web contra /api/zen/invoke (proxy server-side a Zen).
// Sin window.api ni sidecar: el navegador solo habla con nuestro /api,
// la key Zen viaja como header x-zen-key y el servidor la reenvia a Zen.
export default function Chat(props: { model: () => string }) {
  const [input, setInput] = createSignal("")
  const [log, setLog] = createSignal<Msg[]>([])
  const [busy, setBusy] = createSignal(false)
  const [error, setError] = createSignal<string | undefined>()

  async function send(e: SubmitEvent) {
    e.preventDefault()
    const text = input().trim()
    if (!text || busy()) return
    const key = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (!key) {
      setError("Connect your Zen API key first.")
      return
    }
    setError(undefined)
    setBusy(true)
    setLog((l) => [...l, { role: "user", content: text }])
    setInput("")
    try {
      const res = await fetch("/api/zen/invoke", {
        method: "POST",
        headers: { "content-type": "application/json", "x-zen-key": key },
        body: JSON.stringify({
          model: props.model() || CONTRIBUTOR_MODELS[0],
          messages: [...log(), { role: "user", content: text }],
        }),
      })
      const json = (await res.json()) as { text?: string; error?: string }
      if (!res.ok) throw new Error(json.error ?? `Zen error (HTTP ${res.status})`)
      setLog((l) => [...l, { role: "assistant", content: json.text ?? "" }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div class="ov-card">
      <h2>Chat</h2>
      <p class="ov-muted">
        Modelo activo: <strong>{props.model() || CONTRIBUTOR_MODELS[0]}</strong> — guardado local como en la
        app (antes `storeGet`, ahora `localStorage[{STORAGE_MODEL}]`).
      </p>
      <div class="ov-chat-log">
        <For each={log()}>
          {(m) => <div class={`ov-msg ${m.role}`}>{m.content}</div>}
        </For>
        <Show when={log().length === 0}>
          <div class="ov-muted">Sin mensajes. Pregunta algo para probar tu key Zen.</div>
        </Show>
      </div>
      <form onSubmit={send} class="ov-row" style={{ "align-items": "flex-end" }}>
        <textarea
          class="ov-textarea"
          style={{ flex: "1", "min-width": "220px" }}
          placeholder="Escribe tu mensaje..."
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <button class="ov-btn primary" type="submit" disabled={busy()}>
          {busy() ? "..." : "Send"}
        </button>
      </form>
      <Show when={error()}>
        <p class="ov-error" role="alert">
          {error()}
        </p>
      </Show>
    </div>
  )
}
