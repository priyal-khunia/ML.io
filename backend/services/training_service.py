import numpy as np
from typing import Dict, Any, Optional, List
from ..ml.preprocessing import DataProcessor
from ..ml.baseline_model import BaselineLinearRegressionModel
from ..ml.asymmetric_model import AsymmetricCostRegressionModel
from ..ml.comparison_models import (
    RidgeRegressionModel,
    HuberRegressionModel,
    RandomForestRegressionModel,
    SVRRegressionModel,
)
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
        self.ridge_model = RidgeRegressionModel()
        self.huber_model = HuberRegressionModel()
        self.rf_model = RandomForestRegressionModel()
        self.svr_model = SVRRegressionModel()

        self.is_initialized = False
        self.baseline_metrics: Dict[str, Any] = {}
        self.asymmetric_metrics: Dict[str, Any] = {}
        self.comparison_models_metrics: Dict[str, Any] = {}
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
        fits baseline OLS regression, custom asymmetric regression via gradient descent,
        and all 4 comparison models (Ridge, Huber, Random Forest, SVR) on the same train/test split.
        """
        params = hyperparams or DEFAULT_CONFIG
        
        # 1. Prepare data (chronological split, StandardScaler fitted on train only)
        self.X_train_scaled, self.X_test_scaled, self.y_train, self.y_test = self.processor.prepare_train_test_split()

        # 2. Fit Baseline Linear Regression (OLS)
        self.baseline_model.fit(self.X_train_scaled, self.y_train)
        self.baseline_metrics = self.baseline_model.evaluate(self.X_test_scaled, self.y_test)
        self.baseline_metrics["loss_type"] = "symmetric"
        save_model_evaluation(self.baseline_metrics)

        # 3. Train Custom Asymmetric Model via Gradient Descent
        # Warm-start with baseline weights for faster, stable convergence
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
        self.asymmetric_metrics["loss_type"] = "asymmetric"
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

        # 4. Fit and Evaluate 4 Additional Comparison Models on the EXACT same split
        # Model 1: Ridge (L2 / MSE)
        self.ridge_model.fit(self.X_train_scaled, self.y_train)
        ridge_metrics = self.ridge_model.evaluate(self.X_test_scaled, self.y_test)
        save_model_evaluation(ridge_metrics)

        # Model 2: Huber (Robust / Symmetric)
        self.huber_model.fit(self.X_train_scaled, self.y_train)
        huber_metrics = self.huber_model.evaluate(self.X_test_scaled, self.y_test)
        save_model_evaluation(huber_metrics)

        # Model 3: Random Forest (Nonlinear / MSE)
        self.rf_model.fit(self.X_train_scaled, self.y_train)
        rf_metrics = self.rf_model.evaluate(self.X_test_scaled, self.y_test)
        save_model_evaluation(rf_metrics)

        # Model 4: SVR (RBF Kernel)
        self.svr_model.fit(self.X_train_scaled, self.y_train)
        svr_metrics = self.svr_model.evaluate(self.X_test_scaled, self.y_test)
        save_model_evaluation(svr_metrics)

        self.comparison_models_metrics = {
            "ridge": ridge_metrics,
            "huber": huber_metrics,
            "random_forest": rf_metrics,
            "svr": svr_metrics,
        }

        self.is_initialized = True
        return self.get_comparison_summary()

    def get_comparison_summary(self) -> Dict[str, Any]:
        if not self.is_initialized:
            self.initialize_and_train_all()

        base = self.baseline_metrics
        asym = self.asymmetric_metrics
        ridge = self.comparison_models_metrics.get("ridge", {})
        huber = self.comparison_models_metrics.get("huber", {})
        rf = self.comparison_models_metrics.get("random_forest", {})
        svr = self.comparison_models_metrics.get("svr", {})

        all_models = [base, asym, ridge, huber, rf, svr]

        # Calculate Asymmetric Advantage (% SLA violation reduction vs each model)
        asym_sla = asym.get("sla_violation_rate", 0.0)
        for m in all_models:
            if m:
                if m.get("model_type") == "asymmetric":
                    m["loss_type"] = "asymmetric"
                    m["asymmetric_advantage_percent"] = 0.0
                else:
                    m["loss_type"] = "symmetric"
                    m_sla = m.get("sla_violation_rate", 0.0)
                    reduction_pct = round(((m_sla - asym_sla) / max(0.001, m_sla)) * 100.0, 1)
                    m["asymmetric_advantage_percent"] = reduction_pct

        # Rank worst to best by SLA Violation Rate descending
        ranked_models = sorted(
            [m for m in all_models if m],
            key=lambda x: x.get("sla_violation_rate", 0.0),
            reverse=True
        )

        sla_reduction = round(base["sla_violation_rate"] - asym["sla_violation_rate"], 2)
        sla_reduction_pct = round(((base["sla_violation_rate"] - asym["sla_violation_rate"]) / max(0.001, base["sla_violation_rate"])) * 100.0, 1)

        return {
            "baseline": base,
            "asymmetric": asym,
            "ridge": ridge,
            "huber": huber,
            "random_forest": rf,
            "svr": svr,
            "all_models": all_models,
            "ranked_models": ranked_models,
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
