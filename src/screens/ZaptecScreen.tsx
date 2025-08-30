/**
 * ÉCRAN ZAPTEC - Contrôle du chargeur
 * 
 * Cet écran permet de :
 * - Visualiser l'état du chargeur Zaptec
 * - Contrôler la charge (démarrer/arrêter)
 * - Régler le courant de charge
 * - Voir les informations détaillées du chargeur
 * - Gérer les modes d'automatisation
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

// Import des types et services
import { ZaptecStatus, ZaptecChargerInfo } from '../types';
import { apiService } from '../services';

/**
 * Composant ZaptecScreen
 * 
 * Interface de contrôle complète du chargeur Zaptec
 */
const ZaptecScreen: React.FC = () => {
  // ========================================
  // ÉTAT LOCAL
  // ========================================

  const [zaptecStatus, setZaptecStatus] = useState<ZaptecStatus | null>(null);
  const [chargerInfo, setChargerInfo] = useState<ZaptecChargerInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // États pour les contrôles
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(false);
  const [isControlLoading, setIsControlLoading] = useState<boolean>(false);

  // ========================================
  // FONCTIONS
  // ========================================

  /**
   * Charge les données du chargeur depuis l'API
   */
  const loadData = async (): Promise<void> => {
    try {
      // Chargement en parallèle du statut et des infos détaillées
      const [status, info] = await Promise.all([
        apiService.getZaptecStatus(),
        apiService.getZaptecInfo(),
      ]);

      setZaptecStatus(status);
      setChargerInfo(info);
      setIsCharging(status.charging || false);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données Zaptec:', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de récupérer les données du chargeur.',
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
   * Démarre ou arrête la charge
   */
  const handleToggleCharging = async (): Promise<void> => {
    setIsControlLoading(true);
    
    try {
      if (isCharging) {
        await apiService.stopCharging();
        Alert.alert('Succès', 'Charge arrêtée avec succès.');
      } else {
        await apiService.startCharging();
        Alert.alert('Succès', 'Charge démarrée avec succès.');
      }
      
      // Actualisation des données après la commande
      setTimeout(() => {
        loadData();
      }, 2000); // Délai pour laisser le temps à la commande de s'effectuer
      
    } catch (error) {
      console.error('Erreur lors du contrôle de charge:', error);
      Alert.alert(
        'Erreur',
        'Impossible de contrôler la charge. Vérifiez la connexion.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsControlLoading(false);
    }
  };

  /**
   * Modifie le courant de charge
   */
  const handleSetCurrent = async (): Promise<void> => {
    const current = parseFloat(currentInput);
    
    // Validation de l'entrée
    if (isNaN(current) || current < 6 || current > 16) {
      Alert.alert(
        'Valeur invalide',
        'Le courant doit être entre 6 et 16 ampères.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsControlLoading(true);
    
    try {
      await apiService.setChargingCurrent(current);
      Alert.alert('Succès', `Courant réglé à ${current}A avec succès.`);
      setIsModalVisible(false);
      setCurrentInput('');
      
      // Actualisation des données
      setTimeout(() => {
        loadData();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors du réglage du courant:', error);
      Alert.alert(
        'Erreur',
        'Impossible de régler le courant. Vérifiez la connexion.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsControlLoading(false);
    }
  };

  /**
   * Formate le mode d'opération en texte lisible
   */
  const formatOperatingMode = (mode: string | undefined): string => {
    if (!mode) return 'Inconnu';
    
    const modes: { [key: string]: string } = {
      '0': 'Inconnu',
      '1': 'Déconnecté',
      '2': 'Connecté (en attente)',
      '3': 'Connecté (en charge)',
      '5': 'Connecté (terminé)',
    };
    
    return modes[mode] || mode;
  };

  /**
   * Retourne une couleur basée sur l'état de connexion
   */
  const getConnectionColor = (connected: boolean | undefined): string => {
    return connected ? '#34C759' : '#FF3B30';
  };

  /**
   * Retourne une couleur basée sur l'état de charge
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
    }, 10000); // Actualisation toutes les 10 secondes

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing, isControlLoading]);

  // ========================================
  // COMPOSANTS INTERNES
  // ========================================

  /**
   * Bouton de contrôle personnalisé
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
   * Indicateur d'état avec icône
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
  // RENDU CONDITIONNEL
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des données du chargeur...</Text>
      </View>
    );
  }

  if (!zaptecStatus) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucune donnée de chargeur disponible</Text>
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
        <Text style={styles.title}>Chargeur Zaptec</Text>
        <Text style={styles.chargerName}>{zaptecStatus.name || 'Chargeur principal'}</Text>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>
            Dernière MAJ : {lastUpdate.toLocaleTimeString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Indicateurs d'état */}
      <View style={styles.statusContainer}>
        <StatusIndicator
          label="Connexion"
          value={zaptecStatus.online ? 'En ligne' : 'Hors ligne'}
          color={getConnectionColor(zaptecStatus.online)}
          icon="🌐"
        />
        <StatusIndicator
          label="Véhicule"
          value={zaptecStatus.vehicleConnected ? 'Connecté' : 'Absent'}
          color={getConnectionColor(zaptecStatus.vehicleConnected)}
          icon="🚗"
        />
        <StatusIndicator
          label="Charge"
          value={zaptecStatus.charging ? 'En cours' : 'Arrêtée'}
          color={getChargingColor(zaptecStatus.charging)}
          icon="⚡"
        />
      </View>

      {/* Section Contrôles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎛️ Contrôles</Text>
        
        <View style={styles.controlsContainer}>
          <ControlButton
            title={isCharging ? 'Arrêter la charge' : 'Démarrer la charge'}
            onPress={handleToggleCharging}
            disabled={!zaptecStatus.online || !zaptecStatus.vehicleConnected}
            color={isCharging ? '#FF3B30' : '#34C759'}
            loading={isControlLoading}
          />
          
          <ControlButton
            title={`Régler courant (${zaptecStatus.ChargeCurrentSet || 0}A)`}
            onPress={() => setIsModalVisible(true)}
            disabled={!zaptecStatus.online}
            color="#FF9500"
          />
        </View>

        {/* Switch d'automatisation */}
        <View style={styles.automationContainer}>
          <Text style={styles.automationLabel}>Mode automatique</Text>
          <Switch
            value={automationEnabled}
            onValueChange={setAutomationEnabled}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      </View>

      {/* Section Données de charge */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Données de charge</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Puissance actuelle :</Text>
          <Text style={[styles.dataValue, { color: '#007AFF' }]}>
            {(zaptecStatus.power || 0).toFixed(0)} W
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Puissance totale :</Text>
          <Text style={styles.dataValue}>
            {((zaptecStatus.totalPower || 0) / 1000).toFixed(1)} kWh
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Courant configuré :</Text>
          <Text style={styles.dataValue}>
            {zaptecStatus.ChargeCurrentSet || 0} A
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Mode d'opération :</Text>
          <Text style={styles.dataValue}>
            {formatOperatingMode(zaptecStatus.operatingMode)}
          </Text>
        </View>
      </View>

      {/* Section Informations du chargeur */}
      {chargerInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations du chargeur</Text>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Numéro de série :</Text>
            <Text style={styles.dataValue}>{chargerInfo.SerialNo}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Installation :</Text>
            <Text style={styles.dataValue}>{chargerInfo.InstallationName}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Type d'appareil :</Text>
            <Text style={styles.dataValue}>{chargerInfo.DeviceType}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Date de création :</Text>
            <Text style={styles.dataValue}>
              {new Date(chargerInfo.CreatedOnDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Actif :</Text>
            <Text style={[styles.dataValue, { 
              color: chargerInfo.Active ? '#34C759' : '#FF3B30' 
            }]}>
              {chargerInfo.Active ? 'Oui' : 'Non'}
            </Text>
          </View>
        </View>
      )}

      {/* Modal de réglage du courant */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Régler le courant de charge</Text>
            <Text style={styles.modalSubtitle}>
              Entrez une valeur entre 6 et 16 ampères
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="Ex: 10"
              keyboardType="numeric"
              maxLength={2}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setIsModalVisible(false);
                  setCurrentInput('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSetCurrent}
                disabled={isControlLoading}
              >
                {isControlLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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