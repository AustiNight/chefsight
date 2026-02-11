import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Expense } from '../../types';
import { CATEGORY_COLORS, CHART_COLORS } from '../../constants';

interface Props {
  data: Expense[];
}

const CategoryPieChart: React.FC<Props> = ({ data }) => {
  const aggregatedData = React.useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      const current = map.get(item.category) || 0;
      map.set(item.category, current + item.totalCost);
    });
    
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div className="w-full h-[350px] bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={aggregatedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {aggregatedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CATEGORY_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} 
                stroke="rgba(0,0,0,0)"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
