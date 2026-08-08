from __future__ import annotations

import hashlib
import json
import math
import os
import shutil
import subprocess
import tarfile
import time
import zipfile
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, Iterator

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
    precision_recall_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, StandardScaler

import importlib

lgb = importlib.util.find_spec("lightgbm") and importlib.import_module("lightgbm")
xgb = importlib.util.find_spec("xgboost") and importlib.import_module("xgboost")

try:
    torch = importlib.import_module("torch")
    nn = importlib.import_module("torch.nn")
    optim = importlib.import_module("torch.optim")
    _torch_data = importlib.import_module("torch.utils.data")
    DataLoader = getattr(_torch_data, "DataLoader")
    TensorDataset = getattr(_torch_data, "TensorDataset")
except ModuleNotFoundError:
    torch = None
    nn = None
    optim = None
    DataLoader = None
    TensorDataset = None

onnx = importlib.util.find_spec("onnx") and importlib.import_module("onnx")
ort = importlib.util.find_spec("onnxruntime") and importlib.import_module("onnxruntime")

try:
    skl2onnx = importlib.import_module("skl2onnx")
    convert_sklearn = getattr(skl2onnx, "convert_sklearn")
    FloatTensorType = getattr(importlib.import_module("skl2onnx.common.data_types"), "FloatTensorType")
except ModuleNotFoundError:
    skl2onnx = None
    convert_sklearn = None
    FloatTensorType = None

matplotlib_spec = importlib.util.find_spec("matplotlib")
if matplotlib_spec is not None:
    plt = importlib.import_module("matplotlib.pyplot")
else:
    plt = None

sns = importlib.util.find_spec("seaborn") and importlib.import_module("seaborn")

shap = importlib.util.find_spec("shap") and importlib.import_module("shap")

from .mlflow_client import MLFlowClient
from .storage import ArtifactStorage


DATASET_REGISTRY = [
    {
        "id": "nasa_cmapss",
        "title": "NASA C-MAPSS",
        "description": "Aircraft engine degradation simulations for RUL prediction.",
        "direct_urls": [
            "https://github.com/zhengyao42/Deep-Learning-Turbo-Engine/raw/master/data/CMAPSSData.zip"
        ],
        "kaggle_id": "zhanghong90/nasa-cmapss-data-set",
        "task_type": "rul",
    },
    {
        "id": "ai4i2020",
        "title": "AI4I 2020",
        "description": "Predictive maintenance classification dataset.",
        "kaggle_id": "shivamb/ai4i2020-predictive-maintenance-dataset",
        "task_type": "classification",
    },
    {
        "id": "cwru_bearing",
        "title": "CWRU Bearing",
        "description": "Bearing fault diagnosis dataset.",
        "kaggle_id": "case-western-reserve-university-bearing-data",
        "task_type": "classification",
    },
    {
        "id": "ims_bearing",
        "title": "IMS Bearing",
        "description": "NASA bearing degradation dataset.",
        "kaggle_id": "ims-bearing-dataset",
        "task_type": "rul",
    },
    {
        "id": "pronostia",
        "title": "PRONOSTIA",
        "description": "FEMTO-ST bearing lifetime dataset.",
        "kaggle_id": "pronostia/femto-st-pronostia",
        "task_type": "rul",
    },
    {
        "id": "paderborn",
        "title": "Paderborn Bearing",
        "description": "Paderborn University bearing fault data.",
        "kaggle_id": "paderborn-university-bearing-dataset",
        "task_type": "classification",
    },
    {
        "id": "tennessee_eastman",
        "title": "Tennessee Eastman",
        "description": "Industrial process anomaly detection dataset.",
        "direct_urls": [
            "https://dataverse.harvard.edu/api/access/datafile/3776220"
        ],
        "task_type": "anomaly",
    },
    {
        "id": "metropt3",
        "title": "MetroPT-3",
        "description": "Compressor maintenance dataset.",
        "kaggle_id": "arnabbiswas1/metropt-3-dataset",
        "task_type": "classification",
    },
    {
        "id": "mimii",
        "title": "MIMII",
        "description": "Audio anomaly detection dataset.",
        "direct_urls": [
            "https://zenodo.org/record/3384388/files/MIMII_Dataset.tar.gz?download=1"
        ],
        "task_type": "anomaly",
    },
    {
        "id": "secom",
        "title": "SECOM",
        "description": "Manufacturing quality dataset.",
        "direct_urls": [
            "https://archive.ics.uci.edu/ml/machine-learning-databases/secom/secom.data"
        ],
        "task_type": "classification",
    },
]


@dataclass
class DownloadResult:
    dataset_id: str
    file_paths: list[Path]
    checksums: dict[str, str] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)


@dataclass
class TrainingResult:
    model_name: str
    task_type: str
    metrics: dict[str, float]
    inference_time_ms: float
    model_size_bytes: int
    model_path: Path
    export_paths: dict[str, Path] = field(default_factory=dict)
    stage: str = "Staging"


