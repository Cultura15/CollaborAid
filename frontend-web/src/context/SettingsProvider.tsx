"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface SettingsContextType {
  settings: {
    blurSensitiveData: boolean
    language: string
    timeFormat: string
  }
  updateSettings: (newSettings: Partial<SettingsContextType["settings"]>) => void
}

const defaultSettings = {
  blurSensitiveData: false,
  language: "english",
  timeFormat: "12h",
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
})

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState(defaultSettings)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<SettingsContextType["settings"]>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
