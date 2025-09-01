/**
 * SOLIS SCREEN - Solar inverter details
 * 
 * This screen displays all detailed data from your Solis inverter:
 * - PV panel data (strings 1 and 2)
 * - AC data (inverter output)
 * - Battery status with visual chart
 * - Energy flows
 * - Production history (simulation)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

// Import types and services
import { SolisDataDTO } from '../types';
import { apiService } from '../services';

// Get screen dimensions for charts
const { width: screenWidth } = Dimensions.get('window');

/**
 * Composant SolisScreen
 * 
 * Affiche toutes les données détaillées de l'onduleur Solis
 */
const SolisScreen: React.FC = () => {
  // ========================================
  // ÉTAT LOCAL
  // ========================================

  const [solisData, setSolisData] = useState<SolisDataDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ========================================
  // FONCTIONS
  // ========================================

  /**
   * Charge les données Solis depuis l'API
   */
  const loadData = async (): Promise<void> => {
    try {
      const data = await apiService.getSolisData();
      setSolisData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données Solis:', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de récupérer les données de l\'onduleur.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Gère le rafraîchissement manuel
   */
  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadData();
  };

  /**
   * Formate une valeur numérique avec l'unité
   */
  const formatValue = (value: number, unit: string, decimals: number = 1): string => {
    return `${value.toFixed(decimals)} ${unit}`;
  };

  /**
   * Calcule l'efficacité de l'onduleur
   * Efficacité = (Puissance AC / Puissance DC) * 100
   */
  const calculateEfficiency = (): number => {
    if (!solisData || solisData.pv.totalPowerDC === 0) return 0;
    return (solisData.ac.totalPowerAC / solisData.pv.totalPowerDC) * 100;
  };

  /**
   * Retourne une couleur basée sur le niveau de batterie
   */
  const getBatteryColor = (soc: number): string => {
    if (soc > 70) return '#34C759';  // Vert
    if (soc > 30) return '#FF9500';  // Orange
    return '#FF3B30';                // Rouge
  };

  /**
   * Retourne le statut textuel de la batterie
   */
  const getBatteryStatus = (power: number): string => {
    if (power > 50) return 'En charge';
    if (power < -50) return 'En décharge';
    return 'Standby';
  };

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        loadData();
      }
    }, 15000); // Actualisation toutes les 15 secondes

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing]);

  // ========================================
  // COMPOSANTS INTERNES
  // ========================================

  /**
   * Composant de barre de progression pour la batterie
   */
  const BatteryBar: React.FC<{ level: number }> = ({ level }) => {
    return (
      <View style={styles.batteryBarContainer}>
        <View style={styles.batteryBarBackground}>
          <View 
            style={[
              styles.batteryBarFill,
              { 
                width: `${level}%`,
                backgroundColor: getBatteryColor(level)
              }
            ]}
          />
        </View>
        <Text style={styles.batteryBarText}>{level}%</Text>
      </View>
    );
  };

  /**
   * Composant d'indicateur circulaire simple
   */
  const CircularIndicator: React.FC<{ value: number; max: number; label: string; color: string }> = 
    ({ value, max, label, color }) => {
      const percentage = Math.min((value / max) * 100, 100);
      
      return (
        <View style={styles.circularIndicator}>
          <View style={styles.circularIndicatorBorder}>
            <View style={[styles.circularIndicatorFill, { backgroundColor: color, opacity: percentage / 100 }]} />
          </View>
          <Text style={styles.circularIndicatorValue}>{value.toFixed(0)}</Text>
          <Text style={styles.circularIndicatorLabel}>{label}</Text>
        </View>
      );
    };

  // ========================================
  // RENDU CONDITIONNEL
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des données Solis...</Text>
      </View>
    );
  }

  if (!solisData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucune donnée disponible</Text>
      </View>
    );
  }

  // ========================================
  // RENDU PRINCIPAL
  // ========================================

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#007AFF"
        />
      }
    >
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Onduleur Solis</Text>
        <Text style={[styles.statusText, { 
          color: solisData.status.code === 1 ? '#34C759' : '#FF3B30' 
        }]}>
          {solisData.status.text}
        </Text>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>
            Dernière MAJ : {lastUpdate.toLocaleTimeString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Section Production PV */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>☀️ Production Photovoltaïque</Text>
        
        {/* Vue d'ensemble */}
        <View style={styles.overviewRow}>
          <CircularIndicator 
            value={solisData.pv.totalPowerDC} 
            max={5000} 
            label="Puissance totale (W)" 
            color="#FF9500" 
          />
          <CircularIndicator 
            value={calculateEfficiency()} 
            max={100} 
            label="Efficacité (%)" 
            color="#34C759" 
          />
        </View>

        {/* Détails par string */}
        <View style={styles.pvStringContainer}>
          <View style={styles.pvString}>
            <Text style={styles.pvStringTitle}>String PV1</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tension :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv1.voltage, 'V')}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Courant :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv1.current, 'A')}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Puissance :</Text>
              <Text style={[styles.dataValue, { color: '#FF9500' }]}>
                {formatValue(solisData.pv.pv1.power, 'W', 0)}
              </Text>
            </View>
          </View>

          <View style={styles.pvString}>
            <Text style={styles.pvStringTitle}>String PV2</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tension :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv2.voltage, 'V')}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Courant :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv2.current, 'A')}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Puissance :</Text>
              <Text style={[styles.dataValue, { color: '#FF9500' }]}>
                {formatValue(solisData.pv.pv2.power, 'W', 0)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section Batterie */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔋 Batterie domestique</Text>
        
        <BatteryBar level={solisData.battery.soc} />
        
        <View style={styles.batteryDetails}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>État :</Text>
            <Text style={[styles.dataValue, { color: getBatteryColor(solisData.battery.soc) }]}>
              {getBatteryStatus(solisData.battery.power)}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Puissance :</Text>
            <Text style={[styles.dataValue, { 
              color: solisData.battery.power > 0 ? '#34C759' : 
                     solisData.battery.power < 0 ? '#FF3B30' : '#8E8E93' 
            }]}>
              {formatValue(Math.abs(solisData.battery.power), 'W', 0)}
              {solisData.battery.power > 0 && ' ⬆️'}
              {solisData.battery.power < 0 && ' ⬇️'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Tension :</Text>
            <Text style={styles.dataValue}>{formatValue(solisData.battery.voltage, 'V')}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Courant :</Text>
            <Text style={styles.dataValue}>{formatValue(solisData.battery.current, 'A')}</Text>
          </View>
        </View>
      </View>

      {/* Section Sortie AC */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Sortie AC (Onduleur)</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Puissance AC :</Text>
          <Text style={[styles.dataValue, { color: '#007AFF' }]}>
            {formatValue(solisData.ac.totalPowerAC, 'W', 0)}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fréquence :</Text>
          <Text style={styles.dataValue}>{formatValue(solisData.ac.frequency, 'Hz')}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Température :</Text>
          <Text style={[styles.dataValue, { 
            color: solisData.ac.temperature > 60 ? '#FF3B30' : 
                   solisData.ac.temperature > 40 ? '#FF9500' : '#34C759' 
          }]}>
            {formatValue(solisData.ac.temperature, '°C')}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Efficacité :</Text>
          <Text style={[styles.dataValue, { color: '#34C759' }]}>
            {formatValue(calculateEfficiency(), '%')}
          </Text>
        </View>
      </View>

      {/* Section Consommation et Réseau */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Consommation et Réseau</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Consommation maison :</Text>
          <Text style={styles.dataValue}>
            {formatValue(solisData.house.consumption, 'W', 0)}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Consommation backup :</Text>
          <Text style={styles.dataValue}>
            {formatValue(solisData.house.backupConsumption, 'W', 0)}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Échange réseau :</Text>
          <Text style={[styles.dataValue, { 
            color: solisData.grid.activePower > 0 ? '#34C759' : '#FF3B30' 
          }]}>
            {formatValue(Math.abs(solisData.grid.activePower), 'W', 0)}
            {solisData.grid.activePower > 0 ? ' (injection)' : ' (soutirage)'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Énergie exportée :</Text>
          <Text style={styles.dataValue}>
            {formatValue(solisData.grid.exportedEnergyTotal, 'kWh')}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Énergie importée :</Text>
          <Text style={styles.dataValue}>
            {formatValue(solisData.grid.importedEnergyTotal, 'kWh')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  circularIndicator: {
    alignItems: 'center',
  },
  circularIndicatorBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  circularIndicatorFill: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  circularIndicatorValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  circularIndicatorLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  pvStringContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pvString: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  pvStringTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  batteryBarContainer: {
    marginBottom: 16,
  },
  batteryBarBackground: {
    height: 20,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  batteryBarText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  batteryDetails: {
    marginTop: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 14,
    color: '#3C3C43',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    color: '#000000',
  },
});

export default SolisScreen;