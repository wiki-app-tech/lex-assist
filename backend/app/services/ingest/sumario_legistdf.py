"""
Servicio de Ingesta y Procesamiento del Sumario Completo de LegisTDF
Poder Legislativo de la Provincia de Tierra del Fuego, Antártida e Islas del Atlántico Sur.
Fuente: https://buscar.legistdf.gob.ar/sumario_completo
"""

import os
import re
import json
import logging
import urllib.request
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

logger = logging.getLogger("lexassist.ingest.legistdf")

DEFAULT_SUMARIO_URL = "https://buscar.legistdf.gob.ar/sumario_completo"
DEFAULT_PDF_URL = "https://legistdf.gob.ar/lp/sumarios/PUBLICO/SUMARIO%20PENDIENTE.pdf"


class LegisTDFIngestService:
    """
    Servicio de extracción y estructuración del Sumario de Asuntos Pendientes
    de la Legislatura de Tierra del Fuego.
    """

    def __init__(self, sumario_url: str = DEFAULT_SUMARIO_URL):
        self.sumario_url = sumario_url

    def fetch_sumario_html(self) -> str:
        """Descarga el HTML del sumario oficial preservando la codificación UTF-8."""
        headers = {
            "User-Agent": "lex-assist-bot/0.1 (+https://github.com/wiki-app-tech/lex-assist)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        }
        req = urllib.request.Request(self.sumario_url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw_bytes = resp.read()
            # La página puede venir en UTF-8
            return raw_bytes.decode("utf-8", errors="replace")

    def parse_sumario(self, html: str) -> Dict[str, Any]:
        """
        Parsea las filas del sumario parlamentario extrayendo número de asunto,
        expediente oficial, bloque o iniciador, tipo de norma y descripción completa.
        """
        soup = BeautifulSoup(html, "html.parser")
        
        # Fecha de carga
        fecha = "28/09/2026"
        date_el = soup.find(string=re.compile(r"Cargado el \d{2}/\d{2}/\d{4}"))
        if date_el:
            m = re.search(r"(\d{2}/\d{2}/\d{4})", str(date_el))
            if m:
                fecha = m.group(1)

        rows = soup.find_all("tr")
        asuntos: List[Dict[str, Any]] = []

        for r in rows:
            td_n = r.find("td", class_="n")
            td_d = r.find("td", class_="d")
            if not td_n or not td_d:
                continue

            a_n = td_n.find("a")
            num = td_n.get_text(strip=True)
            link = a_n["href"] if a_n and a_n.has_attr("href") else ""
            desc = td_d.get_text(strip=True)

            # Normalizar caracteres
            num = num.replace("\xa0", " ").replace("\xad", "").strip()
            desc = desc.replace("\xa0", " ").replace("\xad", "").strip()

            # Clasificar bloque o iniciador
            upper_desc = desc.upper()
            bloque = "Otros"
            if "BLOQUE SOMOS FUEGUINOS" in upper_desc:
                bloque = "Somos Fueguinos"
            elif "BLOQUE PROVINCIA GRANDE" in upper_desc:
                bloque = "Provincia Grande"
            elif "BLOQUE PARTIDO JUSTICIALISTA" in upper_desc or "BLOQUE PJ" in upper_desc:
                bloque = "Partido Justicialista"
            elif "BLOQUE FORJA" in upper_desc or "BLOQUE PARTIDO FORJA" in upper_desc:
                bloque = "FORJA"
            elif "BLOQUE M.P.F." in upper_desc or "BLOQUE MPF" in upper_desc:
                bloque = "M.P.F."
            elif "BLOQUE LA LIBERTAD AVANZA" in upper_desc:
                bloque = "La Libertad Avanza"
            elif desc.startswith("P.E.P."):
                bloque = "P.E.P. (Ejecutivo Provincial)"
            elif desc.startswith("PRESIDENCIA"):
                bloque = "Presidencia Legislatura"
            elif "DICTAMEN" in upper_desc:
                bloque = "Dictámenes de Comisión"
            elif "IPV" in upper_desc or "I.P.V." in upper_desc:
                bloque = "I.P.V. y H."

            # Tipo de instrumento
            tipo = "Asunto"
            if "PROYECTO DE LEY" in upper_desc or "PROY. DE LEY" in upper_desc:
                tipo = "Proyecto de Ley"
            elif "PROYECTO DE RESOLUCIÓN" in upper_desc or "PROY. DE RESOL." in upper_desc or "RESOLUCIÓN DE PRESIDENCIA" in upper_desc:
                tipo = "Proyecto de Resolución"
            elif "PROYECTO DE DECLARACIÓN" in upper_desc or "PROY. DE DECLARACIÓN" in upper_desc:
                tipo = "Proyecto de Declaración"
            elif "DICTAMEN" in upper_desc:
                tipo = "Dictamen"
            elif "DECRETO" in upper_desc:
                tipo = "Decreto / Convenio"
            elif "NOTA" in upper_desc:
                tipo = "Nota Oficial"

            # Identificador único
            clean_num = re.sub(r"[^0-9a-zA-Z]+", "-", num).strip("-").lower()
            asunto_id = f"legistdf-{clean_num}"

            asuntos.append({
                "id": asunto_id,
                "numero": num,
                "descripcion": desc,
                "link": link,
                "origen": bloque,
                "tipo": tipo,
            })

        return {
            "titulo": "Sumario de Asuntos Pendientes para Próxima Sesión",
            "subtitulo": "Provincia de Tierra del Fuego, Antártida e Islas del Atlántico Sur · Poder Legislativo",
            "organismo": "Poder Legislativo de Tierra del Fuego (LegisTDF)",
            "sitioOficial": self.sumario_url,
            "pdfOriginal": DEFAULT_PDF_URL,
            "fechaActualizacion": fecha,
            "totalAsuntos": len(asuntos),
            "asuntos": asuntos,
        }

    def sync_to_file(self, target_json_path: str) -> Dict[str, Any]:
        """Ejecuta la descarga, parseo y guardado en JSON."""
        html = self.fetch_sumario_html()
        data = self.parse_sumario(html)
        os.makedirs(os.path.dirname(target_json_path), exist_ok=True)
        with open(target_json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"Guardados {data['totalAsuntos']} asuntos en {target_json_path}")
        return data


if __name__ == "__main__":
    service = LegisTDFIngestService()
    data = service.sync_to_file("frontend/data/sumario_legistdf.json")
    print(f"Sincronizados con éxito {data['totalAsuntos']} asuntos de LegisTDF.")
