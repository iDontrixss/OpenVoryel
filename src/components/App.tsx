import { createResource, Show } from "solid-js"
import { createSignal } from "solid-js"
import ConnectZen from "./ConnectZen"
import ModelPicker from "./ModelPicker"
import Chat from "./Chat"
import { STORAGE_MODEL, CONTRIBUTOR_MODELS } from "../lib/zen"

async function hasServerKey(): Promise<boolean> {
  try {
    const res = await fetch("/api/zen/status")
    if (!res.ok) return false
    return ((await res.json()) as { serverKey?: boolean }).serverKey === true
  } catch {
    return false
  }
}

// Isla /app: misma secuencia que la app desktop (conectar Zen -> elegir
// modelo -> chatear), pero con Platform web: localStorage en vez de
// window.api.store*, y ServerConnection = nuestro /api en vez del sidecar.
//
// Modo personal: si el servidor tiene ZEN_API_KEY (secreto Cloudflare),
// ConnectZen muestra modo directo y el chat funciona sin pegar key.
export default function App() {
  const initial =
    typeof localStorage !== "undefined"
      ? (localStorage.getItem(STORAGE_MODEL) ?? CONTRIBUTOR_MODELS[0])
      : CONTRIBUTOR_MODELS[0]
  const [model, setModel] = createSignal(initial)
  const [authTick, setAuthTick] = createSignal(0)
  const [serverKey] = createResource(hasServerKey)

  function select(id: string) {
    setModel(id)
    try {
      localStorage.setItem(STORAGE_MODEL, id)
    } catch {
      // almacenamiento no disponible: seguimos en memoria
    }
  }

  return (
    <>
      <ConnectZen serverKey={() => serverKey.latest === true} onConnected={() => setAuthTick((t) => t + 1)} />
      <ModelPicker model={model} onSelect={select} refreshToken={authTick} />
      <Show when={!serverKey.loading}>
        <Chat model={model} serverKey={() => serverKey.latest === true} />
      </Show>
    </>
  )
}
