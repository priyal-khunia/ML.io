import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrainingLossPoint } from '../types/api';

interface LossChartProps {
  data: TrainingLossPoint[];
}

export const LossChart: React.FC<LossChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[#64748B] text-sm">
        No training history available. Train the model to generate loss trajectory.
      </div>
    );
  }

  const initialLoss = data[0]?.loss ?? 0;
  const finalLoss = data[data.length - 1]?.loss ?? 0;
  const reduction = initialLoss > 0 ? (((initialLoss - finalLoss) / initialLoss) * 100).toFixed(1) : '0';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4 text-[#64748B]">
          <span>Initial Loss: <strong className="text-[#0F172A] font-mono">{initialLoss.toFixed(4)}</strong></span>
          <span>Final Loss: <strong className="text-blue-600 font-mono">{finalLoss.toFixed(4)}</strong></span>
        </div>
        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold font-mono">
          -{reduction}% Loss Convergence
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="epoch"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `Ep ${v}`}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '6px',
                color: '#0F172A',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              labelFormatter={(label) => `Epoch ${label}`}
              formatter={(value: any) => [`${Number(value).toFixed(4)}`, 'Asymmetric Loss']}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#lossGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
