// src/components/DarkModeToggle.tsx

import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeProvider";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-2">
      <span className="text-sm">Dark Mode</span>
      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
    </div>
  );
}
