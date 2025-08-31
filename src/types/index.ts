/**
 * MAIN TYPES EXPORT
 * 
 * This file centralizes the export of all TypeScript types
 * to facilitate imports throughout the application.
 * 
 * Usage:
 * import { ZaptecStatus, SolisInverterData, ApiResponse } from '@/types';
 */

// Export Zaptec types
export type {
  ZaptecStatus,
  ZaptecStateObservation,
  ZaptecChargingSettings,
  ZaptecInstallationInfo,
  ZaptecInstallationUpdateRequest,
} from './zaptec.types';

// Export Solis types
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

// Export API types
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