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

import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator, Dimensions } from "react-native";

// Import types and services
import { SolisDataDTO } from "../types";
import { apiService } from "../services";

// Removed chart components - now available in dedicated Charts screen

// Get screen dimensions for charts
const { width: screenWidth } = Dimensions.get("window");

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
      console.error("Erreur lors du chargement des données Solis:", error);
      Alert.alert("Erreur de connexion", "Impossible de récupérer les données de l'onduleur.", [{ text: "OK" }]);
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
   * Retourne une couleur basée sur le niveau de batterie
   */
  const getBatteryColor = (soc: number): string => {
    if (soc > 70) return "#34C759"; // Vert
    if (soc > 30) return "#FF9500"; // Orange
    return "#FF3B30"; // Rouge
  };

  /**
   * Formate une valeur de puissance avec l'unité appropriée
   */
  const formatPower = (watts: number): string => {
    if (Math.abs(watts) >= 1000) {
      return `${(watts / 1000).toFixed(1)} kW`;
    }
    return `${watts.toFixed(0)} W`;
  };

  /**
   * Retourne le statut textuel de la batterie avec puissance
   */
  const getBatteryStatus = (power: number): string => {
    const absolutePower = Math.abs(power);

    if (power < 0) return `Charging at ${formatPower(absolutePower)}`;
    if (power > 0) return `Discharging at ${formatPower(absolutePower)}`;
    return "Idle";
  };

  /**
   * Retourne la couleur du statut de batterie
   * Vert pour charge, rouge pour décharge, gris pour idle
   */
  const getBatteryStatusColor = (power: number): string => {
    if (power < 0) return "#34C759"; // Vert pour charge
    if (power > 0) return "#FF3B30"; // Rouge pour décharge
    return "#8E8E93"; // Gris pour idle
  };

  // ========================================
  // EFFECTS
  // ========================================

  useFocusEffect(
    useCallback(() => {
      loadData();
      const interval = setInterval(() => {
        loadData();
      }, 30000);
      return () => clearInterval(interval);
    }, [])
  );

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
   * Composant de gauge (jauge) pour afficher la production solaire
   */
  const GaugeChart: React.FC<{ value: number; max: number; label: string; unit: string }> = ({ value, max, label, unit }) => {
    // Pourcentage basé sur la limite de l'onduleur (5000W = 100%)
    const percentage = (value / 5000) * 100;
    const displayPercentage = percentage;

    // Angle pour l'affichage visuel (limité à 180° même si >100%)
    const angle = Math.min((percentage / 100) * 180, 180);

    // Couleur basée sur la puissance absolue (pas le pourcentage)
    // Bordeaux < 1000W, Rouge 1000-2000W, Orange 2000-3000W, Jaune 3000-4000W, Vert 4000-5000W, Vert très foncé >5000W
    const getGaugeColor = (watts: number): string => {
      if (watts < 1000) return "#800020"; // Bordeaux (très faible production)
      if (watts < 2000) return "#FF3B30"; // Rouge (faible production)
      if (watts < 3000) return "#FF9500"; // Orange (production modérée)
      if (watts < 4000) return "#FFD700"; // Jaune (bonne production)
      if (watts <= 5000) return "#34C759"; // Vert (production optimale - limite onduleur)
      return "#006400"; // Vert très foncé (au-delà de la limite onduleur)
    };

    const color = getGaugeColor(value);

    // Format de la valeur (W ou kW)
    const formatValue = (watts: number): string => {
      if (watts >= 1000) {
        return `${(watts / 1000).toFixed(1)} kW`;
      }
      return `${watts.toFixed(0)} W`;
    };

    return (
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeBorder}>
          <View style={[styles.gaugeBackground]}>
            {/* Arc de fond (gris) */}
            <View style={[styles.gaugeArc, { backgroundColor: "#E5E5EA" }]} />

            {/* Arc de progression */}
            <View
              style={[
                styles.gaugeArc,
                {
                  backgroundColor: color,
                  transform: [{ rotate: `${angle - 180}deg` }],
                  opacity: displayPercentage > 0 ? 1 : 0
                }
              ]}
            />
          </View>

          {/* Valeurs centrales */}
          <View style={styles.gaugeContent}>
            <Text style={styles.gaugeValue}>{formatValue(value)}</Text>
            <Text style={styles.gaugePercentage}>{displayPercentage.toFixed(0)}%</Text>
            <Text style={styles.gaugeLabel}>{label}</Text>
            <Text style={styles.gaugeMax}>Max: {formatValue(max)}</Text>
          </View>
        </View>
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
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#007AFF" />}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Onduleur Solis</Text>
        <Text
          style={[
            styles.statusText,
            {
              color: solisData.status.code === 1 ? "#34C759" : "#FF3B30"
            }
          ]}
        >
          {solisData.status.text}
        </Text>
        {lastUpdate && <Text style={styles.lastUpdate}>Dernière MAJ : {lastUpdate.toLocaleTimeString("fr-FR")}</Text>}
      </View>

      {/* Section Production PV */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>☀️ Production Photovoltaïque</Text>

        {/* Vue d'ensemble */}
        <View style={styles.overviewRow}>
          <GaugeChart value={solisData.pv.totalPowerDC} max={9000} label="Production solaire" unit="W" />
        </View>

        {/* Détails par string */}
        <View style={styles.pvStringContainer}>
          <View style={styles.pvString}>
            <Text style={styles.pvStringTitle}>String PV1</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tension :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv1.voltage, "V")}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Courant :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv1.current, "A")}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Puissance :</Text>
              <Text style={[styles.dataValue, { color: "#FF9500" }]}>{formatValue(solisData.pv.pv1.power, "W", 0)}</Text>
            </View>
          </View>

          <View style={styles.pvString}>
            <Text style={styles.pvStringTitle}>String PV2</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tension :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv2.voltage, "V")}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Courant :</Text>
              <Text style={styles.dataValue}>{formatValue(solisData.pv.pv2.current, "A")}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Puissance :</Text>
              <Text style={[styles.dataValue, { color: "#FF9500" }]}>{formatValue(solisData.pv.pv2.power, "W", 0)}</Text>
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
            <Text style={styles.dataLabel}>Status:</Text>
            <Text style={[styles.dataValue, { color: getBatteryStatusColor(solisData.battery.power) }]}>{getBatteryStatus(solisData.battery.power)}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Tension :</Text>
            <Text style={styles.dataValue}>{formatValue(solisData.battery.voltage, "V")}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Courant :</Text>
            <Text style={styles.dataValue}>{formatValue(solisData.battery.current, "A")}</Text>
          </View>
        </View>
      </View>

      {/* Section Sortie AC */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Sortie AC (Onduleur)</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Puissance AC :</Text>
          <Text style={[styles.dataValue, { color: "#007AFF" }]}>{formatValue(solisData.ac.totalPowerAC, "W", 0)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fréquence :</Text>
          <Text style={styles.dataValue}>{formatValue(solisData.ac.frequency, "Hz")}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Température :</Text>
          <Text
            style={[
              styles.dataValue,
              {
                color: solisData.ac.temperature > 60 ? "#FF3B30" : solisData.ac.temperature > 40 ? "#FF9500" : "#34C759"
              }
            ]}
          >
            {formatValue(solisData.ac.temperature, "°C")}
          </Text>
        </View>
      </View>

      {/* Section Consommation et Réseau */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Consommation et Réseau</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Consommation maison :</Text>
          <Text style={styles.dataValue}>{formatValue(solisData.house.consumption, "W", 0)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Consommation backup :</Text>
          <Text style={styles.dataValue}>{formatValue(solisData.house.backupConsumption, "W", 0)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Échange réseau :</Text>
          <Text
            style={[
              styles.dataValue,
              {
                color: solisData.grid.activePower > 0 ? "#34C759" : "#FF3B30"
              }
            ]}
          >
            {formatValue(Math.abs(solisData.grid.activePower), "W", 0)}
            {solisData.grid.activePower > 0 ? " (injection)" : " (soutirage)"}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Énergie exportée :</Text>
          <Text style={styles.dataValue}>{formatValue(solisData.grid.exportedEnergyTotal, "kWh")}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Énergie importée :</Text>
          <Text style={styles.dataValue}>{formatValue(solisData.grid.importedEnergyTotal, "kWh")}</Text>
        </View>
      </View>

      {/* Navigation Tip */}
      <View style={styles.tipSection}>
        <Text style={styles.tipText}>📊 Consultez l'onglet "Charts" pour voir les graphiques détaillés de production solaire, consommation et échanges réseau</Text>
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
    backgroundColor: "#F2F2F7"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7"
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93"
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7"
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30"
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000"
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4
  },
  lastUpdate: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16
  },
  overviewRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  gaugeContainer: {
    alignItems: "center",
    width: "100%"
  },
  gaugeBorder: {
    width: 200,
    height: 120,
    position: "relative",
    alignItems: "center",
    justifyContent: "center"
  },
  gaugeBackground: {
    position: "absolute",
    width: 180,
    height: 90,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    overflow: "hidden",
    top: 10
  },
  gaugeArc: {
    position: "absolute",
    width: 180,
    height: 90,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    transformOrigin: "50% 100%"
  },
  gaugeContent: {
    position: "absolute",
    alignItems: "center",
    top: 20,
    zIndex: 10
  },
  gaugeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2
  },
  gaugePercentage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4
  },
  gaugeLabel: {
    fontSize: 14,
    color: "#3C3C43",
    textAlign: "center",
    marginBottom: 2
  },
  gaugeMax: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center"
  },
  pvStringContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  pvString: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4
  },
  pvStringTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center"
  },
  batteryBarContainer: {
    marginBottom: 16
  },
  batteryBarBackground: {
    height: 20,
    backgroundColor: "#E5E5EA",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8
  },
  batteryBarFill: {
    height: "100%",
    borderRadius: 10
  },
  batteryBarText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#000000"
  },
  batteryDetails: {
    marginTop: 12
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4
  },
  dataLabel: {
    fontSize: 14,
    color: "#3C3C43",
    flex: 1
  },
  dataValue: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    color: "#000000"
  },
  tipSection: {
    backgroundColor: "#FFF3CD",
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFD700"
  },
  tipText: {
    fontSize: 14,
    color: "#B8860B",
    textAlign: "center",
    lineHeight: 20
  }
});

export default SolisScreen;
