/**
 * Types pour les données de graphiques
 */

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
}

export interface MultiSeriesChartData {
  timestamp: Date;
  values: Record<string, number>;
}

export interface SolarProductionChartData {
  period: 'quarterly' | 'hourly' | 'daily' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  data: ChartDataPoint[];
  totalEnergyKwh: number; // Total energy production in kWh for the period
}

export interface GridExchangeChartData {
  period: 'quarterly' | 'hourly' | 'daily' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  imported: ChartDataPoint[];
  exported: ChartDataPoint[];
}

export interface HouseConsumptionChartData {
  period: 'quarterly' | 'hourly' | 'daily' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  data: ChartDataPoint[];
}

export interface ZaptecConsumptionChartData {
  period: 'quarterly' | 'hourly' | 'daily' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  data: ChartDataPoint[];
}

export interface DashboardChartData {
  period: 'quarterly' | 'hourly' | 'daily' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  solarProduction: ChartDataPoint[];
  houseConsumption: ChartDataPoint[];
  zaptecConsumption: ChartDataPoint[];
  gridImported: ChartDataPoint[];
  gridExported: ChartDataPoint[];
  totalSolarEnergyKwh?: number; // Total solar energy in kWh for the period
}

export interface ChartPeriodOption {
  key: 'day' | 'week' | 'month' | 'year';
  label: string;
  groupBy: 'quarterly' | 'hourly' | 'daily' | 'monthly' | 'yearly';
  daysBack: number;
}

export const CHART_PERIODS: ChartPeriodOption[] = [
  { key: 'day', label: 'Jour (par 15min)', groupBy: 'quarterly', daysBack: 1 },
  { key: 'week', label: 'Semaine (par heure)', groupBy: 'hourly', daysBack: 7 },
  { key: 'month', label: 'Mois (par jour)', groupBy: 'daily', daysBack: 30 },
  { key: 'year', label: 'Année (par mois)', groupBy: 'monthly', daysBack: 365 }
];