import React, { useState } from 'react';
import {
  BrainCircuit,
  Calculator,
  Flame,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Cpu,
  Activity,
  Zap,
} from 'lucide-react';

interface ParadigmCard {
  id: string;
  name: string;
  category: 'Symmetric Baseline' | 'Asymmetric Literature Baseline' | 'Proposed Novel Architecture';
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  lossFormula: string;
  gradientFormula: string;
  lossBehaviorUnder: string;
  lossBehaviorOver: string;
  gradientUnder: string;
  gradientOver: string;
  cloudImplication: string;
  asymptoticGrowth: string;
}

export const FeatureComparisonPage: React.FC = () => {
  const [selectedParadigm, setSelectedParadigm] = useState<string>('proposed');
  const [testDeficit, setTestDeficit] = useState<number>(4.0);

  const paradigms: ParadigmCard[] = [
    {
      id: 'ols_ridge',
      name: 'Ordinary Least Squares & Ridge Regression',
      category: 'Symmetric Baseline',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      borderColor: 'border-rose-200',
      bgColor: 'bg-rose-50/30',
      lossFormula: 'L(e) = (1/2) * e^2  [+ (alpha/2)*||w||^2]',
      gradientFormula: 'dL/de = e  (dL/dw = (1/N) * X^T * e)',
      lossBehaviorUnder: 'Quadratic: e.g. (-4.0)^2 = 16.0',
      lossBehaviorOver: 'Quadratic: e.g. (+4.0)^2 = 16.0 (IDENTICAL)',
      gradientUnder: '-4.0 (Linear slope)',
      gradientOver: '+4.0 (Linear slope)',
      cloudImplication:
        'Symmetric penalty forces model weights to converge to the conditional mean. Under-allocates capacity in ~50% of intervals, leading to severe SLA breaches.',
      asymptoticGrowth: 'O(e^2) - Identical in both directions',
    },
    {
      id: 'huber',
      name: 'Huber Robust Regressor',
      category: 'Symmetric Baseline',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50/30',
      lossFormula: 'L(e) = 0.5*e^2 if |e| <= delta, else delta*(|e| - 0.5*delta)',
      gradientFormula: 'dL/de = clip(e, -delta, delta)',
      lossBehaviorUnder: 'Capped linear slope for large outliers',
      lossBehaviorOver: 'Capped linear slope for large outliers (IDENTICAL)',
      gradientUnder: '-delta (Constant capped slope)',
      gradientOver: '+delta (Constant capped slope)',
      cloudImplication:
        'Mitigates dataset telemetry noise and outliers, but remains completely symmetric. Fails ~54% of held-out cloud SLA test intervals because it cannot prioritize capacity safety.',
      asymptoticGrowth: 'O(|e|) - Linear after delta threshold',
    },
    {
      id: 'pinball',
      name: 'Quantile Pinball Regression (tau = 0.85)',
      category: 'Asymmetric Literature Baseline',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/30',
      lossFormula: 'L_tau(e) = max(tau * (-e), (1 - tau) * e)   [e = y_pred - y]',
      gradientFormula: 'dL/de = -tau if e < 0 else (1 - tau)',
      lossBehaviorUnder: 'Linear asymmetric: 0.85 * 4.0 = 3.40',
      lossBehaviorOver: 'Linear asymmetric: 0.15 * 4.0 = 0.60',
      gradientUnder: '-0.85 (STRICTLY CONSTANT)',
      gradientOver: '+0.15 (STRICTLY CONSTANT)',
      cloudImplication:
        'Gold standard asymmetric benchmark in statistics. Reduces SLA violations to ~15-20%, but its constant gradient cannot differentiate a 1% minor deficit from a 40% catastrophic datacenter blackout.',
      asymptoticGrowth: 'O(|e|) - Piecewise linear with constant slope',
    },
    {
      id: 'expectile',
      name: 'Expectile Regression / Asymmetric Least Squares (p = 0.85)',
      category: 'Asymmetric Literature Baseline',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50/30',
      lossFormula: 'L_p(e) = |p - I(e < 0)| * e^2   [solved via NumPy IRLS]',
      gradientFormula: 'dL/de = 2 * |p - I(e < 0)| * e',
      lossBehaviorUnder: 'Weighted quadratic: 0.85 * 16.0 = 13.60',
      lossBehaviorOver: 'Weighted quadratic: 0.15 * 16.0 = 2.40',
      gradientUnder: '-2 * 0.85 * 4.0 = -6.80',
      gradientOver: '+2 * 0.15 * 4.0 = +1.20',
      cloudImplication:
        'Provides smooth quadratic derivatives, but quadratically penalizes over-provisioning. In cloud capacity planning, this causes heavy excessive provisioning and high monthly VM billing waste.',
      asymptoticGrowth: 'O(e^2) - Weighted quadratic on both sides',
    },
    {
      id: 'proposed',
      name: 'Proposed: Piecewise Exponential-Linear Loss',
      category: 'Proposed Novel Architecture',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold',
      borderColor: 'border-emerald-300 ring-2 ring-emerald-500/20',
      bgColor: 'bg-emerald-50/40',
      lossFormula: 'L(e) = alpha * (exp(beta * (-e)) - 1) if e < 0 else gamma * e',
      gradientFormula: 'dL/de = -alpha * beta * exp(beta * (-e)) if e < 0 else gamma',
      lossBehaviorUnder: 'Exponential barrier: 1.0 * (exp(0.7 * 4.0) - 1) = 15.44',
      lossBehaviorOver: 'Linear cost: 0.5 * 4.0 = 2.00',
      gradientUnder: '-1.0 * 0.7 * exp(0.7 * 4.0) = -11.51 (EXPONENTIAL PUSH)',
      gradientOver: '+0.50 (CHEAP CONSTANT MARGINAL COST)',
      cloudImplication:
        'Novel formulation: exponential penalty barrier physically prevents deep SLA capacity deficits, while linear surplus cost allows safe buffer headroom without runaway billing inflation.',
      asymptoticGrowth: 'O(e^(beta * |e|)) under-deficit / O(e) surplus',
    },
  ];

  const current = paradigms.find((p) => p.id === selectedParadigm) || paradigms[4];

  // Dynamic live calculation based on testDeficit slider
  const calcLoss = (pId: string, d: number) => {
    if (pId === 'ols_ridge') {
      const underLoss = 0.5 * d * d;
      const underGrad = -d;
      const overLoss = 0.5 * d * d;
      const overGrad = d;
      return { underLoss, underGrad, overLoss, overGrad };
    }
    if (pId === 'huber') {
      const delta = 1.35;
      const underLoss = d <= delta ? 0.5 * d * d : delta * (d - 0.5 * delta);
      const underGrad = -Math.min(d, delta);
      const overLoss = underLoss;
      const overGrad = Math.min(d, delta);
      return { underLoss, underGrad, overLoss, overGrad };
    }
    if (pId === 'pinball') {
      const underLoss = 0.85 * d;
      const underGrad = -0.85;
      const overLoss = 0.15 * d;
      const overGrad = 0.15;
      return { underLoss, underGrad, overLoss, overGrad };
    }
    if (pId === 'expectile') {
      const underLoss = 0.85 * d * d;
      const underGrad = -2 * 0.85 * d;
      const overLoss = 0.15 * d * d;
      const overGrad = 2 * 0.15 * d;
      return { underLoss, underGrad, overLoss, overGrad };
    }
    // proposed
    const beta = 0.7;
    const alpha = 1.0;
    const gamma = 0.5;
    const clipped = Math.min(beta * d, 8.0);
    const underLoss = alpha * (Math.exp(clipped) - 1.0);
    const underGrad = -alpha * beta * Math.exp(clipped);
    const overLoss = gamma * d;
    const overGrad = gamma;
    return { underLoss, underGrad, overLoss, overGrad };
  };

  const currentCalcs = calcLoss(current.id, testDeficit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" />
          <span>Mathematical Formulation Deep Dive</span>
        </div>
        <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
          Optimization Paradigms: Loss Functions &amp; Gradient Dynamics
        </h2>
        <p className="text-sm text-[#64748B] mt-1">
          Comparing the mathematical structure, analytical gradients, and asymptotic error scaling of symmetric baselines,
          literature asymmetric losses (Quantile &amp; Expectile), and our proposed Piecewise Exp-Linear formulation.
        </p>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {paradigms.map((p) => {
          const isSelected = p.id === selectedParadigm;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedParadigm(p.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                  : 'bg-white/80 border-[#E2E8F0] hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] truncate">
                {p.category.split(' ')[0]}
              </div>
              <div className="text-xs font-bold text-[#0F172A] mt-0.5 leading-snug line-clamp-2">
                {p.name.split('/')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Paradigm Spotlight */}
      <div className={`bg-white border ${current.borderColor} ${current.bgColor} rounded-2xl p-6 shadow-sm space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
          <div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${current.badgeColor}`}>
              {current.category}
            </span>
            <h3 className="text-lg font-extrabold text-[#0F172A] mt-1">{current.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Asymptotic Growth Rate</span>
            <span className="font-mono text-xs font-bold text-slate-800 bg-white/80 px-2.5 py-1 rounded border border-slate-200 inline-block mt-0.5">
              {current.asymptoticGrowth}
            </span>
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Loss Formulation L(e)</span>
            </div>
            <pre className="text-xs text-blue-200 whitespace-pre-wrap leading-relaxed">
              {current.lossFormula}
            </pre>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Analytical Gradient dL/de</span>
            </div>
            <pre className="text-xs text-emerald-200 whitespace-pre-wrap leading-relaxed">
              {current.gradientFormula}
            </pre>
          </div>
        </div>

        {/* Dynamic Deficit Simulator */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Live Calculus Evaluation at Error Magnitude: ±{testDeficit.toFixed(1)}%</span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Slide to observe how this model's penalty and gradient backpropagation signal respond to increasing capacity mismatch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={testDeficit}
                onChange={(e) => setTestDeficit(parseFloat(e.target.value))}
                className="w-36 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded border border-slate-300 min-w-14 text-center">
                |e| = {testDeficit.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Under-provisioning (Deficit) */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  Under-Provisioning (e = -{testDeficit.toFixed(1)}%)
                </span>
                <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                  SLA Outage Danger
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <div className="text-[10px] text-[#64748B] uppercase font-semibold">Loss Value</div>
                  <div className="font-mono font-extrabold text-[#0F172A] text-sm mt-0.5">
                    {currentCalcs.underLoss.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <div className="text-[10px] text-[#64748B] uppercase font-semibold">Backprop Gradient</div>
                  <div className="font-mono font-extrabold text-rose-700 text-sm mt-0.5">
                    {currentCalcs.underGrad.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#475569] leading-relaxed">
                {current.lossBehaviorUnder}
              </div>
            </div>

            {/* Over-provisioning (Headroom) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Over-Provisioning (e = +{testDeficit.toFixed(1)}%)
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Surplus Buffer Headroom
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-[#64748B] uppercase font-semibold">Loss Value</div>
                  <div className="font-mono font-extrabold text-[#0F172A] text-sm mt-0.5">
                    {currentCalcs.overLoss.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-[#64748B] uppercase font-semibold">Backprop Gradient</div>
                  <div className="font-mono font-extrabold text-emerald-700 text-sm mt-0.5">
                    +{currentCalcs.overGrad.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#475569] leading-relaxed">
                {current.lossBehaviorOver}
              </div>
            </div>
          </div>
        </div>

        {/* Cloud SLA Implication */}
        <div className="bg-white/80 border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-slate-700" />
            <span>Cloud Engineering &amp; Operational Reality</span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">{current.cloudImplication}</p>
        </div>
      </div>
    </div>
  );
};
