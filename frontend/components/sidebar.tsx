"use client";

import * as React from "react";
import {
  FileText,
  Search,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  HardDrive,
  Landmark,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  FolderOpen,
  X,
  FileCheck2,
  FileStack,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { THEMATIC_AREAS } from "@/lib/driveBoletines";

export type CategoryKey =
  | "todos"
  | "boletin_oficial"
  | "separatas"
  | "ordinarias";

export interface BoletinFilterState {
  year: number | "all";
  month: number | "all";
  topic: string | "all";
  editionNumber?: string;
  isSeparata?: boolean | "all";
  search: string;
}

interface SidebarProps {
  selectedCategory?: CategoryKey;
  onSelectCategory?: (category: CategoryKey) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  boletinFilter: BoletinFilterState;
  onSelectBoletinFilter: (filter: BoletinFilterState) => void;
  totalEditions?: number;
  yearCounts?: Record<number, number>;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

const MONTHS_LIST = [
  { id: 1, name: "Enero", short: "Ene" },
  { id: 2, name: "Febrero", short: "Feb" },
  { id: 3, name: "Marzo", short: "Mar" },
  { id: 4, name: "Abril", short: "Abr" },
  { id: 5, name: "Mayo", short: "May" },
  { id: 6, name: "Junio", short: "Jun" },
  { id: 7, name: "Julio", short: "Jul" },
  { id: 8, name: "Agosto", short: "Ago" },
  { id: 9, name: "Septiembre", short: "Sep" },
  { id: 10, name: "Octubre", short: "Oct" },
  { id: 11, name: "Noviembre", short: "Nov" },
  { id: 12, name: "Diciembre", short: "Dic" },
];

export function Sidebar({
  isOpenMobile = false,
  onCloseMobile,
  boletinFilter,
  onSelectBoletinFilter,
  totalEditions = 653,
  yearCounts = { 2026: 218, 2025: 236, 2024: 199 },
  onTriggerSync,
  isSyncing = false,
}: SidebarProps) {
  const [isThematicOpen, setIsThematicOpen] = React.useState(true);
  const [isMonthsOpen, setIsMonthsOpen] = React.useState(true);
  const [editionInput, setEditionInput] = React.useState(boletinFilter.editionNumber || "");

  // Actualizar búsqueda por número de edición
  const handleEditionSearch = (val: string) => {
    setEditionInput(val);
    onSelectBoletinFilter({
      ...boletinFilter,
      editionNumber: val.trim() || undefined,
    });
  };

  const handleYearChange = (year: number | "all") => {
    onSelectBoletinFilter({
      ...boletinFilter,
      year,
    });
  };

  const handleMonthChange = (month: number | "all") => {
    onSelectBoletinFilter({
      ...boletinFilter,
      month: boletinFilter.month === month ? "all" : month,
    });
  };

  const handleTopicChange = (topic: string | "all") => {
    onSelectBoletinFilter({
      ...boletinFilter,
      topic: boletinFilter.topic === topic ? "all" : topic,
    });
  };

  const handleTypeChange = (isSeparata: boolean | "all") => {
    onSelectBoletinFilter({
      ...boletinFilter,
      isSeparata,
    });
  };

  const handleResetFilters = () => {
    setEditionInput("");
    onSelectBoletinFilter({
      year: "all",
      month: "all",
      topic: "all",
      editionNumber: undefined,
      isSeparata: "all",
      search: "",
    });
  };

  const activeFiltersCount =
    (boletinFilter.year !== "all" ? 1 : 0) +
    (boletinFilter.month !== "all" ? 1 : 0) +
    (boletinFilter.topic !== "all" ? 1 : 0) +
    (boletinFilter.editionNumber ? 1 : 0) +
    (boletinFilter.isSeparata && boletinFilter.isSeparata !== "all" ? 1 : 0) +
    (boletinFilter.search ? 1 : 0);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-80 bg-card border-r border-border transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col shadow-sm",
        isOpenMobile ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Encabezado Institucional Exclusivo */}
      <div className="p-4 border-b border-border bg-gradient-to-b from-blue-950/10 to-transparent dark:from-blue-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                Boletín Oficial
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold">
                  TDF
                </Badge>
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">
                Gobierno de Tierra del Fuego, AeIAS
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-muted-foreground"
              onClick={onCloseMobile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Indicador de Base de Datos Sincronizada */}
        <div className="mt-3.5 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Base de Datos Actualizada
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-300 font-mono">
              {totalEditions} eds.
            </Badge>
          </div>
          <div className="flex items-center justify-between text-[10px] text-blue-700/80 dark:text-blue-300/70">
            <span>Años: 2024, 2025, 2026</span>
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="hover:underline flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium disabled:opacity-50"
              title="Sincronizar base de datos"
            >
              <RefreshCw className={cn("h-2.5 w-2.5", isSyncing && "animate-spin")} />
              {isSyncing ? "Sincronizando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido con Scroll */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 text-sm custom-scrollbar">
        {/* Buscador Rápido por Número de Edición */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-blue-600" />
            Buscar N° de Edición
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Ej: 6173, 5988, 5545..."
              value={editionInput}
              onChange={(e) => handleEditionSearch(e.target.value)}
              className="h-8 text-xs pr-7 bg-muted/40 font-mono"
            />
            {editionInput && (
              <button
                onClick={() => handleEditionSearch("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtro Principal por Año (2024, 2025, 2026) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              Año de Publicación
            </span>
            {boletinFilter.year !== "all" && (
              <button
                onClick={() => handleYearChange("all")}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Ver todos
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant={boletinFilter.year === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearChange("all")}
              className={cn(
                "h-8 text-xs justify-between px-2.5",
                boletinFilter.year === "all" && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <span>Todos los años</span>
              <span className="font-mono text-[10px] opacity-80">{totalEditions}</span>
            </Button>

            <Button
              variant={boletinFilter.year === 2026 ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearChange(2026)}
              className={cn(
                "h-8 text-xs justify-between px-2.5",
                boletinFilter.year === 2026 && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <span className="font-semibold">Año 2026</span>
              <span className="font-mono text-[10px] opacity-80">{yearCounts[2026] || 218}</span>
            </Button>

            <Button
              variant={boletinFilter.year === 2025 ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearChange(2025)}
              className={cn(
                "h-8 text-xs justify-between px-2.5",
                boletinFilter.year === 2025 && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <span>Año 2025</span>
              <span className="font-mono text-[10px] opacity-80">{yearCounts[2025] || 236}</span>
            </Button>

            <Button
              variant={boletinFilter.year === 2024 ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearChange(2024)}
              className={cn(
                "h-8 text-xs justify-between px-2.5",
                boletinFilter.year === 2024 && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <span>Año 2024</span>
              <span className="font-mono text-[10px] opacity-80">{yearCounts[2024] || 199}</span>
            </Button>
          </div>
        </div>

        {/* Filtro por Mes de Publicación */}
        <div className="space-y-2">
          <button
            onClick={() => setIsMonthsOpen(!isMonthsOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              Mes de Edición
              {boletinFilter.month !== "all" && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-1 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  {MONTHS_LIST.find((m) => m.id === boletinFilter.month)?.name}
                </Badge>
              )}
            </span>
            {isMonthsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {isMonthsOpen && (
            <div className="grid grid-cols-4 gap-1 pt-1">
              {MONTHS_LIST.map((m) => {
                const isSelected = boletinFilter.month === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMonthChange(m.id)}
                    className={cn(
                      "px-1.5 py-1 text-[11px] font-medium rounded-md text-center transition-colors border",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                    )}
                  >
                    {m.short}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tipo de Edición: Ordinaria / Separata */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileStack className="h-3.5 w-3.5 text-blue-600" />
            Tipo de Publicación
          </span>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleTypeChange("all")}
              className={cn(
                "py-1 px-1.5 text-[11px] rounded border font-medium text-center",
                (!boletinFilter.isSeparata || boletinFilter.isSeparata === "all")
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => handleTypeChange(false)}
              className={cn(
                "py-1 px-1.5 text-[11px] rounded border font-medium text-center",
                boletinFilter.isSeparata === false
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              Ordinarias
            </button>
            <button
              onClick={() => handleTypeChange(true)}
              className={cn(
                "py-1 px-1.5 text-[11px] rounded border font-medium text-center",
                boletinFilter.isSeparata === true
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              Separatas
            </button>
          </div>
        </div>

        {/* Ejes Temáticos del Sumario */}
        <div className="space-y-2">
          <button
            onClick={() => setIsThematicOpen(!isThematicOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-600" />
              Ejes Temáticos del Sumario
            </span>
            {isThematicOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {isThematicOpen && (
            <div className="space-y-1 pt-1">
              {THEMATIC_AREAS.map((topic) => {
                const isSelected = boletinFilter.topic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicChange(topic.id)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between border",
                      isSelected
                        ? "bg-blue-600 text-white font-medium border-blue-600"
                        : "bg-transparent hover:bg-muted/60 text-muted-foreground hover:text-foreground border-transparent"
                    )}
                  >
                    <span className="truncate">{topic.shortLabel || topic.label}</span>
                    {isSelected && <CheckCircle2 className="h-3 w-3 shrink-0 ml-1 text-white" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón Reset de Filtros si hay alguno activo */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="w-full text-xs h-8 text-muted-foreground hover:text-foreground border-dashed"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Limpiar filtros activos ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Pie de Página Institucional */}
      <div className="p-3 border-t border-border bg-muted/20 text-xs flex flex-col gap-1.5">
        <a
          href="https://drive.google.com/drive/folders/1EeNy3W0yKZzX9c1hXfwBKZDvLEIVJAdk?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-[11px] text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Abrir carpeta con los últimos Boletines Oficiales (Octubre 2026)"
        >
          <span className="flex items-center gap-1 font-medium text-foreground/80">
            <HardDrive className="h-3.5 w-3.5 text-blue-600" />
            Últimos Boletines (Drive)
          </span>
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href="https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-[10px] text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Repositorio histórico general"
        >
          <span>Archivo General (Drive)</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
        <p className="text-[10px] text-muted-foreground/70">
          Boletín Oficial de Tierra del Fuego • Sistema Digital
        </p>
      </div>
    </aside>
  );
}
