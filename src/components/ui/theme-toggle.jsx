"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/utils/Providers/ThemeProvider";
import { Button } from "./button";

export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`relative  transition-all duration-300 hover:bg-accent hover:scale-105 ${className}`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {/* Sun icon for light theme */}
      <Sun
        className={`size-5 transition-all duration-300 text-amber-500 ${
          theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />

      {/* Moon icon for dark theme */}
      <Moon
        className={`absolute size-5 transition-all duration-300 text-slate-300 ${
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}

export default ThemeToggle;
