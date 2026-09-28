"use client";

import * as React from "react";
import {
  Search,
  Sparkles,
  Calendar,
  Building2,
  BookMarked,
  User,
  ExternalLink,
  FileDown,
  Landmark,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CategoryKey } from "@/components/sidebar";

export interface DocumentItem {
  id: string;
  title: string;
  category:
    | "decretos"
    | "resoluciones"
    | "leyes"
    | "licitaciones"
    | "boletin_drive"
    | "sumario_legis"
    | "biblioteca_libros"
    | "biblioteca_doctrina"
    | "biblioteca_revistas"
    | "biblioteca_digital";
  categoryLabel: string;
  number: string;
  date: string;
  organism: string;
  aiSummary: string;
  sourceUrl?: string;
  pdfUrl?: string;
  fullText: string;
  keyPoints: string[];
  author?: string;
  publisher?: string;
  callNumber?: string;
  branch?: string;
  kohaBiblionumber?: string;
  subjects?: string[];
  sourceType?: "boletin" | "biblioteca_pj" | "boletin_drive" | "legistdf";
}

interface DocumentListProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  onSelectDocument: (doc: DocumentItem) => void;
  selectedCategory: CategoryKey;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function DocumentList({
  documents,
  selectedDocId,
  onSelectDocument,
  selectedCategory,
  searchQuery,
  onSearchChange,
}: DocumentListProps) {
  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case "todos":
        return "Todas las fuentes";
      case "sumario_legis":
        return "Sumario Legislativo (LegisTDF)";
      case "boletin_drive":
        return "Boletines Oficiales (Drive)";
      case "biblioteca":
        return "Biblioteca Judicial (Todos)";
      case "biblioteca_libros":
        return "Libros & Tratados";
      case "biblioteca_doctrina":
        return "Doctrina & Artículos";
      case "biblioteca_revistas":
        return "Revistas Jurídicas";
      case "biblioteca_digital":
        return "Recursos Digitales";
      default:
        return selectedCategory;
    }
  };

  const getBadgeVariant = (category: string) => {
    if (category === "sumario_legis") return "legis";
    if (category === "boletin_drive") return "drive";
    if (category.startsWith("biblioteca_")) {
      const sub = category.replace("biblioteca_", "");
      if (sub === "libros") return "libro";
      if (sub === "doctrina") return "doctrina";
      if (sub === "revistas") return "revista";
      if (sub === "digital") return "digital";
      return "biblioteca";
    }
    return category as any;
  };

  return (
    <div className="flex flex-col h-full border-r border-border bg-background">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-border/80 space-y-3 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight font-serif text-foreground">
              {selectedCategory === "sumario_legis"
                ? "Poder Legislativo TDF"
                : selectedCategory.startsWith("biblioteca")
                ? "Biblioteca Judicial Koha"
                : "Boletines & Normativa"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {documents.length} registros disponibles
            </p>
          </div>
          <div className="flex items-center space-x-1.5">
            <Badge variant="outline" className="text-xs capitalize font-normal">
              {getCategoryTitle()}
            </Badge>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              selectedCategory === "sumario_legis"
                ? "Buscar por asunto (ej: 326), bloque, proyecto..."
                : "Buscar por título, autor, signatura o materia..."
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs bg-card/60 focus:bg-background"
          />
        </div>

        {/* Official Banner when LegisTDF is selected */}
        {selectedCategory === "sumario_legis" && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300">
                <Landmark className="h-3.5 w-3.5" />
                <span>Sumario de Asuntos Pendientes</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-500/40 font-mono">
                LegisTDF
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Asuntos para próxima sesión legislativa provincial publicados en el portal oficial LegisTDF.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <a
                href="https://buscar.legistdf.gob.ar/sumario_completo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-medium transition-colors shadow-sm"
              >
                <span>Acceso al sitio oficial</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://legistdf.gob.ar/lp/sumarios/PUBLICO/SUMARIO%20PENDIENTE.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-[11px] text-foreground font-medium transition-colors"
                title="Descargar PDF original del sumario"
              >
                <FileDown className="h-3 w-3 text-muted-foreground" />
                <span>PDF</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Document Cards List */}
      <ScrollArea className="flex-1 p-3 space-y-2.5">
        {documents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-medium text-foreground">No se encontraron documentos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Prueba modificando los términos de búsqueda o cambiando de catálogo.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              const isKohaDoc = doc.sourceType === "biblioteca_pj";

              return (
                <Card
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md border",
                    isSelected
                      ? "border-primary/80 bg-accent/30 shadow-sm ring-1 ring-primary/40"
                      : "border-border/70 hover:border-border bg-card/90"
                  )}
                >
                  <CardHeader className="p-3.5 pb-2 space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <Badge
                          variant={getBadgeVariant(doc.category)}
                          className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5"
                        >
                          {doc.categoryLabel}
                        </Badge>
                        {doc.callNumber && (
                          <span className="text-[10px] font-mono bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                            {doc.callNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-muted-foreground text-[11px] space-x-1 shrink-0">
                        <Calendar className="h-3 w-3" />
                        <span>{doc.date}</span>
                      </div>
                    </div>

                    <CardTitle className="text-sm font-serif font-bold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {doc.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-3.5 pt-0 space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground font-medium space-x-1.5">
                      {isKohaDoc ? (
                        <>
                          <User className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate">{doc.author || doc.organism}</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate">{doc.organism}</span>
                        </>
                      )}
                    </div>

                    {/* AI Summary Snippet */}
                    <div className="rounded-md bg-muted/60 p-2 text-xs border border-border/40">
                      <div className="flex items-center space-x-1 text-[11px] font-semibold text-primary mb-1">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>Resumen & Descriptores</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
                        {doc.aiSummary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
