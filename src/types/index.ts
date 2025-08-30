/**
 * EXPORT PRINCIPAL DES TYPES
 * 
 * Ce fichier centralise l'export de tous les types TypeScript
 * pour faciliter les imports dans le reste de l'application.
 * 
 * Usage:
 * import { ZaptecStatus, SolisInverterData, ApiResponse } from '@/types';
 */

// Export des types Zaptec
export type {
  ZaptecStatus,
  ZaptecStateObservation,
  ZaptecChargerInfo,
  ZaptecChargingSettings,
  ZaptecInstallationInfo,
  ZaptecInstallationUpdateRequest,
} from './zaptec.types';

// Export des types Solis
export type {
  SolisPVData,
  SolisACData,
  SolisHouseData,
  SolisGridData,
  SolisBatteryData,
  SolisInverterData,
  SolisConnectionOptions,
  SolisEnergyFlow,
} from './solis.types';

// Export des types API
export type {
  ApiResponse,
  ApiError,
  ApiConfig,
  AppSettings,
  AppState,
  ApiEndpoint,
  ChargerControlRequest,
  AutomationConfigRequest,
} from './api.types';