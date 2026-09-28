"use client";

import * as React from "react";
import {
  Search,
  Calendar,
  Filter,
  FileDown,
  ExternalLink,
  BookOpen,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  HeartPulse,
  GraduationCap,
  Coins,
  Trees,
  HardHat,
  Mountain,
  Anchor,
  ShieldCheck,
  ShieldAlert,
  Home,
  Layers,
  Eye,
  X,
  FileText,
  ScrollText,
  Image as ImageIcon,
  Maximize2,
  Copy,
  Check,
  ZoomIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/components/document-list";
import {
  DRIVE_CATALOG,
  DRIVE_BOLETINES_DOCUMENTS,
  THEMATIC_AREAS,
  POLICIA_SECURITY_CASES,
  getDriveEmbedUrl,
} from "@/lib/driveBoletines";

interface BoletinesThematicPanelProps {
  onSelectDocument: (doc: DocumentItem, targetSection?: string) => void;
  selectedDocId?: string | null;
}

const TOPIC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Seguridad & Policía de Tierra del Fuego": ShieldCheck,
  "Salud & Bienestar": HeartPulse,
  "Educación & Ciencia": GraduationCap,
  "Economía, Hacienda & AREF": Coins,
  "Ambiente & Recursos Naturales": Trees,
  "Obras Públicas & Vialidad": HardHat,
  "Turismo & Cultura": Mountain,
  "Puertos & Vías Navegables": Anchor,
  "Seguridad & Justicia": ShieldCheck,
  "Vivienda, Hábitat & Tierras": Home,
};

const ITEMS_PER_PAGE = 24;

