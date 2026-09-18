import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
from sklearn.preprocessing import StandardScaler
from .config import DATASET_PATH, FEATURE_COLUMNS, TARGET_COLUMN

class DataProcessor:
    def __init__(self, dataset_path: str = DATASET_PATH):
        self.dataset_path = dataset_path
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.summary_cache: Dict[str, Any] = {}

    def load_data(self) -> pd.DataFrame:
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Dataset not found at {self.dataset_path}")
            
        df = pd.read_csv(self.dataset_path)
        
        # Verify required columns
        for col in FEATURE_COLUMNS + [TARGET_COLUMN]:
            if col not in df.columns:
                raise ValueError(f"Missing required column in dataset: {col}")
                
        # Data validation and cleaning
        # 1. Check & handle missing values
        df = df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN]).copy()
        
        # 2. Check & handle duplicates
        df = df.drop_duplicates().reset_index(drop=True)
        
        # 3. Ensure numeric types
        for col in FEATURE_COLUMNS + [TARGET_COLUMN]:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        # Re-drop any coerce nulls or non-finite values
        df = df.replace([np.inf, -np.inf], np.nan).dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN])
        
        return df

    def get_dataset_summary(self) -> Dict[str, Any]:
        df = self.load_data()
        stats = {}
        for col in FEATURE_COLUMNS + [TARGET_COLUMN]:
            stats[col] = {
                "mean": round(float(df[col].mean()), 4),
                "std": round(float(df[col].std()), 4),
                "min": round(float(df[col].min()), 4),
                "q25": round(float(df[col].quantile(0.25)), 4),
                "median": round(float(df[col].median()), 4),
                "q75": round(float(df[col].quantile(0.75)), 4),
                "max": round(float(df[col].max()), 4),
            }
            
        split_idx = int(len(df) * 0.8)
        preview_rows = df.head(15).to_dict(orient="records")
        # clean preview for JSON serialization
        for row in preview_rows:
            for k, v in row.items():
                if isinstance(v, float):
                    row[k] = round(v, 4)
                    
        return {
            "total_records": len(df),
            "feature_names": FEATURE_COLUMNS,
            "target_name": TARGET_COLUMN,
            "train_records": split_idx,
            "test_records": len(df) - split_idx,
            "split_ratio": "80% Chronological Train / 20% Latest Test",
            "feature_statistics": stats,
            "preview": preview_rows,
        }

    def prepare_train_test_split(self, train_ratio: float = 0.8) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Chronological train/test split to prevent temporal data leakage in time-series cloud metrics.
        80% earliest -> Training
        20% latest -> Testing
        """
        df = self.load_data()
        n = len(df)
        split_idx = int(n * train_ratio)
        
        X = df[FEATURE_COLUMNS].values
        y = df[TARGET_COLUMN].values
        
        X_train_raw = X[:split_idx]
        X_test_raw = X[split_idx:]
        y_train = y[:split_idx]
        y_test = y[split_idx:]
        
        # Fit scaler ONLY on training data to prevent information leakage
        X_train_scaled = self.scaler.fit_transform(X_train_raw)
        X_test_scaled = self.scaler.transform(X_test_raw)
        self.is_fitted = True
        
        return X_train_scaled, X_test_scaled, y_train, y_test

    def transform_input(self, feature_dict: Dict[str, float]) -> np.ndarray:
        if not self.is_fitted:
            # Fit scaler on full training set first
            self.prepare_train_test_split()
            
        values = [feature_dict[col] for col in FEATURE_COLUMNS]
        x_raw = np.array(values, dtype=float).reshape(1, -1)
        return self.scaler.transform(x_raw)

    def append_row(self, row_dict: Dict[str, Any]) -> Dict[str, Any]:
        df = self.load_data()
        new_row = {
            "cpu_util_percent": float(row_dict["cpu_util_percent"]),
            "mem_util_percent": float(row_dict["mem_util_percent"]),
            "net_in": float(row_dict["net_in"]),
            "net_out": float(row_dict["net_out"]),
            "disk_io_percent": float(row_dict["disk_io_percent"]),
            "required_resource_next_5min": float(row_dict.get("required_resource_next_5min") or row_dict["mem_util_percent"]),
            "scaling_action": str(row_dict.get("scaling_action") or "MAINTAIN")
        }
        df_new = pd.DataFrame([new_row])
        df_combined = pd.concat([df, df_new], ignore_index=True)
        df_combined.to_csv(self.dataset_path, index=False)
        self.is_fitted = False
        return self.get_dataset_summary()
