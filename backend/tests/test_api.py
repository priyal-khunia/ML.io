import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["models_initialized"] is True

def test_dataset_summary_endpoint(client):
    response = client.get("/dataset-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] > 1000
    assert len(data["feature_names"]) == 5
    assert len(data["preview"]) > 0

def test_predict_endpoint(client):
    payload = {
        "cpu_util_percent": 55.0,
        "mem_util_percent": 88.0,
        "net_in": 36.0,
        "net_out": 29.0,
        "disk_io_percent": 5.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_resource" in data
    assert data["scaling_action"] in ["SCALE_UP", "MAINTAIN", "SCALE_DOWN"]
    assert data["model"] == "asymmetric"
    assert "rationale" in data

def test_comparison_endpoint(client):
    response = client.get("/comparison")
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "asymmetric" in data
    assert "comparison_summary" in data
    assert "training_loss_history" in data

def test_train_endpoint(client):
    payload = {
        "alpha": 1.2,
        "beta": 1.4,
        "gamma": 0.4,
        "learning_rate": 0.005,
        "epochs": 50
    }
    response = client.post("/train", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["results"]["training_loss_history"]) > 0
