"use client";

import * as React from "react";
import { Sidebar, type CategoryKey } from "@/components/sidebar";
import { DocumentList, type DocumentItem } from "@/components/document-list";
import { DocumentReader } from "@/components/document-reader";
import { MobileHeader } from "@/components/mobile-header";
import { ThemeToggle } from "@/components/theme-toggle";

// Catálogo combinado: Boletín Oficial TDF y Biblioteca del Poder Judicial TDF (Koha)
const ALL_DOCUMENTS: DocumentItem[] = [
  // --- Normativa y Boletín Oficial ---
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
    sourceType: "boletin",
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
    sourceType: "boletin",
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
    sourceType: "boletin",
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
    sourceType: "boletin",
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
  },

  // --- Biblioteca del Poder Judicial TDF (Koha) ---
  // 1. Libros & Tratados (Koha LIB)
  {
    id: "koha-biblio-22",
    title: "La anulación de oficio del acto administrativo : la denominada 'cosa juzgada administrativa'",
    category: "biblioteca_libros",
    categoryLabel: "Libro / Tratado",
    number: "Koha #22",
    date: "1981",
    organism: "Biblioteca Poder Judicial Sur (Ushuaia)",
    author: "Julio Rodolfo Comadira",
    publisher: "Buenos Aires : Astrea, 1981",
    callNumber: "342.924 COM",
    branch: "Sede Sur (Ushuaia)",
    kohaBiblionumber: "22",
    subjects: ["DERECHO ADMINISTRATIVO", "ACTO ADMINISTRATIVO", "COSA JUZGADA", "REVOCACION DE OFICIO"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=22",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Tratado doctrinario sobre la potestad revocatoria del Estado y las garantías constitucionales ante el acto administrativo regular. Analiza la doctrina de la cosa juzgada administrativa, estabilidad del acto y límites formales en sede contencioso-administrativa.",
    keyPoints: [
      "Principio de estabilidad del acto administrativo regular que genera derechos subjetivos.",
      "Límites a la anulación oficiosa frente al principio de seguridad jurídica.",
      "Evolución pretoriana en la jurisprudencia de la Corte Suprema y tribunales superiores.",
      "Registro físico disponible en Biblioteca Central Ushuaia (Signatura: 342.924 COM)."
    ],
    fullText: `OBRA CATALOGADA EN BIBLIOTECA DEL PODER JUDICIAL DE TIERRA DEL FUEGO

TÍTULO: La anulación de oficio del acto administrativo : la denominada "cosa juzgada administrativa"
AUTOR: Comadira, Julio Rodolfo.
EDITORIAL: Buenos Aires : Astrea, 1981. xix, 221 p. ; 22 cm.
SIGNATURA TOPOGRÁFICA: 342.924 COM
UBICACIÓN FÍSICA: Biblioteca Poder Judicial Sur - Ushuaia.

SINOPSIS ANALÍTICA:
La presente monografía constituye una obra liminar para el derecho público provincial y federal argentino. El autor aborda la tensión existente entre la legalidad objetiva del obrar estatal y la tutela de los derechos adquiridos por los administrados.

CAPÍTULOS PRINCIPALES:
I. Noción preliminar del acto administrativo y sus presunciones de legitimidad y ejecutoriedad.
II. La estabilidad del acto administrativo y la impropiamente denominada 'cosa juzgada administrativa'.
III. Vicios que justifican la extinción del acto: nulidad absoluta vs. nulidad relativa.
IV. La doctrina del fallo 'Elena Carman de Cantón' y 'Pustelnik' en la jurisprudencia superior.
V. Facultades revisoras en el ámbito de las administraciones públicas provinciales y municipales.

DISPONIBILIDAD EN KOHA:
Ítem disponible para consulta en sala y préstamo interbibliotecario en Sede Ushuaia.`
  },
  {
    id: "koha-biblio-2356",
    title: "Tutela jurídica del crédito : Medidas cautelares y acciones de recomposición patrimonial",
    category: "biblioteca_libros",
    categoryLabel: "Libro / Monografía",
    number: "Koha #2356",
    date: "1975",
    organism: "Biblioteca Poder Judicial Sur (Ushuaia)",
    author: "Juan Carlos Palmero",
    publisher: "Buenos Aires : Astrea, 1975",
    callNumber: "347.457 PAL",
    branch: "Sede Sur (Ushuaia)",
    kohaBiblionumber: "2356",
    subjects: ["DERECHO CIVIL", "OBLIGACIONES", "TUTELA DEL CREDITO", "ACCION PAULIANA"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=2356",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Estudio monográfico sobre los mecanismos de protección del acreedor frente a la insolvencia fraudulenta del deudor. Analiza la acción pauliana, subrogatoria y la adopción de medidas conservatorias preventivas en procesos civiles y comerciales.",
    keyPoints: [
      "Sistematización de las acciones de integración y conservación patrimonial.",
      "Requisitos objetivos y subjetivos del fraude a los acreedores.",
      "Compatibilidad con el régimen de quiebras y medidas cautelares genéricas.",
      "Ejemplar disponible en Sede Sur Ushuaia."
    ],
    fullText: `OBRA CATALOGADA EN BIBLIOTECA DEL PODER JUDICIAL DE TIERRA DEL FUEGO

TÍTULO: Tutela jurídica del crédito
AUTOR: Palmero, Juan Carlos.
EDITORIAL: Buenos Aires : Astrea, 1975.
SIGNATURA TOPOGRÁFICA: 347.457 PAL
UBICACIÓN FÍSICA: Biblioteca Poder Judicial Sur - Ushuaia.

RESUMEN TEMÁTICO:
La obra aborda de forma exhaustiva la defensa de los derechos de crédito desde una doble perspectiva sustancial y procesal. Explora la naturaleza jurídica del patrimonio como prenda común de los acreedores y las limitaciones que imponen las leyes de inembargabilidad.

CONTENIDOS TRATADOS:
- La agresión patrimonial legítima.
- Embargo preventivo e inhibición general de bienes.
- Acciones de simulación y revocatoria frente a terceros adquirentes a título oneroso o gratuito.`
  },

  // 2. Doctrina & Artículos (Koha ANA / ART)
  {
    id: "koha-biblio-2411",
    title: "La inconstitucionalidad del solve et repete en la ley provincial 90 (policía del trabajo)",
    category: "biblioteca_doctrina",
    categoryLabel: "Doctrina Fueguina",
    number: "Koha #2411",
    date: "2017",
    organism: "Poder Judicial de Tierra del Fuego",
    author: "Yamina Pallotto",
    publisher: "Ushuaia : Poder Judicial de Tierra del Fuego, 2017",
    callNumber: "DOC TDF 2411",
    branch: "Sede Sur (Ushuaia)",
    kohaBiblionumber: "2411",
    subjects: ["DERECHO LABORAL FUEGUINO", "LEY PROVINCIAL 90", "SOLVE ET REPETE", "TUTELA JUDICIAL EFECTIVA"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=2411",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Investigación jurídica editada por el Poder Judicial de Tierra del Fuego que fundamenta la inconstitucionalidad del requisito de depósito previo (solve et repete) establecido en la Ley Provincial N° 90 de policía laboral, a la luz del artículo 8 de la CADH y la doctrina del STJ.",
    keyPoints: [
      "Impacto directo sobre la normativa local: Ley Provincial 90 de Tierra del Fuego.",
      "Vulneración del acceso irrestricto a la justicia por exigencias pecuniarias previas.",
      "Análisis de precedentes del Superior Tribunal de Justicia de Tierra del Fuego.",
      "Edición institucional de la Escuela Judicial / Biblioteca del PJ TDF."
    ],
    fullText: `PUBLICACIÓN OFICIAL - PODER JUDICIAL DE TIERRA DEL FUEGO

TÍTULO: La inconstitucionalidad del solve et repete en la ley provincial 90 (policía del trabajo)
AUTORA: Yamina Pallotto.
PUBLICACIÓN: Ushuaia : Poder Judicial de Tierra del Fuego, 2017.
COLECCIÓN: Doctrina y Ensayos del Poder Judicial Austral.

INTRODUCCIÓN Y SÍNTESIS DE LA DOCTRINA:
La autora somete a riguroso escrutinio la exigencia legal contenida en la Ley Provincial N° 90 que condiciona la revisión judicial de las sanciones impuestas por la autoridad administrativa laboral al previo pago de la multa.

CONCLUSIONES PRINCIPALES:
1. El principio solve et repete, concebido como prerrogativa fiscal del siglo XIX, resulta anacrónico frente a la constitucionalización del derecho laboral y las directivas del Sistema Interamericano de Derechos Humanos.
2. El Superior Tribunal de Justicia de Tierra del Fuego ha ido consolidando un criterio aperturista en orden a habilitar la instancia judicial cuando se demuestre imposibilidad de pago o afectación del giro comercial.
3. Propuesta de reforma legislativa para armonizar el procedimiento administrativo sancionador con el debido proceso adjetivo.`
  },
  {
    id: "koha-biblio-2408",
    title: "La legitimación en las acciones reales bajo el Código Civil y Comercial",
    category: "biblioteca_doctrina",
    categoryLabel: "Doctrina / Ensayo",
    number: "Koha #2408",
    date: "2018",
    organism: "Biblioteca Poder Judicial Norte (Río Grande)",
    author: "Rosana I. Aguilar",
    publisher: "Santa Fe : Rubinzal-Culzoni, 2018",
    callNumber: "347.23 AGU",
    branch: "Sede Norte (Río Grande)",
    kohaBiblionumber: "2408",
    subjects: ["DERECHOS REALES", "ACCION REIVINDICATORIA", "LEGITIMACION ACTIVA", "POSESION"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=2408",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Tratamiento analítico de la legitimación activa y pasiva en las acciones reivindicatoria, confesoria, negatoria y de deslinde. Especial atención a los conflictos posesorios sobre inmuebles y servidumbres de paso en regiones australes.",
    keyPoints: [
      "Prueba de la titularidad registral y cotejo de títulos dominiales.",
      "Acción posesoria vs. acción real en la práctica de los juzgados de primera instancia.",
      "Disponible en la Biblioteca del Poder Judicial Norte (Río Grande)."
    ],
    fullText: `OBRA CATALOGADA EN BIBLIOTECA DEL PODER JUDICIAL DE TIERRA DEL FUEGO

TÍTULO: La legitimación en las acciones reales
AUTORA: Aguilar, Rosana I.
PUBLICACIÓN: Santa Fe : Rubinzal-Culzoni, 2018.
SIGNATURA TOPOGRÁFICA: 347.23 AGU
UBICACIÓN FÍSICA: Biblioteca Poder Judicial Norte - Río Grande.

RESUMEN DOCTRINARIO:
Un análisis práctico sobre las complejidades probatorias que enfrentan los titulares registrales para acreditar la legitimación activa frente a ocupaciones clandestinas o interversión de títulos posesorios.`
  },

  // 3. Publicaciones Periódicas / Revistas Jurídicas (Koha PP)
  {
    id: "koha-biblio-2404",
    title: "Revista de derecho privado y comunitario (Colección Completa)",
    category: "biblioteca_revistas",
    categoryLabel: "Revista Jurídica",
    number: "Koha #2404",
    date: "1992-",
    organism: "Biblioteca Poder Judicial Norte (Río Grande)",
    author: "Héctor Alegría, Jorge Mosset Iturraspe (Directores)",
    publisher: "Santa Fe : Rubinzal-Culzoni, 1992-",
    callNumber: "347.1 (05) REV",
    branch: "Sede Norte (Río Grande)",
    kohaBiblionumber: "2404",
    subjects: ["DERECHO PRIVADO", "CONTRATOS", "DERECHO DEL CONSUMIDOR", "RESPONSABILIDAD CIVIL"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=2404",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Publicación seriada referente del derecho patrimonial argentino. Contiene ensayos monográficos temáticos (daños en entornos digitales, cláusulas abusivas, fideicomisos) y recopilación comentada de jurisprudencia de las cortes provinciales y CSJN.",
    keyPoints: [
      "Colección hemerográfica física preservada en Sede Río Grande.",
      "Monografías sobre unificación civil y comercial y responsabilidad médica.",
      "Índices analíticos actualizados por autores y materias."
    ],
    fullText: `COLECCIÓN HEMEROGRÁFICA - BIBLIOTECA PODER JUDICIAL TDF

TÍTULO: Revista de derecho privado y comunitario
DIRECTORES: Héctor Alegría y Jorge Mosset Iturraspe.
EDITORIAL: Santa Fe : Rubinzal-Culzoni, 1992-.
PERIODICIDAD: Cuatrimestral.
SIGNATURA TOPOGRÁFICA: 347.1 (05) REV
UBICACIÓN FÍSICA: Biblioteca Poder Judicial Norte (Río Grande) y Sede Ushuaia.

TOMOS DESTACADOS EN ARCHIVO:
- Daños en el transporte marítimo y aéreo.
- Contratación electrónica y defensa del consumidor.
- Régimen de garantías y responsabilidad concursal.`
  },
  {
    id: "koha-biblio-2405",
    title: "Revista de derecho procesal (Colección Trimestral)",
    category: "biblioteca_revistas",
    categoryLabel: "Revista Jurídica",
    number: "Koha #2405",
    date: "1998-",
    organism: "Biblioteca Poder Judicial Sur (Ushuaia)",
    author: "Roland Arazi, Roberto Omar Berizonce, Jorge Walter Peyrano (Directores)",
    publisher: "Santa Fe : Rubinzal-Culzoni, 1998-",
    callNumber: "347.9 (05) REV",
    branch: "Sede Sur (Ushuaia)",
    kohaBiblionumber: "2405",
    subjects: ["DERECHO PROCESAL CIVIL", "CARGAS PROBATORIAS DINAMICAS", "MEDIDAS AUTOSATISFACTIVAS"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=2405",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Publicación académica especializada en derecho procesal constitucional, civil, comercial y penal. Estudia la celeridad judicial, notificación electrónica, medidas cautelares anticipatorias y amparos colectivos.",
    keyPoints: [
      "Aportes dogmáticos de los principales procesalistas de Iberoamérica.",
      "Doctrina sobre oralidad efectiva y digitalización de expedientes judiciales.",
      "Sede física: Biblioteca Central Ushuaia."
    ],
    fullText: `COLECCIÓN HEMEROGRÁFICA - BIBLIOTECA PODER JUDICIAL TDF

TÍTULO: Revista de derecho procesal
DIRECTORES: Roland Arazi, Roberto Omar Berizonce, Enrique M. Falcón, Jorge Walter Peyrano.
EDITORIAL: Santa Fe : Rubinzal-Culzoni, 1998-.
SIGNATURA TOPOGRÁFICA: 347.9 (05) REV
UBICACIÓN FÍSICA: Biblioteca Poder Judicial Sur - Ushuaia.

TEMAS CLAVE TRATADOS:
- Eficacia temporal de las resoluciones cautelares.
- Juicio por jurados y adaptaciones provinciales.
- El rol del juez como director activo del proceso.`
  },

  // 4. Recursos Digitales de Acceso Libre (Koha ARD)
  {
    id: "koha-biblio-2163",
    title: "Abuso sexual contra niños, niñas y adolescentes : Guía para la protección de derechos en el ámbito judicial",
    category: "biblioteca_digital",
    categoryLabel: "Recurso Digital / Guía",
    number: "Koha #2163",
    date: "2016",
    organism: "Acceso Electrónico (AEL) • PJ TDF",
    author: "Fondo de las Naciones Unidas para la Infancia (UNICEF)",
    publisher: "Buenos Aires : UNICEF / Poder Judicial TDF, 2016",
    callNumber: "343.541 UNI",
    branch: "En línea / Acceso Electrónico (AEL)",
    kohaBiblionumber: "2163",
    subjects: ["DERECHOS DEL NIÑO", "CAMARA GESELL", "NO REVICTIMIZACION", "PROTOCOLO INTERINSTITUCIONAL"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=2163",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Manual y protocolo de actuación técnica interinstitucional recomendado por el Poder Judicial de Tierra del Fuego. Fija estándares para la declaración testimonial en Cámara Gesell, asistencia psicológica temprana y garantías de no revictimización.",
    keyPoints: [
      "Protocolo adoptado por juzgados de instrucción y familia de Ushuaia y Río Grande.",
      "Estándares internacionales de prueba testimonial infanto-juvenil.",
      "Recurso digital de descarga y consulta libre en catálogo Koha."
    ],
    fullText: `DOCUMENTO DIGITAL INSTITUCIONAL - RECURSO DE ACCESO LIBRE

TÍTULO: Abuso sexual contra niños, niñas y adolescentes : Una guía para tomar acciones y proteger sus derechos
AUTOR INSTITUCIONAL: UNICEF Argentina y Poder Judicial de Tierra del Fuego.
AÑO DE EDICIÓN: 2016.
SIGNATURA TOPOGRÁFICA: 343.541 UNI
MODALIDAD: Recurso digital de acceso abierto (AEL).

OBJETIVO DE LA GUÍA:
Brindar a magistrados, secretarios judiciales, peritos del Cuerpo Médico Forense y agentes policiales pautas científicas y legales unificadas para el abordaje de denuncias por delitos contra la integridad sexual de menores.

CONTENIDOS PRINCIPALES:
1. Marco normativo: Convención sobre los Derechos del Niño, Ley Nacional 26.061 y normativa provincial.
2. La declaración mediante dispositivo de Cámara Gesell: intervención de psicólogos forenses.
3. Valoración probatoria de la testimonial en coherencia con indicios médicos y periciales.`
  },
  {
    id: "koha-biblio-2164",
    title: "Protocolo de actuación judicial en situaciones de violencia física, psicológica y de género",
    category: "biblioteca_digital",
    categoryLabel: "Recurso Digital / Guía",
    number: "Koha #2164",
    date: "2016",
    organism: "Acceso Electrónico (AEL) • PJ TDF",
    author: "Secretaría de Derechos Humanos & UNICEF",
    publisher: "San José : UNICEF / Ministerio Público, 2016",
    callNumber: "343.541 PRO",
    branch: "En línea / Acceso Electrónico (AEL)",
    kohaBiblionumber: "2164",
    subjects: ["GENERO", "VIOLENCIA DE GENERO", "MEDIDAS CAUTELARES URGENTES", "TUTELA JUDICIAL"],
    sourceUrl: "https://biblioteca.justierradelfuego.gov.ar/cgi-bin/koha/opac-detail.pl?biblionumber=2164",
    sourceType: "biblioteca_pj",
    aiSummary:
      "Protocolo operativo para la adopción inmediata de medidas de protección: exclusión del hogar, restricción perimetral y custodia policial en los distritos judiciales de Tierra del Fuego. Enfoque de género y celeridad procesal.",
    keyPoints: [
      "Circuito de comunicación directa con comisarías de género en Ushuaia, Tolhuin y Río Grande.",
      "Garantía de gratuidad y patrocinio letrado a víctimas en situación de riesgo.",
      "Formato digital completo disponible en el OPAC judicial."
    ],
    fullText: `DOCUMENTO DIGITAL INSTITUCIONAL - RECURSO DE ACCESO LIBRE

TÍTULO: Protocolo de actuación en situaciones de violencia física, psicológica, sexual, acoso y hostigamiento
AUTORES: UNICEF / Equipos Técnicos Multidisciplinarios.
SIGNATURA TOPOGRÁFICA: 343.541 PRO
MODALIDAD: Recurso digital de acceso abierto (AEL).

DIRECTIVAS CENTRALES:
- Recepción de la denuncia con estricta reserva de identidad.
- Plazo máximo de 24 horas para la fijación de medidas de protección cautelar por parte del juez de turno.
- Articulación con los servicios de salud y desarrollo social provincial.`
  },
  // --- Boletines Oficiales descargados desde Google Drive ---
  {
    id: "boletin-drive-5545",
    title: "Boletín Oficial N° 5545 - Ushuaia, Viernes 01 de Marzo de 2024",
    category: "boletin_drive",
    categoryLabel: "B.O. Drive",
    number: "Edición N° 5545",
    date: "01/03/2024",
    organism: "Gobierno de Tierra del Fuego, AeIAS",
    sourceUrl: "https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6",
    sourceType: "boletin_drive",
    aiSummary:
      "Edición oficial completa de 254 páginas descargada e indexada desde Google Drive. Contiene el Decreto N° 281/24 (reestructuración del INFUETUR con nuevas Secretarías de Política Interna y Externa), edictos de licitaciones públicas de obras sanitarias y resoluciones de entes autárquicos.",
    keyPoints: [
      "Decreto N° 281/24: Designación de secretarios en el Instituto Fueguino de Turismo (INFUETUR).",
      "Edictos de compras públicas y contrataciones de servicios provinciales.",
      "Documento completo de 254 páginas archivado e indexado desde Google Drive.",
      "Búsqueda por palabras clave con motor Whoosh habilitada."
    ],
    fullText: `BOLETÍN OFICIAL DE LA PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR
AÑO XXXIII - Ushuaia, Viernes 01 de Marzo de 2024 - N° 5545

"Las Islas Malvinas, Georgias del Sur, Sandwich del Sur, y los espacios marítimos e insulares correspondientes son Argentinos"

DECRETO N° 281/24 (16-02-24)
VISTO: el Decreto Provincial 3186/23; y
CONSIDERANDO:
Que mediante el artículo 25 de la Ley Provincial N° 65, modificado por la Ley Provincial N° 1308, se establece que el Instituto Fueguino de Turismo contará con tres Secretarios, uno de Política Interna, otro de Política Externa y el tercero de Coordinación Estratégica, a propuesta del Presidente del mencionado Instituto.
Por ello: EL GOBERNADOR DE LA PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR DECRETA:
ARTÍCULO 1°.- Desígnanse a los funcionarios que desempeñarán las secretarías ejecutivas en el Instituto Fueguino de Turismo.
ARTÍCULO 2°.- Comuníquese, publíquese en el Boletín Oficial y archívese.

ÍNDICE RESUMIDO DE LA EDICIÓN:
- Decretos del Poder Ejecutivo Provincial (N° 270 a 302).
- Resoluciones del Ministerio de Economía y Obras Públicas.
- Licitaciones de la Dirección Provincial de Obras y Servicios Sanitarios (DPOSS).
- Edictos judiciales y comerciales del Distrito Judicial Sur y Norte.`
  },
  {
    id: "boletin-drive-5546",
    title: "Boletín Oficial N° 5546 - Ushuaia, Lunes 04 de Marzo de 2024",
    category: "boletin_drive",
    categoryLabel: "B.O. Drive",
    number: "Edición N° 5546",
    date: "04/03/2024",
    organism: "Ministerio de Producción y Ambiente • Ministerio de Bienestar",
    sourceUrl: "https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6",
    sourceType: "boletin_drive",
    aiSummary:
      "Edición oficial de 312 páginas procesada con PyMuPDF. Publica resoluciones conjuntas del Ministerio de Producción y Ambiente relativas a ordenamiento de bosques nativos, fiscalización pesquera en el Canal Beagle y convenios de fortalecimiento social.",
    keyPoints: [
      "Ministerio de Producción y Ambiente: Planes de manejo forestal sustentable.",
      "Contrataciones y adquisiciones de equipamiento hospitalario.",
      "Indexado en la base de datos PostgreSQL en la tabla 'boletines_drive'."
    ],
    fullText: `BOLETÍN OFICIAL DE LA PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR
AÑO XXXIII - Ushuaia, Lunes 04 de Marzo de 2024 - N° 5546

SECCIONES OFICIALES:
1. Actos del Poder Ejecutivo:
   - Medidas de fomento productivo y pesca artesanal.
   - Designaciones transitorias de personal en el área de salud pública.
2. Resoluciones de la Agencia de Recaudación Fueguina (AREF):
   - Nuevos regímenes de retención y percepción sobre actividades comerciales.
3. Convenios Interjurisdiccionales con el Estado Nacional y municipios de Tolhuin y Río Grande.`
  },
  {
    id: "boletin-drive-5547",
    title: "Boletín Oficial N° 5547 - Ushuaia, Martes 05 de Marzo de 2024",
    category: "boletin_drive",
    categoryLabel: "B.O. Drive",
    number: "Edición N° 5547",
    date: "05/03/2024",
    organism: "Ministerio de Jefatura de Gabinete • MOSP",
    sourceUrl: "https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6",
    sourceType: "boletin_drive",
    aiSummary:
      "Edición que publica el Decreto N° 303/24 y convocatorias a licitaciones públicas de infraestructura vial y edilicia en Ushuaia y Río Grande. Texto extraído íntegramente y buscable por Whoosh.",
    keyPoints: [
      "Decreto N° 303/24: Aprobación de convenios de asistencia vial invernal.",
      "Licitaciones de la Dirección Provincial de Vialidad sobre Ruta Nacional N° 3.",
      "Edictos sucesorios y de constitución de sociedades anónimas y de responsabilidad limitada."
    ],
    fullText: `BOLETÍN OFICIAL DE LA PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR
AÑO XXXIII - Ushuaia, Martes 05 de Marzo de 2024 - N° 5547

DECRETO N° 303/24 (19-02-24)
VISTO el expediente N° MJG-E-7523-2024 del Ministerio de Jefatura de Gabinete;
CONSIDERANDO:
Que resulta indispensable disponer de los recursos y maquinarias para el despeje de nieve y mantenimiento preventivo de rutas en la temporada invernal 2024.
Por ello: EL GOBERNADOR DE LA PROVINCIA DECRETA:
ARTÍCULO 1°.- Apruébase el plan de contingencia vial austral.
ARTÍCULO 2°.- Comuníquese, publíquese y archívese.`
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryKey>("todos");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentItem | null>(ALL_DOCUMENTS[0]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<"list" | "reader">("list");

  // Dynamic counts for each category
  const documentCounts = React.useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      todos: ALL_DOCUMENTS.length,
      decretos: ALL_DOCUMENTS.filter(d => d.category === "decretos").length,
      resoluciones: ALL_DOCUMENTS.filter(d => d.category === "resoluciones").length,
      leyes: ALL_DOCUMENTS.filter(d => d.category === "leyes").length,
      licitaciones: ALL_DOCUMENTS.filter(d => d.category === "licitaciones").length,
      boletin_drive: ALL_DOCUMENTS.filter(d => d.category === "boletin_drive").length,
      biblioteca: ALL_DOCUMENTS.filter(d => d.sourceType === "biblioteca_pj").length,
      biblioteca_libros: ALL_DOCUMENTS.filter(d => d.category === "biblioteca_libros").length,
      biblioteca_doctrina: ALL_DOCUMENTS.filter(d => d.category === "biblioteca_doctrina").length,
      biblioteca_revistas: ALL_DOCUMENTS.filter(d => d.category === "biblioteca_revistas").length,
      biblioteca_digital: ALL_DOCUMENTS.filter(d => d.category === "biblioteca_digital").length,
    };
    return counts;
  }, []);

  // Filter documents by category and search
  const filteredDocuments = React.useMemo(() => {
    return ALL_DOCUMENTS.filter((doc) => {
      let matchCategory = false;
      if (selectedCategory === "todos") {
        matchCategory = true;
      } else if (selectedCategory === "biblioteca") {
        matchCategory = doc.sourceType === "biblioteca_pj";
      } else {
        matchCategory = doc.category === selectedCategory;
      }

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        doc.title.toLowerCase().includes(q) ||
        doc.organism.toLowerCase().includes(q) ||
        doc.aiSummary.toLowerCase().includes(q) ||
        doc.number.toLowerCase().includes(q) ||
        (doc.author && doc.author.toLowerCase().includes(q)) ||
        (doc.callNumber && doc.callNumber.toLowerCase().includes(q)) ||
        (doc.subjects && doc.subjects.some(s => s.toLowerCase().includes(q)));

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setMobileView("reader");
  };

  const handleSelectCategory = (cat: CategoryKey) => {
    setSelectedCategory(cat);
    // Auto-select first matching document in the newly selected category
    const matchingDocs = ALL_DOCUMENTS.filter(d => {
      if (cat === "todos") return true;
      if (cat === "biblioteca") return d.sourceType === "biblioteca_pj";
      return d.category === cat;
    });
    if (matchingDocs.length > 0) {
      setSelectedDoc(matchingDocs[0]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Mobile Top Header */}
      <MobileHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-1 h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">
        {/* Left Column: Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          documentCounts={documentCounts}
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
