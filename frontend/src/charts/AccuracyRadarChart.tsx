import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ModelMetrics } from '../types/api';

interface AccuracyRadarChartProps {
  models: ModelMetrics[];
}

const getShortName = (m: ModelMetrics): string => {
  if (m.model_type === 'asymmetric') return 'Asymmetric ★';
  if (m.model_type === 'baseline') return 'OLS';
  if (m.model_type === 'ridge') return 'Ridge';
  if (m.model_type === 'huber') return 'Huber';
  if (m.model_type === 'random_forest') return 'Random Forest';
  if (m.model_type === 'svr') return 'SVR';
  return m.model_name || m.model_type || 'Model';
};

// Normalize a value to 0-100 scale where higher = better
const normalizeSLA = (val: number) => Math.max(0, 100 - val);
const normalizeR2 = (val: number) => Math.max(0, Math.min(100, val * 100));
const normalizeRMSE = (val: number, max: number) => Math.max(0, 100 - (val / max) * 100);
const normalizeWastage = (val: number, max: number) => Math.max(0, 100 - (val / max) * 100);

export const AccuracyRadarChart: React.FC<AccuracyRadarChartProps> = ({ models }) => {
  if (!models || models.length === 0) return null;

  const maxRMSE = Math.max(...models.map((m) => m.rmse), 0.001);
  const maxWastage = Math.max(...models.map((m) => m.resource_wastage_index), 0.001);

  // Sort: asymmetric last so it renders on top
  const sorted = [...models].sort((a) => (a.model_type === 'asymmetric' ? 1 : -1));

  const dimensions = [
    { key: 'SLA Compliance', label: 'SLA Compliance' },
    { key: 'R² Score', label: 'R² Score' },
    { key: 'RMSE Score', label: 'RMSE Score' },
    { key: 'Wastage Score', label: 'Wastage Score' },
  ];

  const radarData = dimensions.map((dim) => {
    const entry: Record<string, any> = { subject: dim.label };
    sorted.forEach((m) => {
      const name = getShortName(m);
      if (dim.key === 'SLA Compliance') entry[name] = normalizeSLA(m.sla_violation_rate);
      if (dim.key === 'R² Score') entry[name] = normalizeR2(m.r2);
      if (dim.key === 'RMSE Score') entry[name] = normalizeRMSE(m.rmse, maxRMSE);
      if (dim.key === 'Wastage Score') entry[name] = normalizeWastage(m.resource_wastage_index, maxWastage);
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tickCount={5}
          tick={{ fill: '#94A3B8', fontSize: 9 }}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            borderRadius: '8px',
            fontSize: '11px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          formatter={(val: any, name: any) => [`${Number(val).toFixed(1)}`, String(name ?? '')]}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
          formatter={(value) => (
            <span style={{ color: value.includes('★') ? '#2563EB' : '#64748B', fontWeight: value.includes('★') ? 700 : 500 }}>
              {value}
            </span>
          )}
        />
        {sorted.map((m) => {
          const name = getShortName(m);
          const isAsym = m.model_type === 'asymmetric';
          return (
            <Radar
              key={name}
              name={name}
              dataKey={name}
              stroke={isAsym ? '#2563EB' : '#CBD5E1'}
              fill={isAsym ? '#2563EB' : '#CBD5E1'}
              fillOpacity={isAsym ? 0.18 : 0.04}
              strokeWidth={isAsym ? 2.5 : 1}
              strokeDasharray={isAsym ? undefined : '4 2'}
            />
          );
        })}
      </RadarChart>
    </ResponsiveContainer>
  );
};
