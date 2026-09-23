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
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-[#252936]">Prediction Distribution: Under vs Over Provisioning</h4>
          <p className="text-xs text-[#6B7280]">Total test observations: {baseline.total_samples}</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="category" stroke="#6B7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#252936', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              formatter={(val: any, name: any) => [`${val} samples (${((Number(val) / baseline.total_samples) * 100).toFixed(1)}%)`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="Baseline OLS" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={45} />
            <Bar dataKey="Asymmetric Model" fill="#6C63FF" radius={[4, 4, 0, 0]} barSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
