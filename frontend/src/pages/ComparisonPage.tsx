import React from 'react';
import {
  BarChart3,
  ShieldCheck,
  TrendingDown,
  Scale,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ComparisonResponse } from '../types/api';
import { ComparisonBarChart } from '../charts/ComparisonBarChart';

interface ComparisonPageProps {
  comparison: ComparisonResponse | null;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ comparison }) => {
  if (!comparison) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm">
        Loading model comparison data from backend...
      </div>
    );
  }

  const base = comparison.baseline;
  const asym = comparison.asymmetric;
  const summary = comparison.comparison_summary;

  const featureLabels = [
    'CPU Util %',
    'Memory Util %',
    'Net In (MB/s)',
    'Net Out (MB/s)',
    'Disk I/O %',
  ];

  const rows = [
    {
      label: 'SLA Violation Rate',
      desc: 'Percentage of test samples where capacity was under-provisioned',
      baseVal: `${base.sla_violation_rate.toFixed(2)}%`,
      asymVal: `${asym.sla_violation_rate.toFixed(2)}%`,
      delta: `-${(base.sla_violation_rate - asym.sla_violation_rate).toFixed(2)}%`,
      favorable: asym.sla_violation_rate < base.sla_violation_rate,
      critical: true,
    },
    {
      label: 'SLA Violations (Under-Predictions)',
      desc: `Count of dangerous under-provisioned intervals out of ${base.total_samples} test intervals`,
      baseVal: `${base.sla_violation_count} / ${base.total_samples}`,
      asymVal: `${asym.sla_violation_count} / ${asym.total_samples}`,
      delta: `-${base.sla_violation_count - asym.sla_violation_count} violations`,
      favorable: asym.sla_violation_count < base.sla_violation_count,
      critical: true,
    },
    {
      label: 'Resource Wastage Index',
      desc: 'Mean excess capacity units provisioned above actual demand',
      baseVal: base.resource_wastage_index.toFixed(4),
      asymVal: asym.resource_wastage_index.toFixed(4),
      delta: `+${(asym.resource_wastage_index - base.resource_wastage_index).toFixed(4)}`,
      favorable: false,
      critical: false,
    },
    {
      label: 'Over-Provisioning (Safety Buffer Count)',
      desc: 'Count of intervals with surplus safety capacity',
      baseVal: `${base.over_provisioning_count} / ${base.total_samples}`,
      asymVal: `${asym.over_provisioning_count} / ${asym.total_samples}`,
      delta: `+${asym.over_provisioning_count - base.over_provisioning_count}`,
      favorable: true,
      critical: false,
    },
    {
      label: 'Coefficient of Determination (R²)',
      desc: 'Proportion of true target variance explained by learned weights',
      baseVal: base.r2.toFixed(4),
      asymVal: asym.r2.toFixed(4),
      delta: `${(asym.r2 - base.r2).toFixed(4)}`,
      favorable: asym.r2 >= 0.5,
      critical: false,
    },
    {
      label: 'Root Mean Squared Error (RMSE)',
      desc: 'Standard error deviation in capacity percentage units',
      baseVal: base.rmse.toFixed(4),
      asymVal: asym.rmse.toFixed(4),
      delta: `+${(asym.rmse - base.rmse).toFixed(4)}`,
      favorable: false,
      critical: false,
    },
    {
      label: 'Mean Absolute Error (MAE)',
      desc: 'Average magnitude of errors without directionality',
      baseVal: base.mae.toFixed(4),
      asymVal: asym.mae.toFixed(4),
      delta: `+${(asym.mae - base.mae).toFixed(4)}`,
      favorable: false,
      critical: false,
    },
    {
      label: 'Model Intercept (b)',
      desc: 'Constant capacity offset learned by regression',
      baseVal: base.intercept?.toFixed(4) ?? '--',
      asymVal: asym.intercept?.toFixed(4) ?? '--',
      delta: `+${((asym.intercept ?? 0) - (base.intercept ?? 0)).toFixed(4)}`,
      favorable: true,
      critical: false,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          Empirical Evaluation & Comparative Proof
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Baseline OLS Regression vs Asymmetric Cost Model
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
          Rigorous comparison computed on the held-out 20% chronological test dataset ({base.total_samples} observations).
          All values reflect genuine model inferences on real cloud cluster telemetry.
        </p>
      </div>

      {/* Research Finding Banner */}
      <div className="p-5 bg-dark-900 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Empirical Research Finding</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {summary.conclusion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            {summary.sla_violation_reduction_percent}% SLA Violation Cut
          </span>
        </div>
      </div>

      {/* Core Comparison Visualizer */}
      <div>
        <ComparisonBarChart baseline={base} asymmetric={asym} />
      </div>

      {/* Side-by-Side Detailed Comparison Table */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Detailed Statistical & Operational Metrics Breakdown
          </h3>
          <p className="text-xs text-slate-400">
            Direct comparison on {base.total_samples} chronological test records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dark-700 text-slate-400">
                <th className="pb-3 font-semibold w-2/5">Metric / Evaluation Dimension</th>
                <th className="pb-3 font-semibold text-center w-1/5">Baseline OLS (MSE)</th>
                <th className="pb-3 font-semibold text-center w-1/5">Asymmetric Cost Model</th>
                <th className="pb-3 font-semibold text-right w-1/5">Impact (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/60 font-mono">
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={`hover:bg-dark-850/50 transition-colors ${
                    row.critical ? 'bg-dark-850/30' : ''
                  }`}
                >
                  <td className="py-3 font-sans">
                    <div className="font-semibold text-slate-200">{row.label}</div>
                    <div className="text-[11px] text-slate-400">{row.desc}</div>
                  </td>
                  <td className="py-3 text-center text-slate-300 font-bold">{row.baseVal}</td>
                  <td className="py-3 text-center font-bold text-emerald-400">{row.asymVal}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        row.critical
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : row.favorable
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {row.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Weights Comparison */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
          <Layers className="w-4 h-4 text-emerald-400" />
          Learned Multivariable Regression Weights (w_j)
        </div>
        <p className="text-xs text-slate-400">
          Normalized coefficients assigned to each standardized cloud telemetry feature
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {featureLabels.map((name, i) => {
            const bw = base.weights?.[i] ?? 0;
            const aw = asym.weights?.[i] ?? 0;
            return (
              <div key={name} className="p-3 bg-dark-950 border border-dark-700 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-slate-300 block truncate">{name}</span>
                <div className="text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>OLS:</span>
                    <span>{bw.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Asym:</span>
                    <span>{aw.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic Trade-Off Analysis */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          Engineering Trade-Off Analysis
        </h3>
        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            In conventional machine learning benchmarks, models are evaluated purely on Mean Squared Error (MSE).
            However, MSE assumes an under-prediction of 5% (allocating 80% when 85% is needed) has the exact same operational cost as an over-prediction of 5% (allocating 90% when 85% is needed).
          </p>
          <p>
            In production cloud operations, this symmetry is catastrophic. Under-prediction leads directly to CPU throttling,
            packet dropouts, service downtime, and severe contractual SLA penalties. In contrast, over-prediction
            merely consumes idle hypervisor cycles costing fractions of a cent.
          </p>
          <p>
            At our calibrated setting (<strong>&alpha; = 1.0, &beta; = 0.7, &gamma; = 0.5</strong>), gradient descent balances genuine multivariable feature extraction (<strong>R&sup2; = {asym.r2.toFixed(4)}</strong>) with aggressive SLA protection, reducing SLA violation rates from <strong>{base.sla_violation_rate.toFixed(1)}%</strong> down to <strong>{asym.sla_violation_rate.toFixed(1)}%</strong> with an optimal resource wastage index of <strong>{asym.resource_wastage_index.toFixed(3)}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
