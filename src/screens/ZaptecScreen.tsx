/**
 * ZAPTEC SCREEN - Charger Control
 * 
 * This screen allows to:
 * - View the Zaptec charger status
 * - View detailed charger information
 * - Monitor charging status (read-only)
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
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';

// Import types and services
import { ZaptecStatus } from '../types';
import { apiService } from '../services';

/**
 * ZaptecScreen Component
 * 
 * Complete control interface for the Zaptec charger
 */
const ZaptecScreen: React.FC = () => {
  // ========================================
  // LOCAL STATE
  // ========================================

  const [zaptecStatus, setZaptecStatus] = useState<ZaptecStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // States for controls
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(false);
  const [isControlLoading, setIsControlLoading] = useState<boolean>(false);

  // ========================================
  // FUNCTIONS
  // ========================================

  /**
   * Load charger data from the API
   */
  const loadData = async (): Promise<void> => {
    try {
      // Load charger status
      const status = await apiService.getZaptecStatus();

      setZaptecStatus(status);
      setIsCharging(status.charging || false);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading Zaptec data:', error);
      Alert.alert(
        'Connection Error',
        'Unable to retrieve charger data.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadData();
  };


  /**
   * Format operating mode to readable text
   */
  const formatOperatingMode = (mode: string | undefined): string => {
    if (!mode) return 'Unknown';
    
    const modes: { [key: string]: string } = {
      '0': 'Unknown',
      '1': 'Disconnected',
      '2': 'Connected (waiting)',
      '3': 'Connected (charging)',
      '5': 'Connected (finished)',
    };
    
    return modes[mode] || mode;
  };

  /**
   * Return a color based on connection status
   */
  const getConnectionColor = (connected: boolean | undefined): string => {
    return connected ? '#34C759' : '#FF3B30';
  };

  /**
   * Return a color based on charging status
   */
  const getChargingColor = (charging: boolean | undefined): string => {
    return charging ? '#007AFF' : '#8E8E93';
  };

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing && !isControlLoading) {
        loadData();
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing, isControlLoading]);

  // ========================================
  // INTERNAL COMPONENTS
  // ========================================

  /**
   * Custom control button
   */
  const ControlButton: React.FC<{
    title: string;
    onPress: () => void;
    disabled?: boolean;
    color?: string;
    loading?: boolean;
  }> = ({ title, onPress, disabled = false, color = '#007AFF', loading = false }) => (
    <TouchableOpacity
      style={[
        styles.controlButton,
        { backgroundColor: disabled ? '#E5E5EA' : color },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.controlButtonText, { color: disabled ? '#8E8E93' : '#FFFFFF' }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  /**
   * Status indicator with icon
   */
  const StatusIndicator: React.FC<{
    label: string;
    value: string;
    color: string;
    icon: string;
  }> = ({ label, value, color, icon }) => (
    <View style={styles.statusIndicator}>
      <Text style={styles.statusIcon}>{icon}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
    </View>
  );

  // ========================================
  // CONDITIONAL RENDERING
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading charger data...</Text>
      </View>
    );
  }

  if (!zaptecStatus) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No charger data available</Text>
      </View>
    );
  }

  // ========================================
  // MAIN RENDER
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Zaptec Charger</Text>
        <Text style={styles.chargerName}>{zaptecStatus.name || 'Main charger'}</Text>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>
            Last Update: {lastUpdate.toLocaleTimeString('en-US')}
          </Text>
        )}
      </View>

      {/* Status indicators */}
      <View style={styles.statusContainer}>
        <StatusIndicator
          label="Connection"
          value={zaptecStatus.online ? 'Online' : 'Offline'}
          color={getConnectionColor(zaptecStatus.online)}
          icon="🌐"
        />
        <StatusIndicator
          label="Vehicle"
          value={zaptecStatus.vehicleConnected ? 'Connected' : 'Not connected'}
          color={getConnectionColor(zaptecStatus.vehicleConnected)}
          icon="🚗"
        />
        <StatusIndicator
          label="Charging"
          value={zaptecStatus.charging ? 'In progress' : 'Stopped'}
          color={getChargingColor(zaptecStatus.charging)}
          icon="⚡"
        />
      </View>


      {/* Charging Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Charging Data</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Current power:</Text>
          <Text style={[styles.dataValue, { color: '#007AFF' }]}>
            {(zaptecStatus.power || 0).toFixed(0)} W
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Total power:</Text>
          <Text style={styles.dataValue}>
            {((zaptecStatus.totalPower || 0) / 1000).toFixed(1)} kWh
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Configured current:</Text>
          <Text style={styles.dataValue}>
            {zaptecStatus.ChargeCurrentSet || 0} A
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Operating mode:</Text>
          <Text style={styles.dataValue}>
            {formatOperatingMode(zaptecStatus.operatingMode)}
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
  chargerName: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
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
  controlsContainer: {
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  automationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  automationLabel: {
    fontSize: 16,
    color: '#000000',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#3C3C43',
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonCancel: {
    backgroundColor: '#E5E5EA',
  },
  modalButtonConfirm: {
    backgroundColor: '#007AFF',
  },
  modalButtonCancelText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ZaptecScreen;