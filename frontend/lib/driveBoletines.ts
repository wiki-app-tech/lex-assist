import type { DocumentItem } from "@/components/document-list";
import catalogData from "@/data/boletines_drive_catalog.json";

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
  drive_url: string;
  download_url: string;
  is_separata: boolean;
  has_local_text: boolean;
  summary: string;
  sample_text: string;
}

export interface DriveCatalogStructure {
  total: number;
  updated_at: string;
  years: number[];
  months: { id: number; name: string }[];
  topics: string[];
  boletines: DriveBoletinRaw[];
}

export const DRIVE_CATALOG: DriveCatalogStructure = catalogData as DriveCatalogStructure;

export const THEMATIC_AREAS = [
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
    id: "Economía, Hacienda & AREF",
    label: "Economía, Hacienda & AREF",
    shortLabel: "Economía / AREF",
    color: "emerald",
    bgClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
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
    id: "Obras Públicas & Vialidad",
    label: "Obras Públicas & Vialidad",
    shortLabel: "Obras Públicas",
    color: "amber",
    bgClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
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
    id: "Seguridad & Justicia",
    label: "Seguridad & Justicia",
    shortLabel: "Seguridad",
    color: "indigo",
    bgClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    badgeClass: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
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

// Convert Drive raw boletín to DocumentItem for seamless interoperability
export function mapDriveBoletinToDocumentItem(b: DriveBoletinRaw): DocumentItem {
  const formattedDate = b.edition_date
    ? b.edition_date.split("-").reverse().join("/")
    : `${b.month_name} ${b.year}`;

  const keyPoints: string[] = [
    `Edición Oficial N° ${b.edition_number} (${b.month_name} ${b.year})`,
    `Extensión documental: ${b.page_count} páginas`,
    `Ejes temáticos: ${b.topics.length > 0 ? b.topics.join(" • ") : "Actos Administrativos Generales"}`,
    `Fuente: Google Drive Oficial del Gobierno de Tierra del Fuego`,
    b.is_separata ? "Tipo de publicación: Separata Especial" : "Edición General Ordinaria",
  ];

  return {
    id: b.id,
    title: b.title,
    category: "boletin_drive",
    categoryLabel: b.is_separata ? "Separata B.O." : "B.O. Drive",
    number: `B.O. N° ${b.edition_number}`,
    date: formattedDate,
    organism: "Gobierno de la Provincia de Tierra del Fuego, AeIAS",
    aiSummary: b.summary,
    sourceUrl: b.drive_url,
    pdfUrl: b.download_url,
    sourceType: "boletin_drive",
    keyPoints,
    fullText: `${b.title.toUpperCase()}
PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR
Edición: ${b.edition_number} | Fecha de Publicación: ${formattedDate}
Páginas totales: ${b.page_count}

EJES TEMÁTICOS IDENTIFICADOS:
${b.topics.length > 0 ? b.topics.map((t) => `• ${t}`).join("\n") : "• Actos Administrativos Generales del Poder Ejecutivo y Entes Descentralizados"}

RESUMEN ANALÍTICO DE LA EDICIÓN:
${b.summary}

ENLACE OFICIAL DE DESCARGA Y LECTURA:
Visualización en Google Drive: ${b.drive_url}
Descarga directa del PDF: ${b.download_url}

EXTRACTO DOCUMENTAL DE LA EDICIÓN:
${b.sample_text}`,
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
  };
}

// Pre-transformed list of all 653 Drive bulletins
export const DRIVE_BOLETINES_DOCUMENTS: DocumentItem[] = DRIVE_CATALOG.boletines.map(
  mapDriveBoletinToDocumentItem
);
