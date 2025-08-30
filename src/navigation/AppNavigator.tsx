/**
 * MAIN APPLICATION NAVIGATOR
 * 
 * This file configures application navigation using React Navigation.
 * It defines available screens and how to navigate between them.
 * 
 * React Navigation is the standard library for navigation in React Native.
 * It allows creating navigation stacks, tabs, drawers, etc.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import { HomeScreen, SolisScreen, ZaptecScreen, SettingsScreen } from '../screens';

// Navigation type definitions for TypeScript
// This helps TypeScript verify that we pass the correct parameters during navigation
export type RootTabParamList = {
  Home: undefined;      // Home screen takes no parameters
  Solis: undefined;     // Solis screen takes no parameters
  Zaptec: undefined;    // Zaptec screen takes no parameters
  Settings: undefined;  // Settings screen takes no parameters
};

export type RootStackParamList = {
  MainTabs: undefined;  // Tab navigation
  // Here you can add other screens like modals or detail screens
};

// Navigator creation
// A Stack Navigator manages a stack of screens (like a deck of cards)
const Stack = createStackNavigator<RootStackParamList>();

// A Tab Navigator manages tab navigation at the bottom of the screen
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * TabNavigator Component
 * 
 * Defines the available tabs at the bottom of the screen.
 * Each tab corresponds to a main functionality of the app.
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Global tab configuration
        headerShown: false,           // Hide default header
        tabBarActiveTintColor: '#007AFF',  // Active tab color (iOS blue)
        tabBarInactiveTintColor: '#8E8E93', // Inactive tab color (gray)
        tabBarStyle: {
          backgroundColor: '#FFFFFF',  // White background for tab bar
          borderTopColor: '#E5E5EA',  // Top border color
        },
      }}
    >
      {/* Home Tab - System overview */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          // Here you can add an icon with tabBarIcon
          // tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />
        }}
      />
      
      {/* Solis Tab - Solar inverter data */}
      <Tab.Screen 
        name="Solis" 
        component={SolisScreen}
        options={{
          title: 'Solar',
          // tabBarIcon: ({ color, size }) => <Icon name="sun" size={size} color={color} />
        }}
      />
      
      {/* Zaptec Tab - Charger control */}
      <Tab.Screen 
        name="Zaptec" 
        component={ZaptecScreen}
        options={{
          title: 'Charger',
          // tabBarIcon: ({ color, size }) => <Icon name="car" size={size} color={color} />
        }}
      />
      
      {/* Settings Tab - App configuration */}
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          // tabBarIcon: ({ color, size }) => <Icon name="settings" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main AppNavigator Component
 * 
 * This is the root component of your application navigation.
 * It wraps the entire application in a NavigationContainer and
 * configures the main navigation.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/* NavigationContainer is required - it manages global navigation state */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,  // Hide default header since we use tabs
        }}
      >
        {/* Main screen with tab navigation */}
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
        />
        
        {/* 
        Here you can add other screens like:
        <Stack.Screen name="ChargerDetails" component={ChargerDetailsScreen} />
        <Stack.Screen name="Modal" component={ModalScreen} options={{ presentation: 'modal' }} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}