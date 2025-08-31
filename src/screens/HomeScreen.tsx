/**
 * HOME SCREEN - System overview
 *
 * This screen displays a summary of your system status:
 * - Current solar production
 * - Battery status
 * - Charger status
 * - Global energy flow
 *
 * React Native uses components like View, Text, StyleSheet
 * which are the equivalent of <div>, <p>, CSS on web.
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator } from "react-native";

// Import types and services
import { SolisInverterData, ZaptecStatus } from "../types";
import { apiService } from "../services";

/**
 * HomeScreen Component
 *
 * React functional component that displays the overview.
 * Uses useState and useEffect hooks to manage local state.
 */
const HomeScreen: React.FC = () => {
  // ========================================
  // COMPONENT LOCAL STATE
  // ========================================

  // useState allows storing data that changes in the component
  // When state changes, React automatically re-renders the component

  const [solisData, setSolisData] = useState<SolisInverterData | null>(null);
  const [zaptecStatus, setZaptecStatus] = useState<ZaptecStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading indicator
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Refresh indicator
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Load data from the API
   * Asynchronous function that retrieves Solis and Zaptec data
   */
  const loadData = async (): Promise<void> => {
    try {
      // Promise.all allows executing multiple requests in parallel
      // Faster than waiting for each request one after the other
      const [solis, zaptec] = await Promise.all([apiService.getSolisData(), apiService.getZaptecStatus()]);

      // Update state with retrieved data
      setSolisData(solis);
      setZaptecStatus(zaptec);
      setLastUpdate(new Date());
    } catch (error) {
      // Error handling with native alert display
      console.error("Error loading data:", error);
      Alert.alert("Connection Error", "Unable to retrieve data. Check your connection.", [{ text: "OK" }]);
    } finally {
      // finally always executes, whether the request succeeds or fails
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Handle manual data refresh
   * Called when user pulls down (pull-to-refresh)
   */
  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadData();
  };

  /**
   * Calculate solar surplus
   * Surplus = Production - Consumption
   */
  const calculateSolarSurplus = (): number => {
    if (!solisData) return 0;
    return solisData.pv.totalPowerDC - solisData.house.consumption;
  };

  /**
   * Format power in Watts with appropriate unit
   * Convert to kW if > 1000W
   */
  const formatPower = (watts: number): string => {
    if (Math.abs(watts) >= 1000) {
      return `${(watts / 1000).toFixed(1)} kW`;
    }
    return `${watts.toFixed(0)} W`;
  };

  /**
   * Return a color based on a numeric value
   * Green for positive, red for negative, gray for zero
   */
  const getColorForValue = (value: number): string => {
    if (value > 0) return "#34C759"; // Green (iOS system color)
    if (value < 0) return "#FF3B30"; // Red (iOS system color)
    return "#8E8E93"; // Gray (iOS system color)
  };

  // ========================================
  // EFFECTS (SIDE EFFECTS)
  // ========================================

  /**
   * useEffect with empty dependency array []
   * Executes only once when component mounts (like componentDidMount)
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * useEffect with interval for automatic updates
   * Updates data every 30 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        loadData();
      }
    }, 30000); // 30 seconds

    // Cleanup function: cleans up interval when component unmounts
    return () => clearInterval(interval);
  }, [isLoading, isRefreshing]);

  // ========================================
  // CONDITIONAL RENDERING
  // ========================================

  // Display loading indicator during initial loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <ScrollView
      style={styles.container}
      // RefreshControl adds "pull to refresh" functionality
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#007AFF" // Refresh indicator color
        />
      }
    >
      {/* Header with title and last update */}
      <View style={styles.header}>
        <Text style={styles.title}>Zaptec-Solis System</Text>
        {lastUpdate && <Text style={styles.lastUpdate}>Last Update: {lastUpdate.toLocaleTimeString("en-US")}</Text>}
      </View>

      {/* Solar Production Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Solar Production</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Total production:</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(solisData?.pv.totalPowerDC || 0) }]}>{formatPower(solisData?.pv.totalPowerDC || 0)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>House consumption:</Text>
          <Text style={styles.dataValue}>{formatPower(solisData?.house.consumption || 0)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Available surplus:</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(calculateSolarSurplus()) }]}>{formatPower(calculateSolarSurplus())}</Text>
        </View>
      </View>

      {/* Battery Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔋 Battery</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Charge level:</Text>
          <Text style={styles.dataValue}>{solisData?.battery.soc || 0}%</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Battery power:</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(solisData?.battery.power || 0) }]}>{formatPower(solisData?.battery.power || 0)}</Text>
        </View>
      </View>

      {/* Charger Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚗 Zaptec Charger</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Status:</Text>
          <Text style={[styles.dataValue, { color: zaptecStatus?.online ? "#34C759" : "#FF3B30" }]}>{zaptecStatus?.online ? "Online" : "Offline"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Charging in progress:</Text>
          <Text style={[styles.dataValue, { color: zaptecStatus?.charging ? "#34C759" : "#8E8E93" }]}>{zaptecStatus?.charging ? "Yes" : "No"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Charging power:</Text>
          <Text style={styles.dataValue}>{formatPower(zaptecStatus?.power || 0)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Vehicle connected:</Text>
          <Text style={styles.dataValue}>{zaptecStatus?.vehicleConnected ? "Yes" : "No"}</Text>
        </View>
      </View>

      {/* Grid Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Electrical Grid</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Grid exchange:</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(solisData?.grid.activePower || 0) }]}>
            {formatPower(solisData?.grid.activePower || 0)}
            <Text style={styles.unitExplanation}>{(solisData?.grid.activePower || 0) > 0 ? " (injection)" : " (consumption)"}</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// ========================================
// STYLES
// ========================================

/**
 * React Native StyleSheet
 * Similar to CSS but with JavaScript syntax
 * Properties use camelCase (backgroundColor instead of background-color)
 */
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes all available space
    backgroundColor: "#F2F2F7" // Background color (iOS light gray)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    backgroundColor: "#F2F2F7"
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93"
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center"
  },
  lastUpdate: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 4
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12, // Rounded corners
    padding: 16,
    shadowColor: "#000000", // Shadow (iOS)
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3 // Shadow (Android)
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12
  },
  dataRow: {
    flexDirection: "row", // Horizontal layout
    justifyContent: "space-between", // Space between elements
    alignItems: "center",
    paddingVertical: 8
  },
  dataLabel: {
    fontSize: 16,
    color: "#3C3C43",
    flex: 1 // Takes available space
  },
  dataValue: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right"
  },
  unitExplanation: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#8E8E93"
  }
});

export default HomeScreen;
