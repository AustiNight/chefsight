import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Expense } from '../../types';

interface Props {
  data: Expense[];
}

const CashFlowLineChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    // 1. Sort by date
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 2. Group by Date
    const dailyMap = new Map<string, number>();
    sorted.forEach(item => {
      const current = dailyMap.get(item.date) || 0;
      dailyMap.set(item.date, current + item.totalCost);
    });

    // 3. Create Cumulative
    let runningTotal = 0;
    const result: any[] = [];
    
    Array.from(dailyMap.entries()).forEach(([date, dailyTotal]) => {
      runningTotal += dailyTotal;
      result.push({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        dailySpend: dailyTotal,
        cumulativeSpend: runningTotal
      });
    });

    return result;
  }, [data]);

  return (
    <div className="w-full h-[350px] bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Cash Flow Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
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
             contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
             formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="dailySpend" 
            name="Daily Total" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="cumulativeSpend" 
            name="Cumulative Trend" 
            stroke="#10b981" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowLineChart;
