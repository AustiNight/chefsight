import React from 'react';
import { TimeRange } from '../types';

interface Props {
  currentRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const FilterBar: React.FC<Props> = ({ currentRange, onRangeChange }) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <label htmlFor="timeRange" className="text-slate-400 text-sm font-medium">
        Time Range:
      </label>
      <div className="relative">
        <select
          id="timeRange"
          value={currentRange}
          onChange={(e) => onRangeChange(e.target.value as TimeRange)}
          className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-slate-750 transition-colors cursor-pointer"
        >
          <option value="30_days">Last 30 Days</option>
          <option value="ytd">Year to Date</option>
          <option value="all_time">All Time</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
