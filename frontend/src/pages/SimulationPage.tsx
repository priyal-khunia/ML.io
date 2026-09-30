import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Activity,
  HardDrive,
  Globe,
  Info,
  RotateCcw,
  AlertTriangle,
  Server,
  ArrowRight,
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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" />
          <span>Interactive Inference & Decision Simulation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Cloud Resource Prediction & Auto-Scaling Engine
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl mt-1.5 leading-relaxed">
          Simulate 5-minute resource forecasts and automated scaling recommendations from live telemetry.
        </p>
      </div>

      {/* Workload Presets */}
      <div>
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2.5">
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
              className="text-left p-3 rounded-lg bg-white border border-[#E2E8F0] hover:border-blue-400 hover:bg-[#F8FAFC] transition-colors group"
            >
              <span className="text-xs font-bold text-[#0F172A] group-hover:text-blue-600 block">
                {preset.label}
              </span>
              <span className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Input Form */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Input Cloud Server Metrics (X)
              </h3>
              <p className="text-[11px] text-[#64748B]">Type or adjust values for instant prediction</p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors border border-[#CBD5E1]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Form</span>
            </button>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* CPU Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                  <Cpu className="w-3.5 h-3.5 text-sky-600" />
                  <span>CPU Utilization</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputs.cpu_util_percent}
                    onChange={(e) => setInputs({ ...inputs, cpu_util_percent: parseFloat(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-right font-mono text-[#0F172A] font-bold text-xs focus:outline-none focus:border-blue-600"
                  />
                  <span className="font-mono text-blue-600 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={inputs.cpu_util_percent}
                onChange={(e) => setInputs({ ...inputs, cpu_util_percent: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-[#E2E8F0] rounded-md appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Memory Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Memory Utilization</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputs.mem_util_percent}
                    onChange={(e) => setInputs({ ...inputs, mem_util_percent: parseFloat(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-right font-mono text-[#0F172A] font-bold text-xs focus:outline-none focus:border-blue-600"
                  />
                  <span className="font-mono text-blue-600 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={inputs.mem_util_percent}
                onChange={(e) => setInputs({ ...inputs, mem_util_percent: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-[#E2E8F0] rounded-md appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Network In & Out Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Net In</span>
                  </span>
                  <span className="text-[10px] text-[#64748B]">MB/s</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.net_in}
                  onChange={(e) => setInputs({ ...inputs, net_in: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-xs font-mono text-[#0F172A] focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Net Out</span>
                  </span>
                  <span className="text-[10px] text-[#64748B]">MB/s</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.net_out}
                  onChange={(e) => setInputs({ ...inputs, net_out: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-xs font-mono text-[#0F172A] focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Disk I/O Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                  <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Disk I/O Utilization</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputs.disk_io_percent}
                    onChange={(e) => setInputs({ ...inputs, disk_io_percent: parseFloat(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-right font-mono text-[#0F172A] font-bold text-xs focus:outline-none focus:border-blue-600"
                  />
                  <span className="font-mono text-blue-600 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={inputs.disk_io_percent}
                onChange={(e) => setInputs({ ...inputs, disk_io_percent: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-[#E2E8F0] rounded-md appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Optional Current Capacity */}
            <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#0F172A]">
                  Current Cluster Capacity Buffer (Optional %)
                </label>
                <span className="font-mono text-[#0F172A]">
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
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-xs font-mono text-[#0F172A] focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="predict-btn"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <Server className="w-4 h-4" />
              <span>{loading ? 'Executing Multivariable Inference...' : 'PREDICT RESOURCE REQUIREMENT'}</span>
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs flex items-center gap-2">
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
              <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Model Inference Output (+5 Min)
                  </span>
                  <StatusBadge action={result.scaling_action} size="md" />
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-xs text-[#64748B] block mb-1">
                      Asymmetric Model Forecast
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[#0F172A] font-mono">
                        {result.predicted_resource.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">%</span>
                    </div>
                    <span className="text-[11px] text-blue-700 font-medium block mt-1">
                      SLA-Protected Target
                    </span>
                  </div>

                  <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-xs text-[#64748B] block mb-1">
                      Baseline OLS Forecast
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[#64748B] font-mono">
                        {result.baseline_predicted_resource.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-[#64748B]">%</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] font-medium block mt-1">
                      Symmetric MSE
                    </span>
                  </div>
                </div>

                {/* Safety Headroom Callout */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between text-xs">
                  <span className="text-[#0F172A]">
                    Asymmetric Safety Buffer (Δ vs OLS):
                  </span>
                  <span className="font-mono font-bold text-blue-700">
                    +{result.asymmetric_safety_headroom > 0 ? result.asymmetric_safety_headroom.toFixed(2) : '0.00'}% Capacity Headroom
                  </span>
                </div>
              </div>

              {/* Decision Rationale */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
                <div className="flex items-center gap-2 text-[#0F172A] font-bold text-sm uppercase tracking-wider">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Recommended Scaling Action & Rationale</span>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Provisioning Status:</span>
                    <span className="font-mono font-bold text-[#0F172A] px-2 py-0.5 rounded-md bg-white border border-[#CBD5E1]">
                      {result.provisioning_status}
                    </span>
                  </div>

                  <p className="text-xs text-[#0F172A] leading-relaxed pt-2 border-t border-[#E2E8F0]">
                    {result.rationale}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[11px]">Decision Confidence</span>
                    <span className="font-mono font-bold text-[#0F172A] text-sm">
                      {result.confidence_score}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[11px]">Prediction ID</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      #{result.prediction_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white/70 border border-dashed border-[#CBD5E1] rounded-xl text-center">
              <Server className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-[#0F172A]">Awaiting Workload Telemetry Input</h4>
              <p className="text-xs text-[#64748B] max-w-sm mt-1">
                Enter your metrics on the left or select a scenario preset, then click{' '}
                <strong className="text-blue-700">"PREDICT RESOURCE REQUIREMENT"</strong> to evaluate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
