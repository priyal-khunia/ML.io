import sqlite3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..ml.config import DB_PATH

_db_initialized = False

def get_connection():
    global _db_initialized
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if not _db_initialized:
        _init_tables(conn)
        _db_initialized = True
    return conn

def _init_tables(conn: sqlite3.Connection):
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        cpu_util_percent REAL NOT NULL,
        mem_util_percent REAL NOT NULL,
        net_in REAL NOT NULL,
        net_out REAL NOT NULL,
        disk_io_percent REAL NOT NULL,
        predicted_resource REAL NOT NULL,
        actual_target REAL,
        scaling_action TEXT NOT NULL,
        provisioning_status TEXT NOT NULL,
        model_type TEXT NOT NULL,
        rationale TEXT
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        model_name TEXT NOT NULL,
        model_type TEXT NOT NULL,
        mse REAL NOT NULL,
        rmse REAL NOT NULL,
        mae REAL NOT NULL,
        r2 REAL NOT NULL,
        sla_violation_rate REAL NOT NULL,
        sla_violation_count INTEGER NOT NULL,
        resource_wastage_index REAL NOT NULL,
        over_provisioning_rate REAL NOT NULL,
        over_provisioning_count INTEGER NOT NULL,
        weights_json TEXT,
        intercept REAL,
        hyperparams_json TEXT
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS training_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        alpha REAL NOT NULL,
        beta REAL NOT NULL,
        gamma REAL NOT NULL,
        learning_rate REAL NOT NULL,
        epochs INTEGER NOT NULL,
        final_loss REAL NOT NULL,
        loss_history_json TEXT NOT NULL,
        metrics_json TEXT NOT NULL
    );
    """)
    conn.commit()

def init_db():
    conn = get_connection()
    _init_tables(conn)
    conn.close()

def log_prediction(
    features: Dict[str, float],
    predicted_resource: float,
    scaling_action: str,
    provisioning_status: str,
    model_type: str = "asymmetric",
    actual_target: Optional[float] = None,
    rationale: str = ""
) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO predictions (
            timestamp, cpu_util_percent, mem_util_percent, net_in, net_out,
            disk_io_percent, predicted_resource, actual_target, scaling_action,
            provisioning_status, model_type, rationale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_str,
        features["cpu_util_percent"],
        features["mem_util_percent"],
        features["net_in"],
        features["net_out"],
        features["disk_io_percent"],
        predicted_resource,
        actual_target,
        scaling_action,
        provisioning_status,
        model_type,
        rationale
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return inserted_id

def get_recent_predictions(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def clear_predictions() -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions")
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted

def save_model_evaluation(metrics: Dict[str, Any], hyperparams: Optional[Dict[str, Any]] = None):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO model_evaluations (
            timestamp, model_name, model_type, mse, rmse, mae, r2,
            sla_violation_rate, sla_violation_count, resource_wastage_index,
            over_provisioning_rate, over_provisioning_count, weights_json,
            intercept, hyperparams_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_str,
        metrics.get("model_name", "Unknown"),
        metrics.get("model_type", "unknown"),
        metrics["mse"],
        metrics["rmse"],
        metrics["mae"],
        metrics["r2"],
        metrics["sla_violation_rate"],
        metrics["sla_violation_count"],
        metrics["resource_wastage_index"],
        metrics["over_provisioning_rate"],
        metrics["over_provisioning_count"],
        json.dumps(metrics.get("weights", [])),
        metrics.get("intercept", 0.0),
        json.dumps(hyperparams or {})
    ))
    conn.commit()
    conn.close()

def save_training_run(
    alpha: float,
    beta: float,
    gamma: float,
    learning_rate: float,
    epochs: int,
    final_loss: float,
    loss_history: List[Dict[str, Any]],
    metrics: Dict[str, Any]
):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO training_runs (
            timestamp, alpha, beta, gamma, learning_rate, epochs,
            final_loss, loss_history_json, metrics_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_str,
        alpha,
        beta,
        gamma,
        learning_rate,
        epochs,
        final_loss,
        json.dumps(loss_history),
        json.dumps(metrics)
    ))
    conn.commit()
    conn.close()

def get_training_history(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM training_runs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        d["loss_history"] = json.loads(d["loss_history_json"])
        d["metrics"] = json.loads(d["metrics_json"])
        del d["loss_history_json"]
        del d["metrics_json"]
        results.append(d)
    return results
