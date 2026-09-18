import numpy as np
from typing import Dict, Any
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

def compute_all_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, Any]:
    """
    Computes comprehensive academic performance metrics:
    1. Standard Statistical Metrics: MSE, RMSE, MAE, R-squared
    2. Cloud SLA Metrics: SLA Violation Rate (Under-prediction rate), Under-prediction count
    3. Operational Cost Metrics: Resource Wastage Index (Mean Excess Provisioning), Over-prediction count
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    
    n_samples = len(y_true)
    if n_samples == 0:
        return {}
        
    errors = y_pred - y_true
    
    # Under-prediction: prediction < actual (SLA violation!)
    under_mask = errors < 0
    under_count = int(np.sum(under_mask))
    under_rate = float((under_count / n_samples) * 100.0)
    
    # Over-prediction: prediction >= actual (Resource wastage)
    over_mask = errors >= 0
    over_count = int(np.sum(over_mask))
    over_rate = float((over_count / n_samples) * 100.0)
    
    # Resource Wastage Index: Average magnitude of excess resources allocated
    # Wastage = (1/N) * sum(max(0, y_pred - y_true))
    wastage_index = float(np.mean(np.maximum(0.0, errors)))
    
    # SLA Deficit Severity: Average severity of SLA violations when under-provisioning occurs
    sla_severity = float(np.mean(np.abs(errors[under_mask]))) if under_count > 0 else 0.0
    
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    
    return {
        "mse": round(mse, 4),
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "r2": round(r2, 4),
        "sla_violation_rate": round(under_rate, 2),
        "sla_violation_count": under_count,
        "sla_severity": round(sla_severity, 4),
        "resource_wastage_index": round(wastage_index, 4),
        "over_provisioning_rate": round(over_rate, 2),
        "over_provisioning_count": over_count,
        "total_samples": n_samples,
    }
