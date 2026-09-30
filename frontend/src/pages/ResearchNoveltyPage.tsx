import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  Scale,
  Award,
  Clock,
  Code2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  BookOpen,
  FlaskConical,
  TrendingUp,
  ShieldOff,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
} from 'lucide-react';
import { fetchNovelty } from '../services/api';
import { NoveltyPillar } from '../types/api';

/* ─────────────────────────── static data ─────────────────────────── */

const SYMMETRIC_MODELS = [
  {
    name: 'OLS (Baseline)',
    loss: 'L(e) = e²',
    lossName: 'Mean Squared Error (MSE)',
    why: 'Closed-form least-squares minimises the sum of squared residuals symmetrically. +5% and −5% errors are penalised identically.',
    gap: '~50% SLA violations in test',
    color: 'rose',
  },
  {
    name: 'Ridge Regression (L2)',
    loss: 'L(e) = e² + α‖w‖₂²',
    lossName: 'MSE + L2 Regularisation',
    why: 'Adds an L2 weight penalty to shrink coefficients. The underlying loss is still perfectly symmetric — L2 regularisation addresses overfitting, not directional cost asymmetry.',
    gap: '~49% SLA violations in test',
    color: 'orange',
  },
  {
    name: 'Huber Regression',
    loss: 'L(e) = 0.5e² if |e|≤δ, else δ(|e|−0.5δ)',
    lossName: 'Quadratic-Linear Hybrid (Robust)',
    why: 'Robust to outliers by switching from quadratic to linear beyond δ. The loss is still symmetric with respect to sign: under-prediction −e and over-prediction +e receive the exact same penalty.',
    gap: '~48% SLA violations in test',
    color: 'amber',
  },
  {
    name: 'Random Forest',
    loss: 'Split criterion: MSE = (1/N)Σ(yᵢ−ȳ)²',
    lossName: 'Variance Reduction (MSE)',
    why: 'Ensemble of decision trees, each trained with a symmetric MSE split criterion and aggregated via averaging. Nonlinear capacity does not overcome symmetric tree-splitting centering predictions around the conditional mean.',
    gap: '~52% SLA violations in test',
    color: 'yellow',
  },
  {
    name: 'SVR (RBF Kernel)',
    loss: 'L(e) = 0 if |e|≤ε, else |e|−ε',
    lossName: 'ε-Insensitive Symmetric Tube',
    why: 'Uses a symmetric epsilon-tube: deficits and surpluses outside the corridor receive identical linear penalties. Kernel trick adds nonlinearity but does not introduce directional cost awareness.',
    gap: '~51% SLA violations in test',
    color: 'red',
  },
];

const PILLAR_ICONS: Record<string, React.ElementType> = {
  asymmetric_cost: Scale,
  analytical_gradients: BrainCircuit,
  six_model_benchmark: Award,
  proactive_actuation: Clock,
};

const PILLAR_COLORS: Record<string, string> = {
  asymmetric_cost: 'blue',
  analytical_gradients: 'violet',
  six_model_benchmark: 'emerald',
  proactive_actuation: 'amber',
};

/* ─────────────────────────── colour helpers ─────────────────────────── */
type Color = 'rose' | 'orange' | 'amber' | 'yellow' | 'red' | 'blue' | 'violet' | 'emerald';

function colorClass(color: Color, variant: 'bg' | 'border' | 'text' | 'bgLight') {
  const map: Record<Color, Record<string, string>> = {
    rose:    { bg: 'bg-rose-600',    border: 'border-rose-200',    text: 'text-rose-700',    bgLight: 'bg-rose-50' },
    orange:  { bg: 'bg-orange-500',  border: 'border-orange-200',  text: 'text-orange-700',  bgLight: 'bg-orange-50' },
    amber:   { bg: 'bg-amber-500',   border: 'border-amber-200',   text: 'text-amber-700',   bgLight: 'bg-amber-50' },
    yellow:  { bg: 'bg-yellow-500',  border: 'border-yellow-200',  text: 'text-yellow-700',  bgLight: 'bg-yellow-50' },
    red:     { bg: 'bg-red-600',     border: 'border-red-200',     text: 'text-red-700',     bgLight: 'bg-red-50' },
    blue:    { bg: 'bg-blue-600',    border: 'border-blue-200',    text: 'text-blue-700',    bgLight: 'bg-blue-50' },
    violet:  { bg: 'bg-violet-600',  border: 'border-violet-200',  text: 'text-violet-700',  bgLight: 'bg-violet-50' },
    emerald: { bg: 'bg-emerald-600', border: 'border-emerald-200', text: 'text-emerald-700', bgLight: 'bg-emerald-50' },
  };
  return map[color][variant] ?? '';
}

