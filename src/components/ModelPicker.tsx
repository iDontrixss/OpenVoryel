import { createResource, createSignal, For, Show } from "solid-js"
import { STORAGE_KEY, fallbackModels, normalizeModels, type ZenModel } from "../lib/zen"

async function loadModels(key: string | null): Promise<ZenModel[]> {
  if (!key) return fallbackModels()
  try {
    const res = await fetch("/api/zen/models", { headers: { "x-zen-key": key } })
    if (!res.ok) return fallbackModels()
    const json = await res.json()
    // Zen /v1/models devuelve { data: [{ id }] } estilo OpenAI, o { models: [...] }.
    const raw: unknown = (json as { data?: unknown }).data ?? (json as { models?: unknown }).models ?? json
    const ids = (Array.isArray(raw) ? raw : [])
      .map((m) => (typeof m === "string" ? m : (m as { id?: string }).id))
      .filter((id): id is string => !!id)
    if (ids.length === 0) return fallbackModels()
    return normalizeModels(ids)
  } catch {
    return fallbackModels()
  }
}

export default function ModelPicker(props: {
  model: () => string
  onSelect: (id: string) => void
  refreshToken: () => number
}) {
  const [keyVersion, setKeyVersion] = createSignal(0)
  const storageKey = () => {
    // Relee la key cuando cambia refreshToken (login/logout).
    props.refreshToken()
    return typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
  }
  const [models] = createResource(
    () => `${storageKey() ?? ""}:${keyVersion()}`,
    () => loadModels(storageKey()),
  )

  return (
    <div class="ov-card">
      <div class="ov-row" style={{ "justify-content": "space-between" }}>
        <h2 style={{ margin: 0 }}>Model</h2>
        <button class="ov-btn" onClick={() => setKeyVersion((v) => v + 1)}>
          Refresh
        </button>
      </div>
      <Show when={models.loading}>
        <p class="ov-muted">Loading models...</p>
      </Show>
      <Show when={models.latest}>
        {(list) => (
          <>
            <select
              class="ov-select"
              value={props.model()}
              onChange={(e) => props.onSelect(e.currentTarget.value)}
            >
              <For each={list()}>
                {(m) => (
                  <option value={m.id}>
                    {m.name}
                    {m.contributor ? " — Contributor" : ""}
                  </option>
                )}
              </For>
            </select>
            <p class="ov-muted">
              <span class="ov-badge">Contributor</span> = misma ventaja que la app: modelos gratuitos
              verificados por el equipo opencode.
            </p>
          </>
        )}
      </Show>
    </div>
  )
}
