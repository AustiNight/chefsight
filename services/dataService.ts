import { Expense, TimeRange } from '../types';
import { MOCK_CSV_DATA } from '../constants';

export const parseCSV = (csvText: string): Expense[] => {
  const lines = csvText.trim().split('\n');
  
  // Basic validation to ensure we have data
  if (lines.length < 2) return [];

  // Skip header
  return lines.slice(1).map((line, index) => {
    // Handle CSV lines that might be empty
    if (!line.trim()) return null;

    const values = line.split(',');
    
    // Safety check for malformed lines
    if (values.length < 8) return null;

    return {
      id: `txn-${index}`,
      date: values[0],
      store: values[1],
      item: values[2],
      totalCost: parseFloat(values[3] || '0'),
      units: parseFloat(values[4] || '0'),
      unitType: values[5],
      calculatedCostPerUnit: parseFloat(values[6] || '0'),
      category: values[7]?.replace('\r', '') // Remove potential carriage returns
    };
  }).filter((item): item is Expense => item !== null);
};

export const filterExpenses = (expenses: Expense[], range: TimeRange): Expense[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    
    switch (range) {
      case '30_days': {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return expenseDate >= thirtyDaysAgo;
      }
      case 'ytd': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return expenseDate >= startOfYear;
      }
      case 'all_time':
      default:
        return true;
    }
  });
};

export const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    // CHANGE: Use relative path 'data/expenses.csv' instead of absolute '/data/expenses.csv'
    // This ensures compatibility with GitHub Pages repo subpaths (e.g. /chefsight/data/...)
    const response = await fetch('data/expenses.csv');
    
    if (!response.ok) {
      throw new Error('Live CSV not found');
    }

    const text = await response.text();
    const parsed = parseCSV(text);
    
    if (parsed.length === 0) {
        console.warn("Live CSV was found but empty. Using mock data.");
        return parseCSV(MOCK_CSV_DATA);
    }

    return parsed;

  } catch (error) {
    console.warn("Could not load live data (script might not have run yet). Falling back to Mock Data.", error);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(parseCSV(MOCK_CSV_DATA));
      }, 500);
    });
  }
};