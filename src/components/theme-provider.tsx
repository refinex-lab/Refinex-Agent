import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"
type AccentColor = "default" | "blue" | "green" | "yellow" | "pink" | "orange"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  accentStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  accentColor: "default",
  setAccentColor: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

/** 重点色 CSS 变量映射 */
const accentColorMap: Record<AccentColor, { light: Record<string, string>; dark: Record<string, string> }> = {
  default: { light: {}, dark: {} },
  blue: {
    light: {
      "--primary": "oklch(0.546 0.245 262.881)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.546 0.245 262.881)",
      "--sidebar-primary": "oklch(0.546 0.245 262.881)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.546 0.245 262.881)",
    },
    dark: {
      "--primary": "oklch(0.623 0.214 259.815)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.623 0.214 259.815)",
      "--sidebar-primary": "oklch(0.623 0.214 259.815)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.623 0.214 259.815)",
    },
  },
  green: {
    light: {
      "--primary": "oklch(0.586 0.19 163.222)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.586 0.19 163.222)",
      "--sidebar-primary": "oklch(0.586 0.19 163.222)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.586 0.19 163.222)",
    },
    dark: {
      "--primary": "oklch(0.696 0.17 162.48)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.696 0.17 162.48)",
      "--sidebar-primary": "oklch(0.696 0.17 162.48)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.696 0.17 162.48)",
    },
  },
  yellow: {
    light: {
      "--primary": "oklch(0.795 0.184 86.047)",
      "--primary-foreground": "oklch(0.205 0 0)",
      "--ring": "oklch(0.795 0.184 86.047)",
      "--sidebar-primary": "oklch(0.795 0.184 86.047)",
      "--sidebar-primary-foreground": "oklch(0.205 0 0)",
      "--sidebar-ring": "oklch(0.795 0.184 86.047)",
    },
    dark: {
      "--primary": "oklch(0.828 0.189 84.429)",
      "--primary-foreground": "oklch(0.205 0 0)",
      "--ring": "oklch(0.828 0.189 84.429)",
      "--sidebar-primary": "oklch(0.828 0.189 84.429)",
      "--sidebar-primary-foreground": "oklch(0.205 0 0)",
      "--sidebar-ring": "oklch(0.828 0.189 84.429)",
    },
  },
  pink: {
    light: {
      "--primary": "oklch(0.592 0.249 0.584)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.592 0.249 0.584)",
      "--sidebar-primary": "oklch(0.592 0.249 0.584)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.592 0.249 0.584)",
    },
    dark: {
      "--primary": "oklch(0.7 0.213 0.584)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.7 0.213 0.584)",
      "--sidebar-primary": "oklch(0.7 0.213 0.584)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.7 0.213 0.584)",
    },
  },
  orange: {
    light: {
      "--primary": "oklch(0.646 0.222 41.116)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.646 0.222 41.116)",
      "--sidebar-primary": "oklch(0.646 0.222 41.116)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.646 0.222 41.116)",
    },
    dark: {
      "--primary": "oklch(0.7 0.2 41.116)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.7 0.2 41.116)",
      "--sidebar-primary": "oklch(0.7 0.2 41.116)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-ring": "oklch(0.7 0.2 41.116)",
    },
  },
}

function applyAccentColor(color: AccentColor, resolvedTheme: "light" | "dark") {
  const root = document.documentElement
  // 清除所有重点色自定义属性
  for (const vars of Object.values(accentColorMap)) {
    for (const key of Object.keys(vars.light)) {
      root.style.removeProperty(key)
    }
  }
  // 应用新的重点色
  const vars = accentColorMap[color]?.[resolvedTheme]
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value)
    }
  }
}

function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return theme
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "refinex-theme",
  accentStorageKey = "refinex-accent-color",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [accentColor, setAccentColor] = useState<AccentColor>(
    () => (localStorage.getItem(accentStorageKey) as AccentColor) || "default"
  )

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (resolvedTheme: "dark" | "light") => {
      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)
      applyAccentColor(accentColor, resolvedTheme)
    }

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      applyTheme(mediaQuery.matches ? "dark" : "light")

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light")
      }
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }

    applyTheme(theme)
  }, [theme, accentColor])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    accentColor,
    setAccentColor: (color: AccentColor) => {
      localStorage.setItem(accentStorageKey, color)
      setAccentColor(color)
      applyAccentColor(color, getResolvedTheme(theme))
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

export type { Theme, AccentColor }
