import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { SimulationPage } from './pages/SimulationPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { TrainingPage } from './pages/TrainingPage';
import { DatasetPage } from './pages/DatasetPage';
import { fetchHealth, fetchComparison } from './services/api';
import { ComparisonResponse } from './types/api';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setInitError(null);
    try {
      const health = await fetchHealth();
      setBackendHealthy(health.status === 'healthy');
      setModelReady(health.models_initialized);

      const comp = await fetchComparison();
      setComparison(comp);
      setModelReady(true);
    } catch (err: any) {
      setBackendHealthy(false);
      setInitError(err.message || 'Unable to connect to FastAPI backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetchHealth()
        .then((h) => {
          setBackendHealthy(h.status === 'healthy');
          setModelReady(h.models_initialized);
        })
        .catch(() => setBackendHealthy(false));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTrainingSuccess = (newComparison: ComparisonResponse) => {
    setComparison(newComparison);
    setModelReady(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Fixed Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendHealthy={backendHealthy}
        modelReady={modelReady}
        comparisonR2={
          comparison
            ? {
                baseline: comparison.baseline.r2,
                asymmetric: comparison.asymmetric.r2,
              }
            : undefined
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {initError && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Backend Connection Notice:</strong> {initError}. Ensure FastAPI server is running on port 8000.
                </span>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 font-semibold text-[11px] shrink-0"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
          {activeTab === 'overview' && (
            <OverviewPage
              comparison={comparison}
              onNavigate={setActiveTab}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'simulation' && <SimulationPage />}
          {activeTab === 'comparison' && <ComparisonPage comparison={comparison} />}
          {activeTab === 'training' && (
            <TrainingPage
              comparison={comparison}
              onTrainingSuccess={handleTrainingSuccess}
            />
          )}
          {activeTab === 'dataset' && <DatasetPage />}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-dark-700/60 bg-dark-900/60 py-5 text-center text-xs text-slate-400">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Academic ML Prototype — Asymmetric Cost Multivariable Regression
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              α=1.0 • β=0.70 • γ=0.5 • Chronological Leak-Free Validation
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
