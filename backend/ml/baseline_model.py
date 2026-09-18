import numpy as np
from typing import Dict, Any, Tuple
from sklearn.linear_model import LinearRegression
from .metrics import compute_all_metrics

class BaselineLinearRegressionModel:
    """
    Baseline Ordinary Least Squares (OLS) Multivariable Linear Regression.
    Uses standard Mean Squared Error (MSE) loss:
    L(y, y_hat) = (1/2N) * sum((y_hat - y)^2)
    Treats under-provisioning and over-provisioning symmetrically.
    """
    def __init__(self):
        self.model = LinearRegression()
        self.weights = None
        self.intercept = None
        self.is_trained = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "BaselineLinearRegressionModel":
        self.model.fit(X_train, y_train)
        self.weights = self.model.coef_.tolist()
        self.intercept = float(self.model.intercept_)
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Baseline model has not been trained yet.")
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Baseline Linear Regression (OLS / MSE)"
        self.evaluation_metrics["model_type"] = "baseline"
        self.evaluation_metrics["weights"] = [round(w, 4) for w in self.weights]
        self.evaluation_metrics["intercept"] = round(self.intercept, 4)
        return self.evaluation_metrics
