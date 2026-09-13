const PROJECTS_ROOT = "OpenVoryel"

export function sanitizeProjectName(input: string): string {
  const cleaned = input
    .replace(/[<>:"/\\|?*\0-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "")
    .slice(0, 100)
  return cleaned || "untitled"
}

export function projectDirectory(homedir: string, name: string, existing: string[]): string {
  const sep = homedir.includes("\\") ? "\\" : "/"
  const root = `${homedir.replace(/[\\/]+$/, "")}${sep}${PROJECTS_ROOT}`
  const base = sanitizeProjectName(name)
  const taken = new Set(existing.map((item) => item.toLowerCase()))
  let directory = `${root}${sep}${base}`
  for (let i = 2; taken.has(directory.toLowerCase()); i++) directory = `${root}${sep}${base}-${i}`
  return directory
}
