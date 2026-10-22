import fitz
import re
from pathlib import Path

def test_extract_sections(pdf_path: str):
    doc = fitz.open(pdf_path)
    pages_text = []
    # Read up to 25 pages to get a good distribution of sections
    for p in range(min(len(doc), 30)):
        t = doc[p].get_text()
        if t:
            pages_text.append(t)
    
    full_text = "\n\n".join(pages_text)
    
    # 1. Decretos
    decretos_matches = re.findall(r'(?:DECRETO|DTO\.?)\s+(?:PROVINCIAL\s+)?N[°ºo\.]*\s*(\d+(?:[/-]\d+)?).*?((?:VISTO|CONSIDERANDO|ART[IÍ]CULO).*?)(?=(?:DECRETO|RESOLUCI[ÓO]N|LEY|LICITACI[ÓO]N|\Z))', full_text, re.DOTALL | re.IGNORECASE)
    print(f"Decretos matches: {len(decretos_matches)}")
    
    # 2. Resoluciones
    resoluciones_matches = re.findall(r'(?:RESOLUCI[ÓO]N|RESOL\.?)\s+(?:MINISTERIAL\s+|GENERAL\s+)?N[°ºo\.]*\s*([A-Za-z0-9/-]+).*?((?:VISTO|CONSIDERANDO|ART[IÍ]CULO|RESUELVE).*?)(?=(?:DECRETO|RESOLUCI[ÓO]N|LEY|LICITACI[ÓO]N|\Z))', full_text, re.DOTALL | re.IGNORECASE)
    print(f"Resoluciones matches: {len(resoluciones_matches)}")
    
    # 3. Edictos Judiciales
    edictos_matches = re.findall(r'((?:EDICTO|JUZGADO|TRIBUNAL|SUCESORIO|MENSURA|SECRETAR[IÍ]A\s+ELECTORAL).*?)(?=(?:EDICTO|JUZGADO|DECRETO|RESOLUCI[ÓO]N|\Z))', full_text, re.DOTALL | re.IGNORECASE)
    print(f"Edictos matches: {len(edictos_matches)}")
    
    # 4. Avisos Comerciales y Sociedades
    comercial_matches = re.findall(r'((?:SOCIEDAD\s+AN[ÓO]NIMA|S\.?A\.?|S\.?R\.?L\.?|ASAMBLEA|CONVOCATORIA\s+A\s+ASAMBLEA|ESTATUTO).*?)(?=(?:SOCIEDAD|ASAMBLEA|DECRETO|RESOLUCI[ÓO]N|\Z))', full_text, re.DOTALL | re.IGNORECASE)
    print(f"Comercial matches: {len(comercial_matches)}")
    
    # 5. Licitaciones
    licitaciones_matches = re.findall(r'((?:LICITACI[ÓO]N\s+P[ÚU]BLICA|LICITACI[ÓO]N\s+PRIVADA|CONCURSO\s+DE\s+PRECIOS|CONTRATACI[ÓO]N\s+DIRECTA).*?)(?=(?:LICITACI[ÓO]N|CONCURSO|DECRETO|RESOLUCI[ÓO]N|\Z))', full_text, re.DOTALL | re.IGNORECASE)
    print(f"Licitaciones matches: {len(licitaciones_matches)}")

if __name__ == '__main__':
    test_extract_sections('data/boletines_drive/2026/10 - Octubre/B.O. 6190.pdf')
