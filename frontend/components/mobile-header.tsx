"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <header className="h-14 lg:hidden border-b border-border bg-background/95 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-2.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="h-7 w-7 rounded-md overflow-hidden border border-border/60 shadow-sm shrink-0 bg-black flex items-center justify-center">
          <img
            src="/logo.png"
            alt="lex-assist logo"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="font-serif font-bold text-base text-foreground tracking-tight">
          lex-assist
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
