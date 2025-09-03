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

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isIpModalVisible, setIsIpModalVisible] = useState(false);
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newPort, setNewPort] = useState('3000');
  const [newApiKey, setNewApiKey] = useState('');
  const [currentApiConfig, setCurrentApiConfig] = useState(apiService.getConfig());
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
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
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
      
      setIsIpModalVisible(false);
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

  const toggleSimulationMode = async () => {
    try {
      setIsLoading(true);
      const newConfig = await settingsService.toggleSimulationMode();
      
      apiService.updateConfig(newConfig);
      setCurrentApiConfig(newConfig);
      
      const { ip, port } = settingsService.parseBackendUrl(newConfig.baseUrl);
      setNewIp(ip);
      setNewPort(port.toString());
      
      setConnectionStatus('unknown');
      Alert.alert('Succès', `Mode ${newConfig.simulationMode ? 'simulation' : 'production'} activé`);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du changement de mode');
    } finally {
      setIsLoading(false);
    }
  };

  const openIpModal = () => {
    const { ip, port } = settingsService.parseBackendUrl(currentApiConfig.baseUrl);
    setNewIp(ip);
    setNewPort(port.toString());
    setIsIpModalVisible(true);
  };

  const openApiKeyModal = () => {
    setNewApiKey(currentApiConfig.apiKey || '');
    setIsApiKeyModalVisible(true);
  };

  const saveApiKeyConfiguration = async () => {
    try {
      setIsLoading(true);
      const newApiConfig = await settingsService.setCustomApiKey(newApiKey.trim());
      
      // Mettre à jour la configuration de l'API service
      apiService.updateConfig(newApiConfig);
      setCurrentApiConfig(newApiConfig);
      
      setIsApiKeyModalVisible(false);
      setConnectionStatus('unknown');
      Alert.alert('Succès', 'Clé API sauvegardée');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const resetApiKeyToDefault = async () => {
    try {
      setIsLoading(true);
      const defaultConfig = await settingsService.resetToDefaultApiKey();
      
      // Mettre à jour la configuration de l'API service
      apiService.updateConfig(defaultConfig);
      setCurrentApiConfig(defaultConfig);
      
      setNewApiKey(defaultConfig.apiKey || '');
      setConnectionStatus('unknown');
      Alert.alert('Succès', 'Clé API réinitialisée à la valeur par défaut');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
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
          onPress={openIpModal}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Adresse du backend</Text>
              <Text style={styles.settingItemSubtitle}>{currentApiConfig.baseUrl}</Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={toggleSimulationMode}
          disabled={isLoading}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Mode simulation</Text>
              <Text style={styles.settingItemSubtitle}>{currentApiConfig.simulationMode ? 'Activé (localhost)' : 'Désactivé'}</Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={openApiKeyModal}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Clé API</Text>
              <Text style={styles.settingItemSubtitle}>
                {currentApiConfig.apiKey || 'Non configurée'}
              </Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={testConnection}
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
                 'Vérifier la communication'}
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
        visible={isIpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsIpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configuration serveur</Text>
            
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
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsIpModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
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
        visible={isApiKeyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsApiKeyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configuration clé API</Text>
            
            <Text style={styles.modalLabel}>Clé API</Text>
            <TextInput
              style={styles.modalInput}
              value={newApiKey}
              onChangeText={setNewApiKey}
              placeholder="Entrez la clé API"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsApiKeyModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDefault]}
                onPress={resetApiKeyToDefault}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonDefaultText}>Défaut</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={saveApiKeyConfiguration}
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
  modalButtonDefault: {
    backgroundColor: '#FF9500',
  },
  modalButtonCancelText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalButtonDefaultText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SettingsScreen;