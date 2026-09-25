"use client";

import * as React from "react";
import { Sidebar, type CategoryKey } from "@/components/sidebar";
import { DocumentList, type DocumentItem } from "@/components/document-list";
import { DocumentReader } from "@/components/document-reader";
import { MobileHeader } from "@/components/mobile-header";
import { ThemeToggle } from "@/components/theme-toggle";

// Datos de demostración enriquecidos para Tierra del Fuego, AeIAS
const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: "tdf-decreto-142-2026",
    title: "Decreto N° 142/26 - Declaración de Interés Provincial del Plan de Conservación y Manejo de Turberas",
    category: "decretos",
    categoryLabel: "Decreto",
    number: "Dto. 142/2026",
    date: "24/09/2026",
    organism: "Secretaría de Ambiente y Cambio Climático",
    sourceUrl: "https://boletinoficial.tierradelfuego.gob.ar/decretos/142-2026",
    pdfUrl: "https://boletinoficial.tierradelfuego.gob.ar/archivos/dto-142-26.pdf",
    aiSummary:
      "Declara de interés prioritario la protección integral de las turberas fueguinas como reservorios estratégicos de carbono y agua dulce. Establece una moratoria de 24 meses para nuevas extracciones comerciales en la cuenca del Río Grande y crea el Registro Provincial de Humedales Australes.",
    keyPoints: [
      "Moratoria de 24 meses para nuevas autorizaciones de extracción comercial.",
      "Creación del Registro Único de Humedales y Turberas de Tierra del Fuego.",
      "Obligatoriedad de presentar estudios de impacto hidrológico en proyectos linderos.",
      "Asignación de fondos especiales de mitigación climática bajo fiscalización provincial."
    ],
    fullText: `USHUAIA, 24 de Septiembre de 2026.

VISTO el expediente ambiental N° 0498/2026 caratulado 'Protección y Gestión Sostenible de Turberas Australes en la Provincia de Tierra del Fuego, Antártida e Islas del Atlántico Sur'; y

CONSIDERANDO:
Que las turberas constituyen más del 90% de los humedales de la Isla Grande de Tierra del Fuego y desempeñan un rol irremplazable en la regulación hídrica superficial y la captura a largo plazo de gases de efecto invernadero.

Que la Constitución Provincial en sus artículos 54 y 55 consagra el deber inexcusable del Estado de preservar el equilibrio ecológico y garantizar el aprovechamiento racional de los recursos naturales para las generaciones presentes y futuras.

Que resulta impostergable disponer medidas de salvaguarda precautoria ante el avance no planificado de obras de drenaje y explotaciones extractivas no sustentables.

Por ello:
EL GOBERNADOR DE LA PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR
DECRETA:

ARTÍCULO 1°.- DECLÁRASE de interés ambiental y estratégico provincial la preservación, restauración y monitoreo continuo de los ecosistemas de turberas y humedales de altura ubicados en el territorio provincial.

ARTÍCULO 2°.- SUSPÉNDASE por el término perentorio de veinticuatro (24) meses contados a partir de la publicación del presente en el Boletín Oficial, el otorgamiento de nuevos permisos de extracción, drenaje o modificación física de turberas con destino a uso comercial o industrial.

ARTÍCULO 3°.- CRÉASE en el ámbito de la Secretaría de Ambiente el Registro Provincial de Ecosistemas de Turbera (RPET), el cual deberá completar en un plazo no mayor a ciento ochenta (180) días el relevamiento satelital e in situ de las cuencas prioritarias.

ARTÍCULO 4°.- Comuníquese, publíquese en el Boletín Oficial de la Provincia y archívese.`
  },
  {
    id: "tdf-ley-1520-2026",
    title: "Ley N° 1520 - Régimen de Fomento a la Industria del Conocimiento y Servicios Tecnológicos Fueguinos",
    category: "leyes",
    categoryLabel: "Ley",
    number: "Ley 1520",
    date: "18/09/2026",
    organism: "Poder Legislativo Provincial",
    sourceUrl: "https://buscar.legistdf.gob.ar/leyes/1520",
    pdfUrl: "https://buscar.legistdf.gob.ar/archivos/ley-1520.pdf",
    aiSummary:
      "Crea el Régimen Provincial de Promoción de la Economía del Conocimiento. Otorga exenciones al impuesto sobre los Ingresos Brutos y sellos para empresas que desarrollen software, IA y biotecnología radicadas en Ushuaia, Tolhuin y Río Grande.",
    keyPoints: [
      "Exención del 100% en Ingresos Brutos durante los primeros 5 años de radicación efectiva.",
      "Bonificación de hasta el 40% en contribuciones patronales para empleo joven local.",
      "Creación del Fondo Tecnológico Fueguino (FONTEF) administrado con el CADIC-CONICET.",
      "Condición de arraigo: mínimo 70% de la nómina con residencia acreditada en la provincia."
    ],
    fullText: `LA LEGISLATURA DE LA PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR SANCIONA CON FUERZA DE LEY:

ARTÍCULO 1°.- Créase el 'Régimen Provincial de Promoción de la Economía del Conocimiento y la Innovación Tecnológica', con el objeto de diversificar la matriz productiva provincial, impulsar el empleo de alto valor agregado y complementar el régimen industrial fueguino.

ARTÍCULO 2°.- Serán beneficiarias las personas humanas o jurídicas constituidas o habilitadas para operar en el país, que acrediten que el setenta por ciento (70%) o más de su actividad principal se vincula con:
a) Desarrollo de software, modelos de inteligencia artificial y computación distribuida.
b) Biotecnología aplicada a recursos subantárticos y marinos.
c) Servicios geológicos satelitales y tecnología aeroespacial.

ARTÍCULO 3°.- Los beneficiarios inscriptos en el Registro Provincial gozarán de exención total de las alícuotas del Impuesto sobre los Ingresos Brutos por un plazo de cinco (5) años computados desde su notificación formal.

ARTÍCULO 4°.- Comuníquese al Poder Ejecutivo Provincial.`
  },
  {
    id: "tdf-resolucion-874-2026",
    title: "Resolución N° 874/26 - Actualización del Cuadro Tarifario Portuario para la Temporada Antártica 2026/2027",
    category: "resoluciones",
    categoryLabel: "Resolución",
    number: "Res. 874/2026",
    date: "15/09/2026",
    organism: "Dirección Provincial de Puertos (DPP)",
    sourceUrl: "https://boletinoficial.tierradelfuego.gob.ar/resoluciones/874-2026",
    pdfUrl: "https://boletinoficial.tierradelfuego.gob.ar/archivos/res-874-26.pdf",
    aiSummary:
      "Actualiza el tarifario de amarre, provisión de agua potable y gestión de residuos para buques de crucero y expedición con destino a la Antártida en el Puerto de Ushuaia, aplicando una bonificación verde del 15% para embarcaciones con propulsión híbrida o GNL.",
    keyPoints: [
      "Incremento del 12% en tarifas operativas respecto al período anterior.",
      "Bonificación verde del 15% para cruceros con certificación ambiental internacional.",
      "Nuevo protocolo estricto de descarga cero para residuos biológicos antárticos.",
      "Vigencia a partir del 1 de octubre de 2026 coincidente con la apertura de temporada."
    ],
    fullText: `USHUAIA, 15 de Septiembre de 2026.

VISTO las atribuciones conferidas por la Ley Provincial N° 24 y la proximidad del inicio de recaladas correspondientes a la Temporada de Cruceros y Expediciones Antárticas 2026/2027; y

CONSIDERANDO:
Que el Puerto de Ushuaia concentra más del 90% del tráfico marítimo turístico mundial hacia el continente blanco.

Que resulta indispensable sostener los planes de modernización del muelle comercial y garantizar estándares sustentables acordes a las directrices del Tratado Antártico y la OMI.

EL PRESIDENTE DE LA DIRECCIÓN PROVINCIAL DE PUERTOS
RESUELVE:

ARTÍCULO 1°.- APROBAR el Nuevo Cuadro Tarifario de Servicios Portuarios y Tasas de Uso de Muelle para buques de pasajeros y científicos con destino a la Antártida, obrante en el Anexo I de la presente.

ARTÍCULO 2°.- ESTABLÉCESE una bonificación del quince por ciento (15%) sobre la tasa de ocupación de muelle para aquellos buques que acrediten uso de combustibles limpios o propulsión híbrida.

ARTÍCULO 3°.- Regístrese, publíquese en el Boletín Oficial y comuníquese a las agencias marítimas habilitadas.`
  },
  {
    id: "tdf-licitacion-12-2026",
    title: "Licitación Pública N° 12/26 - Obra de Infraestructura Fibra Óptica Austral Tramo Tolhuin - San Sebastián",
    category: "licitaciones",
    categoryLabel: "Licitación",
    number: "Lic. Púb. 12/2026",
    date: "10/09/2026",
    organism: "Ministerio de Obras y Servicios Públicos",
    sourceUrl: "https://boletinoficial.tierradelfuego.gob.ar/licitaciones/12-2026",
    pdfUrl: "https://boletinoficial.tierradelfuego.gob.ar/archivos/lic-12-26.pdf",
    aiSummary:
      "Convocatoria a licitación pública nacional e internacional para el tendido subterráneo de 145 km de fibra óptica monomodo a lo largo de la Ruta Nacional N° 3. Presupuesto oficial estimado en $4.850.000.000 con apertura de sobres el 20 de octubre de 2026.",
    keyPoints: [
      "Presupuesto oficial: $4.850.000.000 ARS.",
      "Plazo de ejecución: 180 días corridos.",
      "Fecha de apertura de ofertas: 20 de octubre de 2026 a las 11:00 hs en Casa de Gobierno.",
      "Pliego disponible sin costo en el portal oficial de compras de la provincia."
    ],
    fullText: `GOBIERNO DE LA PROVINCIA DE TIERRA DEL FUEGO, AEIAS
MINISTERIO DE OBRAS Y SERVICIOS PÚBLICOS

LLAMADO A LICITACIÓN PÚBLICA NACIONAL N° 12/2026
Expediente N° MOSP-1049/2026

OBJETO: Contratación de la mano de obra, provisión de insumos y ejecución de la obra 'Tendido Troncal de Fibra Óptica Subterránea - Tramo Tolhuin a Paso Fronterizo San Sebastián', sobre traza de la Ruta Nacional N° 3.

PRESUPUESTO OFICIAL: Pesos cuatro mil ochocientos cincuenta millones ($4.850.000.000,00).

PLAZO DE OBRA: Ciento ochenta (180) días corridos a partir del acta de inicio.

VENTA Y CONSULTA DE PLIEGOS: Gratuitos, descargables desde el sitio web institucional compras.tierradelfuego.gob.ar hasta tres (3) días antes de la apertura.

RECEPCIÓN DE OFERTAS: Hasta las 10:30 horas del día 20 de Octubre de 2026 en Mesa de Entradas General de Casa de Gobierno, San Martín 450, Ushuaia.

ACTO DE APERTURA: 20 de Octubre de 2026 a las 11:00 horas en el Salón Islas Malvinas de Casa de Gobierno.`
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryKey>("todos");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentItem | null>(SAMPLE_DOCUMENTS[0]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<"list" | "reader">("list");

  // Filter documents by category and search
  const filteredDocuments = React.useMemo(() => {
    return SAMPLE_DOCUMENTS.filter((doc) => {
      const matchCategory =
        selectedCategory === "todos" || doc.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.organism.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.number.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setMobileView("reader");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Mobile Top Header */}
      <MobileHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-1 h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">
        {/* Left Column: Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (filteredDocuments.length > 0 && !filteredDocuments.some(d => d.id === selectedDoc?.id)) {
              const firstMatch = SAMPLE_DOCUMENTS.find(d => cat === "todos" || d.category === cat);
              if (firstMatch) setSelectedDoc(firstMatch);
            }
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Desktop Top Right Bar with Theme Toggle */}
        <div className="hidden lg:flex fixed top-3 right-6 z-40 items-center space-x-3 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/80 shadow-sm">
          <span className="text-xs font-serif font-medium text-muted-foreground">
            Modo de Lectura
          </span>
          <ThemeToggle />
        </div>

        {/* Central & Right Columns Container */}
        <main className="flex-1 flex overflow-hidden">
          {/* Central Column: Document List */}
          <div
            className={`w-full lg:w-96 xl:w-[420px] flex-shrink-0 flex flex-col h-full ${
              mobileView === "reader" ? "hidden lg:flex" : "flex"
            }`}
          >
            <DocumentList
              documents={filteredDocuments}
              selectedDocId={selectedDoc?.id ?? null}
              onSelectDocument={handleSelectDoc}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Right Column: Editorial Document Reader */}
          <div
            className={`flex-1 flex flex-col h-full bg-background overflow-hidden ${
              mobileView === "list" ? "hidden lg:flex" : "flex"
            }`}
          >
            <DocumentReader
              document={selectedDoc}
              onBackMobile={() => setMobileView("list")}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
