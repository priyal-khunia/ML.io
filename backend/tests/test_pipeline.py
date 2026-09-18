import pytest
import numpy as np
import os
from backend.ml.preprocessing import DataProcessor
from backend.ml.baseline_model import BaselineLinearRegressionModel
from backend.ml.asymmetric_model import AsymmetricCostRegressionModel
from backend.ml.metrics import compute_all_metrics
from backend.ml.scaling import determine_scaling_action
from backend.ml.config import DATASET_PATH

def test_dataset_exists_and_loads():
    assert os.path.exists(DATASET_PATH), f"Dataset missing at {DATASET_PATH}"
    processor = DataProcessor()
    df = processor.load_data()
    assert len(df) > 1000
    assert "required_resource_next_5min" in df.columns
    assert "cpu_util_percent" in df.columns

def test_chronological_split_no_leakage():
    processor = DataProcessor()
    X_train, X_test, y_train, y_test = processor.prepare_train_test_split(0.8)
    assert len(X_train) == int(len(processor.load_data()) * 0.8)
    assert len(X_test) == len(processor.load_data()) - len(X_train)
    # Check scaling mean is ~0 on train
    assert np.allclose(np.mean(X_train, axis=0), 0, atol=1e-5)

def test_baseline_linear_regression():
    processor = DataProcessor()
    X_train, X_test, y_train, y_test = processor.prepare_train_test_split(0.8)
    model = BaselineLinearRegressionModel().fit(X_train, y_train)
    metrics = model.evaluate(X_test, y_test)
    assert "mse" in metrics
    assert "sla_violation_rate" in metrics
    assert metrics["r2"] > 0.4

def test_asymmetric_loss_directionality():
    """
    Under-prediction (pred < true) must produce an exponentially higher penalty
    than an over-prediction (pred > true) of the exact same magnitude!
    """
    model = AsymmetricCostRegressionModel(alpha=1.0, beta=1.5, gamma=0.5)
    
    # 1D test
    X = np.array([[1.0]])
    y = np.array([50.0])
    
    # Under-prediction by 4 units: pred = 46.0
    loss_under, _, _ = model.compute_loss_and_gradients(X, y, w=np.array([0.0]), b=46.0)
    
    # Over-prediction by 4 units: pred = 54.0
    loss_over, _, _ = model.compute_loss_and_gradients(X, y, w=np.array([0.0]), b=54.0)
    
    # Under-prediction penalty MUST be much greater than over-prediction penalty!
    assert loss_under > loss_over * 10
    print(f"Loss Under: {loss_under:.2f} vs Loss Over: {loss_over:.2f}")

def test_asymmetric_gradient_descent_training():
    processor = DataProcessor()
    X_train, X_test, y_train, y_test = processor.prepare_train_test_split(0.8)
    model = AsymmetricCostRegressionModel(
        alpha=1.0, beta=1.2, gamma=0.5, learning_rate=0.005, epochs=100
    )
    model.fit(X_train, y_train)
    assert model.is_trained
    assert len(model.loss_history) > 0
    # Loss should decrease or stay stable from epoch 1
    assert model.loss_history[-1]["loss"] <= model.loss_history[0]["loss"]
    metrics = model.evaluate(X_test, y_test)
    assert metrics["sla_violation_rate"] < 50.0

def test_scaling_action_logic():
    # Scenario A: Predicted high load -> SCALE_UP
    high_rec = determine_scaling_action(
        predicted_resource=92.0,
        current_metrics={"cpu_util_percent": 60.0, "mem_util_percent": 75.0}
    )
    assert high_rec["scaling_action"] == "SCALE_UP"

    # Scenario B: Predicted low load -> SCALE_DOWN
    low_rec = determine_scaling_action(
        predicted_resource=40.0,
        current_metrics={"cpu_util_percent": 70.0, "mem_util_percent": 80.0}
    )
    assert low_rec["scaling_action"] == "SCALE_DOWN"

    # Scenario C: Within buffer corridor -> MAINTAIN
    stable_rec = determine_scaling_action(
        predicted_resource=72.0,
        current_metrics={"cpu_util_percent": 70.0, "mem_util_percent": 71.0}
    )
    assert stable_rec["scaling_action"] == "MAINTAIN"
