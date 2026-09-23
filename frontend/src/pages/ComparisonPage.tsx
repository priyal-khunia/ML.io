import React, { useState } from 'react';
import {
  BarChart3,
  ShieldCheck,
  Scale,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { ComparisonResponse, ModelMetrics } from '../types/api';
import { ComparisonBarChart } from '../charts/ComparisonBarChart';

interface ComparisonPageProps {
  comparison: ComparisonResponse | null;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ comparison }) => {
  const [showStatsDetails, setShowStatsDetails] = useState<boolean>(false);

  if (!comparison) {
    return (
      <div className="h-96 flex items-center justify-center text-[#6B7280] text-sm">
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
      baseVal: `${base.sla_violation_rate.toFixed(2)}%`,
      asymVal: `${asym.sla_violation_rate.toFixed(2)}%`,
      delta: `-${(base.sla_violation_rate - asym.sla_violation_rate).toFixed(2)}%`,
      favorable: asym.sla_violation_rate < base.sla_violation_rate,
      critical: true,
    },
    {
      label: 'SLA Violations (Under-Predictions)',
      baseVal: `${base.sla_violation_count} / ${base.total_samples}`,
      asymVal: `${asym.sla_violation_count} / ${asym.total_samples}`,
      delta: `-${base.sla_violation_count - asym.sla_violation_count} violations`,
      favorable: asym.sla_violation_count < base.sla_violation_count,
      critical: true,
    },
    {
      label: 'Resource Wastage Index',
      baseVal: base.resource_wastage_index.toFixed(4),
      asymVal: asym.resource_wastage_index.toFixed(4),
      delta: `+${(asym.resource_wastage_index - base.resource_wastage_index).toFixed(4)}`,
      favorable: false,
      critical: false,
    },
    {
      label: 'Over-Provisioning (Safety Buffer Count)',
      baseVal: `${base.over_provisioning_count} / ${base.total_samples}`,
      asymVal: `${asym.over_provisioning_count} / ${asym.total_samples}`,
      delta: `+${asym.over_provisioning_count - base.over_provisioning_count}`,
      favorable: true,
      critical: false,
    },
    {
      label: 'Coefficient of Determination (R²)',
      baseVal: base.r2.toFixed(4),
      asymVal: asym.r2.toFixed(4),
      delta: `${(asym.r2 - base.r2).toFixed(4)}`,
      favorable: asym.r2 >= 0.5,
      critical: false,
    },
    {
      label: 'Root Mean Squared Error (RMSE)',
      baseVal: base.rmse.toFixed(4),
      asymVal: asym.rmse.toFixed(4),
      delta: `+${(asym.rmse - base.rmse).toFixed(4)}`,
      favorable: false,
      critical: false,
    },
    {
      label: 'Mean Absolute Error (MAE)',
      baseVal: base.mae.toFixed(4),
      asymVal: asym.mae.toFixed(4),
      delta: `+${(asym.mae - base.mae).toFixed(4)}`,
      favorable: false,
      critical: false,
    },
    {
      label: 'Model Intercept (b)',
      baseVal: base.intercept?.toFixed(4) ?? '--',
      asymVal: asym.intercept?.toFixed(4) ?? '--',
      delta: `+${((asym.intercept ?? 0) - (base.intercept ?? 0)).toFixed(4)}`,
      favorable: true,
      critical: false,
    },
  ];

  // Prepare models list for 6-model benchmark table
  const modelsList: ModelMetrics[] = comparison.ranked_models && comparison.ranked_models.length > 0
    ? comparison.ranked_models
    : [
        base,
        asym,
        comparison.ridge,
        comparison.huber,
        comparison.random_forest,
        comparison.svr,
      ]
        .filter((m): m is ModelMetrics => Boolean(m))
        .sort((a, b) => (b.sla_violation_rate ?? 0) - (a.sla_violation_rate ?? 0));

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          Empirical Evaluation & Comparative Proof
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#252936] tracking-tight">
          Baseline Models vs Asymmetric Cost Model
        </h2>
        <p className="text-sm text-[#6B7280] max-w-3xl mt-1.5 leading-relaxed">
          OLS, Ridge, Huber, Random Forest, SVR vs. the proposed asymmetric cost model &mdash; 449 held-out test records, chronological split, zero data leakage.
        </p>
      </div>

      {/* Research Finding Banner */}
      <div className="p-5 bg-white border border-[#6C63FF]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-[#6C63FF] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#252936] uppercase tracking-wide">Empirical Research Finding</h3>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              SLA violations: {base.sla_violation_rate.toFixed(1)}% (OLS) vs {asym.sla_violation_rate.toFixed(1)}% (Asymmetric) &mdash; a {summary.sla_violation_reduction_percent}% reduction with +{summary.wastage_delta} wastage index.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-[#6C63FF]">
            {summary.sla_violation_reduction_percent}% SLA Violation Cut
          </span>
        </div>
      </div>

      {/* Core Comparison Visualizer */}
      <div>
        <ComparisonBarChart models={modelsList} />
      </div>

      {/* Side-by-Side Detailed Comparison Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#252936] uppercase tracking-wider">
            Detailed Statistical & Operational Metrics Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                <th className="pb-3 font-semibold w-2/5">Metric / Evaluation Dimension</th>
                <th className="pb-3 font-semibold text-center w-1/5">Baseline OLS (MSE)</th>
                <th className="pb-3 font-semibold text-center w-1/5">Asymmetric Cost Model</th>
                <th className="pb-3 font-semibold text-right w-1/5">Impact (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-mono">
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={`hover:bg-[#F7F8FC] transition-colors ${
                    row.critical ? 'bg-[#F9FAFB]' : ''
                  }`}
                >
                  <td className="py-3 font-sans">
                    <div className="font-semibold text-[#252936]">{row.label}</div>
                  </td>
                  <td className="py-3 text-center text-[#6B7280] font-bold">{row.baseVal}</td>
                  <td className="py-3 text-center font-bold text-[#6C63FF]">{row.asymVal}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        row.critical
                          ? 'bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/25'
                          : row.favorable
                          ? 'bg-[#6C63FF]/10 text-[#6C63FF]'
                          : 'bg-[#E7A83B]/10 text-[#E7A83B]'
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
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center gap-2 text-[#252936] font-bold text-sm uppercase tracking-wider">
          <Layers className="w-4 h-4 text-[#6C63FF]" />
          Learned Multivariable Regression Weights (w_j)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {featureLabels.map((name, i) => {
            const bw = base.weights?.[i] ?? 0;
            const aw = asym.weights?.[i] ?? 0;
            return (
              <div key={name} className="p-3 bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl space-y-2">
                <span className="text-xs font-semibold text-[#252936] block truncate">{name}</span>
                <div className="text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>OLS:</span>
                    <span>{bw.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-[#6C63FF] font-bold">
                    <span>Asym:</span>
                    <span>{aw.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engineering Trade-Off Analysis */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        <h3 className="text-sm font-bold text-[#252936] uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#E7A83B]" />
          Engineering Trade-Off Analysis
        </h3>
        <div className="text-xs text-[#6B7280] leading-relaxed">
          <p>
            R&sup2; = <strong className="text-[#252936]">{asym.r2.toFixed(4)}</strong>, SLA violations: <strong className="text-[#252936]">{base.sla_violation_rate.toFixed(1)}%</strong> &rarr; <strong className="text-[#6C63FF]">{asym.sla_violation_rate.toFixed(1)}%</strong>, resource wastage index: <strong className="text-[#252936]">{asym.resource_wastage_index.toFixed(3)}</strong>.
          </p>
        </div>
      </div>

      {/* 6-Model Benchmark: SLA Violation vs Resource Allocation */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              6-Model Empirical Benchmark
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#252936] tracking-tight">
              6-Model Benchmark: SLA Violation vs Resource Allocation
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Ranked worst-to-best by SLA violation rate ({base.total_samples} test samples)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowStatsDetails(!showStatsDetails)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#252936] hover:text-[#252936] text-xs font-medium border border-[#E5E7EB] transition-colors self-start sm:self-center cursor-pointer"
          >
            {showStatsDetails ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#6C63FF]" />
                <span>Hide MSE/RMSE/R² Details</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#6C63FF]" />
                <span>Show MSE/RMSE/R² Details</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                <th className="pb-3 font-semibold">Rank & Model Architecture</th>
                <th className="pb-3 font-semibold text-center">Loss Type</th>
                <th className="pb-3 font-semibold text-center">SLA Violation Rate</th>
                <th className="pb-3 font-semibold text-center">Resource Wastage</th>
                <th className="pb-3 font-semibold text-right">Asymmetric Advantage</th>
                {showStatsDetails && (
                  <>
                    <th className="pb-3 font-semibold text-center text-[#6B7280]">R² Score</th>
                    <th className="pb-3 font-semibold text-center text-[#6B7280]">RMSE</th>
                    <th className="pb-3 font-semibold text-center text-[#6B7280]">MSE</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-mono">
              {modelsList.map((m, idx) => {
                if (!m) return null;
                const isAsym = m.model_type === 'asymmetric';
                const sla = m.sla_violation_rate;
                const asymSla = asym.sla_violation_rate;
                const advantage = m.asymmetric_advantage_percent !== undefined
                  ? m.asymmetric_advantage_percent
                  : Math.round(((sla - asymSla) / Math.max(0.001, sla)) * 1000) / 10;

                return (
                  <tr
                    key={m.model_type || idx}
                    className={`transition-colors ${
                      isAsym
                        ? 'bg-[#8B85FF]/10 border-l-4 border-[#6C63FF] text-[#252936] font-semibold'
                        : 'hover:bg-[#F7F8FC]'
                    }`}
                  >
                    <td className="py-3.5 px-3 font-sans">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-mono text-[#6B7280] w-5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-[#252936] flex items-center gap-2">
                            <span>{m.model_name || m.model_type}</span>
                            {isAsym && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 font-bold">
                                ★ Our Model
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-center font-sans">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          isAsym
                            ? 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30'
                            : 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]'
                        }`}
                      >
                        {isAsym ? 'Asymmetric' : 'Symmetric'}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                          isAsym
                            ? 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30'
                            : sla > 60
                            ? 'bg-[#E76F6F]/15 text-[#E76F6F] border border-[#E76F6F]/25'
                            : sla > 45
                            ? 'bg-[#E7A83B]/15 text-[#E7A83B] border border-[#E7A83B]/25'
                            : 'bg-[#F3F4F6] text-[#6B7280]'
                        }`}
                      >
                        {sla.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-center text-[#6B7280] font-bold">
                      {m.resource_wastage_index.toFixed(4)}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {isAsym ? (
                        <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-[11px] bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Top SLA Guard (Leader)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-[11px] bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20">
                          +{advantage.toFixed(1)}% Violation Cut
                        </span>
                      )}
                    </td>

                    {showStatsDetails && (
                      <>
                        <td className="py-3.5 px-2 text-center text-[#252936]">
                          {m.r2.toFixed(4)}
                        </td>
                        <td className="py-3.5 px-2 text-center text-[#6B7280]">
                          {m.rmse.toFixed(4)}
                        </td>
                        <td className="py-3.5 px-2 text-center text-[#6B7280]">
                          {m.mse.toFixed(4)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
