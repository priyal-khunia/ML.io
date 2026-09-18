import React from 'react';
import {
  BookOpen,
  Sigma,
  ShieldAlert,
  Coins,
  Workflow,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PenaltyCurveChart } from '../charts/PenaltyCurveChart';

export const TheoryPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          Academic Rigor & Mathematical Foundations
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Asymmetric Cost-Weighted Multivariable Regression
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
          In multitenant cloud environments, shorting server capacity leads to outages and SLA breaches, while
          allocating extra capacity only costs pennies. Standard machine learning treats both errors identically.
          Here is how custom asymmetric loss and analytical gradient descent solve this fundamental imbalance.
        </p>
      </div>

      {/* Visual Penalty Curve Comparison */}
      <PenaltyCurveChart />

      {/* Section 1: The Core Motivation */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          1. The Fundamental Flaw of Symmetric Regression (MSE)
        </h3>

        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300 leading-relaxed">
          <strong>In plain language:</strong> Standard linear regression squares every mistake equally. Under this traditional math, giving a server 5% less capacity than needed (which triggers HTTP 504 timeouts and contractual SLA penalties) is treated as having the exact same penalty as giving it 5% surplus capacity (which just idles harmlessly).
        </div>

        <p className="text-xs text-slate-400">
          Standard Ordinary Least Squares (OLS) minimizes Mean Squared Error (MSE):
        </p>

        <div className="p-4 bg-dark-950 border border-dark-700 rounded-xl font-mono text-xs text-slate-200 text-center">
          {"J_MSE(w, b) = (1 / 2N) * Σ (ŷ_i - y_i)²"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-300 space-y-1.5">
            <span className="font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Under-Provisioning (Error &lt; 0)
            </span>
            <p>
              Causes severe CPU starvation, memory swapping, transaction drops, and SLA contractual penalties ($1000s/min).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300 space-y-1.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              Over-Provisioning (Error &ge; 0)
            </span>
            <p>
              Provides a safety buffer. Costs fractional pennies in idle hypervisor compute with optimal response latency.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Mathematical Formulation */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sigma className="w-4 h-4 text-emerald-400" />
          2. Proposed Asymmetric Cost Function
        </h3>

        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300 leading-relaxed">
          <strong>In plain language:</strong> We split error into two distinct branches: if our forecast falls short of actual demand, the penalty accelerates exponentially like a steep wall; if our forecast exceeds actual demand, the penalty grows only as a gentle linear slope.
        </div>

        <p className="text-xs text-slate-400">
          Let prediction error be <span className="font-mono text-slate-200">e_i = ŷ_i - y_i</span>, where{' '}
          <span className="font-mono text-slate-200">ŷ_i = wᵀx_i + b</span>:
        </p>

        <div className="p-4 bg-dark-950 border border-dark-700 rounded-xl font-mono text-xs space-y-3">
          <div>
            <span className="text-rose-400 font-bold block mb-1">
              Case A: Under-prediction deficit (ŷ_i &lt; y_i, e_i &lt; 0) — Exponential SLA Violation Penalty:
            </span>
            <div className="pl-4 py-1 text-emerald-400 font-bold text-sm">
              {"L(e_i) = α · [ exp( β · (y_i - ŷ_i) ) - 1 ]"}
            </div>
          </div>

          <div className="pt-2 border-t border-dark-700">
            <span className="text-emerald-400 font-bold block mb-1">
              Case B: Over-prediction surplus (ŷ_i &ge; y_i, e_i &ge; 0) — Linear Cloud Wastage Cost:
            </span>
            <div className="pl-4 py-1 text-emerald-400 font-bold text-sm">
              {"L(e_i) = γ · ( ŷ_i - y_i )"}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-dark-950 border border-dark-700 rounded-xl text-xs space-y-2">
          <span className="font-semibold text-white block">Hyperparameter Roles:</span>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-start gap-2">
              <strong className="font-mono text-emerald-400 shrink-0">α (alpha = 1.0):</strong>
              <span>Base scale magnitude for the under-prediction penalty ramp.</span>
            </li>
            <li className="flex items-start gap-2">
              <strong className="font-mono text-emerald-400 shrink-0">β (beta = 0.7):</strong>
              <span>Exponential steepness. Calibrated to cut SLA violations from 53% to 32% while keeping R² high (0.53).</span>
            </li>
            <li className="flex items-start gap-2">
              <strong className="font-mono text-emerald-400 shrink-0">γ (gamma = 0.5):</strong>
              <span>Linear cost per surplus unit of memory or CPU allocated beyond demand.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Section 3: Analytical Gradients */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Workflow className="w-4 h-4 text-cyan-400" />
          3. Explicit Analytical Gradient Descent Derivation
        </h3>

        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300 leading-relaxed">
          <strong>In plain language:</strong> Gradient descent asks: "If I tweak my weights slightly, how does loss change?" When our prediction falls short, the gradient produces an immense upward force that violently lifts the forecast. When our prediction is surplus, it applies only a small, constant downward tap.
        </div>

        <p className="text-xs text-slate-400">
          Step 1: First derivative of sample loss with respect to continuous forecast ŷ_i:
        </p>

        <div className="p-4 bg-dark-950 border border-dark-700 rounded-xl font-mono text-xs space-y-2">
          <div className="text-rose-300">
            {"∂L_i / ∂ŷ_i = -α · β · exp( β · (y_i - ŷ_i) )    [if ŷ_i < y_i: strong upward force]"}
          </div>
          <div className="text-emerald-300">
            {"∂L_i / ∂ŷ_i = +γ                                  [if ŷ_i >= y_i: modest downward tap]"}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Step 2: Multivariable chain rule to compute batch parameter gradients across all N training samples:
        </p>

        <div className="p-4 bg-dark-950 border border-dark-700 rounded-xl font-mono text-xs text-slate-200 space-y-2">
          <div>{"∂J / ∂w = (1 / N) * Xᵀ · (∂L / ∂ŷ)     [Feature weight vector gradient]"}</div>
          <div>{"∂J / ∂b = (1 / N) * Σ (∂L_i / ∂ŷ_i)    [Scalar bias intercept gradient]"}</div>
        </div>

        <div className="p-3.5 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-300 leading-relaxed">
          <strong>In plain language:</strong> Each epoch updates the model using learning rate η (0.005):
          <div className="mt-2 font-mono text-emerald-400">
            {"w ← w - η · (∂J / ∂w),       b ← b - η · (∂J / ∂b)"}
          </div>
        </div>
      </div>

      {/* Section 4: Operational Metrics */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          4. Academic Evaluation Metrics & Trade-Offs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-dark-950 border border-dark-700 rounded-xl space-y-2">
            <span className="font-bold text-white block">SLA Violation Rate (%)</span>
            <div className="p-2 bg-dark-900 rounded font-mono text-rose-400 text-[11px]">
              {"SLA Rate = [ Count(ŷ_i < y_i) / Total Test Samples ] * 100%"}
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>In plain language:</strong> The fraction of operational windows where our model under-predicted and failed the cluster SLA. Lower is better.
            </p>
          </div>

          <div className="p-4 bg-dark-950 border border-dark-700 rounded-xl space-y-2">
            <span className="font-bold text-white block">Resource Wastage Index</span>
            <div className="p-2 bg-dark-900 rounded font-mono text-amber-400 text-[11px]">
              {"Wastage Index = (1 / N) * Σ max(0, ŷ_i - y_i)"}
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>In plain language:</strong> The mean amount of safety buffer capacity provisioned beyond actual load. Represents the controlled cost of insurance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
