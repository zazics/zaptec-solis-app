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
import { apiService } from '../services';

const SettingsScreen: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('http://192.168.1.100:3000');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newUrl, setNewUrl] = useState('');

  const testConnection = async () => {
    Alert.alert('Test de connexion', 'Fonctionnalité en cours de développement');
  };

  const saveUrl = () => {
    setApiUrl(newUrl);
    setIsModalVisible(false);
    setNewUrl('');
    Alert.alert('Succès', 'URL sauvegardée');
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
          onPress={() => {
            setNewUrl(apiUrl);
            setIsModalVisible(true);
          }}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Adresse du serveur</Text>
              <Text style={styles.settingItemSubtitle}>{apiUrl}</Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={testConnection}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Tester la connexion</Text>
              <Text style={styles.settingItemSubtitle}>Vérifier la communication</Text>
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
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adresse du serveur</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="http://192.168.1.100:3000"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={saveUrl}
              >
                <Text style={styles.modalButtonConfirmText}>Sauvegarder</Text>
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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

export default SettingsScreen;