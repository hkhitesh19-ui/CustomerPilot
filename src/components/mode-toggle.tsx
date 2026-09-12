"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled aria-label="Toggle theme" className="rounded-full w-9 h-9 border-slate-700">
        <Sun className="h-4 w-4 text-slate-400" />
      </Button>
    )
  }

  const currentTheme = resolvedTheme || theme || "dark"
  const isDark = currentTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      className="rounded-full w-9 h-9 border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 relative overflow-hidden group shadow-sm active:scale-95"
    >
      <Sun className="h-4 w-4 text-amber-400 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 text-indigo-400 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
