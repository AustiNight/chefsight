import { Category } from './types';

export const CATEGORY_COLORS: Record<string, string> = {
  [Category.Proteins]: '#ef4444', // Red 500
  [Category.Produce]: '#22c55e', // Green 500
  [Category.Dairy]: '#eab308', // Yellow 500
  [Category.DryGoods]: '#d97706', // Amber 600
  [Category.SpicesOils]: '#a855f7', // Purple 500
  [Category.Packaging]: '#64748b', // Slate 500
  [Category.Equipment]: '#3b82f6', // Blue 500
  [Category.Alcohol]: '#ec4899', // Pink 500
  [Category.Beverages]: '#06b6d4', // Cyan 500
  [Category.Overhead]: '#6366f1', // Indigo 500
};

export const CHART_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9'
];

export const MOCK_CSV_DATA = `date,store,item,total_cost,units,unit_type,calculated_cost_per_unit,category
2023-10-01,Costco,Ribeye Steaks,145.50,5,lbs,29.10,Proteins
2023-10-02,Whole Foods,Organic Arugula,12.00,3,lbs,4.00,Produce
2023-10-02,Whole Foods,Heavy Cream,8.50,2,qts,4.25,Dairy
2023-10-03,Restaurant Depot,To-Go Containers,45.00,100,ea,0.45,Packaging/Disposables
2023-10-05,Costco,Olive Oil,24.00,2,liters,12.00,Spices/Oils
2023-10-06,Local Butcher,Ribeye Steaks,180.00,5,lbs,36.00,Proteins
2023-10-08,Trader Joes,Salmon Fillet,45.00,3,lbs,15.00,Proteins
2023-10-10,Costco,Salmon Fillet,38.00,3,lbs,12.66,Proteins
2023-10-12,Costco,Paper Towels,22.00,1,box,22.00,Overhead
2023-10-15,Restaurant Depot,Ribeye Steaks,135.00,5,lbs,27.00,Proteins
2023-10-15,Restaurant Depot,Flour,15.00,50,lbs,0.30,Dry Goods
2023-10-18,Whole Foods,Saffron,35.00,1,oz,35.00,Spices/Oils
2023-10-20,Wine Merchant,Cabernet Sauvignon,120.00,6,btl,20.00,Alcohol
2023-10-22,Costco,Sparkling Water,14.00,2,cases,7.00,Beverages
2023-10-25,Chef Toys,Sous Vide Bags,25.00,1,box,25.00,Equipment
2023-11-01,Costco,Ribeye Steaks,150.00,5,lbs,30.00,Proteins
2023-11-02,Local Butcher,Pork Chop,55.00,5,lbs,11.00,Proteins
2023-11-05,Whole Foods,Microgreens,18.00,4,oz,4.50,Produce
2023-11-10,Restaurant Depot,Frying Oil,40.00,35,lbs,1.14,Spices/Oils
2023-11-15,Costco,Butter Unsalted,12.00,4,lbs,3.00,Dairy
2023-12-01,Costco,Ribeye Steaks,148.00,5,lbs,29.60,Proteins
2024-01-05,Costco,Salmon Fillet,40.00,3,lbs,13.33,Proteins
2024-01-10,Local Butcher,Ribeye Steaks,185.00,5,lbs,37.00,Proteins
2024-02-01,Restaurant Depot,Ribeye Steaks,140.00,5,lbs,28.00,Proteins
2024-03-01,Whole Foods,Truffle Oil,28.00,1,btl,28.00,Spices/Oils
2024-03-15,Costco,Avocados,9.99,5,ea,2.00,Produce
2024-04-10,Whole Foods,Avocados,12.50,5,ea,2.50,Produce
2024-04-20,Restaurant Depot,Avocados,8.00,5,ea,1.60,Produce
2024-05-01,Costco,Ribeye Steaks,155.00,5,lbs,31.00,Proteins
2024-05-15,Costco,Salmon Fillet,42.00,3,lbs,14.00,Proteins
2024-05-18,Local Butcher,Salmon Fillet,55.00,3,lbs,18.33,Proteins
`;