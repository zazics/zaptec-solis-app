/**
 * API SERVICE - Communication with your Node.js server
 *
 * This service centralizes all communications with your Node.js API.
 * It uses Axios for HTTP requests and handles errors automatically.
 *
 * Axios is a popular library for HTTP requests, simpler
 * than fetch() and with better features (interceptors, timeout, etc.)
 */

import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiResponse, ApiError, ApiConfig, ZaptecDataDTO, SolisDataDTO, ChargerControlRequest, AutomationConfigRequest } from "../types";

/**
 * ApiService Class
 *
 * This class encapsulates all communications with your Node.js server.
 * It provides typed methods for each endpoint of your API.
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;

  /**
   * API service constructor
   *
   * @param config API configuration (URL, timeout, etc.)
   */
  constructor(config: ApiConfig) {
    this.config = config;

    // Create Axios instance with custom configuration
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl, // Base URL already configured for simulation mode
      timeout: config.timeout || 10000, // 10 second timeout by default
      headers: {
        "Content-Type": "application/json", // JSON content type
        ...(config.authToken && {
          // Add authentication token if present
          Authorization: `Bearer ${config.authToken}`
        })
      }
    });

    // Configure interceptors to handle responses and errors
    this.setupInterceptors();
  }

  /**
   * Configure Axios interceptors
   *
   * Interceptors allow automatic processing of all
   * responses and errors before they reach your code.
   */
  private setupInterceptors(): void {
    // Interceptor for successful responses
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response for debugging (remove in production)
        console.log(`API Response [${response.config.method?.toUpperCase()} ${response.config.url}]:`, response.data);
        return response;
      },
      (error) => {
        // Centralized error handling
        console.error("API Error:", error);

        // Transform error to standardized format
        const apiError: ApiError = {
          status: error.response?.status || 0,
          message: error.response?.data?.message || error.message || "Communication error",
          error: error.response?.data?.error,
          timestamp: new Date().toISOString()
        };

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Generic method for GET requests
   *
   * @param endpoint API endpoint (ex: '/solis/status')
   * @returns Promise with typed response
   */
  private async get<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint);
    return response.data;
  }

  /**
   * Generic method for POST requests
   *
   * @param endpoint API endpoint
   * @param data Data to send in the body
   * @returns Promise with typed response
   */
  private async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  // ========================================
  // SOLIS API METHODS (SOLAR INVERTER)
  // ========================================

  /**
   * Retrieve complete Solis inverter data from database
   *
   * @returns Latest solar inverter data with solar production, battery, grid, etc.
   */
  async getSolisData(): Promise<SolisDataDTO> {
    const response = await this.get<SolisDataDTO>("/automation/solis/latest");
    return response;
  }

  // ========================================
  // ZAPTEC API METHODS (CHARGER)
  // ========================================

  /**
   * Retrieve Zaptec charger status from automation system
   *
   * @returns Charger status (online, charging, power, etc.)
   */
  async getZaptecStatus(): Promise<ZaptecDataDTO> {
    const response = await this.get<ZaptecDataDTO>("/automation/zaptec/status");
    return response;
  }

  // ========================================
  // AUTOMATION METHODS
  // ========================================


  /**
   * Change automation mode
   *
   * @param mode Mode to activate ('manual', 'surplus')
   * @returns Change confirmation
   */
  async setAutomationMode(mode: "manual" | "surplus"): Promise<ApiResponse> {
    return await this.post("/automation/config", { mode });
  }

  /**
   * Configure automation parameters
   *
   * @param config Configuration to apply
   * @returns Configuration confirmation
   */
  async configureAutomation(config: AutomationConfigRequest): Promise<ApiResponse> {
    return await this.post("/automation/config", config);
  }

  /**
   * Enable automation system
   *
   * @returns Enable confirmation
   */
  async enableAutomation(): Promise<ApiResponse> {
    return await this.post("/automation/enable");
  }

  /**
   * Disable automation system
   *
   * @returns Disable confirmation
   */
  async disableAutomation(): Promise<ApiResponse> {
    return await this.post("/automation/disable");
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Test connectivity with the API
   *
   * @returns Connection status
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get("/health", { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Update API configuration
   *
   * @param newConfig New configuration
   */
  updateConfig(newConfig: ApiConfig): void {
    this.config = newConfig;

    this.axiosInstance.defaults.baseURL = newConfig.baseUrl;
    this.axiosInstance.defaults.timeout = newConfig.timeout || 10000;

    // Update authentication header
    if (newConfig.authToken) {
      this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newConfig.authToken}`;
    } else {
      delete this.axiosInstance.defaults.headers.common["Authorization"];
    }
  }

  /**
   * Get current configuration
   *
   * @returns Current API configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

// ========================================
// SINGLETON INSTANCE AND EXPORT
// ========================================

import { API_BASE_URL, API_TIMEOUT, API_USE_HTTPS, SIMULATION_MODE } from "@env";

// Default configuration (loaded from environment variables)
const simulationMode = SIMULATION_MODE === "true" || false;
const defaultConfig: ApiConfig = {
  baseUrl: simulationMode ? "http://localhost:3000" : (API_BASE_URL || "http://192.168.1.100:3000"), // Force localhost if simulation mode
  timeout: parseInt(API_TIMEOUT) || 10000, // Timeout from .env file
  useHttps: API_USE_HTTPS === "true" || false, // HTTPS setting from .env file
  simulationMode: simulationMode // Simulation mode from .env file
};

// API service singleton instance
// By using a single instance, you share configuration throughout the app
const apiService = new ApiService(defaultConfig);

export default apiService;
