import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.linear_model import Ridge, HuberRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
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


class RandomForestRegressionModel:
    """
    Random Forest Regressor (Nonlinear Ensemble Bagging).
    Constructs an ensemble of decision trees trained with symmetric variance reduction (MSE):
    MSE = (1/N) * sum((y_i - y_mean)^2)

    Docstring & Purpose:
    Uses a strictly SYMMETRIC tree-splitting and leaf-aggregation criterion.
    Included in this benchmark to show that adding nonlinear model capacity
    and tree ensembles does not overcome the fundamental limitation of symmetric
    loss: the ensemble centers predictions around the conditional mean, leaving
    frequent under-provisioning intervals.
    """
    def __init__(self, n_estimators: int = 200, max_depth: int = 8, random_state: int = 42):
        self.n_estimators = int(n_estimators)
        self.max_depth = int(max_depth)
        self.random_state = int(random_state)
        self.model = RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.feature_importances: Optional[List[float]] = None
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "RandomForestRegressionModel":
        self.model.fit(X_train, y_train)
        self.feature_importances = [round(float(x), 4) for x in self.model.feature_importances_]
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Random Forest model has not been trained yet.")
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Random Forest Regression (Nonlinear / MSE)"
        self.evaluation_metrics["model_type"] = "random_forest"
        self.evaluation_metrics["loss_type"] = "symmetric"
        self.evaluation_metrics["feature_importances"] = self.feature_importances or []
        return self.evaluation_metrics


class SVRRegressionModel:
    """
    Support Vector Regression with Radial Basis Function (RBF) Kernel.
    Uses standard symmetric epsilon-insensitive loss:
    L_eps(e) = 0 if |e| <= eps, else |e| - eps

    Docstring & Purpose:
    Uses a strictly SYMMETRIC epsilon-tube where deficits and surpluses outside
    the corridor are penalized identically. Included to demonstrate that kernelization
    and margin maximization fail to address the directional cost asymmetry of cloud SLAs.
    """
    def __init__(self, kernel: str = 'rbf', C: float = 1.0, epsilon: float = 0.5):
        self.kernel = kernel
        self.C = float(C)
        self.epsilon = float(epsilon)
        self.model = SVR(kernel=self.kernel, C=self.C, epsilon=self.epsilon)
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "SVRRegressionModel":
        self.model.fit(X_train, y_train)
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("SVR model has not been trained yet.")
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Support Vector Regression (RBF Kernel)"
        self.evaluation_metrics["model_type"] = "svr"
        self.evaluation_metrics["loss_type"] = "symmetric"
        return self.evaluation_metrics
