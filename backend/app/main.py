"""
API REST Oficial de Boletines Oficiales de Tierra del Fuego, AeIAS.
Proporciona endpoints de búsqueda, filtrado por año (2024, 2025, 2026), mes,
número de edición, sumarios analíticos y sincronización en tiempo real.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.app.services.ingest.sync_boletines import BoletinesDatabaseService

app = FastAPI(
    title="Boletín Oficial Tierra del Fuego - API",
    description="Servicio de consulta y búsqueda de Boletines Oficiales del Gobierno de Tierra del Fuego (2024-2026)",
    version="1.0.0"
)

# Habilitar CORS para integración con Frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_service = BoletinesDatabaseService("data/lexassist.db")


class SyncResponse(BaseModel):
    status: str
    message: str
    total: Optional[int] = None
    years: Optional[Dict[str, int]] = None


@app.get("/api/health")
def health_check():
    """Verifica estado de la base de datos y estadísticas generales."""
    try:
        conn = db_service.get_connection()
        total = conn.execute("SELECT count(*) FROM boletines_oficiales_tdf").fetchone()[0]
        years_stat = conn.execute("""
            SELECT year, count(*) as count 
            FROM boletines_oficiales_tdf 
            GROUP BY year 
            ORDER BY year DESC
        """).fetchall()
        conn.close()
        return {
            "status": "healthy",
            "jurisdiction": "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
            "total_editions": total,
            "years_covered": [dict(r) for r in years_stat]
        }
    except Exception as e:
        return {"status": "degraded", "error": str(e)}


@app.get("/api/boletines")
def list_boletines(
    year: Optional[int] = Query(None, description="Año: 2024, 2025, 2026"),
    month: Optional[int] = Query(None, description="Mes (1-12)"),
    edition_number: Optional[str] = Query(None, description="Número de edición (ej. 6173)"),
    topic: Optional[str] = Query(None, description="Eje temático"),
    q: Optional[str] = Query(None, description="Búsqueda libre en sumarios y textos"),
    is_separata: Optional[bool] = Query(None, description="Filtrar por separatas"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Consulta y busca boletines oficiales con filtros combinados."""
    conn = db_service.get_connection()
    cur = conn.cursor()

    conditions = []
    params: List[Any] = []

    if year:
        conditions.append("year = ?")
        params.append(year)
    if month:
        conditions.append("month = ?")
        params.append(month)
    if edition_number:
        conditions.append("edition_number LIKE ?")
        params.append(f"%{edition_number}%")
    if topic:
        conditions.append("topics LIKE ?")
        params.append(f"%{topic}%")
    if is_separata is not None:
        conditions.append("is_separata = ?")
        params.append(1 if is_separata else 0)

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    if q and q.strip():
        clean_q = "".join(c for c in q if c.isalnum() or c in " áéíóúÁÉÍÓÚñÑ").strip()
        if clean_q:
            query_sql = f"""
            SELECT b.* FROM boletines_oficiales_tdf b
            JOIN boletines_fts f ON b.id = f.id
            WHERE boletines_fts MATCH ?
            {"AND " + " AND ".join(conditions) if conditions else ""}
            ORDER BY b.year DESC, b.month DESC, b.edition_number DESC
            LIMIT ? OFFSET ?
            """
            rows = cur.execute(query_sql, [f"{clean_q}*"] + params + [limit, offset]).fetchall()
            conn.close()
            items = []
            for r in rows:
                d = dict(r)
                d["topics"] = json.loads(d["topics"]) if d.get("topics") else []
                d["sumario_acts"] = json.loads(d["sumario_acts"]) if d.get("sumario_acts") else []
                items.append(d)
            return {"total": len(items), "items": items}

    # Búsqueda estructurada normal
    total_sql = f"SELECT count(*) FROM boletines_oficiales_tdf {where_clause}"
    total_count = cur.execute(total_sql, params).fetchone()[0]

    select_sql = f"""
    SELECT * FROM boletines_oficiales_tdf
    {where_clause}
    ORDER BY year DESC, month DESC, edition_date DESC, edition_number DESC
    LIMIT ? OFFSET ?
    """
    rows = cur.execute(select_sql, params + [limit, offset]).fetchall()
    conn.close()

    items = []
    for r in rows:
        d = dict(r)
        d["topics"] = json.loads(d["topics"]) if d.get("topics") else []
        d["sumario_acts"] = json.loads(d["sumario_acts"]) if d.get("sumario_acts") else []
        items.append(d)

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": items
    }


@app.get("/api/boletines/{doc_id}")
def get_boletin(doc_id: str):
    """Devuelve el sumario completo y todos los datos de un boletín oficial."""
    conn = db_service.get_connection()
    row = conn.execute("SELECT * FROM boletines_oficiales_tdf WHERE id = ?", [doc_id]).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Boletín oficial no encontrado")

    d = dict(row)
    d["topics"] = json.loads(d["topics"]) if d.get("topics") else []
    d["organismos"] = json.loads(d["organismos"]) if d.get("organismos") else []
    d["sumario_acts"] = json.loads(d["sumario_acts"]) if d.get("sumario_acts") else []
    return d


@app.get("/api/stats")
def get_stats():
    """Estadísticas detalladas de la colección de boletines."""
    conn = db_service.get_connection()
    total = conn.execute("SELECT count(*) FROM boletines_oficiales_tdf").fetchone()[0]
    by_year = conn.execute("""
        SELECT year, count(*) as count 
        FROM boletines_oficiales_tdf 
        GROUP BY year 
        ORDER BY year DESC
    """).fetchall()
    by_month = conn.execute("""
        SELECT year, month, month_name, count(*) as count 
        FROM boletines_oficiales_tdf 
        GROUP BY year, month 
        ORDER BY year DESC, month DESC
    """).fetchall()
    conn.close()

    return {
        "total_editions": total,
        "by_year": [dict(r) for r in by_year],
        "by_month": [dict(r) for r in by_month]
    }


@app.post("/api/sync", response_model=SyncResponse)
def trigger_sync(background_tasks: BackgroundTasks):
    """Dispara la sincronización y actualización de la base de datos."""
    try:
        res = db_service.sync_all_boletines()
        return SyncResponse(
            status="success",
            message=f"Sincronizados {res['total']} boletines de Tierra del Fuego.",
            total=res["total"],
            years=res["years"]
        )
    except Exception as e:
        return SyncResponse(status="error", message=str(e))
