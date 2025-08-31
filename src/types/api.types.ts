/**
 * API TYPES - Definitions for Node.js API responses
 * 
 * This file contains interfaces for standardized responses
 * from your Node.js API as well as application configuration types.
 */

/**
 * Interface for standardized API responses
 * All responses from your Node.js API follow this format
 */
export interface ApiResponse<T = any> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Information or error message */
  message: string;
  /** Response timestamp */
  timestamp: string;
  /** Response-specific data (optional) */
  data?: T;
}

/**
 * Interface for API errors
 * Used when a request fails
 */
export interface ApiError {
  /** HTTP error code */
  status: number;
  /** Error message */
  message: string;
  /** Additional error details */
  error?: string;
  /** Error timestamp */
  timestamp: string;
}

/**
 * Interface for connection configuration to your Node.js API
 * Stores information needed to connect to your system
 */
export interface ApiConfig {
  /** Base URL of your Node.js API (ex: http://192.168.1.100:3000) */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Authentication token if needed */
  authToken?: string;
  /** Indicates if requests should use HTTPS */
  useHttps?: boolean;
  /** Simulation mode enabled (forces localhost) */
  simulationMode?: boolean;
}

/**
 * Interface for mobile application settings
 * Stores user preferences and configuration
 */
export interface AppSettings {
  /** API configuration */
  api: ApiConfig;
  /** Data refresh interval in milliseconds */
  refreshInterval: number;
  /** Application theme (light/dark) */
  theme: 'light' | 'dark';
  /** Notifications enabled */
  notificationsEnabled: boolean;
  /** Units to display (metric/imperial) */
  units: 'metric' | 'imperial';
  /** Interface language */
  language: 'fr' | 'en';
  /** Simulation mode enabled */
  simulationMode: boolean;
}

/**
 * Interface for global application state
 * Used by state manager (Redux/Zustand)
 */
export interface AppState {
  /** Configuration and settings */
  settings: AppSettings;
  /** API connection status */
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  /** Last error that occurred */
  lastError?: string;
  /** Indicates if the application is loading data */
  isLoading: boolean;
  /** Last update timestamp */
  lastUpdate?: Date;
}

/**
 * Type for available endpoints in your API
 * Facilitates navigation and avoids typos
 */
export type ApiEndpoint = 
  | '/solis/status'           // Solis inverter status
  | '/solis/all'              // Complete Solis data
  | '/zaptec/status'          // Zaptec charger status
  | '/zaptec/charging'        // Start/stop charging
  | '/zaptec/current'         // Set current
  | '/automation/status'      // Automation status
  | '/automation/config'      // Configuration (GET/PUT)
  | '/automation/enable'      // Enable automation
  | '/automation/disable';    // Disable automation

/**
 * Interface for charger control requests
 * Used to send commands to the Zaptec charger
 */
export interface ChargerControlRequest {
  /** Action to perform */
  action: 'start' | 'stop' | 'setCurrent' | 'setMode';
  /** Associated value (ex: current in amperes) */
  value?: number;
  /** Additional parameters */
  parameters?: Record<string, any>;
}

/**
 * Interface for automation configuration requests
 * Allows modifying automation system parameters
 */
export interface AutomationConfigRequest {
  /** Automation mode */
  mode?: 'manual' | 'surplus';
  /** Maximum charging power in Watts */
  maxChargingPower?: number;
  /** Minimum charging current in Amperes */
  minimumCurrent?: number;
  /** Maximum charging current in Amperes */
  maximumCurrent?: number;
}