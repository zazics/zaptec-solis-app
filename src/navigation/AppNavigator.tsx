/**
 * NAVIGATEUR PRINCIPAL DE L'APPLICATION
 * 
 * Ce fichier configure la navigation de l'application en utilisant React Navigation.
 * Il définit les écrans disponibles et comment naviguer entre eux.
 * 
 * React Navigation est la bibliothèque standard pour la navigation dans React Native.
 * Elle permet de créer des piles de navigation, des onglets, des tiroirs, etc.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import des écrans
import { HomeScreen, SolisScreen, ZaptecScreen, SettingsScreen } from '../screens';

// Définition des types de navigation pour TypeScript
// Cela aide TypeScript à vérifier que nous passons les bons paramètres lors de la navigation
export type RootTabParamList = {
  Home: undefined;      // L'écran Home ne prend pas de paramètres
  Solis: undefined;     // L'écran Solis ne prend pas de paramètres
  Zaptec: undefined;    // L'écran Zaptec ne prend pas de paramètres
  Settings: undefined;  // L'écran Settings ne prend pas de paramètres
};

export type RootStackParamList = {
  MainTabs: undefined;  // La navigation par onglets
  // Ici vous pourrez ajouter d'autres écrans comme des modales ou des écrans de détail
};

// Création des navigateurs
// Un Stack Navigator gère une pile d'écrans (comme une pile de cartes)
const Stack = createStackNavigator<RootStackParamList>();

// Un Tab Navigator gère la navigation par onglets en bas de l'écran
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Composant TabNavigator
 * 
 * Définit les onglets disponibles en bas de l'écran.
 * Chaque onglet correspond à une fonctionnalité principale de l'app.
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Configuration globale des onglets
        headerShown: false,           // Masque l'en-tête par défaut
        tabBarActiveTintColor: '#007AFF',  // Couleur de l'onglet actif (bleu iOS)
        tabBarInactiveTintColor: '#8E8E93', // Couleur des onglets inactifs (gris)
        tabBarStyle: {
          backgroundColor: '#FFFFFF',  // Fond blanc pour la barre d'onglets
          borderTopColor: '#E5E5EA',  // Couleur de la bordure supérieure
        },
      }}
    >
      {/* Onglet Accueil - Vue d'ensemble du système */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Accueil',
          // Ici vous pourrez ajouter une icône avec tabBarIcon
          // tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />
        }}
      />
      
      {/* Onglet Solis - Données de l'onduleur solaire */}
      <Tab.Screen 
        name="Solis" 
        component={SolisScreen}
        options={{
          title: 'Solaire',
          // tabBarIcon: ({ color, size }) => <Icon name="sun" size={size} color={color} />
        }}
      />
      
      {/* Onglet Zaptec - Contrôle du chargeur */}
      <Tab.Screen 
        name="Zaptec" 
        component={ZaptecScreen}
        options={{
          title: 'Chargeur',
          // tabBarIcon: ({ color, size }) => <Icon name="car" size={size} color={color} />
        }}
      />
      
      {/* Onglet Paramètres - Configuration de l'app */}
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          // tabBarIcon: ({ color, size }) => <Icon name="settings" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Composant AppNavigator principal
 * 
 * C'est le composant racine de la navigation de votre application.
 * Il enveloppe toute l'application dans un NavigationContainer et
 * configure la navigation principale.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/* NavigationContainer est obligatoire - il gère l'état de navigation global */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,  // Masque l'en-tête par défaut car nous utilisons des onglets
        }}
      >
        {/* Écran principal avec navigation par onglets */}
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
        />
        
        {/* 
        Ici vous pourrez ajouter d'autres écrans comme :
        <Stack.Screen name="ChargerDetails" component={ChargerDetailsScreen} />
        <Stack.Screen name="Modal" component={ModalScreen} options={{ presentation: 'modal' }} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}