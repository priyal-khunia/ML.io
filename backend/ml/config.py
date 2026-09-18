import os
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "data", "cloud_resource_dataset.csv")
DB_PATH = os.path.join(BASE_DIR, "database", "cloud_autoscaling.db")

FEATURE_COLUMNS = [
    "cpu_util_percent",
    "mem_util_percent",
    "net_in",
    "net_out",
    "disk_io_percent",
]
TARGET_COLUMN = "required_resource_next_5min"

class AsymmetricHyperparameters(BaseModel):
    alpha: float = 1.0       # Scaling factor for under-prediction penalty
    beta: float = 0.7        # Exponential sensitivity factor for SLA violation (balanced R² and SLA protection)
    gamma: float = 0.5       # Linear cost factor for over-provisioning resource wastage
    learning_rate: float = 0.005
    epochs: int = 400
    clip_exp: float = 8.0    # Numerical stability gradient clipping for exponential term

class ScalingThresholds(BaseModel):
    scale_up_delta: float = 5.0     # When predicted future > current utilization + 5%
    scale_down_delta: float = -15.0 # When predicted future < current utilization - 15%
    safety_buffer: float = 5.0      # Safety headroom in capacity planning

DEFAULT_CONFIG = AsymmetricHyperparameters()
DEFAULT_SCALING = ScalingThresholds()
