# Zaptec-Solis Mobile Application

A React Native mobile application with TypeScript to control and visualize your automated Zaptec-Solis solar charging system.

## 📱 Features

### Home Screen
- **System Overview**: Solar production, battery level, charger status
- **Energy Flow**: Real-time visualization of energy exchanges
- **Auto-refresh**: Updates every 30 seconds
- **Pull-to-refresh**: Manual refresh by pulling down

### Solis Screen (Solar Inverter)
- **Photovoltaic Production**: Detailed data per PV string
- **Battery Status**: Level, power, charge/discharge status
- **AC Data**: Output power, frequency, temperature, efficiency
- **Grid Exchange**: Energy import/export with the electrical grid

### Zaptec Screen (Charger)
- **Charge Control**: Start/stop charging remotely
- **Current Adjustment**: Modify charging current (6-16A)
- **Detailed Information**: Status, power, operation mode
- **Automatic Mode**: Enable/disable automation

### Settings Screen
- **Server Configuration**: IP address, timeout, secure connection
- **Connection Test**: Verify communication with your API
- **Display Preferences**: Refresh interval, notifications
- **Data Management**: Automatic settings backup

## 🏗️ Technical Architecture

### Technologies Used
- **React Native**: Cross-platform mobile development framework
- **TypeScript**: Typed language for better robustness
- **Expo**: Development and deployment platform
- **React Navigation**: Tab-based navigation management
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Local storage for settings

### Project Structure
```
src/
├── components/          # Reusable components (future)
├── constants/          # Constants and configuration
├── navigation/         # Navigation configuration
├── screens/           # Application screens
│   ├── HomeScreen.tsx     # System overview
│   ├── SolisScreen.tsx    # Inverter details
│   ├── ZaptecScreen.tsx   # Charger control
│   └── SettingsScreen.tsx # Settings
├── services/          # Communication services
│   └── apiService.ts      # API client for Node.js
└── types/             # TypeScript definitions
    ├── api.types.ts       # API and configuration types
    ├── solis.types.ts     # Solis inverter types
    └── zaptec.types.ts    # Zaptec charger types
```

### Node.js API Communication
The application communicates with your Node.js server via REST HTTP requests:

**Solis Endpoints:**
- `GET /solis/data` - Complete inverter data
- `GET /solis/status` - Simplified status

**Zaptec Endpoints:**
- `GET /zaptec/status` - Charger status
- `GET /zaptec/info` - Detailed information
- `POST /zaptec/start` - Start charging
- `POST /zaptec/stop` - Stop charging
- `POST /zaptec/current` - Set current

**Automation Endpoints:**
- `GET /automation/status` - Automation status
- `POST /automation/mode` - Change mode
- `POST /automation/config` - Configuration

## 🚀 Installation and Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Android emulator or physical device

### Installation
```bash
# Clone or navigate to the project folder
cd ZaptecSolisApp

# Install dependencies
npm install

# Start the application
npm start
```

### Environment Configuration
The application now supports environment variables for flexible configuration:

1. **Edit the `.env` file** to match your setup:
```env
API_BASE_URL=http://192.168.1.100:3000
API_TIMEOUT=10000
API_RETRY_COUNT=3
API_RETRY_DELAY=1000
API_USE_HTTPS=false
```

2. **Start your Node.js server** on your Raspberry Pi
3. **Launch the mobile app**
4. **Go to Settings** (bottom right tab)
5. **Test the connection** with the "Test Connection" button
6. **Adjust settings** according to your preferences

### Android Deployment
```bash
# Generate development APK
npx expo build:android

# For production APK (requires Expo account)
npx expo build:android --type app-bundle
```

## 📋 Usage Guide

### First Start
1. Ensure your Node.js server is running
2. Connect to the same WiFi network as your Raspberry Pi
3. Configure the IP address in the .env file
4. Test the connection to verify communication

### Daily Usage
- **Home Screen**: Check overall system status
- **Solis Screen**: Monitor solar production and battery
- **Zaptec Screen**: Control your vehicle charging
- **Settings**: Adjust configuration as needed

### Common Troubleshooting

**"Connection error" or "Unable to fetch data"**
- Check that your Node.js server is running
- Verify the IP address in .env file
- Ensure you're on the same WiFi network

**"Connection failed" during test**
- Verify the URL (must start with http:// or https://)
- Test API access from a browser: `http://YOUR_IP:3000/health`
- Check your Raspberry Pi firewall settings

**App crashes or closes**
- Restart the application
- Check logs with `npx expo start` and view console
- Reset settings in the Settings screen

## 🔧 Customization and Development

### Adding New Screens
1. Create a new file in `src/screens/`
2. Add it to `src/screens/index.ts`
3. Configure navigation in `src/navigation/AppNavigator.tsx`

### Modifying Colors and Styles
- Edit `src/constants/index.ts` for global colors
- Styles are defined in each screen with StyleSheet

### Adding New API Endpoints
1. Add types in `src/types/`
2. Implement methods in `src/services/apiService.ts`
3. Use the new methods in your screens

### Testing and Debugging
```bash
# Start with detailed logs
npx expo start --dev-client

# Open React Native debugger
# Shake your device or Ctrl+M on emulator
```

## 📚 Resources and Learning

### Official Documentation
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Key Concepts to Understand
- **Functional Components**: Functions that return JSX
- **Hooks**: `useState`, `useEffect` for state and side effects management
- **Navigation**: How to navigate between screens
- **REST API**: HTTP communication with your server
- **Local Storage**: Settings backup with AsyncStorage

## 📞 Support

For any questions or issues:
1. First check this README
2. Review application logs
3. Test communication with your Node.js API
4. Verify your Zaptec-Solis system is working correctly

## 🔄 Future Enhancements

Potential features:
- **Charts**: Production and consumption curves
- **History**: Data retention over multiple days
- **Notifications**: Alerts for important events
- **Dark Mode**: Dark theme for nighttime use
- **Widgets**: Android home screen display
- **Scheduling**: Charge programming

---

**Note**: This application is designed to work with your existing Zaptec-Solis system. Ensure your Node.js server is properly configured and accessible on your local network.