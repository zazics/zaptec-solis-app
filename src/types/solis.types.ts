/**
 * TYPES SOLIS - Définitions TypeScript pour les données Solis
 * 
 * Ce fichier contient toutes les interfaces TypeScript qui correspondent
 * aux modèles de données de votre API Node.js Solis (onduleur solaire).
 */

/**
 * Interface pour les données des panneaux photovoltaïques
 * Contient les informations de tension, courant et puissance pour chaque string PV
 */
export interface SolisPVData {
  /** Données du string PV 1 */
  pv1: {
    /** Tension en Volts */
    voltage: number;
    /** Courant en Ampères */
    current: number;
    /** Puissance en Watts */
    power: number;
  };
  /** Données du string PV 2 */
  pv2: {
    /** Tension en Volts */
    voltage: number;
    /** Courant en Ampères */
    current: number;
    /** Puissance en Watts */
    power: number;
  };
  /** Puissance totale DC (courant continu) en Watts */
  totalPowerDC: number;
}

/**
 * Interface pour les données de puissance AC (courant alternatif)
 * Contient les informations de sortie de l'onduleur
 */
export interface SolisACData {
  /** Puissance totale AC en Watts */
  totalPowerAC: number;
  /** Fréquence du réseau en Hz */
  frequency: number;
  /** Température de l'onduleur en °C */
  temperature: number;
}

/**
 * Interface pour les données de consommation de la maison
 * Indique combien la maison consomme d'énergie
 */
export interface SolisHouseData {
  /** Consommation principale de la maison en Watts */
  consumption: number;
  /** Consommation de secours (backup) en Watts */
  backupConsumption: number;
}

/**
 * Interface pour les données du réseau électrique
 * Gère l'import/export d'énergie avec le réseau public
 */
export interface SolisGridData {
  /** Puissance active échangée avec le réseau en Watts (+ = injection, - = soutirage) */
  activePower: number;
  /** Puissance de l'onduleur en Watts */
  inverterPower: number;
  /** Énergie totale importée du réseau en kWh */
  importedEnergyTotal: number;
  /** Énergie totale exportée vers le réseau en kWh */
  exportedEnergyTotal: number;
}

/**
 * Interface pour les données de la batterie
 * Contient les informations sur l'état de la batterie domestique
 */
export interface SolisBatteryData {
  /** Puissance de charge/décharge de la batterie en Watts (+ = charge, - = décharge) */
  power: number;
  /** State of Charge - Niveau de charge de la batterie en % */
  soc: number;
  /** Tension de la batterie en Volts */
  voltage: number;
  /** Courant de la batterie en Ampères */
  current: number;
}

/**
 * Interface complète pour toutes les données de l'onduleur Solis
 * C'est l'interface principale que vous recevrez de votre API
 */
export interface SolisInverterData {
  /** Statut de l'onduleur */
  status: {
    /** Code numérique du statut */
    code: number;
    /** Description textuelle du statut */
    text: string;
  };
  /** Timestamp de la dernière lecture */
  timestamp: Date;
  /** Données des panneaux photovoltaïques */
  pv: SolisPVData;
  /** Données AC de l'onduleur */
  ac: SolisACData;
  /** Données de consommation de la maison */
  house: SolisHouseData;
  /** Données du réseau électrique */
  grid: SolisGridData;
  /** Données de la batterie */
  battery: SolisBatteryData;
}

/**
 * Interface pour les options de configuration de la connexion Solis
 * Utilisée pour la communication RS485/Modbus (en lecture seule dans l'app)
 */
export interface SolisConnectionOptions {
  /** Vitesse de transmission en bauds */
  baudRate?: number;
  /** Nombre de bits de données (5, 6, 7, 8) */
  dataBits?: 5 | 6 | 7 | 8;
  /** Nombre de bits d'arrêt */
  stopBits?: 1 | 1.5 | 2;
  /** Type de parité */
  parity?: 'none' | 'even' | 'mark' | 'odd' | 'space';
  /** ID de l'esclave Modbus */
  slaveId?: number;
  /** Timeout de réponse en millisecondes */
  responseTimeout?: number;
  /** Nombre de tentatives en cas d'échec */
  retryCount?: number;
  /** Délai entre les tentatives en millisecondes */
  retryDelay?: number;
}

/**
 * Interface pour les données calculées et l'état énergétique global
 * Utile pour l'affichage dans l'application mobile
 */
export interface SolisEnergyFlow {
  /** Production solaire totale en Watts */
  solarProduction: number;
  /** Consommation totale de la maison en Watts */
  houseConsumption: number;
  /** Surplus solaire disponible en Watts (production - consommation) */
  solarSurplus: number;
  /** Indique si on injecte (+) ou soutire (-) du réseau */
  gridFlow: number;
  /** Niveau de la batterie en % */
  batteryLevel: number;
  /** Indique si la batterie se charge (+) ou se décharge (-) */
  batteryFlow: number;
}