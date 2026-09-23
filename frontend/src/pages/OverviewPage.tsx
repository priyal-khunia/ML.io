import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
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
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Top Banner / Academic Summary */}
      <div className="relative overflow-hidden bg-dark-900 border border-dark-700 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Empirical ML Workstation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Asymmetric Cost-Weighted Multivariable Regression
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Asymmetric gradient descent penalizing SLA deficits exponentially for proactive 5-minute capacity forecasting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('simulation')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition-all"
            >
              <span>Test Live Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-medium border border-dark-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Telemetry & Live Inference KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Real-Time Cluster Telemetry & Predicted Capacity
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Forecast Horizon: +5 Minutes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Current CPU"
            value={currentCpu}
            unit={latest ? "%" : ""}
            subtitle={latest ? "Host CPU load" : "Awaiting user input"}
            icon={Cpu}
            accentColor="cyan"
            badge={latest ? "Telemetry" : "No Data"}
          />

          <MetricCard
            title="Current Memory"
            value={currentMem}
            unit={latest ? "%" : ""}
            subtitle={latest ? "Active RAM utilization" : "Awaiting user input"}
            icon={Activity}
            accentColor="emerald"
            badge={latest ? "Primary Bottleneck" : "No Data"}
          />

          <MetricCard
            title="Current Disk I/O"
            value={currentDisk}
            unit={latest ? "%" : ""}
            subtitle={latest ? "I/O channel utilization" : "Awaiting user input"}
            icon={HardDrive}
            accentColor="slate"
            badge={latest ? "Telemetry" : "No Data"}
          />

          <div className="relative group overflow-hidden bg-dark-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                Predicted Required Resource
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-bold tracking-tight text-white font-mono">
                {predictedResource}
              </span>
              {latest && <span className="text-sm font-medium text-emerald-400">%</span>}
            </div>
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-dark-700/80">
              <span className="text-xs text-slate-400 truncate">Scaling Recommendation:</span>
              {scalingAction ? (
                <StatusBadge action={scalingAction} size="sm" />
              ) : (
                <span className="text-[11px] text-slate-400 italic">No forecast yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row: SLA Violation Rate, Wastage Index, R2, Test Samples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Recommended Scaling Action"
          value={scalingAction ? scalingAction.replace('_', ' ') : '--'}
          subtitle={latest ? 'Model decision' : 'Awaiting simulation run'}
          icon={Activity}
          accentColor={scalingAction === 'SCALE_UP' ? 'rose' : scalingAction === 'SCALE_DOWN' ? 'cyan' : 'emerald'}
          badge={latest ? "Advisory Decision" : "Standby"}
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
          subtitle="Genuine feature variance learned"
          icon={Database}
          accentColor="emerald"
          badge={asym && asym.r2 >= 0.5 ? "Good Fit" : "Calibrated"}
          badgeColor="emerald"
        />
      </div>

      {/* Recent Predictions Log Table */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Prediction & Scaling History (SQLite)
            </h4>
          </div>
          <div className="flex items-center gap-3">
            {recentLogs.length > 0 && (
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearing ? 'Clearing...' : 'Clear All History'}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('simulation')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Run New Prediction →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dark-700 text-slate-400">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">CPU %</th>
                <th className="pb-3 font-semibold">Mem %</th>
                <th className="pb-3 font-semibold">Net In / Out</th>
                <th className="pb-3 font-semibold">Predicted +5m</th>
                <th className="pb-3 font-semibold">Scaling Action</th>
                <th className="pb-3 font-semibold">Provisioning Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/60 font-mono">
              {recentLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-dark-850/50 transition-colors">
                  <td className="py-2.5 text-slate-400 font-sans">{log.timestamp}</td>
                  <td className="py-2.5 text-slate-200">{log.cpu_util_percent.toFixed(1)}%</td>
                  <td className="py-2.5 text-slate-200">{log.mem_util_percent.toFixed(1)}%</td>
                  <td className="py-2.5 text-slate-400">
                    {log.net_in.toFixed(1)} / {log.net_out.toFixed(1)}
                  </td>
                  <td className="py-2.5 font-bold text-emerald-400">
                    {log.predicted_resource.toFixed(1)}%
                  </td>
                  <td className="py-2.5">
                    <StatusBadge action={log.scaling_action} size="sm" />
                  </td>
                  <td className="py-2.5 text-slate-400 text-[11px] font-sans">
                    {log.provisioning_status}
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No predictions recorded yet. Test a workload in the Live Simulation tab!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
