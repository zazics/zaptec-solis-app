# 🚀 Guide de démarrage rapide

Ce guide vous permettra de démarrer rapidement votre application mobile Zaptec-Solis.

## ✅ Prérequis

- **Node.js** v20.x ou supérieur installé
- **Expo CLI** : `npm install -g @expo/cli`  
- **Émulateur Android** ou appareil Android physique
- **Votre serveur Node.js Zaptec-Solis** en fonctionnement sur le Raspberry Pi

## 🏃‍♂️ Démarrage en 5 minutes

### 1. Installation des dépendances
```bash
cd ZaptecSolisApp
npm install
```

### 2. Configuration de l'API
- Modifiez l'URL dans `src/services/apiService.ts` ligne 143 :
```typescript
const defaultConfig: ApiConfig = {
  baseUrl: 'http://VOTRE_IP_RASPBERRY:3000',  // Remplacez par votre IP
  timeout: 10000,
  useHttps: false,
};
```

### 3. Démarrage de l'application
```bash
npm start
```

### 4. Lancement sur Android
- Scannez le QR code avec l'app **Expo Go** depuis le Play Store
- OU appuyez sur `a` dans le terminal pour lancer l'émulateur Android

## 📱 Interface utilisateur

L'application contient **4 onglets principaux** :

### 🏠 **Accueil**
- Vue d'ensemble du système
- Production solaire, batterie, chargeur
- Actualisation toutes les 30s

### ☀️ **Solaire (Solis)**  
- Détails de l'onduleur
- Production par string PV
- État de la batterie avec barre de progression
- Température et efficacité

### ⚡ **Chargeur (Zaptec)**
- Contrôle de la charge (Start/Stop)
- Réglage du courant (6-16A)
- Informations détaillées du chargeur
- Mode automatique

### ⚙️ **Paramètres**
- Configuration de l'adresse serveur
- Test de connexion
- Préférences d'affichage

## 🔧 Configuration réseau

### Trouver l'IP de votre Raspberry Pi
```bash
# Sur le Raspberry Pi
hostname -I
```

### Tester la connexion
```bash
# Depuis votre téléphone/ordinateur
curl http://VOTRE_IP:3000/solis/status
```

Si cela fonctionne, votre API est accessible !

## 🐛 Résolution des problèmes

### "Impossible de récupérer les données"
1. **Vérifiez que votre serveur Node.js fonctionne**
   ```bash
   cd zaptec-solis-home-automation
   npm run start:dev
   ```

2. **Testez l'API depuis un navigateur**
   - Allez à `http://VOTRE_IP:3000/solis/status`
   - Vous devriez voir du JSON

3. **Vérifiez l'IP dans l'app mobile**
   - Allez dans Paramètres
   - Configurez la bonne adresse IP
   - Testez la connexion

### "Erreur de connexion"
- Assurez-vous d'être sur le même réseau WiFi
- Vérifiez le firewall du Raspberry Pi
- L'URL doit commencer par `http://` ou `https://`

### L'app plante au démarrage
```bash
# Nettoyez le cache
rm -rf node_modules package-lock.json
npm install
```

## 📖 Utilisation quotidienne

### Contrôler la charge
1. Allez dans l'onglet **Zaptec**
2. Vérifiez que le chargeur est en ligne
3. Connectez votre véhicule
4. Appuyez sur **"Démarrer la charge"**
5. Réglez le courant si nécessaire (6-16A)

### Surveiller la production
1. Onglet **Solis** pour les détails
2. Onglet **Accueil** pour la vue d'ensemble  
3. Tirez vers le bas pour actualiser

### Automatisation
- L'app affiche l'état du mode automatique
- La logique d'automatisation fonctionne sur votre serveur Node.js
- Consultez les logs du serveur pour plus de détails

## 🎯 Fonctionnalités principales

### ✅ Implémenté
- [x] Vue d'ensemble temps réel
- [x] Détails de l'onduleur Solis  
- [x] Contrôle du chargeur Zaptec
- [x] Configuration des paramètres
- [x] Rafraîchissement automatique
- [x] Interface responsive et intuitive

### 🔄 À venir (évolutions possibles)
- [ ] Graphiques de production/consommation
- [ ] Historique sur plusieurs jours
- [ ] Notifications push
- [ ] Mode sombre
- [ ] Planification de charges

## 🆘 Besoin d'aide ?

1. **Consultez d'abord ce guide**
2. **Vérifiez les logs** de votre serveur Node.js
3. **Testez manuellement** votre API avec un navigateur
4. **Redémarrez** l'application mobile

## 🏁 Prêt à utiliser !

Votre application mobile est maintenant configurée et prête à contrôler votre système Zaptec-Solis !

Profitez de votre charge solaire intelligente 🌞⚡🚗