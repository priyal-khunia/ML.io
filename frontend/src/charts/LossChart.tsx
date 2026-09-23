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
      <div className="h-64 flex items-center justify-center text-[#6B7280] text-sm">
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
        <div className="flex items-center gap-4 text-[#6B7280]">
          <span>Initial Loss: <strong className="text-[#252936] font-mono">{initialLoss.toFixed(4)}</strong></span>
          <span>Final Loss: <strong className="text-[#6C63FF] font-mono">{finalLoss.toFixed(4)}</strong></span>
        </div>
        <span className="bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 px-2 py-0.5 rounded text-[11px] font-semibold">
          -{reduction}% Loss Convergence
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6C63FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="epoch"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `Ep ${v}`}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                borderRadius: '8px',
                color: '#252936',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              labelFormatter={(label) => `Epoch ${label}`}
              formatter={(value: any) => [`${Number(value).toFixed(4)}`, 'Asymmetric Loss']}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="#6C63FF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#lossGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
