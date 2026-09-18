import React from 'react';
import {
  Server,
  Activity,
  Sliders,
  BarChart3,
  BrainCircuit,
  Database,
  BookOpen,
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
    { id: 'theory', label: 'Academic Theory & Math', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Academic Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl shadow-md shadow-indigo-500/20 text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white uppercase">
                  Asymmetric Cloud Scaling ML
                </h1>
                <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
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
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border bg-slate-900 border-slate-800">
              {backendHealthy ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">FastAPI Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-400 font-medium">Backend Offline</span>
                </>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono border bg-slate-900 border-slate-800">
              {modelReady ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300">Models Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Uninitialized</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
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
