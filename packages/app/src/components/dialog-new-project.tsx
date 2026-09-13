import { useDialog } from "@opencode-ai/ui/context/dialog"
import { Button } from "@opencode-ai/ui/button"
import { Dialog } from "@opencode-ai/ui/dialog"
import { TextField } from "@opencode-ai/ui/text-field"
import { useGlobal } from "@/context/global"
import { useLanguage } from "@/context/language"
import { ServerConnection } from "@/context/server"
import type { Path } from "@opencode-ai/sdk/v2/client"
import { Show, createMemo, createResource, createSignal } from "solid-js"
import { projectDirectory, sanitizeProjectName } from "./dialog-new-project-domain"

interface DialogNewProjectProps {
  server: ServerConnection.Any
  onSelect: (directory: string | null) => void
}

export function DialogNewProject(props: DialogNewProjectProps) {
  const dialog = useDialog()
  const language = useLanguage()
  const global = useGlobal()
  const { sync, sdk, ...serverCtx } = global.ensureServerCtx(props.server)

  const [name, setName] = createSignal("")
  const [error, setError] = createSignal<string | undefined>()

  const missingHome = createMemo(() => !sync.data.path.home)
  const [fallbackPath] = createResource(
    () => (missingHome() ? true : undefined),
    async (): Promise<Path | undefined> => {
      if ((await sdk.protocol) !== "v1") return
      return sdk.client.path
        .get()
        .then((result) => result.data)
        .catch(() => undefined)
    },
    { initialValue: undefined },
  )
  const homedir = createMemo(() => sync.data.path.home || fallbackPath()?.home || "")
  const existing = createMemo(() => serverCtx.projects.list().map((project) => project.worktree))
  const preview = createMemo(() => (homedir() ? projectDirectory(homedir(), name() || "untitled", existing()) : ""))

  function submit(e: SubmitEvent) {
    e.preventDefault()
    if (!homedir()) {
      setError(language.t("home.project.new.noHome"))
      return
    }
    if (!name().trim()) {
      setError(language.t("home.project.new.required"))
      return
    }
    props.onSelect(projectDirectory(homedir(), name(), existing()))
    dialog.close()
  }

  return (
    <Dialog title={language.t("home.project.new.title")}>
      <form onSubmit={submit} class="flex flex-col items-start gap-4 px-3 pb-3">
        <div class="text-14-regular text-text-base">{language.t("home.project.new.description")}</div>
        <TextField
          autofocus
          type="text"
          label={language.t("home.project.new.label")}
          placeholder={language.t("home.project.new.placeholder")}
          name="projectName"
          value={name()}
          onChange={setName}
          validationState={error() ? "invalid" : undefined}
          error={error()}
        />
        <Show when={preview()}>
          <div class="text-12-regular text-text-weak break-all">{preview()}</div>
        </Show>
        <div class="flex gap-2">
          <Button class="w-auto" type="submit" size="large" variant="primary">
            {language.t("common.continue")}
          </Button>
          <Button class="w-auto" type="button" size="large" variant="secondary" onClick={() => dialog.close()}>
            {language.t("common.cancel")}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