export function BoletinesThematicPanel({
  onSelectDocument,
  selectedDocId,
}: BoletinesThematicPanelProps) {
  // Filter States
  const [selectedYear, setSelectedYear] = React.useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = React.useState<number | "all">("all");
  const [selectedTopic, setSelectedTopic] = React.useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"date_desc" | "date_asc" | "edition_desc">("date_desc");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Quick preview modal state
  const [previewDoc, setPreviewDoc] = React.useState<DocumentItem | null>(null);

  // Facsimile & exact redaction lightbox modal state
  const [captureModalDoc, setCaptureModalDoc] = React.useState<DocumentItem | null>(null);
  const [copiedModalRedaction, setCopiedModalRedaction] = React.useState(false);
  const [modalTab, setModalTab] = React.useState<"capture" | "redaction">("capture");

  // Calculate year counts
  const yearCounts = React.useMemo(() => {
    const counts: Record<number, number> = { 2026: 0, 2025: 0, 2024: 0 };
    for (const doc of DRIVE_BOLETINES_DOCUMENTS) {
      if (doc.year && counts[doc.year] !== undefined) {
        counts[doc.year]++;
      }
    }
    return counts;
  }, []);

  // Calculate month counts based on currently selected year
  const monthCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) counts[m] = 0;

    for (const doc of DRIVE_BOLETINES_DOCUMENTS) {
      if (selectedYear === "all" || doc.year === selectedYear) {
        if (doc.month) {
          counts[doc.month] = (counts[doc.month] || 0) + 1;
        }
      }
    }
    return counts;
  }, [selectedYear]);

  // Calculate topic counts based on currently selected year and month
  const topicCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of THEMATIC_AREAS) counts[t.id] = 0;

    for (const doc of DRIVE_BOLETINES_DOCUMENTS) {
      const matchYear = selectedYear === "all" || doc.year === selectedYear;
      const matchMonth = selectedMonth === "all" || doc.month === selectedMonth;
      if (matchYear && matchMonth && doc.topics) {
        for (const t of doc.topics) {
          counts[t] = (counts[t] || 0) + 1;
        }
      }
    }
    return counts;
  }, [selectedYear, selectedMonth]);

  // Filter and sort documents
  const filteredBoletines = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return DRIVE_BOLETINES_DOCUMENTS.filter((doc) => {
      // Filter Year
      if (selectedYear !== "all" && doc.year !== selectedYear) return false;

      // Filter Month
      if (selectedMonth !== "all" && doc.month !== selectedMonth) return false;

      // Filter Topic
      if (selectedTopic !== "all") {
        if (!doc.topics || !doc.topics.includes(selectedTopic)) return false;
      }

      // Filter Search query
      if (q !== "") {
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchNumber = doc.number.toLowerCase().includes(q);
        const matchSummary = doc.aiSummary.toLowerCase().includes(q);
        const matchDate = doc.date.toLowerCase().includes(q);
        const matchTopics = doc.topics?.some((t) => t.toLowerCase().includes(q));
        const matchPoliceSummary = doc.policeCaseSummary?.toLowerCase().includes(q);
        const matchExactRedaction = doc.exactRedaction?.toLowerCase().includes(q);
        const matchActNumber = doc.actNumber?.toLowerCase().includes(q);
        const matchParties = doc.keyParties?.some((p) => p.toLowerCase().includes(q));
        const matchLegalBasis = doc.legalBasis?.some((l) => l.toLowerCase().includes(q));
        if (
          !matchTitle &&
          !matchNumber &&
          !matchSummary &&
          !matchDate &&
          !matchTopics &&
          !matchPoliceSummary &&
          !matchExactRedaction &&
          !matchActNumber &&
          !matchParties &&
          !matchLegalBasis
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === "date_desc") {
        // Most recent first: compare edition_date or year/month/editionNumber
        const numA = parseInt(a.editionNumber || "0", 10);
        const numB = parseInt(b.editionNumber || "0", 10);
        return numB - numA;
      }
      if (sortOrder === "date_asc") {
        const numA = parseInt(a.editionNumber || "0", 10);
        const numB = parseInt(b.editionNumber || "0", 10);
        return numA - numB;
      }
      if (sortOrder === "edition_desc") {
        const numA = parseInt(a.editionNumber || "0", 10);
        const numB = parseInt(b.editionNumber || "0", 10);
        return numB - numA;
      }
      return 0;
    });
  }, [selectedYear, selectedMonth, selectedTopic, searchQuery, sortOrder]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedMonth, selectedTopic, searchQuery, sortOrder]);

  // Pagination slice
  const totalPages = Math.ceil(filteredBoletines.length / ITEMS_PER_PAGE);
  const paginatedBoletines = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBoletines.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBoletines, currentPage]);

  const hasActiveFilters =
    selectedYear !== "all" ||
    selectedMonth !== "all" ||
    selectedTopic !== "all" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
    setSelectedTopic("all");
    setSearchQuery("");
    setSortOrder("date_desc");
  };

  const getTopicConfig = (topicName: string) => {
    return (
      THEMATIC_AREAS.find((t) => t.id === topicName) || {
        id: topicName,
        label: topicName,
        shortLabel: topicName,
        color: "slate",
        bgClass: "bg-muted text-muted-foreground border-border",
        badgeClass: "bg-muted text-muted-foreground border-border",
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Top Banner / Hero Header */}
      <div className="border-b border-border/80 bg-gradient-to-r from-sky-500/10 via-background to-cyan-500/10 p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300">
                <HardDrive className="h-4 w-4" />
              </div>
              <Badge variant="drive" className="text-xs uppercase font-mono tracking-wider">
                Google Drive • Repositorio Provincial
              </Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                653 Boletines Indexados
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Boletines Oficiales de Tierra del Fuego
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Panel de búsqueda temática con acceso directo a cada uno de los boletines oficiales en PDF publicados por el Gobierno Provincial en los años <strong>2024, 2025 y 2026</strong>.
            </p>
          </div>

          {/* Quick Access to Drive Folder */}
          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 text-xs space-x-1.5 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 shadow-sm"
            >
              <a
                href="https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HardDrive className="h-3.5 w-3.5" />
                <span>Carpeta Raíz en Google Drive</span>
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-0.5">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Año 2026</span>
            <div className="text-lg font-bold font-serif text-cyan-700 dark:text-cyan-400">
              {yearCounts[2026]} ediciones
            </div>
            <span className="text-[10px] text-muted-foreground">Enero a Septiembre 2026</span>
          </div>

          <div className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-0.5">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Año 2025</span>
            <div className="text-lg font-bold font-serif text-emerald-700 dark:text-emerald-400">
              {yearCounts[2025]} ediciones
            </div>
            <span className="text-[10px] text-muted-foreground">12 meses completos</span>
          </div>

          <div className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-0.5">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Año 2024</span>
            <div className="text-lg font-bold font-serif text-amber-700 dark:text-amber-400">
              {yearCounts[2024]} ediciones
            </div>
            <span className="text-[10px] text-muted-foreground">Marzo a Diciembre 2024</span>
          </div>

          <div className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-0.5">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Ejes Temáticos</span>
            <div className="text-lg font-bold font-serif text-primary">
              {THEMATIC_AREAS.length} Áreas
            </div>
            <span className="text-[10px] text-muted-foreground">Clasificación Gubernamental</span>
          </div>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="p-4 sm:p-6 border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-20 space-y-4">
        {/* Row 1: Search Input & Order selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por N° de boletín (ej: 6173, 5988), decreto, ministerio, palabra clave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9.5 pr-8 h-9 text-xs sm:text-sm bg-card/70 focus:bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Sort Toggle */}
            <div className="flex items-center space-x-1.5 border border-border/80 rounded-md px-2.5 h-9 bg-card/50 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                aria-label="Criterio de ordenamiento"
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="date_desc">Más recientes primero (2026 → 2024)</option>
                <option value="date_asc">Más antiguos primero (2024 → 2026)</option>
                <option value="edition_desc">N° de Edición (Mayor a menor)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs text-muted-foreground hover:text-foreground space-x-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Restablecer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Year Selector (Años 2024, 2025, 2026) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Año:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedYear === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear("all")}
              className="h-7 text-xs px-2.5"
            >
              Todos los años ({DRIVE_BOLETINES_DOCUMENTS.length})
            </Button>
            {[2026, 2025, 2024].map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(year)}
                className="h-7 text-xs px-2.5 space-x-1.5"
              >
                <span>{year}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    selectedYear === year ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {yearCounts[year]}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Row 3: Month Selector (Enero a Diciembre) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center space-x-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span>Mes:</span>
          </span>
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedMonth === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedMonth("all")}
              className={cn(
                "h-6 text-[11px] px-2",
                selectedMonth === "all" ? "font-semibold bg-secondary text-secondary-foreground" : "text-muted-foreground"
              )}
            >
              Todos los meses
            </Button>
            {DRIVE_CATALOG.months.map((m) => {
              const count = monthCounts[m.id] || 0;
              const isSelected = selectedMonth === m.id;
              return (
                <button
                  key={m.id}
                  disabled={count === 0}
                  onClick={() => setSelectedMonth(isSelected ? "all" : m.id)}
                  className={cn(
                    "h-6 text-[11px] px-2 rounded-md transition-colors flex items-center space-x-1 border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                      : count > 0
                      ? "bg-card/70 border-border/80 text-foreground hover:bg-muted"
                      : "bg-muted/30 border-transparent text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  <span>{m.name}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[9px] px-1 rounded-full font-mono",
                        isSelected ? "bg-primary-foreground/20" : "text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SPOTLIGHT FILTER TAG: Seguridad & Policía de Tierra del Fuego */}
        <div className="rounded-xl border border-blue-500/35 bg-gradient-to-r from-blue-600/10 via-sky-600/5 to-indigo-600/10 p-3 sm:p-4 space-y-2.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                    Etiqueta de Búsqueda: Seguridad & Policía de Tierra del Fuego
                  </span>
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 py-0 font-mono">
                    {topicCounts["Seguridad & Policía de Tierra del Fuego"] || 6} ediciones indexadas
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Actos administrativos, sumarios policiales, pases a retiro por incapacidad, ascensos extraordinarios, equipamiento y redacción oficial de la Policía Provincial y fuerzas de seguridad de TDF.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant={selectedTopic === "Seguridad & Policía de Tierra del Fuego" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedTopic(
                    selectedTopic === "Seguridad & Policía de Tierra del Fuego"
                      ? "all"
                      : "Seguridad & Policía de Tierra del Fuego"
                  )
                }
                className={cn(
                  "h-8 text-xs space-x-1.5 transition-all shadow-xs",
                  selectedTopic === "Seguridad & Policía de Tierra del Fuego"
                    ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                    : "border-blue-500/40 text-blue-800 dark:text-blue-300 hover:bg-blue-500/10"
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {selectedTopic === "Seguridad & Policía de Tierra del Fuego"
                    ? "Filtro Policía Activo"
                    : "Filtrar por Policía & Seguridad"}
                </span>
              </Button>
            </div>
          </div>

          {/* Quick chips to jump directly to specific police cases and facsimiles */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-blue-500/20 text-[11px]">
            <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-wider mr-1 flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>Casos con resumen & facsímil oficial:</span>
            </span>
            {POLICIA_SECURITY_CASES.map((caso) => {
              const isActive =
                searchQuery === caso.edition_number || searchQuery === caso.act_number;
              return (
                <button
                  key={caso.id}
                  onClick={() => {
                    setSelectedTopic("Seguridad & Policía de Tierra del Fuego");
                    setSearchQuery(caso.edition_number);
                  }}
                  className={cn(
                    "inline-flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all",
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs scale-105"
                      : "bg-card/90 text-blue-900 dark:text-blue-200 border-blue-500/30 hover:bg-blue-500/15"
                  )}
                  title={`${caso.title} • ${caso.organism}`}
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                  <span>{caso.act_number} (B.O. {caso.edition_number})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Thematic Topics Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center space-x-1">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Filtrar por Tema / Eje Gubernamental:</span>
            </span>
            {selectedTopic !== "all" && (
              <button
                onClick={() => setSelectedTopic("all")}
                className="text-primary hover:underline text-xs"
              >
                Ver todos los temas
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTopic("all")}
              className={cn(
                "inline-flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border transition-all",
                selectedTopic === "all"
                  ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                  : "bg-card/80 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>Todos los temas</span>
              <span className="text-[10px] font-mono opacity-80">
                ({DRIVE_BOLETINES_DOCUMENTS.length})
              </span>
            </button>

            {THEMATIC_AREAS.map((topic) => {
              const Icon = TOPIC_ICONS[topic.id] || FileText;
              const isSelected = selectedTopic === topic.id;
              const count = topicCounts[topic.id] || 0;

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(isSelected ? "all" : topic.id)}
                  className={cn(
                    "inline-flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border transition-all",
                    isSelected
                      ? cn(topic.bgClass, "ring-2 ring-primary/40 font-semibold shadow-xs")
                      : "bg-card/70 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>{topic.shortLabel}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1 rounded-full",
                      isSelected ? "bg-black/10 dark:bg-white/10" : "text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RESULTS LIST & CARDS */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 space-y-4">
        {/* Results Counter and Current Filter summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/60">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground">
              {filteredBoletines.length} boletines oficiales encontrados
            </span>
            {(selectedYear !== "all" || selectedMonth !== "all" || selectedTopic !== "all") && (
              <span className="hidden sm:inline text-muted-foreground">
                (
                {selectedYear !== "all" ? `Año ${selectedYear}` : "Todos los años"}
                {selectedMonth !== "all" && `, ${DRIVE_CATALOG.months.find((m) => m.id === selectedMonth)?.name}`}
                {selectedTopic !== "all" && ` • Tema: ${selectedTopic}`}
                )
              </span>
            )}
          </div>
          <span className="font-mono text-[11px]">
            Página {currentPage} de {totalPages || 1}
          </span>
        </div>

        {/* Empty state */}
        {filteredBoletines.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              No se encontraron boletines con los filtros aplicados
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Intenta cambiar el año, el mes o restablecer la búsqueda temática para explorar los 653 boletines disponibles en Google Drive.
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Restablecer filtros
            </Button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedBoletines.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              const hasPdf = Boolean(doc.driveUrl || doc.pdfUrl);

              return (
                <Card
                  key={doc.id}
                  className={cn(
                    "flex flex-col justify-between border transition-all duration-200 hover:shadow-md hover:border-cyan-500/50 relative overflow-hidden bg-card/70",
                    isSelected && "ring-2 ring-primary border-primary bg-primary/5",
                    doc.policeCaseSummary && "border-blue-500/35 hover:border-blue-500/60"
                  )}
                >
                  <CardHeader className="p-4 sm:p-5 pb-3 space-y-2.5">
                    {/* Header: Edition & Date Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <Badge variant="drive" className="text-xs uppercase font-mono font-bold">
                          {doc.number}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-border/80">
                          {doc.monthName} {doc.year}
                        </Badge>
                        {doc.isSeparata && (
                          <Badge variant="subtle" className="text-[10px] text-amber-700 bg-amber-500/15">
                            Separata
                          </Badge>
                        )}
                        {doc.policeCaseSummary && (
                          <Badge className="bg-blue-600/20 text-blue-900 dark:text-blue-200 border-blue-600/40 text-[10px] font-semibold flex items-center space-x-1">
                            <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <span>Policía & Seguridad</span>
                          </Badge>
                        )}
                      </div>

                      {doc.pageCount ? (
                        <span className="text-[11px] font-mono text-muted-foreground shrink-0 bg-muted/80 px-2 py-0.5 rounded">
                          {doc.pageCount} págs.
                        </span>
                      ) : null}
                    </div>

                    {/* Title */}
                    <CardTitle
                      className="font-serif text-base sm:text-lg font-semibold leading-snug line-clamp-2 text-foreground hover:text-primary transition-colors cursor-pointer"
                      onClick={() => onSelectDocument(doc)}
                    >
                      {doc.title}
                    </CardTitle>

                    {/* Publication Date & Act Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground gap-2 flex-wrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Fecha: {doc.date}</span>
                      </div>
                      {doc.actNumber && (
                        <span className="font-mono text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/25">
                          {doc.actNumber}
                        </span>
                      )}
                    </div>

                    {/* Thematic Badges */}
                    {doc.topics && doc.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {doc.topics.map((t) => {
                          const cfg = getTopicConfig(t);
                          const Icon = TOPIC_ICONS[t] || FileText;
                          return (
                            <button
                              key={t}
                              onClick={() => setSelectedTopic(t)}
                              title={`Filtrar por ${t}`}
                              className={cn(
                                "inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full border transition-transform hover:scale-105",
                                cfg.badgeClass
                              )}
                            >
                              <Icon className="h-2.5 w-2.5" />
                              <span>{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                    {/* Police Case Box or Generic Summary */}
                    {doc.policeCaseSummary ? (
                      <div className="space-y-2">
                        <div className="rounded-lg border border-blue-500/35 bg-blue-500/10 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-blue-950 dark:text-blue-200 flex items-center space-x-1.5">
                              <ShieldAlert className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>Síntesis del Caso Policial / Seguridad:</span>
                            </span>
                            {doc.captureImageUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCaptureModalDoc(doc);
                                  setModalTab("capture");
                                }}
                                className="inline-flex items-center space-x-1 text-[10px] text-blue-800 dark:text-blue-300 font-semibold bg-blue-500/20 hover:bg-blue-500/30 px-2 py-0.5 rounded border border-blue-500/40 transition-colors"
                                title="Ver captura facsímil oficial de la página"
                              >
                                <ImageIcon className="h-3 w-3" />
                                <span>Ver Facsímil</span>
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                            {doc.policeCaseSummary}
                          </p>

                          {doc.keyParties && doc.keyParties.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-blue-500/20 text-[10px]">
                              <span className="text-muted-foreground font-medium uppercase tracking-wider">Partes:</span>
                              {doc.keyParties.map((p, idx) => (
                                <span key={idx} className="font-mono bg-blue-500/20 text-blue-950 dark:text-blue-200 px-1.5 py-0.2 rounded">
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Generic Summary */
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-sans">
                        {doc.aiSummary}
                      </p>
                    )}

                    {/* Actions bar */}
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-1 flex-wrap gap-y-1">
                        {/* Direct Button to exact wording for police & security cases */}
                        {(doc.exactRedaction || doc.policeCaseSummary) ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onSelectDocument(doc, "redaccion-oficial")}
                            className="h-8 text-xs space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
                            title="Ir directamente a la redacción oficial del caso en el boletín"
                          >
                            <ScrollText className="h-3.5 w-3.5" />
                            <span>Encontrar Redacción</span>
                          </Button>
                        ) : (
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => onSelectDocument(doc)}
                            className="h-8 text-xs space-x-1"
                          >
                            <BookOpen className="h-3 w-3" />
                            <span>Ver Ficha</span>
                          </Button>
                        )}

                        {/* Facsimile capture modal button */}
                        {doc.captureImageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCaptureModalDoc(doc);
                              setModalTab("capture");
                            }}
                            className="h-8 text-xs px-2 space-x-1 border-blue-500/40 text-blue-800 dark:text-blue-300 hover:bg-blue-500/10"
                            title="Ver captura facsímil del documento"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Captura</span>
                          </Button>
                        )}

                        {/* Quick preview modal button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewDoc(doc)}
                          title="Vista rápida del PDF de Drive"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-1">
                        {/* Direct Google Drive PDF Link */}
                        {doc.driveUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 text-xs space-x-1 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
                            title="Ver PDF original en Google Drive"
                          >
                            <a
                              href={doc.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="hidden sm:inline">Drive</span>
                            </a>
                          </Button>
                        )}

                        {/* Direct Download Link */}
                        {doc.downloadUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="h-8 text-xs space-x-1"
                            title="Descargar PDF del Boletín Oficial"
                          >
                            <a
                              href={doc.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileDown className="h-3 w-3" />
                              <span className="hidden sm:inline">PDF</span>
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60">
            <span className="text-xs text-muted-foreground">
              Mostrando {paginatedBoletines.length} de {filteredBoletines.length} boletines oficiales
            </span>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs space-x-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Anterior</span>
              </Button>

              <span className="text-xs font-mono px-2">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 text-xs space-x-1"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QUICK PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/30">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Badge variant="drive" className="text-xs font-mono">
                    {previewDoc.number}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {previewDoc.date} • {previewDoc.pageCount} páginas
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-foreground line-clamp-1">
                  {previewDoc.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {previewDoc.driveUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 text-xs border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                  >
                    <a href={previewDoc.driveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Abrir en Drive
                    </a>
                  </Button>
                )}

                {previewDoc.downloadUrl && (
                  <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
                    <a href={previewDoc.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <FileDown className="h-3.5 w-3.5 mr-1" />
                      Descargar PDF
                    </a>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setPreviewDoc(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content: Embedded Google Drive PDF Viewer */}
            <div className="flex-1 bg-muted/20 relative overflow-hidden">
              {getDriveEmbedUrl(previewDoc.driveUrl) ? (
                <iframe
                  src={getDriveEmbedUrl(previewDoc.driveUrl)!}
                  title={`Visor PDF ${previewDoc.title}`}
                  className="w-full h-full border-0"
                  allow="autoplay"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    El documento puede ser visualizado y descargado directamente desde el enlace oficial de Google Drive.
                  </p>
                  {previewDoc.driveUrl && (
                    <Button asChild size="sm">
                      <a href={previewDoc.driveUrl} target="_blank" rel="noopener noreferrer">
                        Abrir PDF en Google Drive
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL: Facsímil Oficial & Redacción Exacta del Caso Policial */}
      {captureModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-background rounded-xl border border-blue-500/40 shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600/15 via-blue-500/10 to-transparent">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <Badge variant="drive" className="text-xs font-mono font-bold">
                    {captureModalDoc.number}
                  </Badge>
                  {captureModalDoc.actNumber && (
                    <Badge variant="outline" className="border-blue-500/40 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                      {captureModalDoc.actNumber}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {captureModalDoc.date}
                  </Badge>
                  <Badge className="bg-blue-600/20 text-blue-900 dark:text-blue-200 border-blue-600/40 text-xs">
                    Policía & Seguridad TDF
                  </Badge>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-foreground line-clamp-1">
                  {captureModalDoc.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    const d = captureModalDoc;
                    setCaptureModalDoc(null);
                    onSelectDocument(d, "redaccion-oficial");
                  }}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white space-x-1.5 shadow-sm font-semibold"
                >
                  <ScrollText className="h-3.5 w-3.5" />
                  <span>Abrir en Lector Completo</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCaptureModalDoc(null)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Switcher: Facsímil Oficial vs Redacción */}
            <div className="px-4 py-2 border-b border-border/80 bg-muted/40 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant={modalTab === "capture" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setModalTab("capture")}
                  className={cn(
                    "h-7 text-xs space-x-1.5",
                    modalTab === "capture" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                  )}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Facsímil / Captura Oficial</span>
                </Button>
                <Button
                  variant={modalTab === "redaction" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setModalTab("redaction")}
                  className={cn(
                    "h-7 text-xs space-x-1.5",
                    modalTab === "redaction" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                  )}
                >
                  <ScrollText className="h-3.5 w-3.5" />
                  <span>Redacción Textual Verbatim</span>
                </Button>
              </div>

              {modalTab === "redaction" && captureModalDoc.exactRedaction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(captureModalDoc.exactRedaction || "");
                    setCopiedModalRedaction(true);
                    setTimeout(() => setCopiedModalRedaction(false), 2000);
                  }}
                  className="h-7 text-xs space-x-1"
                >
                  {copiedModalRedaction ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Copiado al portapapeles</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Redacción</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20">
              {modalTab === "capture" && captureModalDoc.captureImageUrl ? (
                <div className="flex flex-col items-center justify-center space-y-4 max-w-4xl mx-auto">
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-muted-foreground text-center w-full">
                    <p className="font-semibold text-blue-900 dark:text-blue-200">
                      Evidencia Documental Oficial • Facsímil del Boletín N° {captureModalDoc.editionNumber}
                    </p>
                    <p className="text-[11px] mt-0.5">
                      Esta captura digital de alta resolución permite verificar la redacción impresa fiel en caso de dificultades o caracteres OCR defectuosos.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 p-2 max-w-3xl w-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={captureModalDoc.captureImageUrl}
                      alt={`Facsímil Oficial ${captureModalDoc.number}`}
                      className="w-full h-auto object-contain max-h-[68vh] rounded border border-border/40"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 text-xs space-x-1.5"
                    >
                      <a
                        href={captureModalDoc.captureImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Ver Imagen en Alta Resolución</span>
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-4">
                  {/* Summary Box */}
                  <div className="rounded-lg border border-blue-500/35 bg-blue-500/10 p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      <span>{captureModalDoc.actNumber || "Norma Policial"} • Resumen Analítico Oficial</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {captureModalDoc.policeCaseSummary}
                    </p>
                    {captureModalDoc.legalBasis && (
                      <div className="pt-2 border-t border-blue-500/20 text-xs text-muted-foreground space-y-1">
                        <span className="font-semibold text-[11px] uppercase tracking-wider text-blue-800 dark:text-blue-300">
                          Fundamentos Legales:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {captureModalDoc.legalBasis.map((l, idx) => (
                            <li key={idx}>{l}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Exact Wording Box */}
                  <div className="rounded-lg border border-border/80 bg-card p-5 space-y-3 font-serif shadow-sm">
                    <div className="flex items-center justify-between text-xs font-mono uppercase text-muted-foreground border-b border-border/60 pb-2">
                      <span className="font-semibold text-foreground">Redacción Oficial del Caso (Texto del Boletín)</span>
                      <span className="text-[10px] text-primary">Transcripción Oficial</span>
                    </div>
                    <pre className="text-xs sm:text-sm font-serif leading-relaxed whitespace-pre-wrap text-foreground select-text font-normal">
                      {captureModalDoc.exactRedaction || captureModalDoc.fullText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
