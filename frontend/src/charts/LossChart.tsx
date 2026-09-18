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
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
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
        <div className="flex items-center gap-4 text-slate-400">
          <span>Initial Loss: <strong className="text-slate-200 font-mono">{initialLoss.toFixed(4)}</strong></span>
          <span>Final Loss: <strong className="text-emerald-400 font-mono">{finalLoss.toFixed(4)}</strong></span>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
          -{reduction}% Loss Convergence
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="epoch"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `Ep ${v}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              }}
              labelFormatter={(label) => `Epoch ${label}`}
              formatter={(value: any) => [`${Number(value).toFixed(4)}`, 'Asymmetric Loss']}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="#818cf8"
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
