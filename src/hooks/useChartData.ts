/**
 * Hook personnalisé pour gérer les données de graphiques
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { 
  DashboardChartData, 
  SolarProductionChartData,
  GridExchangeChartData,
  HouseConsumptionChartData,
  ZaptecConsumptionChartData
} from '../types/chart.types';

export type ChartType = 'dashboard' | 'solar' | 'grid' | 'house' | 'zaptec';

interface UseChartDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useChartData = <T>(
  chartType: ChartType,
  period: 'day' | 'week' | 'month' | 'year' = 'day',
  date?: string
): UseChartDataReturn<T> => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      
      switch (chartType) {
        case 'dashboard':
          result = await apiService.getDashboardChart(period, date);
          break;
        case 'solar':
          result = await apiService.getSolarProductionChart(period, date);
          break;
        case 'grid':
          result = await apiService.getGridExchangeChart(period, date);
          break;
        case 'house':
          result = await apiService.getHouseConsumptionChart(period, date);
          break;
        case 'zaptec':
          result = await apiService.getZaptecConsumptionChart(period, date);
          break;
        default:
          throw new Error(`Type de graphique non supporté: ${chartType}`);
      }

      // Convertir les timestamps en objets Date
      if (result) {
        if ('data' in result) {
          result.data = result.data.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
        }
        
        if ('solarProduction' in result) {
          result.solarProduction = result.solarProduction.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
          result.houseConsumption = result.houseConsumption.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
          result.zaptecConsumption = result.zaptecConsumption.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
          result.gridImported = result.gridImported.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
          result.gridExported = result.gridExported.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
        }
        
        if ('imported' in result) {
          result.imported = result.imported.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
          result.exported = result.exported.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
        }

        result.startDate = new Date(result.startDate);
        result.endDate = new Date(result.endDate);
      }

      setData(result);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données de graphique:', err);
      setError(err.message || 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  }, [chartType, period, date]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refreshData
  };
};

// Hooks typés spécialisés
export const useDashboardChartData = (
  period: 'day' | 'week' | 'month' | 'year' = 'day',
  date?: string
): UseChartDataReturn<DashboardChartData> => {
  return useChartData<DashboardChartData>('dashboard', period, date);
};

export const useSolarProductionChartData = (
  period: 'day' | 'week' | 'month' | 'year' = 'day',
  date?: string
): UseChartDataReturn<SolarProductionChartData> => {
  return useChartData<SolarProductionChartData>('solar', period, date);
};

export const useGridExchangeChartData = (
  period: 'day' | 'week' | 'month' | 'year' = 'day',
  date?: string
): UseChartDataReturn<GridExchangeChartData> => {
  return useChartData<GridExchangeChartData>('grid', period, date);
};

export const useHouseConsumptionChartData = (
  period: 'day' | 'week' | 'month' | 'year' = 'day',
  date?: string
): UseChartDataReturn<HouseConsumptionChartData> => {
  return useChartData<HouseConsumptionChartData>('house', period, date);
};

export const useZaptecConsumptionChartData = (
  period: 'day' | 'week' | 'month' | 'year' = 'day',
  date?: string
): UseChartDataReturn<ZaptecConsumptionChartData> => {
  return useChartData<ZaptecConsumptionChartData>('zaptec', period, date);
};