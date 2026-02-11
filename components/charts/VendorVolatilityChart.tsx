import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Expense } from '../../types';
import { CHART_COLORS } from '../../constants';

interface Props {
  data: Expense[];
}

const VendorVolatilityChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    // 1. Identify Top 5 Most Purchased Items (by frequency) to analyze
    const itemFreq = new Map<string, number>();
    data.forEach(d => {
      itemFreq.set(d.item, (itemFreq.get(d.item) || 0) + 1);
    });

    const topItems = Array.from(itemFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // 2. For these items, group by Store and calculate Avg Cost Per Unit
    // Structure: { itemName: "Ribeye", "Costco": 29.10, "Local Butcher": 36.00, ... }
    
    const processedData: any[] = [];
    const allStores = new Set<string>();

    topItems.forEach(itemName => {
      const itemTxns = data.filter(d => d.item === itemName);
      const row: any = { name: itemName };
      
      const storeGroups = new Map<string, { total: number, count: number }>();
      
      itemTxns.forEach(txn => {
        const current = storeGroups.get(txn.store) || { total: 0, count: 0 };
        storeGroups.set(txn.store, { 
          total: current.total + txn.calculatedCostPerUnit, 
          count: current.count + 1 
        });
        allStores.add(txn.store);
      });

      storeGroups.forEach((val, storeName) => {
        row[storeName] = parseFloat((val.total / val.count).toFixed(2));
      });
      
      processedData.push(row);
    });

    return { data: processedData, stores: Array.from(allStores) };
  }, [data]);

  return (
    <div className="w-full h-[400px] bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-100 mb-2">Vendor Volatility Analysis</h3>
      <p className="text-xs text-slate-400 mb-4">Comparing average price per unit across vendors for your top 5 items.</p>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(val) => `$${val}`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            cursor={{fill: '#334155', opacity: 0.4}}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Avg Cost/Unit']}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }}/>
          {chartData.stores.map((store, index) => (
            <Bar 
              key={store} 
              dataKey={store} 
              fill={CHART_COLORS[index % CHART_COLORS.length]} 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VendorVolatilityChart;