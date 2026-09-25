"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
      title={theme === "light" ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
      aria-label="Alternar tema claro y oscuro"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-600 dark:text-amber-400" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-teal-400" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
