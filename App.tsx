import React, { useEffect, useState } from 'react';
import { Expense, TimeRange } from './types';
import { fetchExpenses, filterExpenses } from './services/dataService';
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
    </div>
  );
};

export default App;
