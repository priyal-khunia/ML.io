import React, { useState } from 'react';
import {
  Server,
  Activity,
  Sliders,
  BarChart3,
  BrainCircuit,
  Database,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  backendHealthy: boolean;
  modelReady: boolean;
  comparisonR2?: { baseline: number; asymmetric: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  backendHealthy,
  modelReady,
  comparisonR2,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      desc: 'Telemetry & live capacity',
      icon: Activity,
    },
    {
      id: 'simulation',
      label: 'Live Simulation',
      desc: 'Interactive scaling inference',
      icon: Sliders,
    },
    {
      id: 'comparison',
      label: 'Model Comparison',
      desc: 'Baseline Models vs Asymmetric',
      icon: BarChart3,
    },
    {
      id: 'training',
      label: 'Gradient Descent Lab',
      desc: 'Loss tuning & hyperparameter lab',
      icon: BrainCircuit,
    },
    {
      id: 'dataset',
      label: 'Dataset Explorer',
      desc: 'Cluster telemetry & features',
      icon: Database,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB] text-[#252936]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#6C63FF]/10 border border-[#6C63FF]/25 rounded-xl text-[#6C63FF] shrink-0 shadow-sm">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-[#252936] tracking-tight truncate">
                Cloud Auto-Scale ML
              </h1>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/25 font-semibold">
                Lab
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] truncate">
              Asymmetric Cost Regression
            </p>
          </div>
        </div>
      </div>

      {/* System Status Card */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F7F8FC]">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy ? 'bg-[#35B99A] animate-pulse' : 'bg-[#E76F6F]'
              }`}
            />
            <span className={backendHealthy ? 'text-[#35B99A] font-semibold' : 'text-[#E76F6F] font-semibold'}>
              {backendHealthy ? 'FastAPI Online' : 'Backend Offline'}
            </span>
          </div>
          <span className="text-[#6B7280] font-sans">
            {modelReady ? 'Models Ready' : 'Initializing...'}
          </span>
        </div>
        {comparisonR2 && (
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#6B7280] bg-white px-2 py-1 rounded border border-[#E5E7EB]">
            <span>OLS R²: {comparisonR2.baseline.toFixed(2)}</span>
            <span className="text-[#6C63FF] font-bold">
              Asym R²: {comparisonR2.asymmetric.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
          Navigation Sections
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all group relative ${
                isActive
                  ? 'bg-[#8B85FF]/15 text-[#6C63FF] border border-[#8B85FF]/40 shadow-sm'
                  : 'text-[#6B7280] hover:text-[#252936] hover:bg-[#F3F4F6] border border-transparent'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#6C63FF] rounded-r" />
              )}
              <Icon
                className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#6C63FF]'
                    : 'text-[#6B7280] group-hover:text-[#252936]'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-semibold truncate ${
                    isActive ? 'text-[#6C63FF]' : 'text-[#252936]'
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#F7F8FC] text-[11px] text-[#6B7280] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[#6C63FF] font-bold text-[10px]">β = 0.70</span>
          <span className="text-[#6B7280] font-mono text-[10px]">400 Epochs</span>
        </div>
        <p className="text-[10px] text-[#6B7280] leading-tight">
          Penalizes under-allocation to protect cluster SLA agreements.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-3.5 bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#6C63FF]/10 border border-[#6C63FF]/25 rounded-lg text-[#6C63FF]">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#252936] block">Cloud Auto-Scale ML</span>
            <span className="text-[10px] font-mono text-[#6C63FF] font-semibold">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#F9FAFB] text-[#252936] border border-[#E5E7EB]"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-64 z-30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {navContent}
      </aside>
    </>
  );
};
