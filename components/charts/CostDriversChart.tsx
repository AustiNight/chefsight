import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Expense } from '../../types';

interface Props {
  data: Expense[];
}

const CostDriversChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    // Group by Item, Sum Total Cost
    const map = new Map<string, number>();
    data.forEach(item => {
      const current = map.get(item.item) || 0;
      map.set(item.item, current + item.totalCost);
    });
    
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  }, [data]);

  return (
    <div className="w-full h-[400px] bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-100 mb-2">Cost Drivers (Top 10 Items)</h3>
      <p className="text-xs text-slate-400 mb-4">Items contributing most to your total spend.</p>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(val) => `$${val}`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip 
             cursor={{fill: '#334155', opacity: 0.4}}
             contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
             formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Spent']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
               <Cell key={`cell-${index}`} fill="#f43f5e" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostDriversChart;
