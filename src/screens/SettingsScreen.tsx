import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { apiService, settingsService } from '../services';
import { AutomationConfig } from '../types';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isConnectionModalVisible, setIsConnectionModalVisible] = useState(false);
  const [isModeModalVisible, setIsModeModalVisible] = useState(false);
  const [isPriorityLoadModalVisible, setIsPriorityLoadModalVisible] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newPort, setNewPort] = useState('3000');
  const [newPriorityLoadReserve, setNewPriorityLoadReserve] = useState<number>(0);
  const [currentApiConfig, setCurrentApiConfig] = useState(apiService.getConfig());
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig | null>(null);
  const [selectedMode, setSelectedMode] = useState<'surplus' | 'manual' | 'minimum'>('surplus');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await settingsService.loadSettings();
      setNotificationsEnabled(settings.notificationsEnabled);
      const apiConfig = settingsService.getApiConfig();
      setCurrentApiConfig(apiConfig);
      
      // Pré-remplir les champs IP avec la configuration actuelle
      const { ip, port } = settingsService.parseBackendUrl(apiConfig.baseUrl);
      setNewIp(ip);
      setNewPort(port.toString());

      // Charger la configuration d'automatisation
      await loadAutomationConfig();
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const loadAutomationConfig = async () => {
    try {
      const config = await apiService.getAutomationConfig();
      setAutomationConfig(config);
      setSelectedMode(config.mode);
      setNewPriorityLoadReserve(config.priorityLoadReserve);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration d\'automatisation:', error);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const isConnected = await apiService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      Alert.alert(
        'Test de connexion', 
        isConnected ? 'Connexion réussie!' : 'Connexion échouée. Vérifiez l\'adresse IP et la disponibilité du serveur.'
      );
    } catch (error) {
      setConnectionStatus('failed');
      Alert.alert('Test de connexion', 'Erreur lors du test de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const saveIpConfiguration = async () => {
    if (!newIp.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse IP');
      return;
    }

    const port = parseInt(newPort) || 3000;
    
    try {
      setIsLoading(true);
      const newApiConfig = await settingsService.setCustomBackendUrl(newIp.trim(), port);
      
      // Mettre à jour la configuration de l'API service
      apiService.updateConfig(newApiConfig);
      setCurrentApiConfig(newApiConfig);
      
      setIsConnectionModalVisible(false);
      setConnectionStatus('unknown');
      Alert.alert('Succès', 'Configuration IP sauvegardée');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefault = async () => {
    try {
      setIsLoading(true);
      const defaultConfig = await settingsService.resetToDefaultUrl();
      
      // Mettre à jour la configuration de l'API service
      apiService.updateConfig(defaultConfig);
      setCurrentApiConfig(defaultConfig);
      
      const { ip, port } = settingsService.parseBackendUrl(defaultConfig.baseUrl);
      setNewIp(ip);
      setNewPort(port.toString());
      
      setConnectionStatus('unknown');
      Alert.alert('Succès', 'Configuration réinitialisée à la valeur par défaut');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };


  const openConnectionModal = () => {
    const { ip, port } = settingsService.parseBackendUrl(currentApiConfig.baseUrl);
    setNewIp(ip);
    setNewPort(port.toString());
    setIsConnectionModalVisible(true);
  };


  const openModeModal = () => {
    if (automationConfig) {
      setSelectedMode(automationConfig.mode);
    }
    setIsModeModalVisible(true);
  };

  const openPriorityLoadModal = () => {
    if (automationConfig) {
      setNewPriorityLoadReserve(automationConfig.priorityLoadReserve);
    }
    setIsPriorityLoadModalVisible(true);
  };

  const saveModeConfiguration = async () => {
    try {
      setIsLoading(true);
      await apiService.setAutomationMode(selectedMode);
      await loadAutomationConfig(); // Recharger la configuration
      setIsModeModalVisible(false);
      Alert.alert('Succès', `Mode ${getModeLabel(selectedMode)} activé`);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const savePriorityLoadConfiguration = async () => {
    try {
      setIsLoading(true);
      await apiService.configureAutomation({ priorityLoadReserve: newPriorityLoadReserve });
      await loadAutomationConfig(); // Recharger la configuration
      setIsPriorityLoadModalVisible(false);
      Alert.alert('Succès', `Réserve de puissance prioritaire définie à ${newPriorityLoadReserve}W`);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNeverStopCharging = async (value: boolean) => {
    try {
      setIsLoading(true);
      await apiService.configureAutomation({ neverStopCharging: value });
      await loadAutomationConfig(); // Recharger la configuration
      Alert.alert(
        'Succès',
        value
          ? 'La charge ne s\'arrêtera plus automatiquement'
          : 'La charge pourra être arrêtée selon le mode sélectionné'
      );
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const getModeLabel = (mode: 'surplus' | 'manual' | 'minimum') => {
    switch (mode) {
      case 'surplus': return 'Surplus solaire';
      case 'manual': return 'Manuel';
      case 'minimum': return 'Minimum 6A';
      default: return mode;
    }
  };

  const getModeDescription = (mode: 'surplus' | 'manual' | 'minimum') => {
    switch (mode) {
      case 'surplus': return 'Charge uniquement avec le surplus d\'énergie solaire';
      case 'manual': return 'Contrôle manuel du chargeur';
      case 'minimum': return 'Charge à 6A si assez de puissance solaire';
      default: return '';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>Configuration de l'application</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration serveur</Text>
        

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={openModeModal}
          disabled={isLoading || !automationConfig}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Mode d'automatisation</Text>
              <Text style={styles.settingItemSubtitle}>
                {automationConfig ? getModeLabel(automationConfig.mode) : 'Chargement...'}
              </Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={openPriorityLoadModal}
          disabled={isLoading || !automationConfig}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Réserve de puissance prioritaire</Text>
              <Text style={styles.settingItemSubtitle}>
                {automationConfig ? `${automationConfig.priorityLoadReserve}W` : 'Chargement...'}
              </Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Ne jamais arrêter la charge</Text>
              <Text style={styles.settingItemSubtitle}>
                {automationConfig?.neverStopCharging
                  ? 'La charge ne s\'arrêtera jamais une fois démarrée'
                  : 'La charge peut être arrêtée selon le mode sélectionné'}
              </Text>
            </View>
            <Switch
              value={automationConfig?.neverStopCharging || false}
              onValueChange={toggleNeverStopCharging}
              disabled={isLoading || !automationConfig}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={openConnectionModal}
          disabled={isLoading}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Tester la connexion</Text>
              <Text style={[
                styles.settingItemSubtitle,
                connectionStatus === 'connected' && { color: '#34C759' },
                connectionStatus === 'failed' && { color: '#FF3B30' }
              ]}>
                {isLoading ? 'Test en cours...' : 
                 connectionStatus === 'connected' ? 'Connexion OK' :
                 connectionStatus === 'failed' ? 'Connexion échouée' :
                 'Configurer et tester la connexion'}
              </Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={resetToDefault}
          disabled={isLoading}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Réinitialiser la configuration</Text>
              <Text style={styles.settingItemSubtitle}>Revenir aux paramètres par défaut</Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Affichage</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Notifications</Text>
              <Text style={styles.settingItemSubtitle}>Alertes et notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Version</Text>
              <Text style={styles.settingItemSubtitle}>1.0.0</Text>
            </View>
            <Text style={styles.settingItemValue}>1.0.0</Text>
          </View>
        </View>
      </View>

      <Modal
        visible={isConnectionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsConnectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configuration et test de connexion</Text>
            
            <Text style={styles.modalLabel}>Adresse IP</Text>
            <TextInput
              style={styles.modalInput}
              value={newIp}
              onChangeText={setNewIp}
              placeholder="192.168.0.108"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Port</Text>
            <TextInput
              style={styles.modalInput}
              value={newPort}
              onChangeText={setNewPort}
              placeholder="3000"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalNote}>
              URL finale : http://{newIp || '192.168.0.108'}:{newPort || '3000'}
            </Text>
            
            {/* Status de connexion */}
            <View style={styles.connectionStatus}>
              <Text style={[
                styles.connectionStatusText,
                connectionStatus === 'connected' && { color: '#34C759' },
                connectionStatus === 'failed' && { color: '#FF3B30' }
              ]}>
                {isLoading ? '🔄 Test en cours...' : 
                 connectionStatus === 'connected' ? '✅ Connexion réussie' :
                 connectionStatus === 'failed' ? '❌ Connexion échouée' :
                 '⚪ Prêt à tester'}
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsConnectionModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonTest]}
                onPress={testConnection}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonTestText}>
                  {isLoading ? 'Test...' : 'Tester'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={saveIpConfiguration}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonConfirmText}>
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={isModeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mode d'automatisation</Text>
            
            <Text style={styles.modalLabel}>Sélectionnez un mode :</Text>
            
            {(['surplus', 'manual', 'minimum'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeOption,
                  selectedMode === mode && styles.modeOptionSelected
                ]}
                onPress={() => setSelectedMode(mode)}
              >
                <View style={styles.modeOptionContent}>
                  <Text style={[
                    styles.modeOptionTitle,
                    selectedMode === mode && styles.modeOptionTitleSelected
                  ]}>
                    {getModeLabel(mode)}
                  </Text>
                  <Text style={[
                    styles.modeOptionDescription,
                    selectedMode === mode && styles.modeOptionDescriptionSelected
                  ]}>
                    {getModeDescription(mode)}
                  </Text>
                </View>
                <View style={[
                  styles.modeOptionRadio,
                  selectedMode === mode && styles.modeOptionRadioSelected
                ]} />
              </TouchableOpacity>
            ))}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsModeModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={saveModeConfiguration}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonConfirmText}>
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isPriorityLoadModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPriorityLoadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Réserve de puissance prioritaire</Text>
            
            <Text style={styles.modalLabel}>Puissance en Watts :</Text>
            <TextInput
              style={styles.modalInput}
              value={newPriorityLoadReserve.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setNewPriorityLoadReserve(Math.max(0, value));
              }}
              placeholder="0"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalNote}>
              Définit la puissance minimum à réserver pour les charges prioritaires de la maison (éclairage, frigo, etc.) avant d'envoyer le surplus au chargeur.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsPriorityLoadModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={savePriorityLoadConfiguration}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonConfirmText}>
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  settingItemValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingItemArrow: {
    fontSize: 18,
    color: '#C7C7CC',
    marginLeft: 8,
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
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalNote: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#E5E5EA',
  },
  modalButtonConfirm: {
    backgroundColor: '#007AFF',
  },
  modalButtonTest: {
    backgroundColor: '#FF9500',
  },
  modalButtonCancelText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalButtonTestText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  connectionStatus: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'center',
  },
  connectionStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  modeOptionContent: {
    flex: 1,
  },
  modeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  modeOptionTitleSelected: {
    color: '#007AFF',
  },
  modeOptionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modeOptionDescriptionSelected: {
    color: '#005AC1',
  },
  modeOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modeOptionRadioSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
});

export default SettingsScreen;