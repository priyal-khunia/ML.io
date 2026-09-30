import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.linear_model import Ridge, HuberRegressor, QuantileRegressor
from .metrics import compute_all_metrics

class RidgeRegressionModel:
    """
    Ridge Regression (L2 Regularized Ordinary Least Squares).
    Uses symmetric Mean Squared Error (MSE) loss with an L2 weight penalty:
    L(w, b) = (1/2N) * sum((y_hat - y)^2) + (alpha/2) * ||w||_2^2

    Docstring & Purpose:
    Uses a strictly SYMMETRIC loss function. Included in this benchmark to
    demonstrate that L2 weight shrinkage/regularization alone cannot resolve
    asymmetric cloud provisioning risk or protect SLAs against under-provisioning.
    """
    def __init__(self, alpha: float = 1.0):
        self.alpha = float(alpha)
        self.model = Ridge(alpha=self.alpha)
        self.weights: Optional[List[float]] = None
        self.intercept: Optional[float] = None
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "RidgeRegressionModel":
        self.model.fit(X_train, y_train)
        self.weights = self.model.coef_.tolist()
        self.intercept = float(self.model.intercept_)
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Ridge model has not been trained yet.")
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Ridge Regression (L2 / MSE)"
        self.evaluation_metrics["model_type"] = "ridge"
        self.evaluation_metrics["loss_type"] = "symmetric"
        if self.weights is not None:
            self.evaluation_metrics["weights"] = [round(float(w), 4) for w in self.weights]
        if self.intercept is not None:
            self.evaluation_metrics["intercept"] = round(float(self.intercept), 4)
        return self.evaluation_metrics


class HuberRegressionModel:
    """
    Huber Regressor (Robust Linear Regression).
    Uses a hybrid symmetric loss that is quadratic for small errors and linear for large outliers:
    L_delta(e) = 0.5 * e^2 if |e| <= delta, else delta * (|e| - 0.5 * delta)

    Docstring & Purpose:
    Uses a strictly SYMMETRIC loss function with respect to error sign (e_i vs -e_i).
    Included in this benchmark to demonstrate that robustness against outliers does
    NOT mitigate asymmetric SLA violation penalties, because under-prediction and
    over-prediction are still penalized symmetrically.
    """
    def __init__(self, epsilon: float = 1.35, max_iter: int = 500):
        self.epsilon = float(epsilon)
        self.max_iter = int(max_iter)
        self.model = HuberRegressor(epsilon=self.epsilon, max_iter=self.max_iter)
        self.weights: Optional[List[float]] = None
        self.intercept: Optional[float] = None
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "HuberRegressionModel":
        self.model.fit(X_train, y_train)
        self.weights = self.model.coef_.tolist()
        self.intercept = float(self.model.intercept_)
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Huber model has not been trained yet.")
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Huber Regression (Robust / Symmetric)"
        self.evaluation_metrics["model_type"] = "huber"
        self.evaluation_metrics["loss_type"] = "symmetric"
        if self.weights is not None:
            self.evaluation_metrics["weights"] = [round(float(w), 4) for w in self.weights]
        if self.intercept is not None:
            self.evaluation_metrics["intercept"] = round(float(self.intercept), 4)
        return self.evaluation_metrics


class QuantileRegressionModel:
    """
    Quantile Regression with Asymmetric Pinball (Check) Loss (tau = 0.85).
    L_tau(y, y_hat) = max(tau * (y - y_hat), (tau - 1) * (y - y_hat))

    Docstring & Purpose:
    Standard academic ASYMMETRIC linear loss benchmark (Koenker & Bassett 1978).
    With tau = 0.85, it penalizes under-prediction ~5.67x heavier than over-prediction.
    Limitation vs Proposed Model:
    Pinball loss has a CONSTANT piecewise gradient (+-tau). It cannot penalize large,
    cascading capacity deficits exponentially harder than minor rounding errors.
    """
    def __init__(self, quantile: float = 0.85, alpha: float = 0.01):
        self.quantile = float(quantile)
        self.alpha = float(alpha)
        self.model = QuantileRegressor(quantile=self.quantile, alpha=self.alpha, solver="highs")
        self.weights: Optional[List[float]] = None
        self.intercept: Optional[float] = None
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "QuantileRegressionModel":
        self.model.fit(X_train, y_train)
        self.weights = self.model.coef_.tolist()
        self.intercept = float(self.model.intercept_)
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Quantile model has not been trained yet.")
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Quantile Regression (Pinball tau=0.85)"
        self.evaluation_metrics["model_type"] = "quantile"
        self.evaluation_metrics["loss_type"] = "asymmetric"
        if self.weights is not None:
            self.evaluation_metrics["weights"] = [round(float(w), 4) for w in self.weights]
        if self.intercept is not None:
            self.evaluation_metrics["intercept"] = round(float(self.intercept), 4)
        return self.evaluation_metrics


class ExpectileRegressionModel:
    """
    Expectile Regression / Asymmetric Least Squares (p = 0.85).
    L_p(y, y_hat) = |p - I(y < y_hat)| * (y - y_hat)^2

    Docstring & Purpose:
    Standard academic ASYMMETRIC quadratic loss benchmark (Newey & Powell 1987).
    Fitted via Iteratively Reweighted Least Squares (IRLS) in pure NumPy.
    Limitation vs Proposed Model:
    Quadratically penalizes over-provisioning as well, causing severe resource wastage
    and excessive cloud billing costs, unlike our model's controlled linear wastage term.
    """
    def __init__(self, p: float = 0.85, max_iter: int = 30, tol: float = 1e-5):
        self.p = float(p)
        self.max_iter = int(max_iter)
        self.tol = float(tol)
        self.weights: Optional[List[float]] = None
        self.intercept: Optional[float] = None
        self.coef_: Optional[np.ndarray] = None
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "ExpectileRegressionModel":
        n_samples, n_features = X_train.shape
        X_aug = np.hstack([X_train, np.ones((n_samples, 1))])
        
        # Initial estimate with standard OLS
        w_aug = np.linalg.lstsq(X_aug, y_train, rcond=None)[0]
        
        for _ in range(self.max_iter):
            y_hat = X_aug @ w_aug
            residuals = y_train - y_hat
            weights = np.where(residuals >= 0, self.p, 1.0 - self.p)
            W_sqrt = np.sqrt(weights)
            
            X_weighted = X_aug * W_sqrt[:, None]
            y_weighted = y_train * W_sqrt
            w_new = np.linalg.lstsq(X_weighted, y_weighted, rcond=None)[0]
            
            if np.max(np.abs(w_new - w_aug)) < self.tol:
                w_aug = w_new
                break
            w_aug = w_new

        self.coef_ = w_aug[:-1]
        self.intercept = float(w_aug[-1])
        self.weights = self.coef_.tolist()
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained or self.coef_ is None or self.intercept is None:
            raise RuntimeError("Expectile model has not been trained yet.")
        return X @ self.coef_ + self.intercept

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Expectile Regression (Asym L2 p=0.85)"
        self.evaluation_metrics["model_type"] = "expectile"
        self.evaluation_metrics["loss_type"] = "asymmetric"
        if self.weights is not None:
            self.evaluation_metrics["weights"] = [round(float(w), 4) for w in self.weights]
        if self.intercept is not None:
            self.evaluation_metrics["intercept"] = round(float(self.intercept), 4)
        return self.evaluation_metrics
