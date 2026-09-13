import { describe, expect, test } from "bun:test"
import { projectDirectory, sanitizeProjectName } from "./dialog-new-project-domain"

describe("sanitizeProjectName", () => {
  test("strips illegal filename characters", () => {
    expect(sanitizeProjectName('a<b>c:d"e/f\\g|h?i*j')).toBe("abcdefghij")
  })
  test("collapses whitespace and trims", () => {
    expect(sanitizeProjectName("  mi   proyecto  ")).toBe("mi proyecto")
  })
  test("trims trailing dots and spaces (Windows)", () => {
    expect(sanitizeProjectName("proyecto... ")).toBe("proyecto")
  })
  test("falls back to untitled", () => {
    expect(sanitizeProjectName("")).toBe("untitled")
    expect(sanitizeProjectName("???")).toBe("untitled")
  })
})

describe("projectDirectory", () => {
  test("joins under OpenVoryel with posix separator", () => {
    expect(projectDirectory("/home/nadru", "chat", [])).toBe("/home/nadru/OpenVoryel/chat")
  })
  test("joins with windows separator and strips trailing slashes", () => {
    expect(projectDirectory("C:\\Users\\nadru\\", "chat", [])).toBe("C:\\Users\\nadru\\OpenVoryel\\chat")
  })
  test("dedupes against existing worktrees", () => {
    const existing = ["C:\\Users\\nadru\\OpenVoryel\\chat"]
    expect(projectDirectory("C:\\Users\\nadru", "chat", existing)).toBe("C:\\Users\\nadru\\OpenVoryel\\chat-2")
  })
})
