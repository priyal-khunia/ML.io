import React from 'react';
import {
  Server,
  Activity,
  Sliders,
  BarChart3,
  BrainCircuit,
  Database,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  backendHealthy: boolean;
  modelReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  backendHealthy,
  modelReady,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'simulation', label: 'Live Simulation', icon: Sliders },
    { id: 'comparison', label: 'Model Comparison', icon: BarChart3 },
    { id: 'training', label: 'Gradient Descent Lab', icon: BrainCircuit },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Academic Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6C63FF] rounded-xl shadow-sm text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-[#252936] uppercase">
                  Asymmetric Cloud Scaling ML
                </h1>
                <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20">
                  Prototype
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] truncate max-w-md">
                Asymmetric Cost-Weighted Multivariable Regression for Resource Auto-Scaling
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#8B85FF]/15 text-[#6C63FF] border border-[#8B85FF]/30 shadow-sm'
                      : 'text-[#6B7280] hover:text-[#252936] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backend Status Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border bg-[#F9FAFB] border-[#E5E7EB]">
              {backendHealthy ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#35B99A] animate-pulse" />
                  <span className="text-[#35B99A] font-medium">FastAPI Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#E76F6F]" />
                  <span className="text-[#E76F6F] font-medium">Backend Offline</span>
                </>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono border bg-[#F9FAFB] border-[#E5E7EB]">
              {modelReady ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-[#6C63FF]" />
                  <span className="text-[#6C63FF]">Models Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-[#E7A83B]" />
                  <span className="text-[#E7A83B]">Uninitialized</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-[#E5E7EB] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-[#8B85FF]/20 text-[#6C63FF] border border-[#8B85FF]/30'
                    : 'text-[#6B7280] hover:text-[#252936]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
