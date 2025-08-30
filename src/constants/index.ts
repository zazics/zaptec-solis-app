/**
 * CONSTANTES DE L'APPLICATION
 * 
 * Ce fichier contient toutes les constantes utilisées dans l'application
 * pour éviter les valeurs magiques et centraliser la configuration.
 */

/**
 * Configuration de l'API par défaut
 */
export const DEFAULT_API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:3000',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * Intervalles de rafraîchissement (en millisecondes)
 */
export const REFRESH_INTERVALS = {
  FAST: 5000,     // 5 secondes
  NORMAL: 15000,  // 15 secondes
  SLOW: 30000,    // 30 secondes
  VERY_SLOW: 60000, // 1 minute
} as const;

/**
 * Couleurs de l'application
 * Basées sur les couleurs système iOS pour une cohérence visuelle
 */
export const COLORS = {
  // Couleurs principales
  PRIMARY: '#007AFF',      // Bleu iOS
  SUCCESS: '#34C759',      // Vert iOS
  WARNING: '#FF9500',      // Orange iOS
  DANGER: '#FF3B30',       // Rouge iOS
  
  // Couleurs de fond
  BACKGROUND: '#F2F2F7',   // Fond principal
  CARD_BACKGROUND: '#FFFFFF', // Fond des cartes
  MODAL_OVERLAY: 'rgba(0, 0, 0, 0.5)',
  
  // Couleurs de texte
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#3C3C43',
  TEXT_TERTIARY: '#8E8E93',
  
  // Couleurs de bordure
  BORDER_LIGHT: '#E5E5EA',
  BORDER_MEDIUM: '#C7C7CC',
} as const;

/**
 * Tailles de polices
 */
export const FONT_SIZES = {
  SMALL: 12,
  REGULAR: 14,
  MEDIUM: 16,
  LARGE: 18,
  TITLE: 24,
  HEADER: 28,
} as const;

/**
 * Espacements
 */
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
} as const;

/**
 * Limites et seuils
 */
export const LIMITS = {
  // Chargeur Zaptec
  MIN_CHARGING_CURRENT: 6,    // Ampères
  MAX_CHARGING_CURRENT: 16,   // Ampères
  
  // Batterie
  BATTERY_LOW_THRESHOLD: 20,  // %
  BATTERY_HIGH_THRESHOLD: 80, // %
  
  // Température onduleur
  TEMP_WARNING_THRESHOLD: 40, // °C
  TEMP_DANGER_THRESHOLD: 60,  // °C
  
  // Puissance
  POWER_THRESHOLD_KW: 1,      // kW (pour conversion W -> kW)
} as const;

/**
 * Messages d'erreur standardisés
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de réseau. Vérifiez votre connexion.',
  API_ERROR: 'Erreur de communication avec le serveur.',
  INVALID_INPUT: 'Valeur saisie invalide.',
  PERMISSION_DENIED: 'Permissions insuffisantes.',
  TIMEOUT_ERROR: 'La requête a expiré.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
} as const;

/**
 * Clés de stockage local
 */
export const STORAGE_KEYS = {
  SETTINGS: '@ZaptecSolisApp:settings',
  LAST_UPDATE: '@ZaptecSolisApp:lastUpdate',
  USER_PREFERENCES: '@ZaptecSolisApp:userPreferences',
} as const;

/**
 * Types d'événements pour les logs
 */
export const LOG_EVENTS = {
  APP_START: 'app_start',
  API_CALL: 'api_call',
  USER_ACTION: 'user_action',
  ERROR: 'error',
  CHARGING_START: 'charging_start',
  CHARGING_STOP: 'charging_stop',
} as const;