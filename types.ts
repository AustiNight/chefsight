export enum Category {
  Proteins = 'Proteins',
  Produce = 'Produce',
  Dairy = 'Dairy',
  DryGoods = 'Dry Goods',
  SpicesOils = 'Spices/Oils',
  Packaging = 'Packaging/Disposables',
  Equipment = 'Equipment',
  Alcohol = 'Alcohol',
  Beverages = 'Beverages',
  Overhead = 'Overhead',
}

export interface Expense {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  store: string;
  item: string;
  totalCost: number;
  units: number;
  unitType: string;
  calculatedCostPerUnit: number;
  category: Category | string;
}

export type TimeRange = '30_days' | 'ytd' | 'all_time';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}
