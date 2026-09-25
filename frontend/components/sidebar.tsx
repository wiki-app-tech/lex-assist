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
  Library,
  BookOpen,
  GraduationCap,
  Newspaper,
  Laptop,
  Building,
  HardDrive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type CategoryKey =
  | "todos"
  | "decretos"
  | "resoluciones"
  | "leyes"
  | "licitaciones"
  | "boletin_drive"
  | "biblioteca"
  | "biblioteca_libros"
  | "biblioteca_doctrina"
  | "biblioteca_revistas"
  | "biblioteca_digital";

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
    todos: 63,
    decretos: 18,
    resoluciones: 16,
    leyes: 6,
    licitaciones: 8,
    boletin_drive: 7,
    biblioteca: 8,
    biblioteca_libros: 2,
    biblioteca_doctrina: 2,
    biblioteca_revistas: 2,
    biblioteca_digital: 2,
  },
}: SidebarProps) {
  const normativaCategories: {
    id: CategoryKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    { id: "decretos", label: "Decretos", icon: FileText, color: "text-amber-600 dark:text-amber-400" },
    { id: "resoluciones", label: "Resoluciones", icon: FileCheck, color: "text-sky-600 dark:text-sky-400" },
    { id: "leyes", label: "Leyes", icon: Scale, color: "text-emerald-600 dark:text-emerald-400" },
    { id: "licitaciones", label: "Licitaciones", icon: ShoppingBag, color: "text-purple-600 dark:text-purple-400" },
    { id: "boletin_drive", label: "Boletines Oficiales (Drive)", icon: HardDrive, color: "text-cyan-600 dark:text-cyan-400" },
  ];

  const bibliotecaCategories: {
    id: CategoryKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    { id: "biblioteca", label: "Todos los catálogos", icon: Library, color: "text-blue-600 dark:text-blue-400" },
    { id: "biblioteca_libros", label: "Libros & Tratados", icon: BookOpen, color: "text-indigo-600 dark:text-indigo-400" },
    { id: "biblioteca_doctrina", label: "Doctrina & Artículos", icon: GraduationCap, color: "text-rose-600 dark:text-rose-400" },
    { id: "biblioteca_revistas", label: "Revistas Jurídicas", icon: Newspaper, color: "text-teal-600 dark:text-teal-400" },
    { id: "biblioteca_digital", label: "Recursos Digitales", icon: Laptop, color: "text-violet-600 dark:text-violet-400" },
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
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-border/60 shadow-sm shrink-0 bg-black flex items-center justify-center">
              <img
                src="/logo.png"
                alt="lex-assist logo"
                className="h-full w-full object-cover"
              />
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
        <div className="p-3">
          <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5 flex items-start space-x-2.5">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium text-foreground block">
                Tierra del Fuego, AeIAS
              </span>
              <span className="text-muted-foreground block text-[11px]">
                Boletín Oficial & Biblioteca PJ
              </span>
            </div>
          </div>
        </div>

        <Separator className="opacity-60" />

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* General: Todas las fuentes */}
          <div>
            <button
              onClick={() => {
                onSelectCategory("todos");
                if (onCloseMobile) onCloseMobile();
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all group",
                selectedCategory === "todos"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <div className="flex items-center space-x-3">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>Todas las fuentes</span>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-mono transition-colors",
                  selectedCategory === "todos"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/15"
                )}
              >
                {documentCounts.todos ?? 0}
              </span>
            </button>
          </div>

          {/* Section: Biblioteca del Poder Judicial (Koha) */}
          <div className="space-y-1">
            <div className="px-3 pb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-primary">
              <span className="flex items-center space-x-1.5">
                <Library className="h-3 w-3" />
                <span>Biblioteca Judicial</span>
              </span>
              <Badge variant="subtle" className="text-[9px] px-1 py-0">
                Koha
              </Badge>
            </div>

            {bibliotecaCategories.map((cat) => {
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
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all group",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isSelected ? "text-primary-foreground" : cat.color
                      )}
                    />
                    <span className="text-xs">{cat.label}</span>
                  </div>

                  <span
                    className={cn(
                      "text-[11px] px-1.5 py-0.5 rounded-full font-mono transition-colors",
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
          </div>

          {/* Section: Boletín Oficial & Normativa */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Boletín Oficial
            </div>

            {normativaCategories.map((cat) => {
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
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all group",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isSelected ? "text-primary-foreground" : cat.color
                      )}
                    />
                    <span className="text-xs">{cat.label}</span>
                  </div>

                  <span
                    className={cn(
                      "text-[11px] px-1.5 py-0.5 rounded-full font-mono transition-colors",
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
          </div>

          {/* Sedes Físicas Informativas */}
          <div className="rounded-md border border-border/70 bg-card/60 p-2.5 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 font-medium text-foreground text-[11px]">
              <Building className="h-3 w-3 text-muted-foreground" />
              <span>Sedes Biblioteca PJ TDF</span>
            </div>
            <div className="text-[10px] text-muted-foreground space-y-0.5 pl-4">
              <div>• Sede Sur (Ushuaia - DJS)</div>
              <div>• Sede Norte (Río Grande - DJN)</div>
              <div>• Recursos Digitales (AEL)</div>
            </div>
          </div>

          {/* AI Banner */}
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-medium text-primary text-[11px]">
              <Sparkles className="h-3 w-3" />
              <span>Búsqueda Semántica & IA</span>
            </div>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Indexación unificada de boletines y catálogos de doctrina judicial.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-border/80 text-[10px] text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Sincronización</span>
            <Badge variant="subtle" className="text-[9px] px-1.5 py-0">
              Koha & Boletín
            </Badge>
          </div>
          <div className="text-muted-foreground/75">
            v0.2.0 • Licencia MIT
          </div>
        </div>
      </aside>
    </>
  );
}
