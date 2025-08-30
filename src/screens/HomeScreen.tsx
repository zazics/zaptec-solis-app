/**
 * ÉCRAN D'ACCUEIL - Vue d'ensemble du système
 * 
 * Cet écran affiche un résumé de l'état de votre système :
 * - Production solaire actuelle
 * - État de la batterie
 * - État du chargeur
 * - Flux énergétique global
 * 
 * React Native utilise des composants comme View, Text, StyleSheet
 * qui sont l'équivalent de <div>, <p>, CSS en web.
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
} from 'react-native';

// Import des types et services
import { SolisInverterData, ZaptecStatus } from '../types';
import { apiService } from '../services';

/**
 * Composant HomeScreen
 * 
 * Composant fonctionnel React qui affiche la vue d'ensemble.
 * Utilise les hooks useState et useEffect pour gérer l'état local.
 */
const HomeScreen: React.FC = () => {
  // ========================================
  // ÉTAT LOCAL DU COMPOSANT
  // ========================================
  
  // useState permet de stocker des données qui changent dans le composant
  // Quand l'état change, React re-rend automatiquement le composant
  
  const [solisData, setSolisData] = useState<SolisInverterData | null>(null);
  const [zaptecStatus, setZaptecStatus] = useState<ZaptecStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);    // Indicateur de chargement
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Indicateur de rafraîchissement
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ========================================
  // FONCTIONS UTILITAIRES
  // ========================================

  /**
   * Charge les données depuis l'API
   * Fonction asynchrone qui récupère les données Solis et Zaptec
   */
  const loadData = async (): Promise<void> => {
    try {
      // Promise.all permet d'exécuter plusieurs requêtes en parallèle
      // Plus rapide que d'attendre chaque requête l'une après l'autre
      const [solis, zaptec] = await Promise.all([
        apiService.getSolisData(),
        apiService.getZaptecStatus(),
      ]);

      // Mise à jour de l'état avec les données récupérées
      setSolisData(solis);
      setZaptecStatus(zaptec);
      setLastUpdate(new Date());
    } catch (error) {
      // Gestion d'erreur avec affichage d'une alerte native
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de récupérer les données. Vérifiez votre connexion.',
        [{ text: 'OK' }]
      );
    } finally {
      // finally s'exécute toujours, que la requête réussisse ou échoue
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Gère le rafraîchissement manuel des données
   * Appelée quand l'utilisateur tire vers le bas (pull-to-refresh)
   */
  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadData();
  };

  /**
   * Calcule le surplus solaire
   * Surplus = Production - Consommation
   */
  const calculateSolarSurplus = (): number => {
    if (!solisData) return 0;
    return solisData.pv.totalPowerDC - solisData.house.consumption;
  };

  /**
   * Formate une puissance en Watts avec l'unité appropriée
   * Convertit en kW si > 1000W
   */
  const formatPower = (watts: number): string => {
    if (Math.abs(watts) >= 1000) {
      return `${(watts / 1000).toFixed(1)} kW`;
    }
    return `${watts.toFixed(0)} W`;
  };

  /**
   * Retourne une couleur basée sur une valeur numérique
   * Vert pour positif, rouge pour négatif, gris pour zéro
   */
  const getColorForValue = (value: number): string => {
    if (value > 0) return '#34C759';  // Vert (couleur système iOS)
    if (value < 0) return '#FF3B30';  // Rouge (couleur système iOS)
    return '#8E8E93';                 // Gris (couleur système iOS)
  };

  // ========================================
  // EFFECTS (EFFETS DE BORD)
  // ========================================

  /**
   * useEffect avec tableau de dépendances vide []
   * S'exécute une seule fois au montage du composant (comme componentDidMount)
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * useEffect avec intervalle pour mise à jour automatique
   * Met à jour les données toutes les 30 secondes
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        loadData();
      }
    }, 30000); // 30 secondes

    // Cleanup function : nettoie l'intervalle quand le composant se démonte
    return () => clearInterval(interval);
  }, [isLoading, isRefreshing]);

  // ========================================
  // RENDU CONDITIONNEL
  // ========================================

  // Affiche un indicateur de chargement pendant le chargement initial
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  // ========================================
  // RENDU PRINCIPAL
  // ========================================

  return (
    <ScrollView
      style={styles.container}
      // RefreshControl ajoute la fonctionnalité "tirer pour rafraîchir"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#007AFF"  // Couleur de l'indicateur de rafraîchissement
        />
      }
    >
      {/* En-tête avec titre et dernière mise à jour */}
      <View style={styles.header}>
        <Text style={styles.title}>Système Zaptec-Solis</Text>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>
            Dernière MAJ : {lastUpdate.toLocaleTimeString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Section Production Solaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Production Solaire</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Production totale :</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(solisData?.pv.totalPowerDC || 0) }]}>
            {formatPower(solisData?.pv.totalPowerDC || 0)}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Consommation maison :</Text>
          <Text style={styles.dataValue}>
            {formatPower(solisData?.house.consumption || 0)}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Surplus disponible :</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(calculateSolarSurplus()) }]}>
            {formatPower(calculateSolarSurplus())}
          </Text>
        </View>
      </View>

      {/* Section Batterie */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔋 Batterie</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Niveau de charge :</Text>
          <Text style={styles.dataValue}>
            {solisData?.battery.soc || 0}%
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Puissance batterie :</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(solisData?.battery.power || 0) }]}>
            {formatPower(solisData?.battery.power || 0)}
          </Text>
        </View>
      </View>

      {/* Section Chargeur */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚗 Chargeur Zaptec</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>État :</Text>
          <Text style={[styles.dataValue, { color: zaptecStatus?.online ? '#34C759' : '#FF3B30' }]}>
            {zaptecStatus?.online ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Charge en cours :</Text>
          <Text style={[styles.dataValue, { color: zaptecStatus?.charging ? '#34C759' : '#8E8E93' }]}>
            {zaptecStatus?.charging ? 'Oui' : 'Non'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Puissance de charge :</Text>
          <Text style={styles.dataValue}>
            {formatPower(zaptecStatus?.power || 0)}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Véhicule connecté :</Text>
          <Text style={styles.dataValue}>
            {zaptecStatus?.vehicleConnected ? 'Oui' : 'Non'}
          </Text>
        </View>
      </View>

      {/* Section Réseau */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Réseau électrique</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Échange réseau :</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(solisData?.grid.activePower || 0) }]}>
            {formatPower(solisData?.grid.activePower || 0)}
            <Text style={styles.unitExplanation}>
              {(solisData?.grid.activePower || 0) > 0 ? ' (injection)' : ' (soutirage)'}
            </Text>
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
 * StyleSheet de React Native
 * Similaire au CSS mais avec une syntaxe JavaScript
 * Les propriétés utilisent camelCase (backgroundColor au lieu de background-color)
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,                    // Prend tout l'espace disponible
    backgroundColor: '#F2F2F7', // Couleur de fond (gris clair iOS)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',   // Centre verticalement
    alignItems: 'center',       // Centre horizontalement
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
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
  lastUpdate: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,           // Coins arrondis
    padding: 16,
    shadowColor: '#000000',     // Ombre (iOS)
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,               // Ombre (Android)
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',       // Disposition horizontale
    justifyContent: 'space-between', // Espace entre les éléments
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#3C3C43',
    flex: 1,                    // Prend l'espace disponible
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  unitExplanation: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#8E8E93',
  },
});

export default HomeScreen;