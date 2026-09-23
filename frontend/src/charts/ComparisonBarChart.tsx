import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ModelMetrics } from '../types/api';

export type ComparisonModelItem = ModelMetrics & {
  model_name?: string;
  model_type?: string;
};

interface ComparisonBarChartProps {
  models: ModelMetrics[];
}

const getShortDisplayName = (modelName?: string, modelType?: string): string => {
  if (modelType === 'asymmetric') return 'Asymmetric (Ours)';
  if (modelType === 'baseline') return 'Baseline OLS';
  if (modelType === 'ridge') return 'Ridge (L2)';
  if (modelType === 'huber') return 'Huber';
  if (modelType === 'random_forest') return 'Random Forest';
  if (modelType === 'svr') return 'SVR (RBF)';
  if (!modelName) return modelType || 'Model';
  if (modelName.includes('Asymmetric')) return 'Asymmetric (Ours)';
  if (modelName.includes('Ridge')) return 'Ridge (L2)';
  if (modelName.includes('Huber')) return 'Huber';
  if (modelName.includes('Random Forest')) return 'Random Forest';
  if (modelName.includes('Support Vector') || modelName.includes('SVR')) return 'SVR (RBF)';
  if (modelName.includes('Baseline') || modelName.includes('OLS')) return 'Baseline OLS';
  return modelName;
};

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ models }) => {
  if (!models || models.length === 0) {
    return null;
  }

  // Sort worst-to-best by SLA violation rate descending (highest SLA violation rate on left)
  const sortedModels = [...models].sort(
    (a, b) => (b.sla_violation_rate ?? 0) - (a.sla_violation_rate ?? 0)
  );

  const worstModel = sortedModels[0];
  const asymModel =
    sortedModels.find((m) => m.model_type === 'asymmetric') ||
    sortedModels[sortedModels.length - 1];

  // Calculate gaps vs worst model
  const slaReductionVsWorst = (
    worstModel.sla_violation_rate - asymModel.sla_violation_rate
  ).toFixed(1);

  const wastageGapVsWorst = (
    asymModel.resource_wastage_index - worstModel.resource_wastage_index
  ).toFixed(2);

  // Build one data point per model for SLA violations
  const slaData = sortedModels.map((m) => {
    const typeKey = m.model_type || 'unknown';
    return {
      name: getShortDisplayName(m.model_name, m.model_type),
      fullName: m.model_name || getShortDisplayName(m.model_name, m.model_type),
      [typeKey]: m.sla_violation_rate,
    };
  });

  // Build one data point per model for Resource Wastage
  const wastageData = sortedModels.map((m) => {
    const typeKey = m.model_type || 'unknown';
    return {
      name: getShortDisplayName(m.model_name, m.model_type),
      fullName: m.model_name || getShortDisplayName(m.model_name, m.model_type),
      [typeKey]: m.resource_wastage_index,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SLA Violations Comparison */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-[#252936] uppercase tracking-wider">
              SLA Violation Rate
            </h4>
            <p className="text-xs text-[#6B7280]">
              Lower is critical for cloud cluster SLA compliance
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#6C63FF] bg-[#6C63FF]/10 border border-[#6C63FF]/25 px-2.5 py-1 rounded-lg">
            -{slaReductionVsWorst}% Reduction
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={slaData}
              barGap={8}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={45}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                unit="%"
                domain={[0, 'auto']}
              />
              <Tooltip
                filterNull={true}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: '8px',
                  color: '#252936',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => {
                  if (val === undefined || val === null) return null;
                  return [`${Number(val).toFixed(2)}%`, name];
                }}
              />
              {sortedModels.map((m) => {
                const isAsym = m.model_type === 'asymmetric';
                return (
                  <Bar
                    key={m.model_type}
                    name={m.model_name || getShortDisplayName(m.model_name, m.model_type)}
                    dataKey={m.model_type}
                    stackId="a"
                    fill={isAsym ? '#6C63FF' : '#94A3B8'}
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Wastage Comparison */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-[#252936] uppercase tracking-wider">
              Resource Wastage Index
            </h4>
            <p className="text-xs text-[#6B7280]">
              Excess headroom buffer provisioned above demand
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#E7A83B] bg-[#E7A83B]/10 border border-[#E7A83B]/25 px-2.5 py-1 rounded-lg">
            +{wastageGapVsWorst} Controlled Cost
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wastageData}
              barGap={8}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={45}
              />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                filterNull={true}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: '8px',
                  color: '#252936',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => {
                  if (val === undefined || val === null) return null;
                  return [`${Number(val).toFixed(4)}`, name];
                }}
              />
              {sortedModels.map((m) => {
                const isAsym = m.model_type === 'asymmetric';
                return (
                  <Bar
                    key={m.model_type}
                    name={m.model_name || getShortDisplayName(m.model_name, m.model_type)}
                    dataKey={m.model_type}
                    stackId="a"
                    fill={isAsym ? '#6C63FF' : '#94A3B8'}
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
