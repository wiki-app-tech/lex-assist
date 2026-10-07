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
  getDriveMonthFolderUrl,
} from "@/lib/driveBoletines";
import type { BoletinFilterState } from "@/components/sidebar";

interface BoletinesThematicPanelProps {
  onSelectDocument: (doc: DocumentItem, targetSection?: string) => void;
  selectedDocId?: string | null;
  filter?: BoletinFilterState;
  onFilterChange?: React.Dispatch<React.SetStateAction<BoletinFilterState>>;
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
  filter,
  onFilterChange,
}: BoletinesThematicPanelProps) {
  // Filter States: either controlled via props or local fallback
  const [internalFilter, setInternalFilter] = React.useState<BoletinFilterState>({
    year: "all",
    month: "all",
    topic: "all",
    search: "",
  });

  const activeFilter = filter ?? internalFilter;
  const updateFilter = onFilterChange ?? setInternalFilter;

  const selectedYear = activeFilter.year;
  const selectedMonth = activeFilter.month;
  const selectedTopic = activeFilter.topic;
  const searchQuery = activeFilter.search;
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
    updateFilter({
      year: "all",
      month: "all",
      topic: "all",
      search: "",
    });
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
      {/* ULTRA-COMPACT STICKY HEADER (PC & MOBILE ADAPTED) */}
      <div className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur-md px-3 sm:px-6 py-2.5 space-y-2">
        {/* Row 1: Title, active filter badge, search input, sort, drive link, reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Title & Active Filter Tag */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="h-7 w-7 rounded-md bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300 shrink-0">
              <HardDrive className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="font-serif font-bold text-sm sm:text-base text-foreground tracking-tight">
                Boletines Oficiales
              </span>

              {/* Dynamic active filter pill */}
              {selectedTopic === "Seguridad & Policía de Tierra del Fuego" ? (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 py-0 flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Seguridad & Policía ({filteredBoletines.length})</span>
                  <button
                    onClick={() => updateFilter((prev) => ({ ...prev, topic: "all" }))}
                    className="ml-1 hover:text-red-200"
                    title="Quitar filtro de policía"
                  >
                    ×
                  </button>
                </Badge>
              ) : selectedYear !== "all" ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex items-center space-x-1 border">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span>Año {selectedYear} ({filteredBoletines.length})</span>
                  <button
                    onClick={() => updateFilter((prev) => ({ ...prev, year: "all", month: "all" }))}
                    className="ml-1 hover:text-red-500"
                    title="Quitar filtro de año"
                  >
                    ×
                  </button>
                </Badge>
              ) : selectedTopic !== "all" ? (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center space-x-1 border-primary/40 text-primary">
                  <span>
                    {THEMATIC_AREAS.find((t) => t.id === selectedTopic)?.shortLabel || selectedTopic} ({filteredBoletines.length})
                  </span>
                  <button
                    onClick={() => updateFilter((prev) => ({ ...prev, topic: "all" }))}
                    className="ml-1 hover:text-red-500"
                    title="Quitar filtro de tema"
                  >
                    ×
                  </button>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/80 text-muted-foreground font-mono">
                  653 edic.
                </Badge>
              )}
            </div>
          </div>

          {/* Search Input, Sort Selector & Quick Drive / Reset */}
          <div className="flex items-center space-x-2 flex-1 sm:max-w-xl justify-end">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por N° (ej: 6173), decreto, sumario..."
                value={searchQuery}
                onChange={(e) => updateFilter((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-8 pr-7 h-8 text-xs bg-card/70 focus:bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => updateFilter((prev) => ({ ...prev, search: "" }))}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center space-x-1 border border-border/80 rounded-md px-2 h-8 bg-card/50 text-[11px] shrink-0">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                aria-label="Criterio de ordenamiento"
                className="bg-transparent text-[11px] text-foreground focus:outline-none cursor-pointer max-w-[100px] sm:max-w-none"
              >
                <option value="date_desc">Más recientes (2026 → 2024)</option>
                <option value="date_asc">Más antiguos (2024 → 2026)</option>
                <option value="edition_desc">N° Edición (Mayor a menor)</option>
              </select>
            </div>

            {/* Quick Drive Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 shrink-0"
              title="Abrir carpeta oficial en Google Drive"
            >
              <a
                href="https://drive.google.com/drive/folders/1EeNy3W0yKZzX9c1hXfwBKZDvLEIVJAdk?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HardDrive className="h-3.5 w-3.5" />
              </a>
            </Button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground space-x-1 shrink-0"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden md:inline">Restablecer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Horizontal Quick Filter Chips Strip (Touch-friendly and Swipeable for Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {/* All Chip */}
          <button
            onClick={() => updateFilter((prev) => ({ ...prev, year: "all", topic: "all" }))}
            className={cn(
              "shrink-0 h-6 px-2.5 rounded-full text-[11px] font-medium transition-all flex items-center space-x-1 border",
              selectedYear === "all" && selectedTopic === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-muted/50 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span>Todos</span>
            <span className="font-mono text-[9px] opacity-80">653</span>
          </button>

          {/* Seguridad & Policía Chip */}
          <button
            onClick={() =>
              updateFilter((prev) => ({
                ...prev,
                topic:
                  selectedTopic === "Seguridad & Policía de Tierra del Fuego"
                    ? "all"
                    : "Seguridad & Policía de Tierra del Fuego",
              }))
            }
            className={cn(
              "shrink-0 h-6 px-2.5 rounded-full text-[11px] font-medium transition-all flex items-center space-x-1.5 border",
              selectedTopic === "Seguridad & Policía de Tierra del Fuego"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                : "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
            )}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Seguridad & Policía</span>
            <span className="font-mono text-[9px] bg-blue-600/30 text-current px-1 rounded-full">
              {topicCounts["Seguridad & Policía de Tierra del Fuego"] || 6}
            </span>
          </button>

          {/* Year Chips */}
          {[2026, 2025, 2024].map((year) => {
            const isYearSelected = selectedYear === year && selectedTopic !== "Seguridad & Policía de Tierra del Fuego";
            return (
              <button
                key={year}
                onClick={() =>
                  updateFilter((prev) => ({
                    ...prev,
                    year: selectedYear === year ? "all" : year,
                    month: "all",
                  }))
                }
                className={cn(
                  "shrink-0 h-6 px-2 rounded-full text-[11px] font-medium transition-all flex items-center space-x-1 border",
                  isYearSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                    : "bg-card/70 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{year}</span>
                <span className="font-mono text-[9px] opacity-80">{yearCounts[year]}</span>
              </button>
            );
          })}

          <div className="h-3.5 w-px bg-border shrink-0 mx-0.5" />

          {/* Thematic Area Chips */}
          {THEMATIC_AREAS.filter((t) => t.id !== "Seguridad & Policía de Tierra del Fuego").map((topic) => {
            const Icon = TOPIC_ICONS[topic.id] || FileText;
            const isSelected = selectedTopic === topic.id;
            const count = topicCounts[topic.id] || 0;

            return (
              <button
                key={topic.id}
                onClick={() =>
                  updateFilter((prev) => ({
                    ...prev,
                    topic: isSelected ? "all" : topic.id,
                  }))
                }
                className={cn(
                  "shrink-0 h-6 px-2 rounded-full text-[11px] font-medium transition-all flex items-center space-x-1 border",
                  isSelected
                    ? cn(topic.bgClass, "ring-1 ring-primary font-semibold shadow-xs")
                    : "bg-card/70 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span>{topic.shortLabel}</span>
                {count > 0 && <span className="font-mono text-[9px] opacity-75">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Row 3: Conditional Inline Sub-bars */}
        {/* Month selector if year is selected */}
        {selectedYear !== "all" && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 text-[11px] border-t border-border/50">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground mr-1 shrink-0 flex items-center space-x-1">
              <SlidersHorizontal className="h-3 w-3" />
              <span>Mes:</span>
            </span>
            <button
              onClick={() => updateFilter((prev) => ({ ...prev, month: "all" }))}
              className={cn(
                "shrink-0 h-5 px-1.5 rounded text-[10px] font-medium transition-colors",
                selectedMonth === "all" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Todos
            </button>
            {DRIVE_CATALOG.months.map((m) => {
              const count = monthCounts[m.id] || 0;
              const isSelected = selectedMonth === m.id;
              if (count === 0) return null;
              return (
                <button
                  key={m.id}
                  onClick={() => updateFilter((prev) => ({ ...prev, month: isSelected ? "all" : m.id }))}
                  className={cn(
                    "shrink-0 h-5 px-1.5 rounded text-[10px] font-medium transition-colors flex items-center space-x-1",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground bg-muted/60 hover:bg-muted"
                  )}
                >
                  <span>{m.name.slice(0, 3)}</span>
                  <span className="text-[9px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Police Cases Quick Jumps if Police filter is active */}
        {selectedTopic === "Seguridad & Policía de Tierra del Fuego" && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[11px] border-t border-blue-500/20">
            <span className="text-[10px] uppercase font-semibold text-blue-800 dark:text-blue-300 mr-1 shrink-0 flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>Casos con Facsímil:</span>
            </span>
            {POLICIA_SECURITY_CASES.map((caso) => {
              const isActive = searchQuery === caso.edition_number || searchQuery === caso.act_number;
              return (
                <button
                  key={caso.id}
                  onClick={() =>
                    updateFilter((prev) => ({
                      ...prev,
                      search: isActive ? "" : caso.edition_number,
                    }))
                  }
                  className={cn(
                    "shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-mono transition-all",
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs scale-102"
                      : "bg-card text-blue-900 dark:text-blue-200 border-blue-500/30 hover:bg-blue-500/15"
                  )}
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                  <span>{caso.act_number} (B.O. {caso.edition_number})</span>
                </button>
              );
            })}
          </div>
        )}
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
                              onClick={() => updateFilter((prev) => ({ ...prev, topic: t }))}
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
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="h-8 text-xs bg-cyan-700 hover:bg-cyan-800 text-white font-medium"
                >
                  <a href={getDriveMonthFolderUrl(previewDoc)} target="_blank" rel="noopener noreferrer">
                    <HardDrive className="h-3.5 w-3.5 mr-1 text-cyan-200" />
                    Carpeta {previewDoc.monthName || "Octubre"} en Drive
                    <ExternalLink className="h-3 w-3 ml-1 opacity-80" />
                  </a>
                </Button>

                {previewDoc.driveUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 text-xs border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                  >
                    <a href={previewDoc.driveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Archivo en Drive
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

            {/* Modal Content: Acceso Directo Oficial sin iframe pesado */}
            <div className="flex-1 bg-muted/20 p-6 sm:p-8 flex items-center justify-center overflow-y-auto">
              <div className="max-w-xl w-full bg-card p-6 rounded-2xl border border-border shadow-lg space-y-5 text-center">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center shadow-inner">
                  <HardDrive className="h-7 w-7" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg text-foreground">
                    {previewDoc.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Edición oficial de {previewDoc.date} ({previewDoc.pageCount ? `${previewDoc.pageCount} páginas` : "Edición Oficial"}). Debido a la gran extensión de los ejemplares de la provincia (+100 MB), los documentos originales se consultan directamente en Google Drive sin límites de carga.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Button asChild size="default" className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800 text-white font-medium">
                    <a href={getDriveMonthFolderUrl(previewDoc)} target="_blank" rel="noopener noreferrer">
                      <HardDrive className="h-4 w-4 mr-2 text-cyan-200" />
                      Abrir Carpeta {previewDoc.monthName || "Octubre"} en Google Drive
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-80" />
                    </a>
                  </Button>

                  {previewDoc.downloadUrl && (
                    <Button variant="outline" asChild size="default" className="w-full sm:w-auto">
                      <a href={previewDoc.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <FileDown className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
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
