# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo that provides monitoring and control for a Zaptec-Solis solar charging automation system. The app communicates with a Node.js backend API to display real-time solar production, battery status, and EV charger data.

## Development Commands

### Start Development Server
```bash
npm start                # Start Expo development server
npm run startclear      # Start with cache cleared
```

### Platform-Specific Development
```bash
npm run android         # Run on Android device/emulator
npm run ios            # Run on iOS device/simulator
npm run web            # Run in web browser
npm run web:clear      # Run web version with cleared cache
```

### Building for Production
```bash
npx expo build:android                    # Generate APK
npx expo build:android --type app-bundle  # Generate AAB for Play Store
```

## Architecture Overview

### Technology Stack
- **React Native 0.79.5** with **Expo 53** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **React Navigation** - Bottom tab navigation (Home, Solar, Charger, Charts, Settings)
- **Axios** - HTTP client for API communication with retry logic
- **AsyncStorage** - Local persistence for user settings
- **React Native Chart Kit** - Data visualization components

### Key Directories
```
src/
├── components/         # Reusable UI components
│   └── charts/        # Chart visualization components
├── constants/         # App-wide constants and colors
├── hooks/            # Custom React hooks
├── navigation/       # Navigation setup and type definitions
├── screens/          # Main app screens (5 tabs)
├── services/         # API communication and settings management
└── types/            # TypeScript type definitions
```

### API Integration
The app communicates with a Node.js backend via REST API endpoints:

**Core Data Endpoints:**
- `/automation/solis/latest` - Latest solar inverter data from database
- `/automation/solis/realtime` - Real-time data directly from device
- `/automation/zaptec/status` - EV charger status and power data
- `/automation/config` - Automation system configuration

**Chart Data Endpoints:**
- `/automation/charts/solar-production` - Solar production charts
- `/automation/charts/grid-exchange` - Grid import/export data
- `/automation/charts/battery` - Battery state of charge and power
- `/automation/charts/dashboard` - Combined dashboard metrics

### Configuration Management
The app uses a dual configuration approach:
1. **`.env` file** - Development environment variables
2. **`app.json` extra fields** - Build-time configuration for EAS builds

Key configuration variables:
- `API_BASE_URL` - Backend server URL
- `API_KEY` - Authentication key for API requests
- `SIMULATION_MODE` - Toggle between real API and localhost for development
- `API_TIMEOUT`, `API_RETRY_COUNT`, `API_RETRY_DELAY` - Network resilience settings

### TypeScript Types Architecture
Types are organized by domain:
- `api.types.ts` - API request/response interfaces
- `solis.types.ts` - Solar inverter data structures
- `zaptec.types.ts` - EV charger data structures
- `chart.types.ts` - Chart data and visualization types

## Important Development Patterns

### API Service Singleton
The `apiService` singleton in `src/services/apiService.ts` handles all backend communication with:
- Automatic request/response logging
- Centralized error handling and transformation
- Authentication header management
- Network timeout and retry logic
- Configuration hot-reloading

### Navigation Structure
Uses React Navigation v7 with bottom tabs containing:
1. **Home** - System overview dashboard
2. **Solar** - Detailed solar inverter metrics
3. **Charger** - EV charger monitoring (read-only)
4. **Charts** - Historical data visualization
5. **Settings** - App configuration and connection testing

### Settings Persistence
User settings are managed via `settingsService.ts` using AsyncStorage for local persistence of:
- Custom API base URL overrides
- Connection timeout preferences
- Display refresh intervals
- Chart period preferences

## Environment Setup

1. Copy `.env` file and configure your backend API URL
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Test API connection via Settings screen before using other features

The app defaults to the API_BASE_URL in `.env` but allows runtime IP address override via the Settings screen for flexibility during development and deployment.