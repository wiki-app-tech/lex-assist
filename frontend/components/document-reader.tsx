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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentItem } from "@/components/document-list";

interface DocumentReaderProps {
  document: DocumentItem | null;
  onBackMobile?: () => void;
}

export function DocumentReader({ document, onBackMobile }: DocumentReaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [fontSize, setFontSize] = React.useState<"normal" | "large" | "xlarge">("normal");

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
        </div>

        {/* Reader Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Font scale buttons for editorial reading */}
          <div className="hidden sm:flex items-center rounded-md border border-border/80 p-0.5 mr-2">
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

          {document.sourceUrl && (
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
          )}
        </div>
      </div>

      {/* Reader Scrollable Content */}
      <ScrollArea className="flex-1 px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
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
    </div>
  );
}
