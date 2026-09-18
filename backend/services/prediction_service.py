from typing import Dict, Any, Optional
from .training_service import ModelManager
from ..ml.scaling import determine_scaling_action
from ..database.db import log_prediction

def predict_cloud_resource(
    features: Dict[str, float],
    current_capacity: Optional[float] = None
) -> Dict[str, Any]:
    manager = ModelManager.get_instance()
    if not manager.is_initialized:
        manager.initialize_and_train_all()

    # Scale input using training set parameters
    x_scaled = manager.processor.transform_input(features)

    # Primary prediction: Asymmetric model
    pred_asym = float(manager.asymmetric_model.predict(x_scaled)[0])
    
    # Baseline comparison prediction
    pred_base = float(manager.baseline_model.predict(x_scaled)[0])

    # Auto-scaling recommendation
    scaling_result = determine_scaling_action(
        predicted_resource=pred_asym,
        current_metrics=features,
        current_capacity=current_capacity
    )

    # Log to SQLite
    prediction_id = log_prediction(
        features=features,
        predicted_resource=round(pred_asym, 2),
        scaling_action=scaling_result["scaling_action"],
        provisioning_status=scaling_result["provisioning_status"],
        model_type="asymmetric",
        rationale=scaling_result["rationale"]
    )

    return {
        "prediction_id": prediction_id,
        "predicted_resource": round(pred_asym, 2),
        "scaling_action": scaling_result["scaling_action"],
        "provisioning_status": scaling_result["provisioning_status"],
        "model": "asymmetric",
        "baseline_predicted_resource": round(pred_base, 2),
        "asymmetric_safety_headroom": round(pred_asym - pred_base, 2),
        "confidence_score": scaling_result["confidence_score"],
        "rationale": scaling_result["rationale"],
        "inputs": features,
    }
