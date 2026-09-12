import { createSignal } from "solid-js"
import ConnectZen from "./ConnectZen"
import ModelPicker from "./ModelPicker"
import Chat from "./Chat"
import { STORAGE_MODEL, CONTRIBUTOR_MODELS } from "../lib/zen"

// Isla /app: misma secuencia que la app desktop (conectar Zen -> elegir
// modelo -> chatear), pero con Platform web: localStorage en vez de
// window.api.store*, y ServerConnection = nuestro /api en vez del sidecar.
export default function App() {
  const initial =
    typeof localStorage !== "undefined"
      ? (localStorage.getItem(STORAGE_MODEL) ?? CONTRIBUTOR_MODELS[0])
      : CONTRIBUTOR_MODELS[0]
  const [model, setModel] = createSignal(initial)
  const [authTick, setAuthTick] = createSignal(0)

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
      <ConnectZen onConnected={() => setAuthTick((t) => t + 1)} />
      <ModelPicker model={model} onSelect={select} refreshToken={authTick} />
      <Chat model={model} />
    </>
  )
}
