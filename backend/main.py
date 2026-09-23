import os
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database.db import init_db, get_recent_predictions, get_training_history, clear_predictions
from .ml.config import AsymmetricHyperparameters, DEFAULT_CONFIG
from .services.training_service import ModelManager
from .services.prediction_service import predict_cloud_resource
from .ml.preprocessing import DataProcessor

class AddTelemetryRowRequest(BaseModel):
    cpu_util_percent: float = Field(..., ge=0, le=100, description="CPU Utilization (%)")
    mem_util_percent: float = Field(..., ge=0, le=100, description="Memory Utilization (%)")
    net_in: float = Field(..., ge=0, description="Network In traffic (MB/s)")
    net_out: float = Field(..., ge=0, description="Network Out traffic (MB/s)")
    disk_io_percent: float = Field(..., ge=0, le=100, description="Disk I/O Utilization (%)")
    required_resource_next_5min: Optional[float] = Field(None, ge=0, le=100, description="Required target resource (%)")
    scaling_action: Optional[str] = Field("MAINTAIN", description="Scaling action label")

class PredictRequest(BaseModel):
    cpu_util_percent: float = Field(..., ge=0, le=100, description="CPU Utilization (%)")
    mem_util_percent: float = Field(..., ge=0, le=100, description="Memory Utilization (%)")
    net_in: float = Field(..., ge=0, description="Network In traffic (MB/s or normalized index)")
    net_out: float = Field(..., ge=0, description="Network Out traffic (MB/s or normalized index)")
    disk_io_percent: float = Field(..., ge=0, le=100, description="Disk I/O Utilization (%)")
    current_capacity: Optional[float] = Field(None, ge=0, le=100, description="Optional current provisioned capacity limit")

class TrainRequest(BaseModel):
    alpha: Optional[float] = Field(DEFAULT_CONFIG.alpha, gt=0, description="Scale parameter for under-prediction penalty")
    beta: Optional[float] = Field(DEFAULT_CONFIG.beta, gt=0, description="Exponential sensitivity to SLA violation deficit")
    gamma: Optional[float] = Field(DEFAULT_CONFIG.gamma, gt=0, description="Linear penalty weight for resource wastage")
    learning_rate: Optional[float] = Field(DEFAULT_CONFIG.learning_rate, gt=0, description="Gradient descent step size")
    epochs: Optional[int] = Field(DEFAULT_CONFIG.epochs, ge=10, le=5000, description="Number of gradient descent iterations")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and train baseline + asymmetric models on startup
    init_db()
    manager = ModelManager.get_instance()
    manager.initialize_and_train_all()
    yield

app = FastAPI(
    title="Asymmetric Cost-Weighted Cloud Auto-Scaling API",
    description="Academic Machine Learning prototype for cloud resource forecasting and SLA-aware auto-scaling decision simulation.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    manager = ModelManager.get_instance()
    return {
        "status": "healthy",
        "service": "Cloud Auto-Scaling Regression Service",
        "models_initialized": manager.is_initialized
    }

@app.get("/dataset-summary")
def get_dataset_summary():
    try:
        processor = DataProcessor()
        return processor.get_dataset_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def train_model(req: TrainRequest):
    try:
        manager = ModelManager.get_instance()
        hyperparams = AsymmetricHyperparameters(
            alpha=req.alpha or DEFAULT_CONFIG.alpha,
            beta=req.beta or DEFAULT_CONFIG.beta,
            gamma=req.gamma or DEFAULT_CONFIG.gamma,
            learning_rate=req.learning_rate or DEFAULT_CONFIG.learning_rate,
            epochs=req.epochs or DEFAULT_CONFIG.epochs
        )
        result = manager.initialize_and_train_all(hyperparams=hyperparams)
        return {
            "status": "success",
            "message": f"Successfully trained custom asymmetric model for {hyperparams.epochs} epochs.",
            "hyperparameters": hyperparams.model_dump(),
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.get("/metrics")
def get_metrics():
    manager = ModelManager.get_instance()
    if not manager.is_initialized:
        manager.initialize_and_train_all()
    return {
        "asymmetric_model": manager.asymmetric_metrics,
        "baseline_model": manager.baseline_metrics,
        "comparison_models": manager.comparison_models_metrics,
        "ranked_models": manager.get_comparison_summary().get("ranked_models", [])
    }

@app.get("/comparison")
def get_comparison():
    manager = ModelManager.get_instance()
    return manager.get_comparison_summary()

@app.get("/training-history")
def get_training_history_endpoint():
    return get_training_history(limit=20)

@app.post("/predict")
def predict(req: PredictRequest):
    try:
        features = {
            "cpu_util_percent": req.cpu_util_percent,
            "mem_util_percent": req.mem_util_percent,
            "net_in": req.net_in,
            "net_out": req.net_out,
            "disk_io_percent": req.disk_io_percent,
        }
        result = predict_cloud_resource(features, current_capacity=req.current_capacity)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/predictions-log")
def get_predictions_log():
    return get_recent_predictions(limit=50)

@app.delete("/predictions-log")
def delete_predictions_log():
    count = clear_predictions()
    return {"status": "success", "message": f"Cleared {count} prediction records"}

@app.post("/dataset/add-row")
def add_dataset_row(req: AddTelemetryRowRequest):
    try:
        processor = DataProcessor()
        summary = processor.append_row(req.model_dump())
        # Re-initialize models with updated dataset
        manager = ModelManager.get_instance()
        manager.initialize_and_train_all()
        return {
            "status": "success",
            "message": "Telemetry row added successfully and models re-trained.",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to append row: {str(e)}")
