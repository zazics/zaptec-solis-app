# 🚀 Quick Start Guide

This guide will help you quickly get started with your Zaptec-Solis mobile application.

## ✅ Prerequisites

- **Node.js** v20.x or higher installed
- **Expo CLI**: `npm install -g @expo/cli`  
- **Android Emulator** or physical Android device
- **Your Zaptec-Solis Node.js server** running on the Raspberry Pi

## 🏃‍♂️ Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
cd ZaptecSolisApp
npm install
```

### 2. API Configuration
- Modify the URL in `src/services/apiService.ts` line 143:
```typescript
const defaultConfig: ApiConfig = {
  baseUrl: 'http://YOUR_RASPBERRY_IP:3000',  // Replace with your IP
  timeout: 10000,
  useHttps: false,
};
```

### 3. Start the Application
```bash
npm start
```

### 4. Launch on Android
- Scan the QR code with the **Expo Go** app from the Play Store
- OR press `a` in the terminal to launch the Android emulator

## 📱 User Interface

The application contains **4 main tabs**:

### 🏠 **Home**
- System overview
- Solar production, battery, charger
- Auto-refresh every 30s

### ☀️ **Solar (Solis)**  
- Inverter details
- Production by PV string
- Battery status with progress bar
- Temperature and efficiency

### ⚡ **Charger (Zaptec)**
- Charging control (Start/Stop)
- Current adjustment (6-16A)
- Detailed charger information
- Automatic mode

### ⚙️ **Settings**
- Server address configuration
- Connection test
- Display preferences

## 🔧 Network Configuration

### Find Your Raspberry Pi IP
```bash
# On the Raspberry Pi
hostname -I
```

### Test the Connection
```bash
# From your phone/computer
curl http://YOUR_IP:3000/solis/status
```

If this works, your API is accessible!

## 🐛 Troubleshooting

### "Unable to retrieve data"
1. **Check that your Node.js server is running**
   ```bash
   cd zaptec-solis-home-automation
   npm run start:dev
   ```

2. **Test the API from a browser**
   - Go to `http://YOUR_IP:3000/solis/status`
   - You should see JSON data

3. **Check the IP in the mobile app**
   - Go to Settings
   - Configure the correct IP address
   - Test the connection

### "Connection error"
- Make sure you're on the same WiFi network
- Check the Raspberry Pi firewall
- The URL must start with `http://` or `https://`

### App crashes at startup
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

## 📖 Daily Usage

### Control Charging
1. Go to the **Zaptec** tab
2. Check that the charger is online
3. Connect your vehicle
4. Press **"Start Charging"**
5. Adjust current if necessary (6-16A)

### Monitor Production
1. **Solis** tab for details
2. **Home** tab for overview  
3. Pull down to refresh

### Automation
- The app displays the automatic mode status
- Automation logic runs on your Node.js server
- Check server logs for more details

## 🎯 Main Features

### ✅ Implemented
- [x] Real-time overview
- [x] Solis inverter details  
- [x] Zaptec charger control
- [x] Settings configuration
- [x] Auto-refresh
- [x] Responsive and intuitive interface

### 🔄 Coming Soon (possible improvements)
- [ ] Production/consumption charts
- [ ] Multi-day history
- [ ] Push notifications
- [ ] Dark mode
- [ ] Charge scheduling

## 🆘 Need Help?

1. **Check this guide first**
2. **Check the logs** of your Node.js server
3. **Test manually** your API with a browser
4. **Restart** the mobile application

## 🏁 Ready to Use!

Your mobile application is now configured and ready to control your Zaptec-Solis system!

Enjoy your smart solar charging 🌞⚡🚗