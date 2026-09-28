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
  User,
  Library,
  Tag,
  MapPin,
  FileText,
  Globe,
  Landmark,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/components/document-list";
import { getDriveEmbedUrl } from "@/lib/driveBoletines";

interface DocumentReaderProps {
  document: DocumentItem | null;
  onBackMobile?: () => void;
}

export function DocumentReader({ document, onBackMobile }: DocumentReaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [fontSize, setFontSize] = React.useState<"normal" | "large" | "xlarge">("normal");
  const [viewMode, setViewMode] = React.useState<"text" | "live_web" | "drive_pdf">("text");

  // Reset view mode when document changes
  React.useEffect(() => {
    setViewMode("text");
  }, [document?.id]);

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center bg-background/50">
        <div className="max-w-md space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Ningún documento seleccionado
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Selecciona una norma del Boletín Oficial o una obra del catálogo de la Biblioteca del Poder Judicial para visualizar su resumen y contenido.
          </p>
        </div>
      </div>
    );
  }

  const isKoha = document.sourceType === "biblioteca_pj";

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${document.title}\n\nResumen IA:\n${document.aiSummary}\n\nTexto / Reseña:\n${document.fullText}`
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
        return "text-base leading-relaxed";
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

  const isDrive = document.sourceType === "boletin_drive";
  const isLegis = document.sourceType === "legistdf";

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Reader Sticky Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/80 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {onBackMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-1"
              onClick={onBackMobile}
              aria-label="Volver a la lista"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Badge variant={getBadgeVariant(document.category)} className="text-xs uppercase px-2.5 py-0.5">
            {document.categoryLabel}
          </Badge>

          {document.callNumber ? (
            <span className="text-xs font-mono bg-muted/80 text-muted-foreground px-2 py-0.5 rounded border border-border/60">
              Signatura: {document.callNumber}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-mono">{document.number}</span>
          )}

          {isKoha && (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              Koha OPAC
            </Badge>
          )}

          {isDrive && (
            <Badge variant="outline" className="text-[10px] text-cyan-600 border-cyan-500/30">
              Google Drive • Whoosh
            </Badge>
          )}

          {isLegis && (
            <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-500/40 font-mono">
              LegisTDF • Sumario
            </Badge>
          )}
        </div>

        {/* Reader Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Toggle live web view vs analysis for LegisTDF */}
          {isLegis && (
            <Button
              variant={viewMode === "live_web" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(viewMode === "live_web" ? "text" : "live_web")}
              className={cn(
                "h-8 text-xs space-x-1.5 transition-colors",
                viewMode === "live_web"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10"
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {viewMode === "live_web" ? "Ver Ficha" : "Sitio Web Oficial"}
              </span>
            </Button>
          )}

          {/* Toggle Google Drive PDF preview for Drive Boletines */}
          {isDrive && (
            <Button
              variant={viewMode === "drive_pdf" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(viewMode === "drive_pdf" ? "text" : "drive_pdf")}
              className={cn(
                "h-8 text-xs space-x-1.5 transition-colors",
                viewMode === "drive_pdf"
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                  : "border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
              )}
            >
              <HardDrive className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {viewMode === "drive_pdf" ? "Ver Ficha IA" : "Visor PDF en Drive"}
              </span>
            </Button>
          )}

          {/* Font scale buttons for editorial reading */}
          <div className="hidden sm:flex items-center rounded-md border border-border/80 p-0.5 mr-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setFontSize("normal")}
              title="Tipografía normal"
            >
              A
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-sm font-semibold"
              onClick={() => setFontSize("large")}
              title="Tipografía grande"
            >
              A+
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </Button>

          {document.pdfUrl && (
            <Button
              variant="default"
              size="sm"
              asChild
              className="h-8 text-xs space-x-1.5 bg-primary text-primary-foreground"
            >
              <a href={document.pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileDown className="h-3.5 w-3.5" />
                <span>PDF Oficial</span>
              </a>
            </Button>
          )}

          {isDrive ? (
            (document.driveUrl || document.sourceUrl) && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 text-xs space-x-1.5 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
              >
                <a href={document.driveUrl || document.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Drive</span>
                </a>
              </Button>
            )
          ) : isLegis ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs space-x-1.5 border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10"
            >
              <a href="https://buscar.legistdf.gob.ar/sumario_completo" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sitio Oficial</span>
              </a>
            </Button>
          ) : document.sourceUrl ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs space-x-1.5 border-border"
            >
              <a href={document.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isKoha ? "Ficha Koha" : "Fuente"}</span>
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Reader Body: Live Web View, Drive PDF Viewer, or Scrollable Content */}
      {viewMode === "drive_pdf" && isDrive ? (
        <div className="flex-1 flex flex-col h-full p-3 sm:p-4 space-y-3 bg-muted/20 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-card/90 p-3 rounded-lg border border-border/80 shadow-sm gap-2">
            <div className="flex items-center space-x-2 truncate">
              <HardDrive className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="font-mono text-muted-foreground truncate">
                {document.title} • {document.date}
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("text")}
                className="h-7 text-xs border-border"
              >
                Volver a síntesis
              </Button>
              {document.pdfUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="h-7 text-xs"
                >
                  <a href={document.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileDown className="h-3 w-3 mr-1" />
                    Descargar PDF
                  </a>
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                asChild
                className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <a
                  href={document.driveUrl || document.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir en Google Drive
                </a>
              </Button>
            </div>
          </div>

          <div className="flex-1 rounded-lg border border-border/80 overflow-hidden bg-white shadow-sm flex flex-col">
            {getDriveEmbedUrl(document.driveUrl || document.sourceUrl) ? (
              <iframe
                src={getDriveEmbedUrl(document.driveUrl || document.sourceUrl)!}
                title={`Visor PDF ${document.title}`}
                className="w-full h-full flex-1 border-0"
                allow="autoplay"
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Visualizador no disponible directamente. Podés abrirlo en Google Drive.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === "live_web" && isLegis ? (
        <div className="flex-1 flex flex-col h-full p-3 sm:p-4 space-y-3 bg-muted/20 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-card/90 p-3 rounded-lg border border-border/80 shadow-sm gap-2">
            <div className="flex items-center space-x-2 truncate">
              <Globe className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span className="font-mono text-muted-foreground truncate">
                https://buscar.legistdf.gob.ar/sumario_completo
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("text")}
                className="h-7 text-xs border-border"
              >
                Volver a ficha del asunto
              </Button>
              <Button
                variant="default"
                size="sm"
                asChild
                className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white"
              >
                <a
                  href="https://buscar.legistdf.gob.ar/sumario_completo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir en nueva pestaña
                </a>
              </Button>
            </div>
          </div>

          <div className="flex-1 rounded-lg border border-border/80 overflow-hidden bg-white shadow-sm flex flex-col">
            <iframe
              src="https://buscar.legistdf.gob.ar/sumario_completo"
              title="Sumario de Asuntos Pendientes - Legislatura de Tierra del Fuego"
              className="w-full h-full flex-1 border-0"
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* LegisTDF Official Header Card */}
            {isLegis && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-orange-700 dark:text-orange-300">
                    <Landmark className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span>Sumario de Asuntos Pendientes — Legislatura TDF</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Publicado oficialmente en el portal LegisTDF para la próxima sesión ordinaria.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    size="sm"
                    asChild
                    className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                  >
                    <a
                      href="https://buscar.legistdf.gob.ar/sumario_completo"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Acceso al sitio oficial
                    </a>
                  </Button>
                  {document.sourceUrl && document.sourceUrl.includes("ir_asunto.php") && (
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs border-orange-500/30">
                      <a href={document.sourceUrl} target="_blank" rel="noopener noreferrer">
                        Expediente ↗
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Google Drive Official Header Card */}
            {isDrive && (
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                    <HardDrive className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Boletín Oficial de Tierra del Fuego — Google Drive Oficial</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Edición digital {document.number} • {document.monthName || ""} {document.year || ""} {document.pageCount ? `• ${document.pageCount} páginas` : ""}
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => setViewMode("drive_pdf")}
                    className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm space-x-1"
                  >
                    <HardDrive className="h-3.5 w-3.5" />
                    <span>Ver PDF en Visor</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 text-xs border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <a href={document.driveUrl || document.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Drive
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Metadata & Title */}
            <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{isKoha ? `Año: ${document.date}` : `Publicado: ${document.date}`}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                {isKoha ? (
                  <>
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Autor: {document.author || document.organism}</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>{document.organism}</span>
                  </>
                )}
              </span>
              {document.branch && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-primary">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{document.branch}</span>
                  </span>
                </>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              {document.title}
            </h1>

            {/* Subject tags if available */}
            {document.subjects && document.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {document.subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-[10px] bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full border border-border/50"
                  >
                    <Tag className="h-2.5 w-2.5 mr-1 text-primary/70" />
                    {sub}
                  </span>
                ))}
              </div>
            )}

            {/* Thematic topic tags for Drive Boletines */}
            {document.topics && document.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {document.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-[10px] bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-medium"
                  >
                    <Tag className="h-2.5 w-2.5 mr-1 text-cyan-600 dark:text-cyan-400" />
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI SUMMARY BOX */}
          <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
            <CardHeader className="p-4 sm:p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary font-semibold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Resumen IA & Descriptores Analíticos</span>
                </div>
                <Badge variant="subtle" className="text-[10px] tracking-wider uppercase font-mono">
                  {isKoha ? "Koha • Análisis Doctrinal" : "Ollama • Llama 3.1"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5">
              <p className="text-sm text-foreground/90 font-sans leading-relaxed">
                {document.aiSummary}
              </p>

              {document.keyPoints && document.keyPoints.length > 0 && (
                <div className="pt-2 border-t border-primary/20 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
                    Puntos destacados / Descriptores temáticos:
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground font-sans">
                    {document.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trazabilidad & Fuente */}
              <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground/80 border-t border-primary/15 gap-2">
                <span>
                  {isKoha
                    ? `Biblioteca Judicial: ${document.publisher || "Poder Judicial de Tierra del Fuego"}`
                    : "Trazabilidad verificada: Boletín Oficial TDF"}
                </span>
                {document.sourceUrl && (
                  <a
                    href={document.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-primary hover:underline font-medium"
                  >
                    <span>{isKoha ? "Ver ficha en Koha OPAC" : "Ver publicación oficial"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* DOCUMENT CONTENT / EXTRACT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-sans font-medium pb-2 border-b border-border/60">
              <span>{isKoha ? "Ficha Técnica & Reseña de Contenido" : "Texto Completo del Acto Administrativo"}</span>
              <span className="font-mono">{isKoha ? "Catálogo OPAC" : "Transcripción Oficial"}</span>
            </div>

            <article
              className={`font-serif text-foreground/95 transition-all prose-editorial ${getFontSizeClass()}`}
              style={{
                letterSpacing: "0.01em",
                wordSpacing: "0.05em",
              }}
            >
              {document.fullText.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-5 text-justify leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </article>
          </div>

          {/* Final Source Citation Footer */}
          <div className="mt-12 p-4 rounded-lg bg-muted/40 border border-border/80 text-xs text-muted-foreground space-y-1 font-sans">
            <div className="font-semibold text-foreground">
              {isKoha ? "Referencia Bibliográfica:" : "Cita legal sugerida:"}
            </div>
            <p className="font-mono text-[11px]">
              {isKoha
                ? `${document.author ? `${document.author}. ` : ""}${document.title}. ${document.publisher || "Poder Judicial TDF"}${document.callNumber ? ` [Signatura: ${document.callNumber}]` : ""}. Catálogo Biblioteca PJ Tierra del Fuego.`
                : `Provincia de Tierra del Fuego, AeIAS. ${document.categoryLabel} ${document.number}. Publicado en el Boletín Oficial de Tierra del Fuego con fecha ${document.date}.`}
            </p>
          </div>
        </div>
      </ScrollArea>
      )}
    </div>
  );
}
