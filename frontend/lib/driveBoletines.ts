import type { DocumentItem } from "@/components/document-list";
import catalogData from "@/data/boletines_drive_catalog.json";
import seguridadPoliciaCasos from "@/data/seguridad_policia_casos.json";

export const POLICIA_SECURITY_CASES = seguridadPoliciaCasos;

export interface ActoAdministrativo {
  tipo: string;
  numero: string;
  organismo: string;
  sintesis: string;
}

export interface DriveBoletinRaw {
  id: string;
  filename: string;
  edition_number: string;
  edition_date: string;
  year: number;
  month: number;
  month_name: string;
  title: string;
  page_count: number;
  topics: string[];
  organismos?: string[];
  drive_url: string;
  download_url: string;
  is_separata: boolean;
  has_local_text: boolean;
  summary: string;
  sumario?: string;
  sumario_acts?: ActoAdministrativo[];
  sample_text: string;
}

export interface DriveCatalogStructure {
  total: number;
  updated_at: string;
  years: number[];
  year_counts?: Record<string, number>;
  months: { id: number; name: string }[];
  topics: string[];
  organismos?: string[];
  boletines: DriveBoletinRaw[];
}

export const DRIVE_CATALOG: DriveCatalogStructure = catalogData as DriveCatalogStructure;

export const THEMATIC_AREAS = [
  {
    id: "Economía, Hacienda & AREF",
    label: "Economía, Hacienda & AREF",
    shortLabel: "Economía / AREF",
    color: "emerald",
    bgClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  {
    id: "Salud & Bienestar",
    label: "Salud & Bienestar",
    shortLabel: "Salud",
    color: "rose",
    bgClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    badgeClass: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
  },
  {
    id: "Educación & Ciencia",
    label: "Educación & Ciencia",
    shortLabel: "Educación",
    color: "blue",
    bgClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    badgeClass: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
  },
  {
    id: "Obras Públicas & Vialidad",
    label: "Obras Públicas & Vialidad",
    shortLabel: "Obras Públicas",
    color: "amber",
    bgClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  {
    id: "Seguridad & Policía de Tierra del Fuego",
    label: "Seguridad & Policía de Tierra del Fuego",
    shortLabel: "Seguridad & Policía",
    color: "blue",
    bgClass: "bg-blue-600/15 text-blue-900 dark:text-blue-200 border-blue-600/40",
    badgeClass: "bg-blue-600/20 text-blue-900 dark:text-blue-200 border-blue-600/40 font-semibold",
    isFeatured: true,
  },
  {
    id: "Ambiente & Recursos Naturales",
    label: "Ambiente & Recursos Naturales",
    shortLabel: "Ambiente",
    color: "teal",
    bgClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    badgeClass: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
  },
  {
    id: "Turismo & Cultura",
    label: "Turismo & Cultura",
    shortLabel: "Turismo & Cultura",
    color: "purple",
    bgClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    badgeClass: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
  },
  {
    id: "Puertos & Vías Navegables",
    label: "Puertos & Vías Navegables",
    shortLabel: "Puertos",
    color: "cyan",
    bgClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    badgeClass: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
  },
  {
    id: "Vivienda, Hábitat & Tierras",
    label: "Vivienda, Hábitat & Tierras",
    shortLabel: "Vivienda & Hábitat",
    color: "orange",
    bgClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    badgeClass: "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30",
  },
];

// Helper to extract Drive file ID from drive_url for embedding iframe preview
export function getDriveFileId(driveUrl?: string): string | null {
  if (!driveUrl) return null;
  const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const ucMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return ucMatch ? ucMatch[1] : null;
}

export function getDriveEmbedUrl(driveUrl?: string): string | null {
  const fileId = getDriveFileId(driveUrl);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

// Convert Drive raw boletín to DocumentItem for seamless presentation
export function mapDriveBoletinToDocumentItem(b: DriveBoletinRaw): DocumentItem {
  const formattedDate = b.edition_date
    ? b.edition_date.split("-").reverse().join("/")
    : `${b.month_name} ${b.year}`;

  const acts = b.sumario_acts || [];
  const keyPoints: string[] = [
    `Edición Oficial N° ${b.edition_number || "S/N"} • ${b.month_name} de ${b.year}`,
    `Extensión documental: ${b.page_count} páginas oficiales`,
    `Ejes temáticos: ${b.topics && b.topics.length > 0 ? b.topics.join(" • ") : "Actos Generales del Poder Ejecutivo"}`,
    `Jurisdicción: Provincia de Tierra del Fuego, Antártida e Islas del Atlántico Sur`,
  ];

  // Agregar actos principales a los keyPoints
  if (acts.length > 0) {
    acts.slice(0, 3).forEach((a) => {
      keyPoints.push(`[${a.tipo}] ${a.numero} (${a.organismo}): ${a.sintesis.slice(0, 90)}...`);
    });
  }

  const effectiveSummary = b.sumario || b.summary;

  const fullTextContent = `${b.title.toUpperCase()}
PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR
Edición: ${b.edition_number || "S/N"} | Fecha de Publicación: ${formattedDate}
Extensión: ${b.page_count} páginas oficiales

======================================================================
SUMARIO OFICIAL Y ACTOS ADMINISTRATIVOS PUBLICADOS:
======================================================================
${effectiveSummary}

${acts.length > 0 ? `ACTOS IDENTIFICADOS EN EL EJEMPLAR:
${acts.map((a, i) => `${i + 1}. [${a.tipo}] ${a.numero} - ${a.organismo}\n   ${a.sintesis}`).join("\n\n")}` : ""}

======================================================================
ACCESO AL DOCUMENTO OFICIAL:
Visualización digital en Google Drive: ${b.drive_url}
Descarga directa del PDF oficial: ${b.download_url}

======================================================================
EXTRACTO DEL TEXTO DEL EJEMPLAR:
${b.sample_text}`;

  return {
    id: b.id,
    title: b.title,
    category: "boletin_oficial",
    categoryLabel: b.is_separata ? "Separata Especial" : "Boletín Oficial",
    number: b.edition_number ? `B.O. N° ${b.edition_number}` : "B.O. S/N",
    date: formattedDate,
    organism: "Gobierno de la Provincia de Tierra del Fuego, AeIAS",
    aiSummary: effectiveSummary,
    sourceUrl: b.drive_url,
    pdfUrl: b.download_url,
    sourceType: "boletin_drive",
    keyPoints,
    fullText: fullTextContent,
    year: b.year,
    month: b.month,
    monthName: b.month_name,
    editionNumber: b.edition_number,
    pageCount: b.page_count,
    topics: b.topics,
    driveUrl: b.drive_url,
    downloadUrl: b.download_url,
    isSeparata: b.is_separata,
    hasLocalText: b.has_local_text,
    sumario: b.sumario || b.summary,
    sumarioActs: acts,
  };
}

// Catálogo pre-mapeado de todos los boletines oficiales
export const DRIVE_BOLETINES_DOCUMENTS: DocumentItem[] = DRIVE_CATALOG.boletines.map(
  mapDriveBoletinToDocumentItem
);
