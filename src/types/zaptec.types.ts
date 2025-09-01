/**
 * TYPES ZAPTEC - Définitions TypeScript pour les données Zaptec
 * 
 * Ce fichier contient toutes les interfaces TypeScript qui correspondent
 * aux modèles de données de votre API Node.js Zaptec.
 */

/**
 * DTO pour le statut principal d'un chargeur Zaptec
 * Utilisée pour afficher l'état en temps réel du chargeur
 */
export interface ZaptecDataDTO {
  /** Identifiant unique du chargeur */
  id: string;
  /** Nom du chargeur */
  name: string;
  /** Indique si le chargeur est en ligne */
  online: boolean;
  /** Indique si le chargeur est en cours de charge */
  charging: boolean;
  /** Puissance actuelle en Watts */
  power: number;
  /** Puissance totale en Watts */
  totalPower: number;
  /** Courant de charge configuré en Ampères */
  ChargeCurrentSet: number;
  /** Indique si un véhicule est connecté */
  vehicleConnected: boolean;
  /** Mode d'opération: 0=Unknown, 1=Disconnected, 2=Connected_Requesting, 3=Connected_Charging, 5=Connected_Finished */
  operatingMode: string;
  /** Type d'appareil depuis l'API */
  deviceType: number;
  /** Numéro de série */
  serialNo: string;
}

/**
 * Interface pour les observations d'état du chargeur
 * Utilisée pour les données de monitoring en temps réel
 */
export interface ZaptecStateObservation {
  /** ID du chargeur concerné */
  ChargerId: string;
  /** ID de l'état observé */
  StateId: number;
  /** Timestamp de l'observation */
  Timestamp: string;
  /** Valeur sous forme de chaîne de caractères */
  ValueAsString?: string;
}

/**
 * Interface pour les informations détaillées du chargeur
 * Contient toutes les propriétés techniques et de configuration
 */
export interface ZaptecChargerInfo {
  Id: string;
  Name: string;
  DeviceId: string;
  SerialNo: string;
  CreatedOnDate: string;
  CircuitId: string;
  Active: boolean;
  IsOnline: boolean;
  OperatingMode: number;
  CurrentUserRoles: number;
  Pin: string;
  PropertyPinOfflinePhase: boolean;
  PropertyAuthenticationDisabled: boolean;
  HasSessions: boolean;
  PropertyOfflinePhaseOverride: number;
  SignedMeterValueKwh: number;
  SignedMeterValue: string;
  DeviceType: number;
  InstallationName: string;
  InstallationId: string;
  AuthenticationType: number;
  IsAuthorizationRequired: boolean;
  MID?: string;
}

/**
 * Interface pour les paramètres de charge
 * Utilisée pour contrôler le chargeur
 */
export interface ZaptecChargingSettings {
  /** Courant maximum en Ampères */
  maxCurrent: number;
  /** Indique si la charge est activée */
  enabled: boolean;
}

/**
 * Interface pour les informations d'installation
 * Contient toutes les données de l'installation électrique
 */
export interface ZaptecInstallationInfo {
  Id: string;
  Name: string;
  Address: string;
  ZipCode: string;
  City: string;
  CountryId: string;
  InstallationType: number;
  MaxCurrent: number;
  AvailableCurrent: number;
  AvailableCurrentPhase1: number;
  AvailableCurrentPhase2: number;
  AvailableCurrentPhase3: number;
  AvailableCurrentMode: number;
  AvailableCurrentScheduleWeekendActive: boolean;
  DefaultThreeToOneSwitchCurrent: number;
  InstallationCategoryId: string;
  InstallationCategory: string;
  UseLoadBalancing: boolean;
  IsRequiredAuthentication: boolean;
  Latitude: number;
  Longitude: number;
  Active: boolean;
  NetworkType: number;
  AvailableInternetAccessPLC: boolean;
  AvailableInternetAccessWiFi: boolean;
  CreatedOnDate: string;
  UpdatedOn: string;
  CurrentUserRoles: number;
  AuthenticationType: number;
  MessagingEnabled: boolean;
  RoutingId: string;
  OcppCloudUrlVersion: number;
  TimeZoneName: string;
  TimeZoneIanaName: string;
  IsSubscriptionsAvailableForCurrentUser: boolean;
  AvailableFeatures: number;
  EnabledFeatures: number;
  ActiveChargerCount: number;
  Feature_PowerManagement_EcoMode_DepartureTime: number;
  Feature_PowerManagement_EcoMode_MinEnergy: number;
  Feature_PowerManagement_Apm_SinglePhaseMappedToPhase: number;
  PropertyIsMinimumPowerOfflineMode: boolean;
  PropertyOfflineModeAllowAnonymous: boolean;
  PropertyEnergySensorUniqueId: string;
  PropertyMainFuseCurrent: number;
  PropertyExperimentalFeaturesEnabled: number;
  PropertyEnergySensorRippleEnabled: boolean;
  PropertyEnergySensorRippleNumBits: number;
  PropertyEnergySensorRipplePercentBits00: number;
  PropertyEnergySensorRipplePercentBits01: number;
  PropertyEnergySensorRipplePercentBits10: number;
  PropertyFirmwareAutomaticUpdates: boolean;
  PropertySessionMaxStopCount: number;
}

/**
 * Interface pour la demande de mise à jour d'installation
 * Utilisée pour modifier les paramètres d'installation
 */
export interface ZaptecInstallationUpdateRequest {
  /** Courant disponible à régler sur toutes les phases */
  availableCurrent?: number | null;
  /** Courant disponible pour la phase 1 */
  availableCurrentPhase1?: number | null;
  /** Courant disponible pour la phase 2 */
  availableCurrentPhase2?: number | null;
  /** Courant disponible pour la phase 3 */
  availableCurrentPhase3?: number | null;
  /** Courant maximum autorisé pour l'installation */
  maxCurrent?: number | null;
  /** Mode puissance minimale hors ligne */
  minPowerOfflineMode?: boolean | null;
  /** Courant de commutation 3 vers 1 phase */
  threeToOnePhaseSwitchCurrent?: number | null;
}