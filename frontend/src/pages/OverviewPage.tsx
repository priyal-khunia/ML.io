import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  ShieldCheck,
  TrendingDown,
  Server,
  ArrowRight,
  Database,
  RefreshCw,
  Trash2,
  Layers,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { NoveltySection } from '../components/NoveltySection';
import { ComparisonResponse, PredictionLog } from '../types/api';
import { fetchPredictionLogs, clearPredictionLogs } from '../services/api';

interface OverviewPageProps {
  comparison: ComparisonResponse | null;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  comparison,
  onNavigate,
  onRefresh,
  isLoading,
}) => {
  const [recentLogs, setRecentLogs] = useState<PredictionLog[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchPredictionLogs()
      .then((logs) => {
        setRecentLogs(logs);
      })
      .catch(() => {});
  }, []);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await clearPredictionLogs();
      setRecentLogs([]);
    } catch {
      // silently handle
    } finally {
      setClearing(false);
    }
  };

  const base = comparison?.baseline;
  const asym = comparison?.asymmetric;

  const latest = recentLogs.length > 0 ? recentLogs[0] : null;
  const currentCpu = latest ? latest.cpu_util_percent.toFixed(1) : '--';
  const currentMem = latest ? latest.mem_util_percent.toFixed(1) : '--';
  const currentDisk = latest ? latest.disk_io_percent.toFixed(1) : '--';

  const predictedResource = latest ? latest.predicted_resource.toFixed(1) : '--';
  const scalingAction = latest ? latest.scaling_action : null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Banner / Technical Engineering Summary */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Predictive Cloud Infrastructure Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Asymmetric Cost-Weighted Multivariable Regression
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
              Analytical gradient descent engine penalizing under-provisioning deficits exponentially
              for proactive 5-minute cloud capacity forecasting. Guarantees SLA compliance under asymmetric utility penalties.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('simulation')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <span>Test Live Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-medium border border-[#CBD5E1] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Telemetry & Live Inference KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Cluster Telemetry & Predicted Demand
          </h3>
          <span className="text-xs text-[#64748B] font-mono">
            Forecast Horizon: +5 Minutes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Current CPU"
            value={currentCpu}
            unit={latest ? "%" : ""}
            subtitle={latest ? "Host CPU load" : "Awaiting telemetry stream"}
            icon={Cpu}
            accentColor="cyan"
            badge={latest ? "Telemetry" : "No Data"}
          />

          <MetricCard
            title="Current Memory"
            value={currentMem}
            unit={latest ? "%" : ""}
            subtitle={latest ? "Active RAM utilization" : "Awaiting telemetry stream"}
            icon={Activity}
            accentColor="emerald"
            badge={latest ? "Active Load" : "No Data"}
          />

          <MetricCard
            title="Current Disk I/O"
            value={currentDisk}
            unit={latest ? "%" : ""}
            subtitle={latest ? "I/O channel utilization" : "Awaiting telemetry stream"}
            icon={HardDrive}
            accentColor="slate"
            badge={latest ? "Telemetry" : "No Data"}
          />

          <div className="relative group bg-white border border-blue-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
                Predicted Demand (+5m)
              </span>
              <Server className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-bold tracking-tight text-[#0F172A] font-mono">
                {predictedResource}
              </span>
              {latest && <span className="text-sm font-medium text-blue-600">%</span>}
            </div>
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#F1F5F9]">
              <span className="text-xs text-[#64748B] truncate">Scaling Action:</span>
              {scalingAction ? (
                <StatusBadge action={scalingAction} size="sm" />
              ) : (
                <span className="text-[11px] text-[#64748B] italic">No forecast yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row: SLA Violation Rate, Wastage Index, R2, Decision Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Scaling Recommendation"
          value={scalingAction ? scalingAction.replace('_', ' ') : '--'}
          subtitle={latest ? 'Model decision' : 'Awaiting simulation run'}
          icon={Activity}
          accentColor={scalingAction === 'SCALE_UP' ? 'rose' : scalingAction === 'SCALE_DOWN' ? 'cyan' : 'emerald'}
          badge={latest ? "Advisory Action" : "Standby"}
        />

        <MetricCard
          title="SLA Violation Rate"
          value={asym ? `${asym.sla_violation_rate.toFixed(1)}` : '--'}
          unit="%"
          subtitle={base ? `Baseline OLS: ${base.sla_violation_rate.toFixed(1)}%` : 'Test evaluation'}
          icon={ShieldCheck}
          accentColor="emerald"
          badge={
            base && asym
              ? `-${(base.sla_violation_rate - asym.sla_violation_rate).toFixed(1)}% vs OLS`
              : 'SLA Guard'
          }
          badgeColor="emerald"
        />

        <MetricCard
          title="Resource Wastage Index"
          value={asym ? `${asym.resource_wastage_index.toFixed(3)}` : '--'}
          subtitle={base ? `Baseline OLS: ${base.resource_wastage_index.toFixed(3)}` : 'Excess margin'}
          icon={TrendingDown}
          accentColor="amber"
          badge="Controlled Headroom"
          badgeColor="amber"
        />

        <MetricCard
          title="Model R² Score"
          value={asym ? `${asym.r2.toFixed(3)}` : '--'}
          subtitle="Feature variance learned"
          icon={Database}
          accentColor="blue"
          badge={asym && asym.r2 >= 0.5 ? "Good Fit" : "Calibrated"}
          badgeColor="blue"
        />
      </div>

      {/* Core Technical Novelty & Mathematical Foundations */}
      <NoveltySection />

      {/* Recent Predictions Log Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Recent Prediction & Scaling History (SQLite)
            </h4>
          </div>
          <div className="flex items-center gap-3">
            {recentLogs.length > 0 && (
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearing ? 'Clearing...' : 'Clear All History'}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('simulation')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Run New Prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">CPU %</th>
                <th className="pb-3 font-semibold">Mem %</th>
                <th className="pb-3 font-semibold">Net In / Out</th>
                <th className="pb-3 font-semibold">Predicted +5m</th>
                <th className="pb-3 font-semibold">Scaling Action</th>
                <th className="pb-3 font-semibold">Provisioning Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-mono">
              {recentLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 text-[#64748B] font-sans">{log.timestamp}</td>
                  <td className="py-2.5 text-[#0F172A]">{log.cpu_util_percent.toFixed(1)}%</td>
                  <td className="py-2.5 text-[#0F172A]">{log.mem_util_percent.toFixed(1)}%</td>
                  <td className="py-2.5 text-[#64748B]">
                    {log.net_in.toFixed(1)} / {log.net_out.toFixed(1)}
                  </td>
                  <td className="py-2.5 font-bold text-blue-600">
                    {log.predicted_resource.toFixed(1)}%
                  </td>
                  <td className="py-2.5">
                    <StatusBadge action={log.scaling_action} size="sm" />
                  </td>
                  <td className="py-2.5 text-[#64748B] text-[11px] font-sans">
                    {log.provisioning_status}
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B] font-sans">
                    No predictions recorded yet. Test a workload in the Decision Simulation tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Feature Comparison Table ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Layers className="w-4 h-4" />
            <span>Feature Comparison</span>
          </div>
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            Feature Comparison: What Each Model Is Built To Do
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Not a ranking by score — a comparison of design capabilities.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B]">
                <th className="px-5 py-3 font-semibold text-left w-40">Feature</th>
                <th className="px-4 py-3 font-semibold text-left border-l-2 border-emerald-300 text-emerald-700 w-1/2">
                  Asymmetric Model
                </th>
                <th className="px-4 py-3 font-semibold text-left text-[#64748B] w-1/2">
                  Other 5 Models (OLS, Ridge, Huber, Random Forest, SVR)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {[
                {
                  feature: 'Loss function direction',
                  asym: 'Penalizes under-prediction exponentially harder than over-prediction',
                  others: 'Penalize both directions equally (symmetric MSE, Huber loss, or epsilon-insensitive loss)',
                },
                {
                  feature: 'Risk tuning',
                  asym: 'Has α, β, γ — lets you directly control how aggressively to avoid outages vs. save resources',
                  others: "Fixed regularization/kernel settings (e.g. Ridge's alpha, SVR's C) — none represent cost of failure",
                },
                {
                  feature: "How it's trained",
                  asym: 'Custom gradient descent, hand-derived and coded from scratch in NumPy',
                  others: 'Standard scikit-learn training routines (closed-form OLS, LP-based Huber, tree-splitting, kernel optimization)',
                },
                {
                  feature: 'What it optimizes for',
                  asym: 'Minimizing real-world SLA violation risk',
                  others: 'Minimizing statistical error (MSE, RMSE)',
                },
                {
                  feature: 'Live retraining in the app',
                  asym: 'Yes — Beta slider retrains and updates results instantly',
                  others: 'No — trained once in the backend, not adjustable from the dashboard',
                },
                {
                  feature: 'Model complexity',
                  asym: 'Simple linear model, easy to interpret',
                  others: 'Ranges from simple (OLS, Ridge) to complex (Random Forest, SVR)',
                },
                {
                  feature: 'Best at',
                  asym: 'Reducing outages (SLA compliance)',
                  others: 'Reducing raw prediction error (accuracy metrics like R², RMSE)',
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#0F172A] align-top">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3.5 text-emerald-800 border-l-2 border-emerald-200 bg-emerald-50/30 align-top leading-relaxed">
                    {row.asym}
                  </td>
                  <td className="px-4 py-3.5 text-[#475569] align-top leading-relaxed">
                    {row.others}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
