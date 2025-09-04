/**
 * MAIN TYPES EXPORT
 *
 * This file centralizes the export of all TypeScript types
 * to facilitate imports throughout the application.
 *
 * Usage:
 * import { ZaptecDataDTO, SolisDataDTO, ApiResponse } from '@/types';
 */

// Export Zaptec types
export type { ZaptecDataDTO, ZaptecStateObservation, ZaptecChargingSettings, ZaptecInstallationInfo, ZaptecInstallationUpdateRequest } from "./zaptec.types";

// Export Solis types
export type { SolisPVData, SolisACData, SolisHouseData, SolisGridData, SolisBatteryData, SolisDataDTO, SolisConnectionOptions, SolisEnergyFlow } from "./solis.types";

// Export API types
export type { ApiResponse, ApiError, ApiConfig, AppSettings, AppState, ApiEndpoint, ChargerControlRequest, AutomationConfig } from "./api.types";