class IndustrialTrainingPipeline:
    def __init__(
        self,
        root_path: str | Path = "./maintix_industrial_pipeline",
        tracking_uri: str | Path = "sqlite:///mlflow.db",
        experiment_name: str = "maintix_industrial_ai",
    ) -> None:
        self.root_path = Path(root_path)
        self.raw_path = self.root_path / "raw"
        self.bronze_path = self.root_path / "bronze"
        self.silver_path = self.root_path / "silver"
        self.gold_path = self.root_path / "gold"
        self.reports_path = self.root_path / "reports"
        self.feature_store_path = self.root_path / "feature_store"
        self.raw_path.mkdir(parents=True, exist_ok=True)
        self.bronze_path.mkdir(parents=True, exist_ok=True)
        self.silver_path.mkdir(parents=True, exist_ok=True)
        self.gold_path.mkdir(parents=True, exist_ok=True)
        self.reports_path.mkdir(parents=True, exist_ok=True)
        self.feature_store_path.mkdir(parents=True, exist_ok=True)
        self.artifact_storage = ArtifactStorage(self.root_path / "artifacts")
        self.mlflow = MLFlowClient(str(tracking_uri), experiment_name)
        self._ensure_plotting()

    def _ensure_plotting(self) -> None:
        if plt is None or sns is None:
            raise ImportError(
                "Matplotlib and seaborn are required for report generation. Install maintix-mlops[full] or add matplotlib and seaborn."
            )

    def download_datasets(self) -> list[DownloadResult]:
        results: list[DownloadResult] = []
        for spec in DATASET_REGISTRY:
            result = DownloadResult(dataset_id=spec["id"], file_paths=[])
            try:
                result.file_paths = self._download_dataset(spec)
                result.checksums = {str(path): self._file_checksum(path) for path in result.file_paths}
            except Exception as exc:
                result.errors.append(str(exc))
            results.append(result)
        return results

    def _download_dataset(self, spec: dict[str, Any]) -> list[Path]:
        dataset_dir = self.raw_path / spec["id"]
        dataset_dir.mkdir(parents=True, exist_ok=True)
        downloaded: list[Path] = []

        if spec.get("direct_urls"):
            for url in spec["direct_urls"]:
                downloaded.extend(self._download_url(url, dataset_dir))

        if not downloaded and spec.get("kaggle_id"):
            downloaded.extend(self._download_kaggle_dataset(spec["kaggle_id"], dataset_dir))

        if not downloaded:
            raise RuntimeError(f"Unable to download dataset {spec['id']}. Provide direct_urls or configure Kaggle API.")

        extracted: list[Path] = []
        for path in downloaded:
            extracted.extend(self._extract_if_archive(path, dataset_dir))

        if extracted:
            return extracted
        return downloaded

    def _download_url(self, url: str, target_dir: Path) -> list[Path]:
        if url.endswith("?download=1"):
            url = url.replace("?download=1", "")
        file_name = url.split("/")[-1] or target_dir.name
        file_path = target_dir / file_name
        if file_path.exists() and file_path.stat().st_size > 0:
            return [file_path]

        try:
            import requests
        except ImportError as exc:
            raise ImportError("requests is required to download direct dataset URLs") from exc

        response = requests.get(url, stream=True, timeout=120)
        response.raise_for_status()
        with file_path.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    handle.write(chunk)
        return [file_path]

    def _download_kaggle_dataset(self, dataset_id: str, target_dir: Path) -> list[Path]:
        target_dir.mkdir(parents=True, exist_ok=True)
        kaggle_spec = importlib.util.find_spec("kaggle")
        if kaggle_spec is not None:
            kaggle = importlib.import_module("kaggle")
            api = getattr(kaggle, "api", None)
            if api is not None:
                api.dataset_download_files(dataset_id, path=str(target_dir), unzip=True, quiet=True)
                return list(target_dir.glob("**/*"))
        subprocess.run(
            [
                "kaggle",
                "datasets",
                "download",
                "-d",
                dataset_id,
                "-p",
                str(target_dir),
                "--unzip",
            ],
            check=True,
        )
        return list(target_dir.glob("**/*"))

    def _extract_if_archive(self, archive_path: Path, destination: Path) -> list[Path]:
        extracted: list[Path] = []
        suffix = archive_path.suffix.lower()
        if suffix == ".zip":
            with zipfile.ZipFile(archive_path, "r") as archive:
                archive.extractall(destination)
                extracted.extend([destination / name for name in archive.namelist()])
        elif suffix in {".tar", ".gz", ".tgz", ".bz2"}:
            with tarfile.open(archive_path, "r:*") as archive:
                archive.extractall(destination)
                extracted.extend([destination / member.name for member in archive.getmembers() if member.name])
        return [path for path in extracted if path.exists()]

    def _file_checksum(self, path: Path, algorithm: str = "sha256") -> str:
        hash_func = hashlib.new(algorithm)
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(8192), b""):
                hash_func.update(chunk)
        return hash_func.hexdigest()

    def validate_raw_datasets(self, raw_downloads: list[DownloadResult]) -> dict[str, dict[str, Any]]:
        report: dict[str, dict[str, Any]] = {}
        for result in raw_downloads:
            dataset_report: dict[str, Any] = {
                "file_count": len(result.file_paths),
                "checksums": result.checksums,
                "errors": result.errors,
            }
            for path in result.file_paths:
                if not path.exists():
                    dataset_report.setdefault("errors", []).append(f"Missing file {path}")
                elif path.stat().st_size == 0:
                    dataset_report.setdefault("errors", []).append(f"Empty file {path}")
            report[result.dataset_id] = dataset_report
        return report

    def clean_and_merge_datasets(self, raw_downloads: list[DownloadResult]) -> pd.DataFrame:
        cleaned_frames: list[pd.DataFrame] = []
        for spec in DATASET_REGISTRY:
            result = next((r for r in raw_downloads if r.dataset_id == spec["id"]), None)
            if result is None or result.errors:
                continue
            for file_path in result.file_paths:
                try:
                    frame = self._load_dataframe(file_path)
                except Exception:
                    continue
                if frame.empty:
                    continue
                frame = self._clean_dataframe(frame)
                frame = self._normalize_units(frame)
                frame = self._verify_and_add_timestamp(frame)
                frame = self._standardize_dataset(frame, spec)
                frame = self._engineer_features(frame)
                cleaned_frames.append(frame)
                self._write_zone(self.bronze_path, spec["id"], frame)
        merged = self._merge_frames(cleaned_frames)
        self._write_zone(self.silver_path, "merged", merged)
        gold = self._aggregate_to_gold(merged)
        self._write_zone(self.gold_path, "merged", gold)
        self._register_feature_store(merged)
        return merged

    def _load_dataframe(self, file_path: Path) -> pd.DataFrame:
        suffix = file_path.suffix.lower()
        if suffix in {".csv", ".data", ".txt"}:
            return pd.read_csv(file_path, sep=None, engine="python", header=0)
        if suffix in {".json"}:
            return pd.read_json(file_path)
        if suffix in {".parquet"}:
            return pd.read_parquet(file_path)
        if suffix in {".xls", ".xlsx"}:
            return pd.read_excel(file_path)
        raise ValueError(f"Unsupported dataset format: {suffix}")

    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        frame = df.copy()
        frame.columns = [self._normalize_column_name(col) for col in frame.columns]
        frame = frame.drop_duplicates(ignore_index=True)
        for column in frame.select_dtypes(include=["number"]):
            if frame[column].isna().any():
                frame[column] = frame[column].interpolate(limit_direction="both")
                frame[column] = frame[column].fillna(frame[column].median())
        for column in frame.select_dtypes(include=["object"]):
            frame[column] = frame[column].astype(str).str.strip()
        return frame

    def _normalize_column_name(self, name: str) -> str:
        return (
            str(name)
            .strip()
            .lower()
            .replace(" ", "_")
            .replace("/", "_")
            .replace("-", "_")
        )

    def _normalize_units(self, frame: pd.DataFrame) -> pd.DataFrame:
        normalized = frame.copy()
        for column in normalized.columns:
            if "temp" in column and normalized[column].dtype.kind in "if":
                if normalized[column].max(skipna=True) > 200:
                    normalized[column] = (normalized[column] - 32.0) * 5.0 / 9.0
            if "rpm" in column or "speed" in column:
                normalized[column] = normalized[column].abs()
        return normalized

    def _verify_and_add_timestamp(self, frame: pd.DataFrame) -> pd.DataFrame:
        if "timestamp" in frame.columns:
            frame["timestamp"] = pd.to_datetime(frame["timestamp"], errors="coerce")
        elif "time" in frame.columns:
            frame["timestamp"] = pd.to_datetime(frame["time"], errors="coerce")
        else:
            frame["timestamp"] = pd.date_range(start=datetime.utcnow(), periods=len(frame), freq="s")
        if frame["timestamp"].isna().any():
            frame["timestamp"] = pd.date_range(start=datetime.utcnow(), periods=len(frame), freq="s")
        return frame

    def _standardize_dataset(self, frame: pd.DataFrame, spec: dict[str, Any]) -> pd.DataFrame:
        standardized = frame.copy()
        standardized["dataset"] = spec["id"]
        standardized["source"] = spec["title"]
        standardized["task_type"] = spec["task_type"]
        standardized["unit"] = standardized.get("unit") or standardized.get("id") or standardized.get("machine") or "unknown"
        standardized["cycle"] = standardized.get("cycle") or standardized.get("run") or standardized.get("time")
        if "rul" not in standardized.columns and spec["task_type"] == "rul":
            standardized["rul"] = standardized.get("remaining_useful_life") or standardized.get("time_to_failure") or np.nan
        if "label" not in standardized.columns and spec["task_type"] in {"classification", "anomaly"}:
            if "fault" in standardized.columns:
                standardized["label"] = standardized["fault"].astype(int)
            elif "failure" in standardized.columns:
                standardized["label"] = standardized["failure"].astype(int)
            else:
                standardized["label"] = 0
        return standardized

    def _engineer_features(self, frame: pd.DataFrame) -> pd.DataFrame:
        features = frame.copy()
        numeric_columns = [
            col
            for col in features.select_dtypes(include=["number"]).columns
            if col not in {"label", "rul", "cycle"}
        ]
        sensor_columns = [col for col in numeric_columns if col not in {"health_index", "risk_score", "anomaly_score"}]
        grouped = features.groupby(["dataset", "unit"], dropna=False)
        engineered_frames: list[pd.DataFrame] = []
        for _, group in grouped:
            enriched = group.copy()
            enriched = self._add_statistical_features(enriched, sensor_columns)
            enriched = self._add_frequency_features(enriched, sensor_columns)
            enriched = self._add_health_scores(enriched, sensor_columns)
            engineered_frames.append(enriched)
        result = pd.concat(engineered_frames, ignore_index=True, sort=False)
        result = result.sort_values(by=["dataset", "unit", "timestamp"], ignore_index=True)
        return result

    def _add_statistical_features(self, frame: pd.DataFrame, sensor_columns: list[str]) -> pd.DataFrame:
        window = min(10, len(frame))
        engineered = frame.copy()
        for column in sensor_columns:
            engineered[f"{column}_rms"] = np.sqrt(
                engineered[column].pow(2).rolling(window=window, min_periods=1).mean()
            )
            engineered[f"{column}_peak"] = engineered[column].abs().rolling(window=window, min_periods=1).max()
            engineered[f"{column}_peak_to_peak"] = (
                engineered[column].rolling(window=window, min_periods=1).max()
                - engineered[column].rolling(window=window, min_periods=1).min()
            )
            engineered[f"{column}_rolling_mean"] = engineered[column].rolling(window=window, min_periods=1).mean()
            engineered[f"{column}_rolling_std"] = engineered[column].rolling(window=window, min_periods=1).std().fillna(0)
            engineered[f"{column}_kurtosis"] = engineered[column].rolling(window=window, min_periods=1).apply(
                lambda x: x.kurtosis() if len(x) > 1 else 0, raw=False
            )
            engineered[f"{column}_skewness"] = engineered[column].rolling(window=window, min_periods=1).skew().fillna(0)
            engineered[f"{column}_crest_factor"] = engineered[f"{column}_peak"] / (engineered[f"{column}_rolling_std"] + 1e-9)
        return engineered

    def _add_frequency_features(self, frame: pd.DataFrame, sensor_columns: list[str]) -> pd.DataFrame:
        engineered = frame.copy()
        for column in sensor_columns[:1]:
            values = engineered[column].replace({np.nan: 0}).to_numpy(dtype=float)
            if len(values) < 2:
                engineered[f"{column}_dominant_frequency"] = 0.0
                engineered[f"{column}_spectral_entropy"] = 0.0
                continue
            spectrum = np.abs(np.fft.rfft(values - np.mean(values)))
            freqs = np.fft.rfftfreq(len(values), d=1.0)
            if spectrum.sum() > 0:
                dominant = freqs[np.argmax(spectrum)]
                power = spectrum / (spectrum.sum() + 1e-9)
                entropy = -np.sum(power * np.log2(power + 1e-9))
            else:
                dominant = 0.0
                entropy = 0.0
            engineered[f"{column}_dominant_frequency"] = dominant
            engineered[f"{column}_spectral_entropy"] = entropy
        return engineered

    def _add_health_scores(self, frame: pd.DataFrame, sensor_columns: list[str]) -> pd.DataFrame:
        enriched = frame.copy()
        if not sensor_columns:
            enriched["health_index"] = 1.0
            enriched["risk_score"] = 0.0
            enriched["anomaly_score"] = 0.0
            return enriched
        meta = enriched[[*sensor_columns]].abs().fillna(0)
        combined = np.sqrt((meta.pow(2)).mean(axis=1))
        normalized = (combined - combined.min()) / (combined.max() - combined.min() + 1e-9)
        enriched["health_index"] = 1.0 - normalized
        enriched["risk_score"] = normalized
        enriched["anomaly_score"] = normalized ** 1.5
        return enriched

    def _merge_frames(self, frames: list[pd.DataFrame]) -> pd.DataFrame:
        if not frames:
            return pd.DataFrame()
        merged = pd.concat(frames, ignore_index=True, sort=False)
        merged["timestamp"] = pd.to_datetime(merged["timestamp"], errors="coerce")
        return merged

    def _aggregate_to_gold(self, merged: pd.DataFrame) -> pd.DataFrame:
        if merged.empty:
            return merged
        numeric = merged.select_dtypes(include=["number"]).columns.tolist()
        group_cols = ["dataset", "unit"] if "unit" in merged.columns else ["dataset"]
        aggregation = {col: "mean" for col in numeric if col not in {"label", "rul"}}
        return merged.groupby(group_cols, dropna=False).agg(aggregation).reset_index()

    def _write_zone(self, zone_path: Path, dataset_name: str, frame: pd.DataFrame, fmt: str = "parquet") -> Path:
        path = zone_path / f"{dataset_name}.{fmt}"
        frame.to_parquet(path, index=False)
        return path

    def _register_feature_store(self, merged: pd.DataFrame) -> Path:
        definitions = {
            "feature_set": "maintix_industrial_features",
            "columns": [
                {
                    "name": column,
                    "dtype": str(merged[column].dtype),
                    "description": "engineered feature" if column not in {"dataset", "unit", "source", "task_type", "timestamp"} else "metadata",
                }
                for column in merged.columns
            ],
        }
        path = self.feature_store_path / "feature_definitions.json"
        path.write_text(json.dumps(definitions, indent=2))
        return path

    def train_and_compare_models(
        self,
        dataframe: pd.DataFrame,
        target_column: str = "label",
        test_size: float = 0.2,
        random_state: int = 42,
    ) -> list[TrainingResult]:
        if dataframe.empty:
            raise ValueError("Training dataset is empty")
        if target_column not in dataframe.columns:
            raise ValueError(f"Target column '{target_column}' not found in training dataset")
        task_type = self._infer_task_type(dataframe[target_column])
        X = dataframe.drop(columns=[target_column, "dataset", "source", "task_type", "timestamp", "unit"], errors="ignore")
        y = dataframe[target_column]
        X_numeric = X.select_dtypes(include=["number"]).fillna(0)
        if X_numeric.empty:
            raise ValueError("No numeric training features found")
        X_train, X_test, y_train, y_test = train_test_split(
            X_numeric, y, test_size=test_size, random_state=random_state, stratify=y if task_type == "classification" else None
        )
        scaler = StandardScaler().fit(X_train)
        X_train_scaled = pd.DataFrame(scaler.transform(X_train), columns=X_train.columns)
        X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns)
        results: list[TrainingResult] = []
        models = [
            ("random_forest", self._train_random_forest),
            ("lightgbm", self._train_lightgbm),
            ("xgboost", self._train_xgboost),
            ("autoencoder", self._train_autoencoder),
            ("cnn", self._train_cnn),
            ("lstm", self._train_lstm),
        ]
        for model_name, trainer in models:
            try:
                trained_model, metrics = trainer(
                    X_train_scaled, X_test_scaled, y_train, y_test, task_type
                )
            except RuntimeError as exc:
                continue
            inference_time_ms, model_size = self._record_model_costs(trained_model, X_test_scaled)
            model_path = self.artifact_storage.save_model(trained_model, model_name)
            export_paths = self._export_model(trained_model, model_name, X_test_scaled)
            with self.mlflow.start_run(f"industrial_{model_name}") as run:
                self.mlflow.log_params({"model": model_name, "task_type": task_type, "target_column": target_column})
                self.mlflow.log_metrics(metrics)
                self.mlflow.log_artifact(model_path, artifact_path="models")
                for path in export_paths.values():
                    self.mlflow.log_artifact(path, artifact_path=f"export/{model_name}")
            result = TrainingResult(
                model_name=model_name,
                task_type=task_type,
                metrics=metrics,
                inference_time_ms=inference_time_ms,
                model_size_bytes=model_size,
                model_path=model_path,
                export_paths=export_paths,
            )
            results.append(result)
        return results

    def _infer_task_type(self, target_series: pd.Series) -> str:
        if pd.api.types.is_numeric_dtype(target_series) and target_series.nunique() > 10:
            return "regression"
        if target_series.nunique() == 2:
            return "classification"
        return "classification"

    def _train_random_forest(
        self,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        y_test: pd.Series,
        task_type: str,
    ) -> tuple[Any, dict[str, float]]:
        if task_type == "regression":
            model = RandomForestRegressor(n_estimators=200, random_state=42)
        else:
            model = RandomForestClassifier(n_estimators=200, random_state=42)
        model.fit(X_train, y_train)
        return model, self._evaluate_model(model, X_test, y_test, task_type)

    def _train_lightgbm(
        self,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        y_test: pd.Series,
        task_type: str,
    ) -> tuple[Any, dict[str, float]]:
        if lgb is None:
            raise RuntimeError("LightGBM is not installed")
        if task_type == "regression":
            model = lgb.LGBMRegressor(n_estimators=200, random_state=42)
        else:
            model = lgb.LGBMClassifier(n_estimators=200, random_state=42)
        model.fit(X_train, y_train)
        return model, self._evaluate_model(model, X_test, y_test, task_type)

    def _train_xgboost(
        self,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        y_test: pd.Series,
        task_type: str,
    ) -> tuple[Any, dict[str, float]]:
        if xgb is None:
            raise RuntimeError("XGBoost is not installed")
        if task_type == "regression":
            model = xgb.XGBRegressor(n_estimators=200, random_state=42, use_label_encoder=False, eval_metric="rmse")
        else:
            model = xgb.XGBClassifier(n_estimators=200, random_state=42, use_label_encoder=False, eval_metric="logloss")
        model.fit(X_train, y_train)
        return model, self._evaluate_model(model, X_test, y_test, task_type)

    def _train_autoencoder(
        self,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        y_test: pd.Series,
        task_type: str,
    ) -> tuple[Any, dict[str, float]]:
        if torch is None:
            raise RuntimeError("PyTorch is required for AutoEncoder training")
        model = TorchAutoEncoder(input_size=X_train.shape[1], latent_dim=32)
        self._train_torch_model(model, X_train, X_test, y_train, task_type, epochs=10)
        predictions = model.predict(X_test.to_numpy(dtype=np.float32))
        return model, self._evaluate_reconstruction(predictions, X_test, y_test, task_type)

    def _train_cnn(
        self,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        y_test: pd.Series,
        task_type: str,
    ) -> tuple[Any, dict[str, float]]:
        if torch is None:
            raise RuntimeError("PyTorch is required for CNN training")
        model = TorchCNN(input_channels=1, input_length=X_train.shape[1], output_size=len(np.unique(y_train)) if task_type == "classification" else 1)
        self._train_torch_model(model, X_train, X_test, y_train, task_type, epochs=12)
        return model, self._evaluate_torch_model(model, X_test, y_test, task_type)

    def _train_lstm(
        self,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        y_test: pd.Series,
        task_type: str,
    ) -> tuple[Any, dict[str, float]]:
        if torch is None:
            raise RuntimeError("PyTorch is required for LSTM training")
        model = TorchLSTM(input_size=X_train.shape[1], hidden_size=64, output_size=len(np.unique(y_train)) if task_type == "classification" else 1)
        self._train_torch_model(model, X_train, X_test, y_train, task_type, epochs=12)
        return model, self._evaluate_torch_model(model, X_test, y_test, task_type)

    def _train_torch_model(
        self,
        model: Any,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        task_type: str,
        epochs: int,
    ) -> None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        X_train_tensor = torch.tensor(X_train.to_numpy(dtype=np.float32), dtype=torch.float32, device=device)
        X_test_tensor = torch.tensor(X_test.to_numpy(dtype=np.float32), dtype=torch.float32, device=device)
        if task_type == "classification":
            y_train_tensor = torch.tensor(y_train.to_numpy(dtype=np.int64), device=device)
        else:
            y_train_tensor = torch.tensor(y_train.to_numpy(dtype=np.float32), device=device).unsqueeze(1)
        dataset = TensorDataset(X_train_tensor, y_train_tensor)
        loader = DataLoader(dataset, batch_size=32, shuffle=True)
        optimizer = optim.Adam(model.parameters(), lr=1e-3)
        criterion = nn.CrossEntropyLoss() if task_type == "classification" else nn.MSELoss()
        model.train()
        for _ in range(epochs):
            for x_batch, y_batch in loader:
                optimizer.zero_grad()
                outputs = model(x_batch)
                if task_type == "classification":
                    loss = criterion(outputs, y_batch)
                else:
                    loss = criterion(outputs, y_batch)
                loss.backward()
                optimizer.step()

    def _evaluate_model(self, model: Any, X_test: pd.DataFrame, y_test: pd.Series, task_type: str) -> dict[str, float]:
        y_pred = model.predict(X_test)
        return self._classification_or_regression_metrics(y_test, y_pred, task_type)

    def _evaluate_torch_model(self, model: Any, X_test: pd.DataFrame, y_test: pd.Series, task_type: str) -> dict[str, float]:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        model.eval()
        with torch.no_grad():
            X_tensor = torch.tensor(X_test.to_numpy(dtype=np.float32), dtype=torch.float32, device=device)
            output = model(X_tensor)
        if task_type == "classification":
            y_pred = output.argmax(dim=1).cpu().numpy()
        else:
            y_pred = output.cpu().numpy().reshape(-1)
        return self._classification_or_regression_metrics(y_test, pd.Series(y_pred, index=y_test.index), task_type)

    def _evaluate_reconstruction(
        self,
        reconstruction: np.ndarray,
        X_test: pd.DataFrame,
        y_test: pd.Series,
        task_type: str,
    ) -> dict[str, float]:
        errors = np.mean(np.square(X_test.to_numpy(dtype=np.float32) - reconstruction), axis=1)
        if task_type == "classification":
            threshold = np.median(errors)
            y_pred = (errors > threshold).astype(int)
            return self._classification_or_regression_metrics(y_test, pd.Series(y_pred, index=y_test.index), task_type)
        return self._classification_or_regression_metrics(y_test, pd.Series(errors, index=y_test.index), task_type)

    def _classification_or_regression_metrics(self, y_true: pd.Series, y_pred: pd.Series, task_type: str) -> dict[str, float]:
        metrics: dict[str, float] = {}
        if task_type == "classification":
            metrics["accuracy"] = float(accuracy_score(y_true, y_pred))
            metrics["precision"] = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
            metrics["recall"] = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
            metrics["f1_score"] = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))
            try:
                metrics["roc_auc"] = float(roc_auc_score(y_true, y_pred))
            except Exception:
                metrics["roc_auc"] = 0.0
        else:
            metrics["mae"] = float(mean_absolute_error(y_true, y_pred))
            metrics["mse"] = float(mean_squared_error(y_true, y_pred))
            metrics["rmse"] = float(np.sqrt(mean_squared_error(y_true, y_pred)))
            metrics["r2"] = float(1.0 - mean_squared_error(y_true, y_pred) / (np.var(y_true) + 1e-9))
        return metrics

    def _record_model_costs(self, model: Any, X_test: pd.DataFrame) -> tuple[float, int]:
        start = time.perf_counter()
        if hasattr(model, "predict"):
            _ = model.predict(X_test)
        elif torch is not None and isinstance(model, torch.nn.Module):
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model.to(device)
            model.eval()
            with torch.no_grad():
                _ = model(torch.tensor(X_test.to_numpy(dtype=np.float32), device=device))
        inference_time_ms = (time.perf_counter() - start) * 1000.0
        model_path = self.artifact_storage.save_model(model, f"tmp_inference_size")
        size_bytes = model_path.stat().st_size
        model_path.unlink(missing_ok=True)
        return inference_time_ms, size_bytes

    def _export_model(self, model: Any, model_name: str, X_test: pd.DataFrame) -> dict[str, Path]:
        paths: dict[str, Path] = {}
        if skl2onnx is not None and hasattr(model, "predict"):
            try:
                initial_type = [("float_input", FloatTensorType([None, X_test.shape[1]]))]
                onnx_model = convert_sklearn(model, initial_types=initial_type)
                onnx_path = self.artifact_storage.root_path / f"{model_name}.onnx"
                with open(onnx_path, "wb") as handle:
                    handle.write(onnx_model.SerializeToString())
                paths["onnx"] = onnx_path
            except Exception:
                pass
        if torch is not None and isinstance(model, torch.nn.Module):
            model.eval()
            example = torch.tensor(X_test.iloc[:1].to_numpy(dtype=np.float32))
            traced = torch.jit.trace(model, example)
            torch_path = self.artifact_storage.root_path / f"{model_name}.pt"
            traced.save(torch_path)
            paths["torchscript"] = torch_path
        if hasattr(model, "save"):
            tf_path = self.artifact_storage.root_path / f"{model_name}_saved_model"
            try:
                model.save(str(tf_path))
                paths["saved_model"] = tf_path
            except Exception:
                pass
        return paths

    def generate_reports(
        self,
        merged_dataset: pd.DataFrame,
        results: list[TrainingResult],
        target_column: str = "label",
    ) -> Path:
        report_html = self.reports_path / "maintix_industrial_report.html"
        self._generate_dataset_statistics(merged_dataset)
        self._generate_performance_plots(merged_dataset, results, target_column)
        self._write_html_report(report_html, merged_dataset, results)
        return report_html

    def _generate_dataset_statistics(self, merged: pd.DataFrame) -> None:
        if merged.empty:
            return
        fig = plt.figure(figsize=(12, 8))
        corr = merged.select_dtypes(include=["number"]).corr()
        sns.heatmap(corr, annot=False, cmap="viridis")
        fig.suptitle("Correlation Matrix")
        fig.tight_layout()
        fig.savefig(self.reports_path / "correlation_matrix.png")
        plt.close(fig)

        numeric = merged.select_dtypes(include=["number"])
        if not numeric.empty:
            fig = plt.figure(figsize=(12, 6))
            ncols = 4
            nrows = max(1, (len(numeric.columns) + ncols - 1) // ncols)
            numeric.hist(bins=30, figsize=(12, nrows * 3), layout=(nrows, ncols))
            fig.suptitle("Feature Distribution")
            fig.tight_layout()
            fig.savefig(self.reports_path / "feature_distribution.png")
            plt.close(fig)

    def _generate_performance_plots(
        self,
        merged: pd.DataFrame,
        results: list[TrainingResult],
        target_column: str,
    ) -> None:
        if not results:
            return
        model_names = [result.model_name for result in results]
        metrics = {name: result.metrics for name, result in zip(model_names, results)}
        if any("accuracy" in res.metrics for res in results):
            fig, ax = plt.subplots(figsize=(10, 5))
            ax.bar(model_names, [res.metrics.get("accuracy", 0.0) for res in results], color="tab:blue")
            ax.set_title("Model Accuracy Comparison")
            ax.set_ylabel("Accuracy")
            ax.set_ylim(0, 1)
            fig.tight_layout()
            fig.savefig(self.reports_path / "accuracy_comparison.png")
            plt.close(fig)
        if any("rmse" in res.metrics for res in results):
            fig, ax = plt.subplots(figsize=(10, 5))
            ax.bar(model_names, [res.metrics.get("rmse", 0.0) for res in results], color="tab:orange")
            ax.set_title("Model RMSE Comparison")
            ax.set_ylabel("RMSE")
            fig.tight_layout()
            fig.savefig(self.reports_path / "rmse_comparison.png")
            plt.close(fig)

    def _write_html_report(self, report_path: Path, merged: pd.DataFrame, results: list[TrainingResult]) -> None:
        metrics_table = "".join(
            f"<tr><td>{res.model_name}</td><td>{res.task_type}</td><td>{json.dumps(res.metrics)}</td><td>{res.inference_time_ms:.1f}</td><td>{res.model_size_bytes}</td></tr>"
            for res in results
        )
        content = f"""
        <html>
            <head>
                <title>Maintix Industrial AI Report</title>
                <style>body{{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;}}table{{width:100%;border-collapse:collapse;margin-bottom:24px;}}th,td{{border:1px solid #334155;padding:10px;text-align:left;}}th{{background:#1e293b;}}</style>
            </head>
            <body>
                <h1>Maintix Industrial AI Pipeline Report</h1>
                <p>Generated {datetime.utcnow().isoformat()}Z</p>
                <h2>Data Summary</h2>
                <p>Datasets merged: {merged["dataset"].nunique() if "dataset" in merged.columns else 0}</p>
                <p>Rows: {len(merged)}</p>
                <p>Numeric features: {len(merged.select_dtypes(include=["number"]).columns)}</p>
                <h2>Model Comparison</h2>
                <table>
                    <thead><tr><th>Model</th><th>Task</th><th>Metrics</th><th>Inference (ms)</th><th>Size (bytes)</th></tr></thead>
                    <tbody>{metrics_table}</tbody>
                </table>
                <h2>Visualizations</h2>
                <div><img src="{Path(self.reports_path / 'correlation_matrix.png').name}" width="900"/></div>
                <div><img src="{Path(self.reports_path / 'feature_distribution.png').name}" width="900"/></div>
                <div><img src="{Path(self.reports_path / 'accuracy_comparison.png').name}" width="900"/></div>
                <div><img src="{Path(self.reports_path / 'rmse_comparison.png').name}" width="900"/></div>
            </body>
        </html>
        """
        report_path.write_text(content)
        for image_name in [
            "correlation_matrix.png",
            "feature_distribution.png",
            "accuracy_comparison.png",
            "rmse_comparison.png",
        ]:
            source = self.reports_path / image_name
            if source.exists():
                shutil.copy(source, self.reports_path / image_name)


if torch is not None and nn is not None:
    class TorchAutoEncoder(nn.Module):
        def __init__(self, input_size: int, latent_dim: int = 32) -> None:
            super().__init__()
            self.encoder = nn.Sequential(
                nn.Linear(input_size, max(latent_dim * 2, 64)),
                nn.ReLU(inplace=True),
                nn.Linear(max(latent_dim * 2, 64), latent_dim),
                nn.ReLU(inplace=True),
            )
            self.decoder = nn.Sequential(
                nn.Linear(latent_dim, max(latent_dim * 2, 64)),
                nn.ReLU(inplace=True),
                nn.Linear(max(latent_dim * 2, 64), input_size),
            )

        def forward(self, x):
            encoded = self.encoder(x)
            return self.decoder(encoded)

        def predict(self, x: np.ndarray) -> np.ndarray:
            self.eval()
            with torch.no_grad():
                tensor = torch.tensor(x, dtype=torch.float32)
                output = self(tensor).cpu().numpy()
            return output

    class TorchCNN(nn.Module):
        def __init__(self, input_channels: int, input_length: int, output_size: int) -> None:
            super().__init__()
            self.network = nn.Sequential(
                nn.Conv1d(input_channels, 16, kernel_size=3, padding=1),
                nn.BatchNorm1d(16),
                nn.ReLU(inplace=True),
                nn.AdaptiveAvgPool1d(1),
                nn.Flatten(),
                nn.Linear(16, output_size),
            )

        def forward(self, x):
            x = x.unsqueeze(1)
            return self.network(x)

    class TorchLSTM(nn.Module):
        def __init__(self, input_size: int, hidden_size: int, output_size: int) -> None:
            super().__init__()
            self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True, num_layers=1, bidirectional=False)
            self.fc = nn.Linear(hidden_size, output_size)

        def forward(self, x):
            x = x.unsqueeze(1)
            x, _ = self.lstm(x)
            return self.fc(x[:, -1, :])
