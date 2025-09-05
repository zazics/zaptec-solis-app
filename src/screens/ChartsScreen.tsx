/**
 * CHARTS SCREEN - Graphiques énergétiques dédiés
 *
 * Cet écran affiche tous les graphiques énergétiques dans un onglet dédié :
 * - Vue d'ensemble combinée (dashboard)
 * - Production solaire détaillée
 * - Consommation de la maison
 * - Échanges avec le réseau (import/export)
 * - Consommation de la borne Zaptec
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from "react-native";

// Import chart components and types
import DashboardChart from "../components/charts/DashboardChart";
import ChartComponent from "../components/charts/ChartComponent";
import PeriodSelector from "../components/charts/PeriodSelector";
import { useDashboardChartData, useSolarProductionChartData, useGridExchangeChartData, useHouseConsumptionChartData, useZaptecConsumptionChartData } from "../hooks/useChartData";

/**
 * ChartsScreen Component
 *
 * Écran dédié uniquement aux graphiques avec navigation par catégories
 */
const ChartsScreen: React.FC = () => {
  // ========================================
  // STATE
  // ========================================

  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year">("day");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Initialize with today's date in YYYY-MM-DD format
    return new Date().toISOString().split("T")[0];
  });
  const [activeTab, setActiveTab] = useState<"dashboard" | "solar" | "house" | "grid" | "zaptec">("dashboard");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Chart data hooks - pass date only for daily period
  const chartDate = selectedPeriod === "day" ? selectedDate : undefined;
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refreshData: refreshDashboard } = useDashboardChartData(selectedPeriod, chartDate);
  const { data: solarData, loading: solarLoading, error: solarError, refreshData: refreshSolar } = useSolarProductionChartData(selectedPeriod, chartDate);
  const { data: houseData, loading: houseLoading, error: houseError, refreshData: refreshHouse } = useHouseConsumptionChartData(selectedPeriod, chartDate);
  const { data: gridData, loading: gridLoading, error: gridError, refreshData: refreshGrid } = useGridExchangeChartData(selectedPeriod, chartDate);
  const { data: zaptecData, loading: zaptecLoading, error: zaptecError, refreshData: refreshZaptec } = useZaptecConsumptionChartData(selectedPeriod, chartDate);

  // ========================================
  // FUNCTIONS
  // ========================================

  /**
   * Handle period change
   */
  const handlePeriodChange = (period: "day" | "week" | "month" | "year"): void => {
    setSelectedPeriod(period);
    // Reset to today when changing period
    if (period === "day") {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  };

  /**
   * Handle date change for daily navigation
   */
  const handleDateChange = (date: string): void => {
    setSelectedDate(date);
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = (): void => {
    setIsRefreshing(true);

    // Refresh all data
    Promise.all([refreshDashboard(), refreshSolar(), refreshHouse(), refreshGrid(), refreshZaptec()]).finally(() => {
      setIsRefreshing(false);
    });
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tab: "dashboard" | "solar" | "house" | "grid" | "zaptec"): void => {
    setActiveTab(tab);
  };

  /**
   * Get tab configuration
   */
  const getTabConfig = () => [
    { key: "dashboard", label: "Global", icon: "📊" },
    { key: "solar", label: "Solar", icon: "☀️" },
    { key: "house", label: "Home", icon: "🏠" },
    { key: "grid", label: "Grid", icon: "🔌" },
    { key: "zaptec", label: "Zaptec", icon: "🚗" }
  ];

  /**
   * Render error message
   */
  const renderError = (error: string | null, context: string) => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Erreur {context}: {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            Alert.alert("Erreur de chargement", `Impossible de charger les données ${context}. Vérifiez votre connexion.`, [{ text: "OK" }]);
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render loading indicator
   */
  const renderLoading = (context: string) => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Chargement {context}...</Text>
    </View>
  );

  /**
   * Render chart content based on active tab
   */
  const renderChartContent = () => {
    switch (activeTab) {
      case "dashboard":
        if (dashboardError) return renderError(dashboardError, "vue d'ensemble");
        if (dashboardLoading) return renderLoading("vue d'ensemble");
        if (dashboardData) {
          return <DashboardChart title="Vue d'ensemble énergétique" data={dashboardData} height={300} totalSolarEnergyKwh={dashboardData.totalSolarEnergyKwh} />;
        }
        return null;

      case "solar":
        if (solarError) return renderError(solarError, "production solaire");
        if (solarLoading) return renderLoading("production solaire");
        if (solarData) {
          return <ChartComponent title="Production Solaire" data={solarData.data} color="rgba(255, 193, 7, 1)" unit="W" showValues={true} height={280} period={solarData.period} totalEnergy={solarData.totalEnergyKwh} />;
        }
        return null;

      case "house":
        if (houseError) return renderError(houseError, "consommation maison");
        if (houseLoading) return renderLoading("consommation maison");
        if (houseData) {
          return <ChartComponent title="Consommation Maison" data={houseData.data} color="rgba(0, 123, 255, 1)" unit="W" showValues={true} height={280} period={houseData.period} />;
        }
        return null;

      case "grid":
        if (gridError) return renderError(gridError, "échanges réseau");
        if (gridLoading) return renderLoading("échanges réseau");
        if (gridData) {
          return (
            <View>
              <ChartComponent title="Import Réseau" data={gridData.imported} color="rgba(220, 53, 69, 1)" unit="W" showValues={true} height={250} period={gridData.period} />
              <ChartComponent title="Export Réseau" data={gridData.exported} color="rgba(40, 167, 69, 1)" unit="W" showValues={true} height={250} period={gridData.period} />
            </View>
          );
        }
        return null;

      case "zaptec":
        if (zaptecError) return renderError(zaptecError, "consommation Zaptec");
        if (zaptecLoading) return renderLoading("consommation Zaptec");
        if (zaptecData) {
          return <ChartComponent title="Consommation Zaptec" data={zaptecData.data} color="rgba(40, 167, 69, 1)" unit="W" showValues={true} height={280} period={zaptecData.period} />;
        }
        return null;

      default:
        return null;
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#007AFF" />}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Graphiques Énergétiques</Text>
        <Text style={styles.subtitle}>Visualisez l'historique de votre système énergétique</Text>
      </View>

      {/* Period Selector */}
      <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} selectedDate={selectedPeriod === "day" ? selectedDate : undefined} onDateChange={selectedPeriod === "day" ? handleDateChange : undefined} />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {getTabConfig().map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]} onPress={() => handleTabChange(tab.key as any)}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chart Content */}
      <View style={styles.chartContent}>{renderChartContent()}</View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>💡 Utilisez le sélecteur de période et les onglets pour explorer vos données énergétiques</Text>
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
    color: "#000000",
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center"
  },
  tabContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA"
  },
  tabScrollContent: {
    paddingHorizontal: 16
  },
  tabButton: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    minWidth: 70
  },
  activeTabButton: {
    backgroundColor: "#007AFF"
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#495057",
    textAlign: "center"
  },
  activeTabLabel: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  chartContent: {
    flex: 1,
    minHeight: 400
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600"
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
    marginHorizontal: 16
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#8E8E93"
  },
  footer: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  footerText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 16
  }
});

export default ChartsScreen;
