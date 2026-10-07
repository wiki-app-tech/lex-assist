"use client";

import * as React from "react";
import {
  Sparkles,
  FileDown,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Building2,
  BookOpen,
  ArrowLeft,
  Tag,
  FileText,
  Landmark,
  HardDrive,
  ShieldCheck,
  FileCheck2,
  Scale,
  Maximize2,
  ZoomIn,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/components/document-list";
import { getDriveMonthFolderUrl } from "@/lib/driveBoletines";

interface DocumentReaderProps {
  document: DocumentItem | null;
  onBackMobile?: () => void;
}

export function DocumentReader({ document, onBackMobile }: DocumentReaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [fontSize, setFontSize] = React.useState<"normal" | "large" | "xlarge">("normal");
  const [activeTab, setActiveTab] = React.useState<"sumario" | "texto">("sumario");
  const [textFilter, setTextFilter] = React.useState("");

  // Reiniciar a la pestaña del Sumario al cambiar de documento
  React.useEffect(() => {
    setActiveTab("sumario");
    setTextFilter("");
  }, [document?.id]);

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center bg-background/50">
        <div className="max-w-md space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Selecciona un Boletín Oficial
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Elige una edición oficial de 2024, 2025 o 2026 en el listado para inspeccionar su sumario oficial, actos administrativos publicados o ver el documento PDF original.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${document.title}\n\nSumario Oficial:\n${document.sumario || document.aiSummary}\n\nEnlace Oficial: ${document.driveUrl || document.pdfUrl}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "large":
        return "text-lg leading-relaxed";
      case "xlarge":
        return "text-xl leading-loose";
      default:
        return "text-sm leading-relaxed";
    }
  };

  const monthFolderUrl = getDriveMonthFolderUrl(document);
  const acts = document.sumarioActs || [];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Barra Superior del Lector */}
      <div className="flex items-center justify-between p-3.5 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {onBackMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-1 h-8 w-8"
              onClick={onBackMobile}
              aria-label="Volver a la lista"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <Badge className="bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold px-2.5 py-0.5">
            {document.categoryLabel || "Boletín Oficial"}
          </Badge>

          <span className="text-xs font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/60">
            {document.number}
          </span>

          <span className="text-xs text-muted-foreground hidden sm:inline">
            • {document.date}
          </span>
          {document.pageCount && (
            <span className="text-xs text-muted-foreground font-mono hidden md:inline">
              • {document.pageCount} págs.
            </span>
          )}
        </div>

        {/* Pestañas de Vista y Acciones */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Selector de Pestañas: Sumario y Texto */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80">
            <button
              onClick={() => setActiveTab("sumario")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                activeTab === "sumario"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Sumario</span>
            </button>
            <button
              onClick={() => setActiveTab("texto")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                activeTab === "texto"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5 text-purple-600" />
              <span className="hidden sm:inline">Texto</span>
            </button>
          </div>

          {/* Botón Acceso a la Carpeta de Google Drive del Mes */}
          <Button
            variant="default"
            size="sm"
            asChild
            className="h-8 text-xs bg-cyan-700 hover:bg-cyan-800 text-white font-medium shadow-xs"
            title={`Abrir carpeta de ${document.monthName || "Octubre"} en Google Drive`}
          >
            <a href={monthFolderUrl} target="_blank" rel="noopener noreferrer">
              <HardDrive className="h-3.5 w-3.5 mr-1 text-cyan-200" />
              <span>Drive ({document.monthName || "Octubre"})</span>
              <ExternalLink className="h-3 w-3 ml-1 opacity-80" />
            </a>
          </Button>

          {/* Botón Descargar PDF */}
          {document.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs border-blue-600/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              <a href={document.pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileDown className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Descargar PDF</span>
              </a>
            </Button>
          )}

          {/* Botón Copiar */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs px-2 sm:px-3"
            title="Copiar información al portapapeles"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline ml-1">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-1">Copiar</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Contenido según la pestaña activa (Texto o Sumario) */}
      {activeTab === "texto" ? (
        /* Pestaña: Texto Completo / Extracto */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar dentro del texto..."
                value={textFilter}
                onChange={(e) => setTextFilter(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-background"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setFontSize("normal")}
              >
                A
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-semibold"
                onClick={() => setFontSize("large")}
              >
                A+
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className={cn("max-w-3xl mx-auto font-mono whitespace-pre-wrap bg-muted/30 p-6 rounded-xl border border-border text-foreground", getFontSizeClass())}>
              {document.fullText}
            </div>
          </ScrollArea>
        </div>
      ) : (
        /* Pestaña Principal: Sumario Oficial y Actos Estructurados */
        <ScrollArea className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Encabezado y Metadatos de la Edición */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1 font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>Publicación: {document.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Gobierno de Tierra del Fuego, AeIAS</span>
                </span>
                {document.pageCount && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-foreground font-semibold">
                      {document.pageCount} páginas oficiales
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {document.title}
              </h1>

              {/* Badges Temáticos */}
              {document.topics && document.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {document.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-[11px] bg-blue-500/10 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/25 font-medium"
                    >
                      <Tag className="h-2.5 w-2.5 mr-1 text-blue-600 dark:text-blue-400" />
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Tarjeta de Síntesis del Sumario Oficial */}
            <Card className="border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />
              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
                    <FileCheck2 className="h-4 w-4 text-blue-600" />
                    <span>Sumario Oficial de la Edición</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono border-blue-400/40 text-blue-800 dark:text-blue-300">
                    B.O. Oficial TDF
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                <div className="text-sm text-foreground/90 font-sans leading-relaxed whitespace-pre-wrap">
                  {document.sumario || document.aiSummary}
                </div>
              </CardContent>
            </Card>

            {/* Desglose de Actos Administrativos Identificados */}
            {acts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-600" />
                  Actos y Normativas Publicadas en este Ejemplar ({acts.length})
                </h3>
                <div className="grid gap-2.5">
                  {acts.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-card hover:border-blue-500/40 transition-colors shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          [{act.tipo}] {act.numero}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {act.organismo}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-blue-500/30">
                        {act.sintesis}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Puntos Clave de la Edición */}
            {document.keyPoints && document.keyPoints.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Aspectos Relevantes del Ejemplar
                </h3>
                <ul className="grid gap-2">
                  {document.keyPoints.map((pt, i) => (
                    <li
                      key={i}
                      className="text-xs text-foreground/85 flex items-start gap-2 bg-muted/30 p-2.5 rounded-lg border border-border/60"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accesos Directos al Documento y Carpeta de Google Drive */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-foreground">
                  Repositorio Oficial en Google Drive
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Accede a la carpeta oficial de {document.monthName || "Octubre"} en Google Drive para consultar y descargar los archivos originales.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  asChild
                  className="h-8 text-xs bg-cyan-700 hover:bg-cyan-800 text-white font-medium shadow-xs"
                >
                  <a href={monthFolderUrl} target="_blank" rel="noopener noreferrer">
                    <HardDrive className="h-3.5 w-3.5 mr-1 text-cyan-200" />
                    Abrir Carpeta {document.monthName || "Octubre"} (Drive)
                    <ExternalLink className="h-3 w-3 ml-1 opacity-80" />
                  </a>
                </Button>
                {document.pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 text-xs"
                  >
                    <a href={document.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <FileDown className="h-3.5 w-3.5 mr-1" />
                      Descargar PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
