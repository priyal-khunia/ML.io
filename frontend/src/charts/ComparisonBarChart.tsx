import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ModelMetrics } from '../types/api';

interface ComparisonBarChartProps {
  baseline: ModelMetrics;
  asymmetric: ModelMetrics;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ baseline, asymmetric }) => {
  const slaData = [
    {
      name: 'SLA Violations (%)',
      baseline: baseline.sla_violation_rate,
      asymmetric: asymmetric.sla_violation_rate,
    },
  ];

  const wastageData = [
    {
      name: 'Resource Wastage Index',
      baseline: baseline.resource_wastage_index,
      asymmetric: asymmetric.resource_wastage_index,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SLA Violations Comparison */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">SLA Violation Rate</h4>
            <p className="text-xs text-slate-400">Lower is critical for system reliability</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            -{(baseline.sla_violation_rate - asymmetric.sla_violation_rate).toFixed(1)}% Reduction
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slaData} barGap={12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252b35" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111418', borderColor: '#2e3542', borderRadius: '8px', color: '#fff' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar name="Baseline OLS" dataKey="baseline" fill="#64748b" radius={[4, 4, 0, 0]} barSize={42} />
              <Bar name="Asymmetric Model" dataKey="asymmetric" fill="#10b981" radius={[4, 4, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Wastage Comparison */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resource Wastage Index</h4>
            <p className="text-xs text-slate-400">Excess buffer over-provisioned (units)</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            +{(asymmetric.resource_wastage_index - baseline.resource_wastage_index).toFixed(2)} Controlled Cost
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wastageData} barGap={12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252b35" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111418', borderColor: '#2e3542', borderRadius: '8px', color: '#fff' }}
                formatter={(val: any) => [`${Number(val).toFixed(4)}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar name="Baseline OLS" dataKey="baseline" fill="#64748b" radius={[4, 4, 0, 0]} barSize={42} />
              <Bar name="Asymmetric Model" dataKey="asymmetric" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
