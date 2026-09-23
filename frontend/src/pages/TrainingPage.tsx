import React, { useState } from 'react';
import {
  BrainCircuit,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  AlertCircle,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { LossChart } from '../charts/LossChart';
import { ComparisonResponse, TrainRequest } from '../types/api';
import { postTrain } from '../services/api';

interface TrainingPageProps {
  comparison: ComparisonResponse | null;
  onTrainingSuccess: (newComparison: ComparisonResponse) => void;
}

export const TrainingPage: React.FC<TrainingPageProps> = ({
  comparison,
  onTrainingSuccess,
}) => {
  const [params, setParams] = useState<TrainRequest>({
    alpha: comparison?.asymmetric?.alpha ?? 1.0,
    beta: comparison?.asymmetric?.beta ?? 0.7,
    gamma: comparison?.asymmetric?.gamma ?? 0.5,
    learning_rate: comparison?.asymmetric?.learning_rate ?? 0.005,
    epochs: comparison?.asymmetric?.epochs ?? 400,
  });

  const [isTraining, setIsTraining] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      name: 'Default Balanced',
      desc: 'Optimal balance between SLA safety and true feature learning (R² = 0.53, 32.5% SLA violations)',
      values: { alpha: 1.0, beta: 0.7, gamma: 0.5, learning_rate: 0.005, epochs: 400 },
    },
    {
      name: 'Ultra High SLA Guard',
      desc: 'High exponential penalty; slashes SLA violations below 10%',
      values: { alpha: 1.5, beta: 1.8, gamma: 0.4, learning_rate: 0.005, epochs: 500 },
    },
    {
      name: 'Cost Conservation',
      desc: 'Higher weight on wastage penalty; tighter resource margins',
      values: { alpha: 0.6, beta: 0.8, gamma: 0.8, learning_rate: 0.005, epochs: 350 },
    },
  ];

  const handleTrain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTraining(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await postTrain(params);
      setSuccessMsg(res.message);
      onTrainingSuccess(res.results);
    } catch (err: any) {
      setErrorMsg(err.message || 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const lossHistory = comparison?.training_loss_history ?? [];
  const asym = comparison?.asymmetric;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BrainCircuit className="w-4 h-4" />
          Mathematical Optimization Engine
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Custom Gradient Descent Training Lab
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl mt-1">
          Configure cost hyperparameters and run gradient descent optimization across 1,793 chronological training samples.
        </p>
      </div>

      {/* Preset Profiles */}
      <div>
        <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-2.5">
          Hyperparameter Configuration Presets:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setParams(preset.values)}
              className="text-left p-3.5 rounded-xl bg-dark-900 border border-dark-700 hover:border-emerald-500/50 hover:bg-dark-850 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-dark-100 group-hover:text-emerald-400">
                  {preset.name}
                </span>
                <span className="text-[10px] font-mono text-dark-400">
                  α={preset.values.alpha}, β={preset.values.beta}
                </span>
              </div>
              <p className="text-[11px] text-dark-400 mt-1">
                {preset.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hyperparameter Form */}
        <div className="lg:col-span-5 bg-dark-900/90 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-700">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Asymmetric Cost Hyperparameters
            </h3>
            <span className="text-xs font-mono text-accent-emerald bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active Status
            </span>
          </div>

          <form onSubmit={handleTrain} className="space-y-5">
            {/* Alpha (Under-prediction scale) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-dark-200">
                  Alpha (α) — Under-prediction Scale Factor
                </label>
                <span className="font-mono text-emerald-400 font-bold">{params.alpha}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={params.alpha}
                onChange={(e) => setParams({ ...params, alpha: parseFloat(e.target.value) || 0.1 })}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-dark-400">
                Magnifies the overall scale of under-provisioning penalty.
              </p>
            </div>

            {/* Beta (Exponential sensitivity) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-dark-200">
                  Beta (β) — Exponential SLA Sensitivity
                </label>
                <span className="font-mono text-rose-400 font-bold">{params.beta}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={params.beta}
                onChange={(e) => setParams({ ...params, beta: parseFloat(e.target.value) || 0.2 })}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[10px] text-dark-400">
                Controls how aggressively penalty increases as deficit grows: $e^{`\\beta |e|`}$.
              </p>
            </div>

            {/* Gamma (Linear over-prediction weight) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-dark-200">
                  Gamma (γ) — Over-prediction Wastage Weight
                </label>
                <span className="font-mono text-amber-400 font-bold">{params.gamma}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={params.gamma}
                onChange={(e) => setParams({ ...params, gamma: parseFloat(e.target.value) || 0.1 })}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[10px] text-dark-400">
                Linear penalty weight on unused cloud headroom: $\gamma |e|$.
              </p>
            </div>

            {/* Learning Rate & Epochs */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-700">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-200">
                  Learning Rate (η)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.0001"
                  max="0.1"
                  value={params.learning_rate}
                  onChange={(e) => setParams({ ...params, learning_rate: parseFloat(e.target.value) || 0.005 })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-200">
                  Epochs
                </label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  max="2000"
                  value={params.epochs}
                  onChange={(e) => setParams({ ...params, epochs: parseInt(e.target.value, 10) || 100 })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Train Button */}
            <button
              type="submit"
              disabled={isTraining}
              id="train-btn"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent-emerald hover:bg-emerald-600 text-dark-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Running Gradient Descent Optimization...' : 'TRAIN ASYMMETRIC MODEL'}</span>
            </button>
          </form>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Training Loss Curve & Convergence Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-900/90 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-700">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Empirical Training Loss Trajectory
              </h3>
            </div>

            <LossChart data={lossHistory} />
          </div>

          {/* Test Performance After Training */}
          {asym && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-dark-900/90 border border-dark-700 rounded-xl">
                <span className="text-xs text-dark-400 block mb-1">Test SLA Violations</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {asym.sla_violation_rate.toFixed(2)}%
                </span>
                <span className="text-[10px] text-dark-400 block mt-0.5">
                  ({asym.sla_violation_count} / {asym.total_samples} intervals)
                </span>
              </div>

              <div className="p-4 bg-dark-900/90 border border-dark-700 rounded-xl">
                <span className="text-xs text-dark-400 block mb-1">Resource Wastage</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {asym.resource_wastage_index.toFixed(3)}
                </span>
                <span className="text-[10px] text-dark-400 block mt-0.5">
                  Average excess units
                </span>
              </div>

              <div className="p-4 bg-dark-900/90 border border-dark-700 rounded-xl">
                <span className="text-xs text-dark-400 block mb-1">Model Intercept ($b$)</span>
                <span className="text-xl font-bold font-mono text-white">
                  {asym.intercept?.toFixed(2) ?? '--'}
                </span>
                <span className="text-[10px] text-dark-400 block mt-0.5">
                  Learned safety offset
                </span>
              </div>

              <div className="p-4 bg-dark-900/90 border border-dark-700 rounded-xl">
                <span className="text-xs text-dark-400 block mb-1">Test Set MSE</span>
                <span className="text-xl font-bold font-mono text-dark-200">
                  {asym.mse.toFixed(3)}
                </span>
                <span className="text-[10px] text-dark-400 block mt-0.5">
                  RMSE: {asym.rmse.toFixed(3)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
