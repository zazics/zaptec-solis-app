/**
 * MAIN APPLICATION
 * 
 * This file is the entry point of your React Native application.
 * It configures the main application and launches the navigation system.
 * 
 * React Native works like a SPA (Single Page Application):
 * - A single "page" that contains the entire application
 * - Navigation changes the displayed components
 * - State is managed at the global or local level
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import main navigator
import { AppNavigator } from './src/navigation';

/**
 * Main App component
 * 
 * This is the root component of your application.
 * It wraps the entire application and configures global providers.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      {/* SafeAreaProvider automatically manages safe areas (notch, system bars) */}
      
      {/* AppNavigator contains all navigation logic */}
      <AppNavigator />
      
      {/* StatusBar configures the status bar appearance */}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
