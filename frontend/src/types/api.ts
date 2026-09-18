export interface ModelMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
  sla_violation_rate: number;
  sla_violation_count: number;
  sla_severity: number;
  resource_wastage_index: number;
  over_provisioning_rate: number;
  over_provisioning_count: number;
  total_samples: number;
  model_name?: string;
  model_type?: string;
  weights?: number[];
  intercept?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  learning_rate?: number;
  epochs?: number;
}

export interface TrainingLossPoint {
  epoch: number;
  loss: number;
  bias: number;
  max_weight_grad: number;
}

export interface ComparisonResponse {
  baseline: ModelMetrics;
  asymmetric: ModelMetrics;
  comparison_summary: {
    sla_violation_reduction_points: number;
    sla_violation_reduction_percent: number;
    wastage_delta: number;
    mse_delta: number;
    conclusion: string;
  };
  training_loss_history: TrainingLossPoint[];
  feature_names: string[];
}

export interface PredictRequest {
  cpu_util_percent: number;
  mem_util_percent: number;
  net_in: number;
  net_out: number;
  disk_io_percent: number;
  current_capacity?: number;
}

export interface PredictResponse {
  prediction_id: number;
  predicted_resource: number;
  scaling_action: 'SCALE_UP' | 'MAINTAIN' | 'SCALE_DOWN';
  provisioning_status: string;
  model: string;
  baseline_predicted_resource: number;
  asymmetric_safety_headroom: number;
  confidence_score: number;
  rationale: string;
  inputs: Record<string, number>;
}

export interface TrainRequest {
  alpha: number;
  beta: number;
  gamma: number;
  learning_rate: number;
  epochs: number;
}

export interface DatasetFeatureStat {
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
}

export interface DatasetSummary {
  total_records: number;
  feature_names: string[];
  target_name: string;
  train_records: number;
  test_records: number;
  split_ratio: string;
  feature_statistics: Record<string, DatasetFeatureStat>;
  preview: Array<Record<string, number | string>>;
}

export interface PredictionLog {
  id: number;
  timestamp: string;
  cpu_util_percent: number;
  mem_util_percent: number;
  net_in: number;
  net_out: number;
  disk_io_percent: number;
  predicted_resource: number;
  actual_target?: number;
  scaling_action: string;
  provisioning_status: string;
  model_type: string;
  rationale?: string;
}
