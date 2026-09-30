export interface ModelMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
  accuracy?: number;
  sla_compliance_accuracy?: number;
  forecast_accuracy?: number;
  operational_accuracy?: number;
  sla_violation_rate: number;
  sla_violation_count: number;
  sla_severity: number;
  resource_wastage_index: number;
  over_provisioning_rate: number;
  over_provisioning_count: number;
  total_samples: number;
  model_name?: string;
  model_type?: string;
  loss_type?: 'symmetric' | 'asymmetric' | string;
  asymmetric_advantage_percent?: number;
  accuracy_advantage_points?: number;
  accuracy_boost_percent?: number;
  weights?: number[];
  intercept?: number;
  feature_importances?: number[];
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
  ridge?: ModelMetrics;
  huber?: ModelMetrics;
  quantile?: ModelMetrics;
  expectile?: ModelMetrics;
  random_forest?: ModelMetrics;
  svr?: ModelMetrics;
  all_models?: ModelMetrics[];
  ranked_models?: ModelMetrics[];
  comparison_summary: {
    sla_violation_reduction_points: number;
    sla_violation_reduction_percent: number;
    accuracy_advantage_points?: number;
    accuracy_improvement_percent?: number;
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

export interface NoveltyPillar {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  formula?: string;
  key_points: string[];
}

export interface NoveltyResponse {
  title: string;
  core_contributions: NoveltyPillar[];
}

export interface CodeSnippet {
  id: string;
  title: string;
  file: string;
  lines: string;
  summary: string;
  code: string;
}

export interface CodeProofScenario {
  name: string;
  error: number;
  description: string;
  asymmetric: {
    loss: number;
    gradient: number;
    behavior: string;
  };
  symmetric_mse: {
    loss: number;
    gradient: number;
    behavior: string;
  };
  pinball_quantile: {
    loss: number;
    gradient: number;
    behavior: string;
  };
}

export interface CodeProofResponse {
  title: string;
  subtitle: string;
  gradient_verification: {
    status: string;
    method: string;
    epsilon: number;
    max_gradient_difference: number;
    passed: boolean;
    verdict: string;
  };
  model_parameters: {
    alpha: number;
    beta: number;
    gamma: number;
    clip_exp: number;
    learned_bias: number;
    weights: number[];
  };
  scenarios: CodeProofScenario[];
  source_snippets: CodeSnippet[];
}

export interface CodeSimulationResponse {
  error: number;
  is_under_prediction: boolean;
  proposed_asymmetric: {
    loss: number;
    gradient: number;
    formula: string;
  };
  symmetric_mse: {
    loss: number;
    gradient: number;
    formula: string;
  };
  pinball_quantile: {
    loss: number;
    gradient: number;
    formula: string;
  };
}