/* ─────────────────────────── component ─────────────────────────── */

export const ResearchNoveltyPage: React.FC = () => {
  const [pillars, setPillars] = useState<NoveltyPillar[]>([]);
  const [activePillar, setActivePillar] = useState<string>('asymmetric_cost');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovelty()
      .then((data) => {
        setPillars(data.core_contributions);
        if (data.core_contributions.length > 0) {
          setActivePillar(data.core_contributions[0].id);
        }
      })
      .catch(() => {
        // fallback: empty — static content still shows
      })
      .finally(() => setLoading(false));
  }, []);

  const currentPillar = pillars.find((p) => p.id === activePillar) || pillars[0];

  return (
    <div className="space-y-10 max-w-5xl">

      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FlaskConical className="w-4 h-4" />
          <span>Research Problem · Existing Model Gaps · Proposed Novelty</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Why Symmetric ML Models Fail Cloud Auto-Scaling
        </h2>
        <p className="text-xs sm:text-sm text-[#475569] max-w-3xl mt-1.5 leading-relaxed">
          Every standard regression model — OLS, Ridge, Huber, Random Forest, SVR — optimises a{' '}
          <strong>symmetric loss function</strong>. This means under-provisioning a server by 5% and
          over-provisioning it by 5% are treated as equally bad errors. In cloud infrastructure, they
          are <em>not</em>: one causes an SLA outage costing thousands per minute; the other wastes
          a few cents of compute.
        </p>
      </div>

      {/* ── Problem Statement Banner ── */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-[0_2px_8px_rgba(239,68,68,0.06)]">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-rose-100 border border-rose-200 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
              Core Research Problem
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] leading-snug">
              The Symmetric Loss Assumption is Fundamentally Wrong for Cloud SLAs
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] mt-2 leading-relaxed">
              All five benchmark models (OLS, Ridge, Huber, Random Forest, SVR) minimise <strong>symmetric</strong>{' '}
              loss functions. They optimise for the <em>statistical centre</em> of the data distribution,
              resulting in predictions that are equally likely to under-provision as to over-provision.
              This produces <strong className="text-rose-700">~48–52% SLA violation rates</strong> on held-out test data —
              meaning roughly every other interval breaches the capacity contract.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: ShieldOff, label: 'SLA Violations', value: '~50%', sub: 'in all symmetric models', color: 'text-rose-600' },
                { icon: TrendingUp, label: 'Root Cause', value: 'Symmetric Loss', sub: 'MSE treats ±error equally', color: 'text-orange-600' },
                { icon: BarChart3, label: 'Test Set', value: '449 intervals', sub: 'chronological, zero leakage', color: 'text-violet-600' },
              ].map(({ icon: Icon, label, value, sub, color }) => (
                <div key={label} className="bg-white border border-rose-100 rounded-lg px-4 py-3 flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">{value}</div>
                    <div className="text-[10px] font-semibold text-[#64748B]">{label}</div>
                    <div className="text-[10px] text-[#94A3B8]">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Existing Model Gaps Grid ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-0.5">
            <XCircle className="w-4 h-4" />
            <span>Existing Model Gaps — All 5 Comparison Models Are Symmetric</span>
          </div>
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            Why Each Symmetric Model Fails SLA-Aware Cloud Auto-Scaling
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            These are the <strong>5 models used as baselines</strong> in our benchmark. Our asymmetric model
            is the proposed solution — it is NOT included in this group.
          </p>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {SYMMETRIC_MODELS.map((model) => {
            const c = model.color as Color;
            return (
              <div key={model.name} className="px-6 py-5 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Model tag */}
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${colorClass(c, 'bgLight')} ${colorClass(c, 'border')} ${colorClass(c, 'text')}`}>
                      <XCircle className="w-3.5 h-3.5" />
                      {model.name}
                    </span>
                    <div className="mt-1.5">
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                        Loss Type:
                      </span>
                      <span className="ml-1 text-[10px] text-[#0F172A] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        Symmetric
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                      {model.lossName}
                    </div>
                    {/* Formula */}
                    <div className="font-mono text-xs bg-slate-900 text-slate-200 px-3 py-2 rounded-md inline-block">
                      {model.loss}
                    </div>
                    {/* Why it fails */}
                    <p className="text-xs text-[#475569] leading-relaxed">{model.why}</p>
                  </div>

                  {/* Gap badge */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Test Result</span>
                    <span className={`inline-block px-2.5 py-1 rounded-lg border font-bold text-xs ${colorClass(c, 'bgLight')} ${colorClass(c, 'border')} ${colorClass(c, 'text')}`}>
                      {model.gap}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="px-6 py-4 bg-rose-50 border-t border-rose-100">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-[#475569] leading-relaxed">
              <strong className="text-[#0F172A]">Key insight:</strong> Even nonlinear models (Random Forest,
              SVR) fail at SLA compliance because their loss functions are symmetric. Adding model complexity
              (more trees, kernel tricks) cannot fix a fundamentally wrong optimisation objective. The only
              solution is to <strong>change the loss function itself</strong> to be asymmetric.
            </p>
          </div>
        </div>
      </div>

      {/* ── Research Gap ── */}
      <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-2xl p-6 shadow-[0_2px_8px_rgba(124,58,237,0.06)]">
        <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-3">
          <BookOpen className="w-4 h-4" />
          <span>Research Gap Identified</span>
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] mb-3">
          The Missing Piece: A Loss Function That Mirrors Real Cloud Costs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/70 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <XCircle className="w-3.5 h-3.5" />
              <span>What's Missing in All 5 Models</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#475569]">
              {[
                'No directional asymmetry in the loss function',
                'Under-provisioning treated same as over-provisioning',
                'No tunable SLA cost vs resource-waste trade-off',
                'No custom gradient derivation — all use standard optimisers',
                'No proactive SLA protection signal in training objective',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>What Our Proposed Model Adds</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#475569]">
              {[
                'Piecewise exponential-linear asymmetric loss (α, β, γ)',
                'Under-provisioning penalised exponentially more than over-provisioning',
                'Tunable hyperparameters to control SLA vs resource trade-off directly',
                'Hand-derived analytical piecewise gradient descent in NumPy',
                'Proactive 5-minute lookahead SCALE_UP / MAINTAIN / SCALE_DOWN signal',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── 4 Novelty Pillars ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Zap className="w-4 h-4" />
            <span>4 Core Academic Contributions</span>
          </div>
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            Technical Novelty of the Proposed Asymmetric Cost-Weighted Regression
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Four distinct, original engineering and mathematical contributions that differentiate this work.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Tab selector */}
          {loading ? (
            <div className="h-24 flex items-center justify-center text-xs text-[#64748B]">
              Loading novelty data from backend…
            </div>
          ) : pillars.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-xs text-[#64748B]">
              Could not fetch novelty data. Is the backend running?
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {pillars.map((pillar, idx) => {
                  const Icon = PILLAR_ICONS[pillar.id] || BrainCircuit;
                  const color = (PILLAR_COLORS[pillar.id] || 'blue') as Color;
                  const isActive = pillar.id === activePillar;
                  return (
                    <button
                      key={pillar.id}
                      onClick={() => setActivePillar(pillar.id)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl text-left transition-all border ${
                        isActive
                          ? `${colorClass(color, 'bgLight')} ${colorClass(color, 'border')} shadow-sm`
                          : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? colorClass(color, 'text') : 'text-[#64748B]'}`} />
                      <div className="min-w-0">
                        <div className={`text-[11px] font-bold block leading-snug ${isActive ? colorClass(color, 'text') : 'text-[#0F172A]'}`}>
                          {idx + 1}. {pillar.title}
                        </div>
                        <div className="text-[10px] text-[#64748B] mt-0.5 truncate">{pillar.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active pillar detail */}
              {currentPillar && (() => {
                const color = (PILLAR_COLORS[currentPillar.id] || 'blue') as Color;
                const Icon = PILLAR_ICONS[currentPillar.id] || BrainCircuit;
                return (
                  <div className={`rounded-xl border ${colorClass(color, 'border')} ${colorClass(color, 'bgLight')} p-5 space-y-4 transition-all`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${colorClass(color, 'bgLight')} ${colorClass(color, 'border')}`}>
                        <Icon className={`w-4 h-4 ${colorClass(color, 'text')}`} />
                      </div>
                      <div>
                        <div className={`text-[11px] font-bold uppercase tracking-wider ${colorClass(color, 'text')}`}>
                          {currentPillar.subtitle}
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F172A] mt-0.5">{currentPillar.title}</h4>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {currentPillar.summary}
                    </p>

                    {currentPillar.formula && (
                      <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">
                          <Code2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Mathematical Formulation</span>
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-blue-200">{currentPillar.formula}</pre>
                      </div>
                    )}

                    <div className="space-y-2 pt-1 border-t border-white/60">
                      <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider block">
                        Key Engineering Insights:
                      </span>
                      <ul className="space-y-1.5">
                        {currentPillar.key_points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${colorClass(color, 'text')}`} />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* ── Summary: Mathematical Loss Regimes Comparison ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Loss Formulation &amp; Optimization Regimes</span>
          </div>
          <h3 className="text-base font-extrabold text-[#0F172A]">
            Mathematical Contrast: Symmetric vs Asymmetric Literature vs Proposed Novelty
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Comparing the core optimization objectives, gradient characteristics, and empirical SLA failure boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Symmetric Regime */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                1. Symmetric Loss Regime (OLS, Ridge, Huber)
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] mt-0.5">Objective: Statistical Mean Error</h4>
              <div className="bg-slate-900 text-rose-300 font-mono text-[11px] p-2.5 rounded-lg mt-2">
                L(e) = (1/2) * e^2<br />
                dL/de = e  (Linear gradient)
              </div>
              <p className="text-xs text-[#475569] mt-2.5 leading-relaxed">
                Penalizes deficits and surpluses identically. Because error signs cancel out, gradient descent centres
                predictions directly on the mean, leaving ~50% of intervals in SLA under-provisioning starvation.
              </p>
            </div>
            <div className="bg-white border border-rose-100 rounded-lg p-2.5 text-xs text-rose-800 font-bold">
              Held-Out Test SLA Breach: ~50% – 54%
            </div>
          </div>

          {/* Asymmetric Literature Regime */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                2. Asymmetric Literature (Pinball &amp; Expectile)
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] mt-0.5">Objective: Asymmetric Quantiles / ALS</h4>
              <div className="bg-slate-900 text-amber-300 font-mono text-[11px] p-2.5 rounded-lg mt-2">
                L_tau(e) = max(tau*(-e), (1-tau)*e)<br />
                dL/de = -tau if e &lt; 0 else (1 - tau)
              </div>
              <p className="text-xs text-[#475569] mt-2.5 leading-relaxed">
                Directional penalty, but Pinball has a <strong>constant gradient</strong> (+/- tau): unable to scale up
                backprop during catastrophic outages. Expectile has quadratic surplus penalty causing high cloud over-billing waste.
              </p>
            </div>
            <div className="bg-white border border-amber-100 rounded-lg p-2.5 text-xs text-amber-800 font-bold">
              SLA Breach: 15% – 25% | High Wastage: 1.33 – 1.66
            </div>
          </div>

          {/* Proposed Novel Regime */}
          <div className="bg-emerald-50/50 border border-emerald-300 rounded-xl p-4 flex flex-col justify-between space-y-3 ring-1 ring-emerald-500/20">
            <div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                3. Proposed Model (Piecewise Exp-Linear)
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] mt-0.5">Objective: Cloud SLA Risk Minimization</h4>
              <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-2.5 rounded-lg mt-2">
                L(e) = alpha*(exp(beta*(-e))-1) [e&lt;0]<br />
                dL/de = -alpha*beta*exp(beta*(-e))
              </div>
              <p className="text-xs text-[#475569] mt-2.5 leading-relaxed">
                Exponential penalty barrier escalates to infinity during deep capacity spikes, physically preventing SLA
                breaches. Meanwhile, linear surplus term keeps hypervisor wastage tightly bounded. Hand-derived NumPy gradients.
              </p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-lg p-2.5 text-xs text-emerald-800 font-bold">
              Controlled Trade-off | Finite-Diff Check: 10^-11
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
