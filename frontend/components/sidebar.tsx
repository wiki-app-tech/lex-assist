"use client";

import * as React from "react";
import {
  FileText,
  FileCheck,
  Scale,
  ShoppingBag,
  Layers,
  Sparkles,
  MapPin,
  X,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type CategoryKey = "todos" | "decretos" | "resoluciones" | "leyes" | "licitaciones";

interface SidebarProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  documentCounts?: Record<CategoryKey, number>;
}

export function Sidebar({
  selectedCategory,
  onSelectCategory,
  isOpenMobile = false,
  onCloseMobile,
  documentCounts = {
    todos: 48,
    decretos: 18,
    resoluciones: 16,
    leyes: 6,
    licitaciones: 8,
  },
}: SidebarProps) {
  const categories: {
    id: CategoryKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    { id: "todos", label: "Todas las fuentes", icon: Layers, color: "text-muted-foreground" },
    { id: "decretos", label: "Decretos", icon: FileText, color: "text-amber-600 dark:text-amber-400" },
    { id: "resoluciones", label: "Resoluciones", icon: FileCheck, color: "text-sky-600 dark:text-sky-400" },
    { id: "leyes", label: "Leyes", icon: Scale, color: "text-emerald-600 dark:text-emerald-400" },
    { id: "licitaciones", label: "Licitaciones", icon: ShoppingBag, color: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 flex-col bg-background/95 backdrop-blur border-r border-border transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0",
          isOpenMobile ? "translate-x-0 flex" : "-translate-x-full"
        )}
      >
        {/* Brand & Jurisdiction Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-lg border border-primary/20">
              §
            </div>
            <div>
              <span className="font-serif font-semibold tracking-tight text-lg text-foreground">
                lex-assist
              </span>
              <span className="block text-[10px] uppercase font-sans tracking-widest text-muted-foreground">
                Asistencia Legal & IA
              </span>
            </div>
          </div>

          {isOpenMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onCloseMobile}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Territory Chip */}
        <div className="p-4">
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 flex items-start space-x-2.5">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium text-foreground block">
                Tierra del Fuego, AeIAS
              </span>
              <span className="text-muted-foreground block text-[11px]">
                Boletín Oficial & Normativa
              </span>
            </div>
          </div>
        </div>

        <Separator className="opacity-60" />

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Categorías Normativas
          </div>

          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isSelected ? "text-primary-foreground" : cat.color
                    )}
                  />
                  <span>{cat.label}</span>
                </div>

                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-mono transition-colors",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/15"
                  )}
                >
                  {documentCounts[cat.id] ?? 0}
                </span>
              </button>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Funcionalidades IA
          </div>

          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
            <div className="flex items-center space-x-1.5 font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Resumen & Búsqueda Semántica</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Modelos LLM locales y Qdrant Vector DB activos para indexación en tiempo real.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-border/80 text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Sincronización</span>
            <Badge variant="subtle" className="text-[10px] px-1.5 py-0">
              Diaria 07:00
            </Badge>
          </div>
          <div className="text-[10px] text-muted-foreground/75">
            v0.1.0 • Licencia MIT
          </div>
        </div>
      </aside>
    </>
  );
}
