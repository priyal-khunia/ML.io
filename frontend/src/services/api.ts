import {
  ComparisonResponse,
  DatasetSummary,
  PredictRequest,
  PredictResponse,
  TrainRequest,
  PredictionLog,
} from '../types/api';

const API_BASE_URL = 'http://127.0.0.1:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // fallback to status text
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function fetchHealth(): Promise<{ status: string; models_initialized: boolean }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(res);
}

export async function fetchDatasetSummary(): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE_URL}/dataset-summary`);
  return handleResponse(res);
}

export async function fetchComparison(): Promise<ComparisonResponse> {
  const res = await fetch(`${API_BASE_URL}/comparison`);
  return handleResponse(res);
}

export async function postPredict(data: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function postTrain(data: TrainRequest): Promise<{ status: string; message: string; results: ComparisonResponse }> {
  const res = await fetch(`${API_BASE_URL}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function fetchPredictionLogs(): Promise<PredictionLog[]> {
  const res = await fetch(`${API_BASE_URL}/predictions-log`);
  return handleResponse(res);
}

export async function clearPredictionLogs(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/predictions-log`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function addDatasetRow(data: {
  cpu_util_percent: number;
  mem_util_percent: number;
  net_in: number;
  net_out: number;
  disk_io_percent: number;
  required_resource_next_5min?: number;
  scaling_action?: string;
}): Promise<{ status: string; message: string; summary: DatasetSummary }> {
  const res = await fetch(`${API_BASE_URL}/dataset/add-row`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
