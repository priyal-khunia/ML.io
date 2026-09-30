import React, { useState } from 'react';
import {
  BrainCircuit,
  Scale,
  Award,
  Clock,
  ChevronRight,
  Code2,
  CheckCircle2,
} from 'lucide-react';

export const NoveltySection: React.FC = () => {
  const [activePillar, setActivePillar] = useState<string>('asymmetric_cost');

  const pillars = [
    {
      id: 'asymmetric_cost',
      title: 'Piecewise Exp-Linear Loss',
      shortTitle: '1. Loss Formulation',
      icon: Scale,
      badge: 'Mathematical Novelty',
      headline: 'Resolving the Fundamental Flaw of Symmetric Loss (MSE)',
      description:
        'MSE treats under-provisioning and over-provisioning as equally costly — this model corrects that with an asymmetric piecewise loss.',
      formula: 'L(e_i) = α · (exp(β · |e_i|) - 1)   if ŷ_i < y_i (SLA Deficit)\nL(e_i) = γ · |e_i|                 if ŷ_i ≥ y_i (Headroom Surplus)',
      insights: [
        'Symmetric MSE models center predictions in noise, causing ~50% SLA violations; asymmetric penalty shifts predictions upward to avoid this.',
      ],
    },
    {
      id: 'analytical_gradients',
      title: 'Analytical Piecewise Gradients',
      shortTitle: '2. Gradient Descent',
      icon: BrainCircuit,
      badge: 'Optimization Novelty',
      headline: 'Exact Analytical Derivatives in Pure NumPy',
      description:
        'Rather than adding a fixed safety buffer, this model learns the optimal upward offset directly from data via hand-derived analytical gradients.',
      formula: '∂L/∂ŷ_i = -α · β · exp(β(y_i - ŷ_i))   if ŷ_i < y_i\n∂L/∂ŷ_i = γ                            if ŷ_i ≥ y_i\n\n∂J/∂w = (1/N) · Xᵀ · [∂L/∂ŷ]\n∂J/∂b = (1/N) · Σ [∂L/∂ŷ_i]',
      insights: [
        'Weights and bias are learned directly from data via analytical gradient descent — not a fixed heuristic safety buffer.',
      ],
    },
    {
      id: 'six_model_benchmark',
      title: '6-Model Benchmark Proof',
      shortTitle: '3. Empirical Proof',
      icon: Award,
      badge: 'Empirical Novelty',
      headline: 'Rigorous Validation Against Industry Standard Baselines',
      description:
        'Validated against 5 standard baseline models on 2,242 chronological cloud telemetry observations with zero test leakage.',
      formula: 'SLA Violation Rate = (Count(ŷ < y) / Total Test Intervals) · 100%\nResource Wastage Index = (1/N) · Σ max(0, ŷ_i - y_i)',
      insights: [
        'Standard models (OLS, Ridge, Huber, Random Forest, SVR) all show ~48-52% SLA violations; this model reduces that to 10-30% while preserving R² ≈ 0.53.',
      ],
    },
    {
      id: 'proactive_actuation',
      title: 'Proactive 5-Min Auto-Scaling',
      shortTitle: '4. Decision Engine',
      icon: Clock,
      badge: 'Systems Novelty',
      headline: 'Predictive Lookahead vs. Reactive Hypervisor Latency',
      description:
        'Predicts 5 minutes ahead so capacity can scale proactively, unlike reactive systems that only respond after a threshold is already breached.',
      formula: 'ŷ_{t+5min} = wᵀ · x_t + b\nAction: SCALE_UP if ŷ > capacity, SCALE_DOWN if ŷ < lower_bound, else MAINTAIN',
      insights: [
        'Predicts 5 minutes ahead so capacity can scale up before congestion occurs, unlike reactive systems that only react after a threshold is breached.',
      ],
    },
  ];

  const current = pillars.find((p) => p.id === activePillar) || pillars[0];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Core Technical Novelty & Mathematical Foundations</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
            Why Asymmetric Cost Optimization Outperforms Standard ML
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Solving the mismatch between symmetric statistical loss functions and asymmetric cloud infrastructure operational costs.
          </p>
        </div>
      </div>

      {/* Pillar Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isActive = pillar.id === activePillar;
          return (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(pillar.id)}
              className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition-colors border ${
                isActive
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-[#64748B]'}`} />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold block truncate">
                  {pillar.shortTitle}
                </span>
                <span className="text-[10px] text-[#64748B] block truncate">
                  {pillar.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Pillar Content Card */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider font-mono">
              {current.badge}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[#0F172A] mt-0.5">
              {current.headline}
            </h4>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          {current.description}
        </p>

        {/* Formula Box */}
        {current.formula && (
          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-md font-mono text-xs overflow-x-auto space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Mathematical Formulation:</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">{current.formula}</pre>
          </div>
        )}

        {/* Key Engineering Insights */}
        <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
            Key Architectural Insights:
          </span>
          <ul className="space-y-1.5 text-xs text-[#475569]">
            {current.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
