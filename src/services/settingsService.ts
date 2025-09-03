/**
 * SETTINGS SERVICE
 *
 * Ce service gère la persistance des paramètres utilisateur
 * et la configuration dynamique de l'API.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiConfig, AppSettings } from "../types";
import { API_BASE_URL, API_TIMEOUT, API_USE_HTTPS, SIMULATION_MODE, API_KEY } from "@env";
import { STORAGE_KEYS } from "../constants";
import Constants from "expo-constants";

/**
 * Configuration par défaut basée sur les variables d'environnement ou app.json
 */
const getEnvVar = (envVar: string, extraKey: string, fallback: string = ""): string => {
  return envVar || Constants.expoConfig?.extra?.[extraKey] || fallback;
};

const getDefaultApiConfig = (): ApiConfig => {
  const simulationMode = getEnvVar(SIMULATION_MODE, "SIMULATION_MODE", "false") === "true";
  return {
    baseUrl: simulationMode ? "http://localhost:3000" : getEnvVar(API_BASE_URL, "API_BASE_URL", "http://192.168.0.108:3000"),
    timeout: parseInt(getEnvVar(API_TIMEOUT, "API_TIMEOUT", "10000")),
    useHttps: getEnvVar(API_USE_HTTPS, "API_USE_HTTPS", "false") === "true",
    simulationMode: simulationMode,
    apiKey: getEnvVar(API_KEY, "API_KEY", "")
  };
};

/**
 * Paramètres par défaut de l'application
 */
const getDefaultSettings = (): AppSettings => ({
  api: getDefaultApiConfig(),
  refreshInterval: 15000,
  theme: "light",
  notificationsEnabled: true,
  units: "metric",
  language: "fr",
  simulationMode: getEnvVar(SIMULATION_MODE, "SIMULATION_MODE", "false") === "true"
});

export class SettingsService {
  private static instance: SettingsService;
  private settings: AppSettings;

  private constructor() {
    this.settings = getDefaultSettings();
  }

  /**
   * Obtenir l'instance singleton du service
   */
  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Charger les paramètres depuis le stockage local
   */
  async loadSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsedSettings = JSON.parse(stored) as AppSettings;
        this.settings = { ...getDefaultSettings(), ...parsedSettings };
      }
    } catch (error) {
      console.warn("Erreur lors du chargement des paramètres:", error);
      this.settings = getDefaultSettings();
    }
    return this.settings;
  }

  /**
   * Sauvegarder les paramètres dans le stockage local
   */
  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      throw error;
    }
  }

  /**
   * Obtenir les paramètres actuels
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Obtenir la configuration API actuelle
   */
  getApiConfig(): ApiConfig {
    return { ...this.settings.api };
  }

  /**
   * Mettre à jour la configuration API
   */
  async updateApiConfig(apiConfig: Partial<ApiConfig>): Promise<void> {
    const newSettings: Partial<AppSettings> = {
      api: { ...this.settings.api, ...apiConfig }
    };
    await this.saveSettings(newSettings);
  }

  /**
   * Définir une adresse IP personnalisée pour le backend
   */
  async setCustomBackendUrl(ip: string, port: number = 3000): Promise<ApiConfig> {
    // Validation de l'IP
    if (!this.isValidIpAddress(ip)) {
      throw new Error("Adresse IP invalide");
    }

    // Construction de l'URL
    const protocol = this.settings.api.useHttps ? "https" : "http";
    const baseUrl = `${protocol}://${ip}:${port}`;

    await this.updateApiConfig({ baseUrl });

    return this.getApiConfig();
  }

  /**
   * Réinitialiser à l'adresse IP par défaut
   */
  async resetToDefaultUrl(): Promise<ApiConfig> {
    const defaultConfig = getDefaultApiConfig();
    await this.updateApiConfig({ baseUrl: defaultConfig.baseUrl });
    return this.getApiConfig();
  }

  /**
   * Basculer le mode simulation
   */
  async toggleSimulationMode(): Promise<ApiConfig> {
    const simulationMode = !this.settings.simulationMode;
    const baseUrl = simulationMode ? "http://localhost:3000" : API_BASE_URL || "http://192.168.0.108:3000";

    await this.saveSettings({ simulationMode });
    await this.updateApiConfig({ baseUrl, simulationMode });

    return this.getApiConfig();
  }

  /**
   * Définir une clé API personnalisée
   */
  async setCustomApiKey(apiKey: string): Promise<ApiConfig> {
    await this.updateApiConfig({ apiKey });
    return this.getApiConfig();
  }

  /**
   * Réinitialiser à la clé API par défaut
   */
  async resetToDefaultApiKey(): Promise<ApiConfig> {
    const defaultApiKey = getEnvVar(API_KEY, "API_KEY", "");
    await this.updateApiConfig({ apiKey: defaultApiKey });
    return this.getApiConfig();
  }

  /**
   * Obtenir l'adresse IP par défaut depuis l'environnement
   */
  getDefaultBackendUrl(): string {
    const simulationMode = SIMULATION_MODE === "true" || false;
    return simulationMode ? "http://localhost:3000" : API_BASE_URL || "http://192.168.0.108:3000";
  }

  /**
   * Extraire l'IP et le port d'une URL
   */
  parseBackendUrl(url: string): { ip: string; port: number } {
    try {
      const urlObj = new URL(url);
      return {
        ip: urlObj.hostname,
        port: parseInt(urlObj.port) || 3000
      };
    } catch {
      return { ip: "192.168.0.108", port: 3000 };
    }
  }

  /**
   * Valider une adresse IP
   */
  private isValidIpAddress(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip) || ip === "localhost";
  }

  /**
   * Réinitialiser tous les paramètres
   */
  async resetAllSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
      this.settings = getDefaultSettings();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      throw error;
    }
  }
}

// Export de l'instance singleton
export const settingsService = SettingsService.getInstance();
export default settingsService;
