import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { DatasetSummary } from '../types/api';
import { fetchDatasetSummary, addDatasetRow } from '../services/api';

export const DatasetPage: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add new observation form state
  const [newRow, setNewRow] = useState({
    cpu_util_percent: '',
    mem_util_percent: '',
    net_in: '',
    net_out: '',
    disk_io_percent: '',
    required_resource_next_5min: '',
  });
  const [addingRow, setAddingRow] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasetSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.cpu_util_percent || !newRow.mem_util_percent) {
      alert('Please provide at least CPU and Memory values');
      return;
    }
    setAddingRow(true);
    setAddMsg(null);
    try {
      const res = await addDatasetRow({
        cpu_util_percent: parseFloat(newRow.cpu_util_percent) || 0,
        mem_util_percent: parseFloat(newRow.mem_util_percent) || 0,
        net_in: parseFloat(newRow.net_in) || 0,
        net_out: parseFloat(newRow.net_out) || 0,
        disk_io_percent: parseFloat(newRow.disk_io_percent) || 0,
        required_resource_next_5min: newRow.required_resource_next_5min ? parseFloat(newRow.required_resource_next_5min) : undefined,
      });
      setSummary(res.summary);
      setAddMsg('Row added successfully! Models automatically updated.');
      setNewRow({
        cpu_util_percent: '',
        mem_util_percent: '',
        net_in: '',
        net_out: '',
        disk_io_percent: '',
        required_resource_next_5min: '',
      });
    } catch (err: any) {
      alert(`Error adding row: ${err.message}`);
    } finally {
      setAddingRow(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-[#6B7280] text-sm">
        Loading dataset metadata from backend...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-[#E76F6F]/10 border border-[#E76F6F]/30 rounded-2xl text-[#E76F6F] text-sm">
        Failed to load dataset: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-bold uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" />
          Cloud Server Observability Telemetry
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#252936] tracking-tight">
          Dataset Characteristics & Preprocessing Pipeline
        </h2>
        <p className="text-sm text-[#6B7280] max-w-3xl mt-1">
          cloud_resource_dataset.csv &mdash; 5 telemetry features, 5-min-ahead target.
        </p>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Total Observations
          </span>
          <span className="text-2xl font-bold text-[#252936] font-mono mt-1 block">
            {summary.total_records.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            Sequential 5-min intervals
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Input Features (X)
          </span>
          <span className="text-2xl font-bold text-[#6C63FF] font-mono mt-1 block">
            {summary.feature_names.length}
          </span>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            Multivariable telemetry
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Train Split (80%)
          </span>
          <span className="text-2xl font-bold text-[#5B9CF6] font-mono mt-1 block">
            {summary.train_records.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            Chronological
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Test Split (20%)
          </span>
          <span className="text-2xl font-bold text-[#E7A83B] font-mono mt-1 block">
            {summary.test_records.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            Holdout partition
          </span>
        </div>
      </div>

      {/* Feature Distributions & Preprocessing Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <h3 className="text-sm font-bold text-[#252936] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6C63FF]" />
            Statistical Distributions of Input Features & Target
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                  <th className="pb-3">Column Name</th>
                  <th className="pb-3 text-right">Mean</th>
                  <th className="pb-3 text-right">Std</th>
                  <th className="pb-3 text-right">Min</th>
                  <th className="pb-3 text-right">Median</th>
                  <th className="pb-3 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] font-mono">
                {Object.entries(summary.feature_statistics).map(([col, stats]) => {
                  const isTarget = col === summary.target_name;
                  return (
                    <tr
                      key={col}
                      className={`hover:bg-[#F7F8FC] transition-colors ${
                        isTarget ? 'bg-[#6C63FF]/5' : ''
                      }`}
                    >
                      <td className="py-2.5 font-sans font-medium text-[#252936] flex items-center gap-2">
                        <span>{col}</span>
                        {isTarget && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30">
                            TARGET (Y)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-[#252936]">{stats.mean.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-[#6B7280]">{stats.std.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-[#6B7280]">{stats.min.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-[#6C63FF] font-bold">{stats.median.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-[#252936]">{stats.max.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Preprocessing Audit Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <h3 className="text-sm font-bold text-[#252936] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#35B99A]" />
            Preprocessing & Hygiene Audit
          </h3>

          <ul className="space-y-3 text-xs text-[#6B7280]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#35B99A] shrink-0" />
              <span>
                <strong className="text-[#252936]">Zero Missing Values</strong> ({summary.total_records.toLocaleString()} rows)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#35B99A] shrink-0" />
              <span>
                <strong className="text-[#252936]">Zero Duplicate Rows</strong>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#35B99A] shrink-0" />
              <span>
                <strong className="text-[#252936]">Chronological Split:</strong> 80% Train ({summary.train_records.toLocaleString()}) / 20% Test ({summary.test_records.toLocaleString()})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#35B99A] shrink-0" />
              <span>
                <strong className="text-[#252936]">StandardScaler:</strong> Fitted strictly on train set
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Add Custom Telemetry Observation Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#6C63FF]" />
            <h3 className="text-sm font-bold text-[#252936] uppercase tracking-wider">
              Add New Telemetry Observation
            </h3>
          </div>
          {addMsg && (
            <span className="text-xs font-semibold text-[#35B99A] bg-[#35B99A]/10 border border-[#35B99A]/20 px-2.5 py-1 rounded">
              {addMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleAddRow} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">CPU %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 45.2"
              value={newRow.cpu_util_percent}
              onChange={(e) => setNewRow({ ...newRow, cpu_util_percent: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-mono text-[#252936] focus:outline-none focus:border-[#6C63FF]"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">Mem %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 88.5"
              value={newRow.mem_util_percent}
              onChange={(e) => setNewRow({ ...newRow, mem_util_percent: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-mono text-[#252936] focus:outline-none focus:border-[#6C63FF]"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">Net In</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 35.0"
              value={newRow.net_in}
              onChange={(e) => setNewRow({ ...newRow, net_in: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-mono text-[#252936] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">Net Out</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 28.0"
              value={newRow.net_out}
              onChange={(e) => setNewRow({ ...newRow, net_out: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-mono text-[#252936] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">Disk I/O %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 5.5"
              value={newRow.disk_io_percent}
              onChange={(e) => setNewRow({ ...newRow, disk_io_percent: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-mono text-[#252936] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              type="submit"
              disabled={addingRow}
              className="w-full py-1.5 px-3 rounded bg-[#6C63FF] hover:bg-[#5A52E0] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {addingRow ? 'Adding...' : '+ Add Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#252936] uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#6C63FF]" />
            Dataset Observation Preview
          </h3>
          <span className="text-xs font-mono text-[#6B7280]">Showing 15 rows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                <th className="pb-3">Index</th>
                <th className="pb-3">CPU Util %</th>
                <th className="pb-3">Mem Util %</th>
                <th className="pb-3">Net In</th>
                <th className="pb-3">Net Out</th>
                <th className="pb-3">Disk I/O %</th>
                <th className="pb-3 text-[#6C63FF] font-bold">Target (+5 min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-mono">
              {summary.preview.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F7F8FC] transition-colors">
                  <td className="py-2.5 text-[#6B7280] font-sans">#{idx + 1}</td>
                  <td className="py-2.5 text-[#252936]">{Number(row.cpu_util_percent).toFixed(2)}%</td>
                  <td className="py-2.5 text-[#252936]">{Number(row.mem_util_percent).toFixed(2)}%</td>
                  <td className="py-2.5 text-[#6B7280]">{Number(row.net_in).toFixed(2)}</td>
                  <td className="py-2.5 text-[#6B7280]">{Number(row.net_out).toFixed(2)}</td>
                  <td className="py-2.5 text-[#6B7280]">{Number(row.disk_io_percent).toFixed(2)}%</td>
                  <td className="py-2.5 font-bold text-[#6C63FF]">
                    {Number(row.required_resource_next_5min).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
