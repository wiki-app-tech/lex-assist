#!/usr/bin/env python3
"""
Script de Actualización Automática y Mantenimiento de la Base de Datos
de Boletines Oficiales del Gobierno de Tierra del Fuego (Años 2024, 2025, 2026).

Uso:
    python scripts/actualizar_boletines.py
"""

import sys
from pathlib import Path

# Agregar raíz al sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from backend.app.services.ingest.sync_boletines import BoletinesDatabaseService

def main():
    print("=" * 70)
    print(" ACTUALIZADOR OFICIAL DE BOLETINES DE TIERRA DEL FUEGO (AeIAS)")
    print(" Años cubiertos: 2024, 2025, 2026 • Almacenamiento por Año, Mes y Edición")
    print("=" * 70)

    try:
        service = BoletinesDatabaseService("data/lexassist.db")
        result = service.sync_all_boletines()
        
        print("\n [OK] Sincronización finalizada correctamente.")
        print(f" -> Total boletines indexados: {result['total']}")
        print(f" -> Ediciones 2026: {result['years'].get(2026, 0)}")
        print(f" -> Ediciones 2025: {result['years'].get(2025, 0)}")
        print(f" -> Ediciones 2024: {result['years'].get(2024, 0)}")
        print(f" -> Boletines con texto de PDF extraído: {result['local_text_count']}")
        print(f" -> Base de datos actualizada: data/lexassist.db")
        print(f" -> Catálogo JSON frontend actualizado: frontend/data/boletines_drive_catalog.json")
        print("=" * 70)
    except Exception as e:
        print(f"\n [ERROR] Ocurrió una falla durante la actualización: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
