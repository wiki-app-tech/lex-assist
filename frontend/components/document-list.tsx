"use client";

import * as React from "react";
import { Search, Sparkles, Calendar, Building2, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CategoryKey } from "@/components/sidebar";

export interface DocumentItem {
  id: string;
  title: string;
  category: "decretos" | "resoluciones" | "leyes" | "licitaciones";
  categoryLabel: string;
  number: string;
  date: string;
  organism: string;
  aiSummary: string;
  sourceUrl?: string;
  pdfUrl?: string;
  fullText: string;
  keyPoints: string[];
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
  return (
    <div className="flex flex-col h-full border-r border-border bg-background">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-border/80 space-y-3 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight font-serif text-foreground">
              Boletines & Normativa
            </h2>
            <p className="text-xs text-muted-foreground">
              {documents.length} documentos disponibles
            </p>
          </div>
          <div className="flex items-center space-x-1.5">
            <Badge variant="outline" className="text-xs capitalize font-normal">
              {selectedCategory === "todos" ? "Todas las fuentes" : selectedCategory}
            </Badge>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por palabra clave, organismo o norma..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs bg-card/60 focus:bg-background"
          />
        </div>
      </div>

      {/* Document Cards List */}
      <ScrollArea className="flex-1 p-3 space-y-2.5">
        {documents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-medium text-foreground">No se encontraron documentos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Prueba modificando los términos de búsqueda o cambiando de categoría.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc.id;

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
                      <Badge
                        variant={doc.category as any}
                        className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5"
                      >
                        {doc.categoryLabel}
                      </Badge>

                      <div className="flex items-center text-muted-foreground text-[11px] space-x-1">
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
                      <Building2 className="h-3 w-3 shrink-0 text-primary/70" />
                      <span className="truncate">{doc.organism}</span>
                    </div>

                    {/* AI Summary Snippet */}
                    <div className="rounded-md bg-muted/60 p-2 text-xs border border-border/40">
                      <div className="flex items-center space-x-1 text-[11px] font-semibold text-primary mb-1">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>Resumen Inteligente</span>
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
