import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Cpu,
  Activity,
  HardDrive,
  Globe,
  Info,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { PredictResponse, PredictRequest } from '../types/api';
import { postPredict } from '../services/api';

export const SimulationPage: React.FC = () => {
  const [inputs, setInputs] = useState<PredictRequest>({
    cpu_util_percent: 0,
    mem_util_percent: 0,
    net_in: 0,
    net_out: 0,
    disk_io_percent: 0,
    current_capacity: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      label: 'Nominal Steady State',
      desc: 'Typical cloud workload',
      values: { cpu_util_percent: 40.2, mem_util_percent: 87.9, net_in: 41.0, net_out: 32.5, disk_io_percent: 7.7, current_capacity: 88.0 }
    },
    {
      label: 'Traffic Surge',
      desc: 'Inbound request surge',
      values: { cpu_util_percent: 68.5, mem_util_percent: 92.4, net_in: 46.5, net_out: 36.8, disk_io_percent: 18.2, current_capacity: 85.0 }
    },
    {
      label: 'Memory Saturation',
      desc: 'High RAM with moderate CPU',
      values: { cpu_util_percent: 32.0, mem_util_percent: 94.8, net_in: 42.0, net_out: 33.1, disk_io_percent: 8.5, current_capacity: 89.0 }
    },
    {
      label: 'Off-Peak Quiet',
      desc: 'Early morning minimal load',
      values: { cpu_util_percent: 18.5, mem_util_percent: 84.2, net_in: 35.1, net_out: 27.8, disk_io_percent: 3.8, current_capacity: 90.0 }
    },
  ];

  const handleClear = () => {
    setInputs({
      cpu_util_percent: 0,
      mem_util_percent: 0,
      net_in: 0,
      net_out: 0,
      disk_io_percent: 0,
      current_capacity: undefined,
    });
    setResult(null);
    setError(null);
  };

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await postPredict(inputs);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" />
          Interactive Inference & Decision Simulation
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cloud Resource Prediction & Auto-Scaling Engine
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
          Input instantaneous cloud server metrics to evaluate the asymmetric regression model (calibrated with &beta; = 0.70).
          The engine computes the 5-minute forecast with built-in SLA safety margin and issues an auto-scaling recommendation.
        </p>
      </div>

      {/* Workload Presets */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
          Workload Scenario Presets (Click to autofill):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setInputs(preset.values);
                setResult(null);
              }}
              className="text-left p-3 rounded-xl bg-dark-900 border border-dark-700 hover:border-emerald-500/50 hover:bg-dark-850 transition-all group"
            >
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 block">
                {preset.label}
              </span>
              <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Input Form */}
        <div className="lg:col-span-6 bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-700">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Input Cloud Server Metrics (X)
              </h3>
              <p className="text-[11px] text-slate-400">Type or adjust values for instant prediction</p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors border border-dark-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Form</span>
            </button>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            {/* CPU Util */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  CPU Utilization (cpu_util_percent)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputs.cpu_util_percent || ''}
                    onChange={(e) => setInputs({ ...inputs, cpu_util_percent: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className="w-20 px-2 py-1 bg-dark-800 border border-dark-700 rounded text-right font-mono text-cyan-400 font-bold text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <span className="font-mono text-cyan-400 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={inputs.cpu_util_percent}
                onChange={(e) => setInputs({ ...inputs, cpu_util_percent: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Memory Util */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Memory Utilization (mem_util_percent)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputs.mem_util_percent || ''}
                    onChange={(e) => setInputs({ ...inputs, mem_util_percent: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className="w-20 px-2 py-1 bg-dark-800 border border-dark-700 rounded text-right font-mono text-emerald-400 font-bold text-xs focus:outline-none focus:border-emerald-400"
                  />
                  <span className="font-mono text-emerald-400 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={inputs.mem_util_percent}
                onChange={(e) => setInputs({ ...inputs, mem_util_percent: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Network In & Out */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1 text-slate-300 font-semibold truncate">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Net In (MB/s)
                  </label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={inputs.net_in || ''}
                  onChange={(e) => setInputs({ ...inputs, net_in: parseFloat(e.target.value) || 0 })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1 text-slate-300 font-semibold truncate">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    Net Out (MB/s)
                  </label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={inputs.net_out || ''}
                  onChange={(e) => setInputs({ ...inputs, net_out: parseFloat(e.target.value) || 0 })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Disk IO */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  Disk I/O Utilization (disk_io_percent)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputs.disk_io_percent || ''}
                    onChange={(e) => setInputs({ ...inputs, disk_io_percent: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className="w-20 px-2 py-1 bg-dark-800 border border-dark-700 rounded text-right font-mono text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                  <span className="font-mono text-amber-400 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={inputs.disk_io_percent}
                onChange={(e) => setInputs({ ...inputs, disk_io_percent: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Current Provisioned Capacity Reference */}
            <div className="pt-2 border-t border-dark-700/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="text-slate-400 font-medium">
                  Current Provisioned Baseline Capacity (%) (Optional)
                </label>
                <span className="font-mono text-slate-300">
                  {inputs.current_capacity !== undefined ? `${inputs.current_capacity}%` : 'None'}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="e.g. 85.0"
                value={inputs.current_capacity ?? ''}
                onChange={(e) => setInputs({ ...inputs, current_capacity: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="predict-btn"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Executing Multivariable Inference...' : 'PREDICT RESOURCE REQUIREMENT'}</span>
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Prediction Results & Scaling Decision */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Primary Output Card */}
              <div className="bg-dark-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Model Inference Output (+5 Min)
                  </span>
                  <StatusBadge action={result.scaling_action} size="md" />
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-dark-950 rounded-xl border border-dark-700">
                    <span className="text-xs text-slate-400 block mb-1">
                      Asymmetric Model Forecast
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {result.predicted_resource.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-emerald-400">%</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium block mt-1">
                      SLA-Protected Target
                    </span>
                  </div>

                  <div className="p-4 bg-dark-950 rounded-xl border border-dark-700">
                    <span className="text-xs text-slate-400 block mb-1">
                      Baseline OLS Forecast
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-400 font-mono">
                        {result.baseline_predicted_resource.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      Symmetric MSE
                    </span>
                  </div>
                </div>

                {/* Safety Headroom Callout */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Asymmetric Safety Buffer (Δ vs OLS):
                  </span>
                  <span className="font-mono font-bold text-emerald-300">
                    +{result.asymmetric_safety_headroom > 0 ? result.asymmetric_safety_headroom.toFixed(2) : '0.00'}% Capacity Headroom
                  </span>
                </div>
              </div>

              {/* Decision Rationale */}
              <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                  <Info className="w-4 h-4 text-emerald-400" />
                  Recommended Scaling Action & Rationale
                </div>

                <div className="p-4 bg-dark-950 border border-dark-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Provisioning Status:</span>
                    <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-dark-800 border border-dark-700">
                      {result.provisioning_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-dark-700">
                    {result.rationale}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-dark-950 rounded-xl border border-dark-700">
                    <span className="text-slate-400 block text-[11px]">Decision Confidence</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {result.confidence_score}%
                    </span>
                  </div>
                  <div className="p-3 bg-dark-950 rounded-xl border border-dark-700">
                    <span className="text-slate-400 block text-[11px]">Prediction ID</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      #{result.prediction_id}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Note: This recommendation is simulated for academic evaluation; no live cloud hypervisor API is invoked.
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-dark-900/60 border border-dashed border-dark-700 rounded-2xl text-center">
              <Sparkles className="w-10 h-10 text-emerald-500/30 mb-3" />
              <h4 className="text-sm font-bold text-slate-300">Awaiting Workload Input</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Enter your metrics on the left or pick an example preset, then click{' '}
                <strong className="text-emerald-400">"PREDICT RESOURCE REQUIREMENT"</strong> to evaluate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
