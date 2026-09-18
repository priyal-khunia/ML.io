import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';

export const PenaltyCurveChart: React.FC = () => {
  // Generate curve data points from e = -4.0 to +4.0
  const data = [];
  const alpha = 1.0;
  const beta = 0.7;
  const gamma = 0.5;

  for (let e = -4.0; e <= 4.01; e += 0.25) {
    const error = parseFloat(e.toFixed(2));
    // Asymmetric piecewise loss
    let asymLoss: number;
    if (error < 0) {
      // Under-prediction: exponential penalty
      asymLoss = alpha * (Math.exp(beta * Math.abs(error)) - 1.0);
    } else {
      // Over-prediction: linear penalty
      asymLoss = gamma * error;
    }

    // Symmetric MSE baseline for reference: 0.5 * e^2
    const mseLoss = 0.5 * Math.pow(error, 2);

    data.push({
      error,
      asymmetric: parseFloat(asymLoss.toFixed(2)),
      mse: parseFloat(mseLoss.toFixed(2)),
    });
  }

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-700">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Loss Penalty Curve Comparison (Visualized)
          </h4>
          <p className="text-xs text-slate-400">
            Error (e) = Predicted Capacity − Actual Needed Load (%)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold">
            Under-Prediction (SLA Danger)
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
            Over-Prediction (Safe Margin)
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252b35" vertical={false} />
            <XAxis
              dataKey="error"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${v > 0 ? `+${v}` : v}%`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              domain={[0, 16]}
              allowDataOverflow
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111418',
                borderColor: '#2e3542',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              }}
              labelFormatter={(label) => `Prediction Error (e): ${Number(label) > 0 ? `+${label}` : label}%`}
              formatter={(val: any, name: any) => [
                `${Number(val).toFixed(2)} penalty units`,
                name === 'asymmetric' ? 'Asymmetric Model Loss' : 'Symmetric MSE Loss',
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" label={{ value: 'Zero Error', fill: '#94a3b8', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="asymmetric"
              name="Asymmetric Loss (Our Model: α=1, β=0.7, γ=0.5)"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mse"
              name="Symmetric MSE Loss (Standard OLS: ½ e²)"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3 bg-dark-950/60 rounded-xl border border-rose-500/20 text-slate-300">
          <strong className="text-rose-400 block mb-1">Left side (e &lt; 0): Exponential Ramp</strong>
          An under-prediction of −3% incurs a massive penalty of ~7.2 units, making capacity starvation mathematically unacceptable to the optimizer.
        </div>
        <div className="p-3 bg-dark-950/60 rounded-xl border border-emerald-500/20 text-slate-300">
          <strong className="text-emerald-400 block mb-1">Right side (e &ge; 0): Gentle Linear Slope</strong>
          An over-prediction of +3% incurs only 1.5 units, treating surplus buffer as modest, acceptable cloud headroom cost.
        </div>
      </div>
    </div>
  );
};
