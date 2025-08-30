/**
 * APPLICATION PRINCIPALE
 * 
 * Ce fichier est le point d'entrée de votre application React Native.
 * Il configure l'application principale et lance le système de navigation.
 * 
 * React Native fonctionne comme une SPA (Single Page Application) :
 * - Une seule "page" qui contient toute l'application
 * - La navigation change les composants affichés
 * - L'état est géré au niveau global ou local
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import du navigateur principal
import { AppNavigator } from './src/navigation';

/**
 * Composant App principal
 * 
 * C'est le composant racine de votre application.
 * Il enveloppe toute l'application et configure les providers globaux.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      {/* SafeAreaProvider gère automatiquement les zones sûres (notch, barres système) */}
      
      {/* AppNavigator contient toute la logique de navigation */}
      <AppNavigator />
      
      {/* StatusBar configure l'apparence de la barre de statut */}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
