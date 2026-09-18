import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from .metrics import compute_all_metrics

class AsymmetricCostRegressionModel:
    """
    Explicit Implementation of Custom Asymmetric Cost-Weighted Multivariable Regression
    optimized via Custom Gradient Descent.

    Mathematical Formulation:
    -------------------------
    Error: e_i = y_pred_i - y_true_i

    Cost function:
    - Under-prediction (y_pred < y_true, e_i < 0):
      L(e_i) = alpha * (exp(beta * |e_i|) - 1) = alpha * (exp(beta * (y_true_i - y_pred_i)) - 1)
      Applies an exponentially accelerating penalty to prevent SLA violations.
      
    - Over-prediction (y_pred >= y_true, e_i >= 0):
      L(e_i) = gamma * |e_i| = gamma * (y_pred_i - y_true_i)
      Applies a linear cost corresponding to marginal cloud resource over-allocation.

    Analytical Gradients:
    dL/d(y_pred_i) = -alpha * beta * exp(beta * (y_true_i - y_pred_i))  if y_pred_i < y_true_i
                   = gamma                                             if y_pred_i >= y_true_i
    
    dJ/dw = (1/N) * X^T * [dL/d(y_pred)]
    dJ/db = (1/N) * sum(dL/d(y_pred))
    """
    def __init__(
        self,
        alpha: float = 1.0,
        beta: float = 1.2,
        gamma: float = 0.5,
        learning_rate: float = 0.005,
        epochs: int = 400,
        clip_exp: float = 8.0
    ):
        self.alpha = float(alpha)
        self.beta = float(beta)
        self.gamma = float(gamma)
        self.learning_rate = float(learning_rate)
        self.epochs = int(epochs)
        self.clip_exp = float(clip_exp)

        self.weights: Optional[np.ndarray] = None
        self.bias: float = 0.0
        self.loss_history: List[Dict[str, Any]] = []
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def compute_loss_and_gradients(
        self, X: np.ndarray, y: np.ndarray, w: np.ndarray, b: float
    ) -> Tuple[float, np.ndarray, float]:
        """
        Computes the asymmetric loss and analytical gradients w.r.t weights w and bias b.
        """
        n_samples = len(y)
        y_pred = np.dot(X, w) + b
        error = y_pred - y  # e = y_pred - y

        under_pred_mask = error < 0
        
        # Loss calculation
        deficit = np.clip(self.beta * (-error), None, self.clip_exp)
        loss_under = self.alpha * (np.exp(deficit) - 1.0)
        loss_over = self.gamma * error
        
        total_loss_per_sample = np.where(under_pred_mask, loss_under, loss_over)
        mean_loss = float(np.mean(total_loss_per_sample))

        # Gradient of loss w.r.t y_pred
        grad_y_pred = np.where(
            under_pred_mask,
            -self.alpha * self.beta * np.exp(deficit),
            self.gamma
        )

        # Batch gradients
        grad_w = np.dot(X.T, grad_y_pred) / n_samples
        grad_b = float(np.mean(grad_y_pred))

        return mean_loss, grad_w, grad_b

    def fit(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        initial_w: Optional[np.ndarray] = None,
        initial_b: Optional[float] = None
    ) -> "AsymmetricCostRegressionModel":
        n_samples, n_features = X_train.shape

        # Initialize weights
        if initial_w is not None and initial_b is not None:
            self.weights = np.copy(initial_w)
            self.bias = float(initial_b)
        else:
            self.weights = np.zeros(n_features, dtype=float)
            self.bias = float(np.mean(y_train))

        self.loss_history = []

        # Gradient Descent loop
        for epoch in range(1, self.epochs + 1):
            loss, grad_w, grad_b = self.compute_loss_and_gradients(
                X_train, y_train, self.weights, self.bias
            )
            
            # Record loss history for dashboard visualization
            if epoch == 1 or epoch % 5 == 0 or epoch == self.epochs:
                self.loss_history.append({
                    "epoch": epoch,
                    "loss": round(loss, 4),
                    "bias": round(float(self.bias), 4),
                    "max_weight_grad": round(float(np.max(np.abs(grad_w))), 4)
                })

            # Parameter updates
            self.weights -= self.learning_rate * grad_w
            self.bias -= self.learning_rate * grad_b

        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained or self.weights is None:
            raise RuntimeError("Asymmetric model has not been trained yet.")
        return np.dot(X, self.weights) + self.bias

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        y_pred = self.predict(X_test)
        self.evaluation_metrics = compute_all_metrics(y_test, y_pred)
        self.evaluation_metrics["model_name"] = "Custom Asymmetric Cost-Weighted Regression"
        self.evaluation_metrics["model_type"] = "asymmetric"
        self.evaluation_metrics["alpha"] = self.alpha
        self.evaluation_metrics["beta"] = self.beta
        self.evaluation_metrics["gamma"] = self.gamma
        self.evaluation_metrics["learning_rate"] = self.learning_rate
        self.evaluation_metrics["epochs"] = self.epochs
        self.evaluation_metrics["weights"] = [round(float(w), 4) for w in self.weights]
        self.evaluation_metrics["intercept"] = round(float(self.bias), 4)
        return self.evaluation_metrics
