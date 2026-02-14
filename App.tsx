import React, { useEffect, useState } from 'react';
import { Expense, TimeRange } from './types';
import { fetchExpenses, filterExpenses } from './services/dataService';
import { processReceipts, fetchFailures, setOpenAIKey, FailedReceipt, ProcessResult } from './services/backendService';
import FilterBar from './components/FilterBar';
import CategoryPieChart from './components/charts/CategoryPieChart';
import CashFlowLineChart from './components/charts/CashFlowLineChart';
import VendorVolatilityChart from './components/charts/VendorVolatilityChart';
import CostDriversChart from './components/charts/CostDriversChart';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<Expense[]>([]);
  const [filteredData, setFilteredData] = useState<Expense[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30_days');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [failures, setFailures] = useState<FailedReceipt[]>([]);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchExpenses();
        setRawData(data);
      } catch (error) {
        console.error("Failed to load expenses", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadFailures = async () => {
      try {
        const data = await fetchFailures();
        setFailures(data);
      } catch (error) {
        console.warn("Failed to load receipt failures", error);
      }
    };
    loadFailures();
  }, []);

  // Filter Effect
  useEffect(() => {
    if (rawData.length > 0) {
      setFilteredData(filterExpenses(rawData, timeRange));
    }
  }, [rawData, timeRange]);

  const totalSpend = React.useMemo(() => 
    filteredData.reduce((acc, curr) => acc + curr.totalCost, 0)
  , [filteredData]);

  const txnVolume = filteredData.length;

  const refreshExpenses = async () => {
    try {
      const data = await fetchExpenses();
      setRawData(data);
    } catch (error) {
      console.error("Failed to refresh expenses", error);
    }
  };

  const refreshFailures = async () => {
    try {
      const data = await fetchFailures();
      setFailures(data);
    } catch (error) {
      console.warn("Failed to refresh receipt failures", error);
    }
  };

  const handleProcess = async (options?: { retryFailed?: boolean; files?: string[] }) => {
    setProcessing(true);
    setProcessError(null);
    setProcessResult(null);
    try {
      const result = await processReceipts(options || {});
      setProcessResult(result);
      await refreshExpenses();
      await refreshFailures();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Processing failed';
      setProcessError(message);
      if (message.includes('OPENAI_API_KEY')) {
        setShowKeyDialog(true);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryFile = async (filename: string) => {
    await handleProcess({ files: [filename] });
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      setProcessError('Please enter a valid API key.');
      return;
    }
    setSavingKey(true);
    try {
      await setOpenAIKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowKeyDialog(false);
      setProcessError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save API key';
      setProcessError(message);
    } finally {
      setSavingKey(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading Financial Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
               CS
             </div>
             <h1 className="text-xl font-bold text-slate-100 tracking-tight">ChefSight</h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Automated Expense Intelligence
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Controls & Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
            <p className="text-slate-400">Overview of your kitchen's financial health.</p>
          </div>
          <FilterBar currentRange={timeRange} onRangeChange={setTimeRange} />
        </div>

        {/* Receipt Processing */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Receipt Processing</h3>
              <p className="text-sm text-slate-400">Scan new receipts and retry failures.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleProcess()}
                disabled={processing}
              >
                {processing ? 'Scanning...' : 'Scan New Receipts'}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleProcess({ retryFailed: true })}
                disabled={processing || failures.length === 0}
              >
                Retry Failed
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 text-sm font-semibold hover:border-slate-500"
                onClick={() => setShowKeyDialog(true)}
              >
                Set API Key
              </button>
            </div>
          </div>

          {processResult && (
            <div className="mt-4 text-sm text-slate-300">
              Processed {processResult.processed} receipts, wrote {processResult.written_rows} rows, {processResult.failed} failed.
            </div>
          )}
          {processResult && processResult.written_rows === 0 && (
            <div className="mt-2 text-xs text-amber-400">
              No rows were written. The AI may have returned an empty response.
            </div>
          )}

          {processError && (
            <div className="mt-3 text-sm text-rose-400">
              {processError}
            </div>
          )}

          <div className="mt-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Failed Receipts</div>
            {failures.length === 0 ? (
              <div className="text-sm text-slate-500">No failed receipts.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {failures.map((failure) => (
                  <div key={failure.filename} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-200">{failure.filename}</div>
                      <div className="text-xs text-slate-500">{failure.error}</div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
                      onClick={() => handleRetryFile(failure.filename)}
                      disabled={processing}
                    >
                      Retry
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Spend</p>
            <p className="text-3xl font-bold text-white mt-2">
              ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-500 mt-2 flex items-center">
               For selected period
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Transactions</p>
            <p className="text-3xl font-bold text-white mt-2">{txnVolume}</p>
             <p className="text-xs text-slate-500 mt-2">
               Receipts processed
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Top Category</p>
             <p className="text-3xl font-bold text-white mt-2 truncate">
              {filteredData.length > 0 
                ? filteredData.sort((a,b) => b.totalCost - a.totalCost)[0]?.category 
                : 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-2">
               Highest spend area
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Row 1 */}
          <CategoryPieChart data={filteredData} />
          <CashFlowLineChart data={filteredData} />
          
          {/* Row 2 */}
          <VendorVolatilityChart data={filteredData} />
          <CostDriversChart data={filteredData} />
        </div>
      </main>

      {showKeyDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6">
            <h4 className="text-lg font-semibold text-white mb-2">Set OpenAI API Key</h4>
            <p className="text-sm text-slate-400 mb-4">Your key will be saved to backend/.env for future runs.</p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg text-slate-300 text-sm hover:text-white"
                onClick={() => setShowKeyDialog(false)}
                disabled={savingKey}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
                onClick={handleSaveKey}
                disabled={savingKey}
              >
                {savingKey ? 'Saving...' : 'Save Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
