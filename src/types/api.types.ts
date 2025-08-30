/**
 * TYPES API - Définitions pour les réponses de l'API Node.js
 * 
 * Ce fichier contient les interfaces pour les réponses standardisées
 * de votre API Node.js ainsi que les types de configuration de l'application.
 */

/**
 * Interface pour les réponses standardisées de l'API
 * Toutes les réponses de votre API Node.js suivent ce format
 */
export interface ApiResponse<T = any> {
  /** Indique si la requête a réussi */
  success: boolean;
  /** Message d'information ou d'erreur */
  message: string;
  /** Timestamp de la réponse */
  timestamp: string;
  /** Données spécifiques à la réponse (optionnel) */
  data?: T;
}

/**
 * Interface pour les erreurs API
 * Utilisée quand une requête échoue
 */
export interface ApiError {
  /** Code d'erreur HTTP */
  status: number;
  /** Message d'erreur */
  message: string;
  /** Détails supplémentaires de l'erreur */
  error?: string;
  /** Timestamp de l'erreur */
  timestamp: string;
}

/**
 * Interface pour la configuration de connexion à votre API Node.js
 * Stocke les informations nécessaires pour se connecter à votre système
 */
export interface ApiConfig {
  /** URL de base de votre API Node.js (ex: http://192.168.1.100:3000) */
  baseUrl: string;
  /** Timeout pour les requêtes en millisecondes */
  timeout?: number;
  /** Token d'authentification si nécessaire */
  authToken?: string;
  /** Indique si les requêtes doivent utiliser HTTPS */
  useHttps?: boolean;
}

/**
 * Interface pour les paramètres de l'application mobile
 * Stocke les préférences utilisateur et la configuration
 */
export interface AppSettings {
  /** Configuration de l'API */
  api: ApiConfig;
  /** Intervalle de rafraîchissement des données en millisecondes */
  refreshInterval: number;
  /** Thème de l'application (light/dark) */
  theme: 'light' | 'dark';
  /** Notifications activées */
  notificationsEnabled: boolean;
  /** Unités à afficher (metric/imperial) */
  units: 'metric' | 'imperial';
  /** Langue de l'interface */
  language: 'fr' | 'en';
}

/**
 * Interface pour l'état global de l'application
 * Utilisée par le gestionnaire d'état (Redux/Zustand)
 */
export interface AppState {
  /** Configuration et paramètres */
  settings: AppSettings;
  /** Statut de connexion à l'API */
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  /** Dernière erreur survenue */
  lastError?: string;
  /** Indique si l'application charge des données */
  isLoading: boolean;
  /** Timestamp de la dernière mise à jour */
  lastUpdate?: Date;
}

/**
 * Type pour les endpoints disponibles dans votre API
 * Facilite la navigation et évite les erreurs de frappe
 */
export type ApiEndpoint = 
  | '/solis/status'           // État de l'onduleur Solis
  | '/solis/data'             // Données complètes Solis
  | '/zaptec/status'          // État du chargeur Zaptec
  | '/zaptec/info'            // Informations du chargeur
  | '/zaptec/start'           // Démarrer la charge
  | '/zaptec/stop'            // Arrêter la charge
  | '/zaptec/current'         // Régler le courant
  | '/automation/status'      // État de l'automatisation
  | '/automation/mode'        // Mode d'automatisation
  | '/automation/config';     // Configuration

/**
 * Interface pour les requêtes de contrôle du chargeur
 * Utilisée pour envoyer des commandes au chargeur Zaptec
 */
export interface ChargerControlRequest {
  /** Action à effectuer */
  action: 'start' | 'stop' | 'setCurrent' | 'setMode';
  /** Valeur associée (ex: courant en ampères) */
  value?: number;
  /** Paramètres additionnels */
  parameters?: Record<string, any>;
}

/**
 * Interface pour les requêtes de configuration de l'automatisation
 * Permet de modifier les paramètres du système d'automatisation
 */
export interface AutomationConfigRequest {
  /** Mode d'automatisation */
  mode: 'manual' | 'surplus' | 'scheduled';
  /** Seuil de puissance pour démarrer la charge en Watts */
  powerThreshold?: number;
  /** Courant minimum de charge en Ampères */
  minimumCurrent?: number;
  /** Courant maximum de charge en Ampères */
  maximumCurrent?: number;
  /** Planning de charge (pour mode scheduled) */
  schedule?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
}