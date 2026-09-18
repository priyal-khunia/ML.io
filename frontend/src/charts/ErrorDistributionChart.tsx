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

interface ErrorDistributionChartProps {
  baseline: ModelMetrics;
  asymmetric: ModelMetrics;
}

export const ErrorDistributionChart: React.FC<ErrorDistributionChartProps> = ({ baseline, asymmetric }) => {
  const data = [
    {
      category: 'Under-Predictions (SLA Violations)',
      'Baseline OLS': baseline.sla_violation_count,
      'Asymmetric Model': asymmetric.sla_violation_count,
    },
    {
      category: 'Over-Predictions (Resource Buffer)',
      'Baseline OLS': baseline.over_provisioning_count,
      'Asymmetric Model': asymmetric.over_provisioning_count,
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Prediction Distribution: Under vs Over Provisioning</h4>
          <p className="text-xs text-slate-400">Total test observations: {baseline.total_samples}</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              formatter={(val: any, name: any) => [`${val} samples (${((Number(val) / baseline.total_samples) * 100).toFixed(1)}%)`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="Baseline OLS" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={45} />
            <Bar dataKey="Asymmetric Model" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
