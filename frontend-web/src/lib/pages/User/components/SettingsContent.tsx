"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Monitor, Globe, Clock, Eye, EyeOff } from "lucide-react"
import { useTheme } from "../../../context/ThemeProvider"
import { useSettings } from "../../../context/SettingsProvider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function SettingsContent() {
  // Get settings from SettingsProvider
  const { settings, updateSettings } = useSettings()

  // Get theme from ThemeProvider
  const { theme, themeMode, setThemeMode } = useTheme()

  // For current time display
  const [currentTime, setCurrentTime] = useState(new Date())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Update time every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Handle theme change
  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setThemeMode(value)
  }

  // Handle blur setting change
  const handleBlurChange = (checked: boolean) => {
    updateSettings({
      blurSensitiveData: checked,
    })
  }

  // Handle language change
  const handleLanguageChange = (value: string) => {
    updateSettings({
      language: value,
    })
  }

  // Handle time format change
  const handleTimeFormatChange = (value: string) => {
    updateSettings({
      timeFormat: value,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your application preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup value={themeMode} onValueChange={handleThemeChange} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {settings.blurSensitiveData ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              Privacy & Personalization
            </CardTitle>
            <CardDescription>Control how your information is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="blur-data" className="font-medium">
                  Blur Sensitive Data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Hide sensitive information like emails and points until hovered
                </p>
              </div>
              <Switch id="blur-data" checked={settings.blurSensitiveData} onCheckedChange={handleBlurChange} />
            </div>

            {/* Example of blurred data */}
            {settings.blurSensitiveData && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm">Example:</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="blur-sm hover:blur-none transition-all duration-200">user@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points:</span>
                    <span className="blur-sm hover:blur-none transition-all duration-200">250</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language & Localization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Localization
            </CardTitle>
            <CardDescription>Customize language and format preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="filipino">Filipino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label htmlFor="time-format">Time Format</Label>
              </div>
              <RadioGroup value={settings.timeFormat} onValueChange={handleTimeFormatChange} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="12h" id="12h" />
                  <Label htmlFor="12h" className="cursor-pointer">
                    12-hour (1:30 PM)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="24h" id="24h" />
                  <Label htmlFor="24h" className="cursor-pointer">
                    24-hour (13:30)
                  </Label>
                </div>
              </RadioGroup>

              {/* Example of time format with dynamic updating */}
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  Current time:{" "}
                  {currentTime.toLocaleTimeString(settings.language === "filipino" ? "fil-PH" : "en-US", {
                    hour12: settings.timeFormat === "12h",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                <p className="text-sm mt-1">
                  Current date:{" "}
                  {currentTime.toLocaleDateString(settings.language === "filipino" ? "fil-PH" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
