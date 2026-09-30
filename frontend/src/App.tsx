import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { SimulationPage } from './pages/SimulationPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { TrainingPage } from './pages/TrainingPage';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-100 selection:text-blue-900">
      {/* Fixed Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendHealthy={backendHealthy}
        modelReady={modelReady}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {initError && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Backend Connection Notice:</strong> {initError}. Ensure FastAPI server is running on port 8000.
                </span>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
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
        </main>

        {/* Minimal Engineering Footer */}
        <footer className="mt-auto border-t border-[#E2E8F0] bg-white text-xs text-[#64748B]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <span className="font-semibold text-[#0F172A]">Cloud Auto-Scale ML</span>
            <span className="text-[11px] text-[#64748B]">
              Asymmetric Cost-Weighted Multivariable Regression Engine
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
