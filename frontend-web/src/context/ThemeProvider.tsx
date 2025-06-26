"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: "light" | "dark"
  themeMode: Theme
  toggleTheme: () => void
  setThemeMode: (mode: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  themeMode: "light",
  toggleTheme: () => {},
  setThemeMode: () => {},
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Get initial theme from localStorage or default to light
  const [themeMode, setThemeMode] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("themeMode") as Theme
      return savedTheme || "light" // Default to light instead of system
    }
    return "light"
  })

  // Actual theme applied (light or dark)
  const [theme, setTheme] = useState<"light" | "dark">("light") // Default to light

  // Initialize theme on client side
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark"
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // If no saved theme, use light as default
      setTheme("light")
    }
  }, [])

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      const handleChange = () => {
        if (themeMode === "system") {
          setTheme(mediaQuery.matches ? "dark" : "light")
        }
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [themeMode])

  // Update theme when themeMode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (themeMode === "system") {
        const systemTheme =
          window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        setTheme(systemTheme)
      } else {
        setTheme(themeMode)
      }

      localStorage.setItem("themeMode", themeMode)
    }
  }, [themeMode])

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark")
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
    setThemeMode(theme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
