from typing import Dict, Any, Optional
from .config import ScalingThresholds, DEFAULT_SCALING

def determine_scaling_action(
    predicted_resource: float,
    current_metrics: Dict[str, float],
    thresholds: Optional[ScalingThresholds] = None,
    current_capacity: Optional[float] = None
) -> Dict[str, Any]:
    """
    Simulated Auto-Scaling Decision Engine.
    Evaluates forecasted 5-minute resource demand against current resource utilization.
    
    Academic Prototype Note:
    This algorithm generates advisory scaling recommendations for simulation and evaluation.
    It does not issue direct API calls to cloud hypervisors (AWS EC2 / Azure VMSS / GCP MIGs).
    """
    if thresholds is None:
        thresholds = DEFAULT_SCALING

    # Derive current operational baseline (maximum of core bottlenecks: CPU & Memory)
    cpu = float(current_metrics.get("cpu_util_percent", 50.0))
    mem = float(current_metrics.get("mem_util_percent", 50.0))
    
    if current_capacity is not None:
        current_baseline = float(current_capacity)
    else:
        current_baseline = max(cpu, mem)
        
    delta = predicted_resource - current_baseline

    if delta > thresholds.scale_up_delta:
        action = "SCALE_UP"
        status = "HIGH_DEMAND_SLA_RISK"
        confidence = min(99.0, 70.0 + abs(delta) * 1.5)
        rationale = (
            f"Predicted 5-minute requirement of {predicted_resource:.2f}% exceeds current "
            f"load ({current_baseline:.2f}%) by +{delta:.2f}%, surpassing the +{thresholds.scale_up_delta:.1f}% "
            f"scale-up threshold. Proactive provisioning recommended to avoid SLA violation."
        )
    elif delta < thresholds.scale_down_delta:
        action = "SCALE_DOWN"
        status = "EXCESS_CAPACITY_SURPLUS"
        confidence = min(99.0, 65.0 + abs(delta) * 1.2)
        rationale = (
            f"Predicted 5-minute requirement of {predicted_resource:.2f}% indicates a surplus of "
            f"{abs(delta):.2f}% below current capacity ({current_baseline:.2f}%), exceeding the "
            f"{abs(thresholds.scale_down_delta):.1f}% reduction buffer. De-provisioning recommended to eliminate resource wastage."
        )
    else:
        action = "MAINTAIN"
        status = "BALANCED_OPERATIONAL_STATE"
        confidence = 90.0
        rationale = (
            f"Predicted requirement of {predicted_resource:.2f}% is within the stable operational corridor "
            f"({thresholds.scale_down_delta:.1f}% to +{thresholds.scale_up_delta:.1f}%) around current load "
            f"({current_baseline:.2f}%). Maintaining current provisioning."
        )

    return {
        "scaling_action": action,
        "provisioning_status": status,
        "delta": round(delta, 2),
        "current_baseline": round(current_baseline, 2),
        "predicted_resource": round(predicted_resource, 2),
        "confidence_score": round(confidence, 1),
        "rationale": rationale,
        "thresholds_used": {
            "scale_up_delta": thresholds.scale_up_delta,
            "scale_down_delta": thresholds.scale_down_delta,
            "safety_buffer": thresholds.safety_buffer
        }
    }
