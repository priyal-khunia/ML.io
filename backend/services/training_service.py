import numpy as np
from typing import Dict, Any, Optional, List
from ..ml.preprocessing import DataProcessor
from ..ml.baseline_model import BaselineLinearRegressionModel
from ..ml.asymmetric_model import AsymmetricCostRegressionModel
from ..ml.config import AsymmetricHyperparameters, DEFAULT_CONFIG
from ..database.db import save_model_evaluation, save_training_run

class ModelManager:
    _instance = None

    def __init__(self):
        self.processor = DataProcessor()
        self.baseline_model = BaselineLinearRegressionModel()
        self.asymmetric_model = AsymmetricCostRegressionModel(
            alpha=DEFAULT_CONFIG.alpha,
            beta=DEFAULT_CONFIG.beta,
            gamma=DEFAULT_CONFIG.gamma,
            learning_rate=DEFAULT_CONFIG.learning_rate,
            epochs=DEFAULT_CONFIG.epochs,
            clip_exp=DEFAULT_CONFIG.clip_exp
        )
        self.is_initialized = False
        self.baseline_metrics: Dict[str, Any] = {}
        self.asymmetric_metrics: Dict[str, Any] = {}
        self.latest_loss_history: List[Dict[str, Any]] = []
        self.X_train_scaled = None
        self.X_test_scaled = None
        self.y_train = None
        self.y_test = None

    @classmethod
    def get_instance(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

    def initialize_and_train_all(self, hyperparams: Optional[AsymmetricHyperparameters] = None) -> Dict[str, Any]:
        """
        Loads dataset, performs chronological split, scales features,
        fits baseline regression, and trains the custom asymmetric regression model via gradient descent.
        """
        params = hyperparams or DEFAULT_CONFIG
        
        # 1. Prepare data
        self.X_train_scaled, self.X_test_scaled, self.y_train, self.y_test = self.processor.prepare_train_test_split()

        # 2. Fit Baseline Linear Regression
        self.baseline_model.fit(self.X_train_scaled, self.y_train)
        self.baseline_metrics = self.baseline_model.evaluate(self.X_test_scaled, self.y_test)
        save_model_evaluation(self.baseline_metrics)

        # 3. Train Custom Asymmetric Model via Gradient Descent
        # We warm-start with baseline weights for faster, stable convergence
        self.asymmetric_model = AsymmetricCostRegressionModel(
            alpha=params.alpha,
            beta=params.beta,
            gamma=params.gamma,
            learning_rate=params.learning_rate,
            epochs=params.epochs,
            clip_exp=params.clip_exp
        )
        self.asymmetric_model.fit(
            self.X_train_scaled,
            self.y_train,
            initial_w=np.copy(self.baseline_model.weights),
            initial_b=self.baseline_model.intercept
        )
        self.asymmetric_metrics = self.asymmetric_model.evaluate(self.X_test_scaled, self.y_test)
        self.latest_loss_history = self.asymmetric_model.loss_history
        
        save_model_evaluation(self.asymmetric_metrics, params.model_dump())
        final_loss = self.latest_loss_history[-1]["loss"] if self.latest_loss_history else 0.0
        save_training_run(
            alpha=params.alpha,
            beta=params.beta,
            gamma=params.gamma,
            learning_rate=params.learning_rate,
            epochs=params.epochs,
            final_loss=final_loss,
            loss_history=self.latest_loss_history,
            metrics=self.asymmetric_metrics
        )

        self.is_initialized = True
        return self.get_comparison_summary()

    def get_comparison_summary(self) -> Dict[str, Any]:
        if not self.is_initialized:
            self.initialize_and_train_all()

        base = self.baseline_metrics
        asym = self.asymmetric_metrics

        sla_reduction = round(base["sla_violation_rate"] - asym["sla_violation_rate"], 2)
        sla_reduction_pct = round(((base["sla_violation_rate"] - asym["sla_violation_rate"]) / max(0.001, base["sla_violation_rate"])) * 100.0, 1)

        return {
            "baseline": base,
            "asymmetric": asym,
            "comparison_summary": {
                "sla_violation_reduction_points": sla_reduction,
                "sla_violation_reduction_percent": sla_reduction_pct,
                "wastage_delta": round(asym["resource_wastage_index"] - base["resource_wastage_index"], 4),
                "mse_delta": round(asym["mse"] - base["mse"], 4),
                "conclusion": (
                    f"The Asymmetric Cost-Weighted model reduced SLA violations by {sla_reduction_pct}% "
                    f"({base['sla_violation_rate']}% -> {asym['sla_violation_rate']}%) with an operational "
                    f"resource trade-off of +{round(asym['resource_wastage_index'] - base['resource_wastage_index'], 3)} wastage index."
                )
            },
            "training_loss_history": self.latest_loss_history,
            "feature_names": self.processor.load_data().columns[:5].tolist()
        }
