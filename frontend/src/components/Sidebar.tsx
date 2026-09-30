import React, { useState } from 'react';
import {
  Server,
  Activity,
  Sliders,
  BarChart3,
  BrainCircuit,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  backendHealthy?: boolean;
  modelReady?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'overview',
      label: 'Telemetry Overview',
      desc: 'Cluster health & telemetry',
      icon: Activity,
    },
    {
      id: 'simulation',
      label: 'Decision Simulation',
      desc: 'Proactive capacity forecasting',
      icon: Sliders,
    },
    {
      id: 'comparison',
      label: 'Model Benchmark',
      desc: 'Performance evaluation',
      icon: BarChart3,
    },
    {
      id: 'training',
      label: 'Model Training Lab',
      desc: 'Hyperparameters & convergence',
      icon: BrainCircuit,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] text-[#0F172A]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-[#0F172A] tracking-tight truncate">
                Cloud Auto-Scale ML
              </h1>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] truncate mt-0.5">
              Asymmetric Cost Regression
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
          Core Workstation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50/80 text-blue-700 border border-blue-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-[#64748B]'
                }`}
              />
              <div className="min-w-0">
                <div
                  className={`text-xs font-bold leading-snug truncate ${
                    isActive ? 'text-blue-700' : 'text-[#0F172A]'
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-[11px] text-[#64748B] leading-tight truncate mt-0.5">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]/50 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B] font-medium">Cluster Telemetry</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B] font-medium">Validation Split</span>
          <span className="font-mono text-[10px] text-[#0F172A] font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            80/20 Chrono
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-md text-blue-600">
            <Server className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#0F172A]">Cloud Auto-Scale ML</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#64748B] hover:text-[#0F172A] focus:outline-none"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {navContent}
      </aside>
    </>
  );
};
