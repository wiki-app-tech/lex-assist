"use client";

import * as React from "react";
import {
  Search,
  Calendar,
  Building2,
  FileDown,
  ExternalLink,
  Tag,
  FileText,
  FileCheck2,
  X,
  Scale,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
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
  sourceType?: string;
  year?: number;
  month?: number;
  monthName?: string;
  editionNumber?: string;
  pageCount?: number;
  topics?: string[];
  driveUrl?: string;
  downloadUrl?: string;
  isSeparata?: boolean;
  hasLocalText?: boolean;
  sumario?: string;
  sumarioActs?: Array<{
    tipo: string;
    numero: string;
    organismo: string;
    sintesis: string;
  }>;
  policeCaseSummary?: string;
  exactRedaction?: string;
  captureImageUrl?: string;
  actNumber?: string;
  keyParties?: string[];
  legalBasis?: string[];
}

interface DocumentListProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  onSelectDocument: (doc: DocumentItem) => void;
  selectedCategory?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function DocumentList({
  documents,
  selectedDocId,
  onSelectDocument,
  searchQuery,
  onSearchChange,
}: DocumentListProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Barra de Búsqueda del Listado */}
      <div className="p-3 border-b border-border space-y-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por acto, número, tema, ministerio o sumario..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-7 h-9 text-xs bg-card/60 focus:bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Listado de Tarjetas con Scroll */}
      <ScrollArea className="flex-1 p-2.5">
        <div className="space-y-2">
          {documents.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No se encontraron ediciones</p>
              <p className="text-xs text-muted-foreground">
                Prueba ajustando los filtros de año, mes o el término de búsqueda.
              </p>
            </div>
          ) : (
            documents.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              const acts = doc.sumarioActs || [];

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all duration-150 text-left relative group",
                    isSelected
                      ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 shadow-xs ring-1 ring-blue-500/20"
                      : "bg-card border-border hover:border-blue-400/50 hover:bg-muted/40"
                  )}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {doc.number}
                      </span>
                      {doc.isSeparata ? (
                        <Badge className="bg-purple-600/15 text-purple-800 dark:text-purple-300 border-purple-500/30 text-[10px] px-1.5 py-0 h-4">
                          Separata
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-blue-700 dark:text-blue-300 border-blue-400/40">
                          Ordinaria
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span>{doc.date}</span>
                    </div>
                  </div>

                  {/* Título y Resumen del Sumario */}
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {doc.title}
                  </h4>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                    {doc.sumario ? doc.sumario.replace(/^SUMARIO OFICIAL[^\n]+\n[^\n]+\n[^\n]+\n/, "").slice(0, 160) : doc.aiSummary}
                  </p>

                  {/* Actos destacados */}
                  {acts.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-border/60 flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-300 font-medium truncate">
                      <Scale className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {acts.slice(0, 2).map((a) => `${a.numero}`).join(" • ")}
                      </span>
                    </div>
                  )}

                  {/* Badges Temáticos y Páginas */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1 overflow-hidden">
                      {doc.topics && doc.topics.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="truncate px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium"
                        >
                          {t.split("&")[0].trim()}
                        </span>
                      ))}
                    </div>
                    {doc.pageCount && (
                      <span className="font-mono text-muted-foreground shrink-0 ml-1">
                        {doc.pageCount} págs.
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
