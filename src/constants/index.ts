/**
 * APPLICATION CONSTANTS
 *
 * This file contains all constants used in the application
 * to avoid magic values and centralize configuration.
 */

import { API_BASE_URL, API_TIMEOUT, API_RETRY_COUNT, API_RETRY_DELAY } from "@env";

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG = {
  BASE_URL: API_BASE_URL || "http://192.168.0.151:3000",
  TIMEOUT: parseInt(API_TIMEOUT) || 10000,
  RETRY_COUNT: parseInt(API_RETRY_COUNT) || 3,
  RETRY_DELAY: parseInt(API_RETRY_DELAY) || 1000
} as const;

/**
 * Refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  FAST: 5000, // 5 seconds
  NORMAL: 15000, // 15 seconds
  SLOW: 30000, // 30 seconds
  VERY_SLOW: 60000 // 1 minute
} as const;

/**
 * Application colors
 * Based on iOS system colors for visual consistency
 */
export const COLORS = {
  // Primary colors
  PRIMARY: "#007AFF", // iOS Blue
  SUCCESS: "#34C759", // iOS Green
  WARNING: "#FF9500", // iOS Orange
  DANGER: "#FF3B30", // iOS Red

  // Background colors
  BACKGROUND: "#F2F2F7", // Main background
  CARD_BACKGROUND: "#FFFFFF", // Card background
  MODAL_OVERLAY: "rgba(0, 0, 0, 0.5)",

  // Text colors
  TEXT_PRIMARY: "#000000",
  TEXT_SECONDARY: "#3C3C43",
  TEXT_TERTIARY: "#8E8E93",

  // Border colors
  BORDER_LIGHT: "#E5E5EA",
  BORDER_MEDIUM: "#C7C7CC"
} as const;

/**
 * Font sizes
 */
export const FONT_SIZES = {
  SMALL: 12,
  REGULAR: 14,
  MEDIUM: 16,
  LARGE: 18,
  TITLE: 24,
  HEADER: 28
} as const;

/**
 * Spacing
 */
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24
} as const;

/**
 * Limits and thresholds
 */
export const LIMITS = {
  // Zaptec charger
  MIN_CHARGING_CURRENT: 6, // Amperes
  MAX_CHARGING_CURRENT: 16, // Amperes

  // Battery
  BATTERY_LOW_THRESHOLD: 20, // %
  BATTERY_HIGH_THRESHOLD: 80, // %

  // Inverter temperature
  TEMP_WARNING_THRESHOLD: 40, // °C
  TEMP_DANGER_THRESHOLD: 60, // °C

  // Power
  POWER_THRESHOLD_KW: 1 // kW (for W -> kW conversion)
} as const;

/**
 * Standardized error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Check your connection.",
  API_ERROR: "Communication error with server.",
  INVALID_INPUT: "Invalid input value.",
  PERMISSION_DENIED: "Insufficient permissions.",
  TIMEOUT_ERROR: "Request timed out.",
  UNKNOWN_ERROR: "An unexpected error occurred."
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  SETTINGS: "@ZaptecSolisApp:settings",
  LAST_UPDATE: "@ZaptecSolisApp:lastUpdate",
  USER_PREFERENCES: "@ZaptecSolisApp:userPreferences"
} as const;

/**
 * Event types for logging
 */
export const LOG_EVENTS = {
  APP_START: "app_start",
  API_CALL: "api_call",
  USER_ACTION: "user_action",
  ERROR: "error",
  CHARGING_START: "charging_start",
  CHARGING_STOP: "charging_stop"
} as const;
