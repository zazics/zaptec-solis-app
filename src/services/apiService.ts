/**
 * SERVICE API - Communication avec votre serveur Node.js
 * 
 * Ce service centralise toutes les communications avec votre API Node.js.
 * Il utilise Axios pour les requêtes HTTP et gère les erreurs automatiquement.
 * 
 * Axios est une bibliothèque populaire pour les requêtes HTTP, plus simple
 * que fetch() et avec de meilleures fonctionnalités (interceptors, timeout, etc.)
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  ApiError, 
  ApiConfig,
  ZaptecStatus, 
  ZaptecChargerInfo,
  SolisInverterData,
  ChargerControlRequest,
  AutomationConfigRequest
} from '../types';

/**
 * Classe ApiService
 * 
 * Cette classe encapsule toutes les communications avec votre serveur Node.js.
 * Elle fournit des méthodes typées pour chaque endpoint de votre API.
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;

  /**
   * Constructeur du service API
   * 
   * @param config Configuration de l'API (URL, timeout, etc.)
   */
  constructor(config: ApiConfig) {
    this.config = config;
    
    // Création de l'instance Axios avec configuration personnalisée
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,           // URL de base de votre API (ex: http://192.168.1.100:3000)
      timeout: config.timeout || 10000,  // Timeout de 10 secondes par défaut
      headers: {
        'Content-Type': 'application/json',  // Type de contenu JSON
        ...(config.authToken && {           // Ajout du token d'authentification si présent
          'Authorization': `Bearer ${config.authToken}`
        }),
      },
    });

    // Configuration des interceptors pour gérer les réponses et erreurs
    this.setupInterceptors();
  }

  /**
   * Configuration des interceptors Axios
   * 
   * Les interceptors permettent de traiter automatiquement toutes les
   * réponses et erreurs avant qu'elles n'arrivent dans votre code.
   */
  private setupInterceptors(): void {
    // Interceptor pour les réponses réussies
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log de la réponse pour le débogage (à supprimer en production)
        console.log(`API Response [${response.config.method?.toUpperCase()} ${response.config.url}]:`, response.data);
        return response;
      },
      (error) => {
        // Gestion centralisée des erreurs
        console.error('API Error:', error);
        
        // Transformation de l'erreur en format standardisé
        const apiError: ApiError = {
          status: error.response?.status || 0,
          message: error.response?.data?.message || error.message || 'Erreur de communication',
          error: error.response?.data?.error,
          timestamp: new Date().toISOString(),
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Méthode générique pour les requêtes GET
   * 
   * @param endpoint Endpoint de l'API (ex: '/solis/status')
   * @returns Promise avec la réponse typée
   */
  private async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(endpoint);
    return response.data;
  }

  /**
   * Méthode générique pour les requêtes POST
   * 
   * @param endpoint Endpoint de l'API
   * @param data Données à envoyer dans le body
   * @returns Promise avec la réponse typée
   */
  private async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(endpoint, data);
    return response.data;
  }

  // ========================================
  // MÉTHODES POUR L'API SOLIS (ONDULEUR SOLAIRE)
  // ========================================

  /**
   * Récupère les données complètes de l'onduleur Solis
   * 
   * @returns Données de l'onduleur avec production solaire, batterie, réseau, etc.
   */
  async getSolisData(): Promise<SolisInverterData> {
    const response = await this.get<SolisInverterData>('/solis/data');
    return response.data!;
  }

  /**
   * Récupère uniquement le statut de l'onduleur Solis
   * 
   * @returns Statut simplifié de l'onduleur
   */
  async getSolisStatus(): Promise<{ status: string; online: boolean }> {
    const response = await this.get<{ status: string; online: boolean }>('/solis/status');
    return response.data!;
  }

  // ========================================
  // MÉTHODES POUR L'API ZAPTEC (CHARGEUR)
  // ========================================

  /**
   * Récupère le statut du chargeur Zaptec
   * 
   * @returns Statut du chargeur (en ligne, en charge, puissance, etc.)
   */
  async getZaptecStatus(): Promise<ZaptecStatus> {
    const response = await this.get<ZaptecStatus>('/zaptec/status');
    return response.data!;
  }

  /**
   * Récupère les informations détaillées du chargeur
   * 
   * @returns Informations complètes du chargeur
   */
  async getZaptecInfo(): Promise<ZaptecChargerInfo> {
    const response = await this.get<ZaptecChargerInfo>('/zaptec/info');
    return response.data!;
  }

  /**
   * Démarre la charge du véhicule
   * 
   * @returns Confirmation du démarrage
   */
  async startCharging(): Promise<ApiResponse> {
    return await this.post('/zaptec/start');
  }

  /**
   * Arrête la charge du véhicule
   * 
   * @returns Confirmation de l'arrêt
   */
  async stopCharging(): Promise<ApiResponse> {
    return await this.post('/zaptec/stop');
  }

  /**
   * Modifie le courant de charge
   * 
   * @param current Courant en ampères (6-16A généralement)
   * @returns Confirmation du changement
   */
  async setChargingCurrent(current: number): Promise<ApiResponse> {
    return await this.post('/zaptec/current', { current });
  }

  /**
   * Contrôle général du chargeur
   * 
   * @param request Requête de contrôle (start, stop, setCurrent, etc.)
   * @returns Confirmation de la commande
   */
  async controlCharger(request: ChargerControlRequest): Promise<ApiResponse> {
    return await this.post('/zaptec/control', request);
  }

  // ========================================
  // MÉTHODES POUR L'AUTOMATISATION
  // ========================================

  /**
   * Récupère l'état du système d'automatisation
   * 
   * @returns État de l'automatisation (mode, configuration, etc.)
   */
  async getAutomationStatus(): Promise<{ mode: string; enabled: boolean; lastUpdate: string }> {
    const response = await this.get<{ mode: string; enabled: boolean; lastUpdate: string }>('/automation/status');
    return response.data!;
  }

  /**
   * Change le mode d'automatisation
   * 
   * @param mode Mode à activer ('manual', 'surplus', 'scheduled')
   * @returns Confirmation du changement
   */
  async setAutomationMode(mode: 'manual' | 'surplus' | 'scheduled'): Promise<ApiResponse> {
    return await this.post('/automation/mode', { mode });
  }

  /**
   * Configure les paramètres d'automatisation
   * 
   * @param config Configuration à appliquer
   * @returns Confirmation de la configuration
   */
  async configureAutomation(config: AutomationConfigRequest): Promise<ApiResponse> {
    return await this.post('/automation/config', config);
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================

  /**
   * Teste la connectivité avec l'API
   * 
   * @returns État de la connexion
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Met à jour la configuration de l'API
   * 
   * @param newConfig Nouvelle configuration
   */
  updateConfig(newConfig: ApiConfig): void {
    this.config = newConfig;
    this.axiosInstance.defaults.baseURL = newConfig.baseUrl;
    this.axiosInstance.defaults.timeout = newConfig.timeout || 10000;
    
    // Mise à jour de l'en-tête d'authentification
    if (newConfig.authToken) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newConfig.authToken}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Récupère la configuration actuelle
   * 
   * @returns Configuration actuelle de l'API
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

// ========================================
// INSTANCE SINGLETON ET EXPORT
// ========================================

// Configuration par défaut (vous devrez la modifier selon votre environnement)
const defaultConfig: ApiConfig = {
  baseUrl: 'http://192.168.1.100:3000',  // Remplacez par l'IP de votre Raspberry Pi
  timeout: 10000,                        // 10 secondes de timeout
  useHttps: false,                       // Changez à true si vous utilisez HTTPS
};

// Instance singleton du service API
// En utilisant une instance unique, vous partagez la configuration dans toute l'app
const apiService = new ApiService(defaultConfig);

export default apiService;