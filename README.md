# Application Mobile Zaptec-Solis

Une application mobile React Native avec TypeScript pour contrôler et visualiser votre système de charge solaire automatisé Zaptec-Solis.

## 📱 Fonctionnalités

### Écran d'accueil
- **Vue d'ensemble du système** : Production solaire, niveau de batterie, état du chargeur
- **Flux énergétiques** : Visualisation en temps réel des échanges d'énergie
- **Rafraîchissement automatique** : Mise à jour toutes les 30 secondes
- **Pull-to-refresh** : Actualisation manuelle en tirant vers le bas

### Écran Solis (Onduleur solaire)
- **Production photovoltaïque** : Données détaillées par string PV
- **État de la batterie** : Niveau, puissance, statut de charge/décharge
- **Données AC** : Puissance de sortie, fréquence, température, efficacité
- **Échanges réseau** : Import/export d'énergie avec le réseau électrique

### Écran Zaptec (Chargeur)
- **Contrôle de charge** : Démarrer/arrêter la charge à distance
- **Réglage du courant** : Modification du courant de charge (6-16A)
- **Informations détaillées** : Statut, puissance, mode d'opération
- **Mode automatique** : Activation/désactivation de l'automatisation

### Écran Paramètres
- **Configuration serveur** : Adresse IP, timeout, connexion sécurisée
- **Test de connexion** : Vérification de la communication avec votre API
- **Préférences d'affichage** : Intervalle de rafraîchissement, notifications
- **Gestion des données** : Sauvegarde automatique des paramètres

## 🏗️ Architecture technique

### Technologies utilisées
- **React Native** : Framework de développement mobile cross-platform
- **TypeScript** : Langage typé pour une meilleure robustesse
- **Expo** : Plateforme de développement et de déploiement
- **React Navigation** : Gestion de la navigation par onglets
- **Axios** : Client HTTP pour les requêtes API
- **AsyncStorage** : Stockage local des paramètres

### Structure du projet
```
src/
├── components/          # Composants réutilisables (futurs)
├── constants/          # Constantes et configuration
├── navigation/         # Configuration de la navigation
├── screens/           # Écrans de l'application
│   ├── HomeScreen.tsx     # Vue d'ensemble
│   ├── SolisScreen.tsx    # Détails onduleur
│   ├── ZaptecScreen.tsx   # Contrôle chargeur
│   └── SettingsScreen.tsx # Paramètres
├── services/          # Services de communication
│   └── apiService.ts      # Client API pour Node.js
└── types/             # Définitions TypeScript
    ├── api.types.ts       # Types API et configuration
    ├── solis.types.ts     # Types onduleur Solis
    └── zaptec.types.ts    # Types chargeur Zaptec
```

### Communication avec l'API Node.js
L'application communique avec votre serveur Node.js via des requêtes HTTP REST :

**Endpoints Solis :**
- `GET /solis/data` - Données complètes de l'onduleur
- `GET /solis/status` - Statut simplifié

**Endpoints Zaptec :**
- `GET /zaptec/status` - État du chargeur
- `GET /zaptec/info` - Informations détaillées
- `POST /zaptec/start` - Démarrer la charge
- `POST /zaptec/stop` - Arrêter la charge
- `POST /zaptec/current` - Régler le courant

**Endpoints Automatisation :**
- `GET /automation/status` - État de l'automatisation
- `POST /automation/mode` - Changer le mode
- `POST /automation/config` - Configuration

## 🚀 Installation et configuration

### Prérequis
- Node.js 20.x ou supérieur
- npm ou yarn
- Expo CLI : `npm install -g @expo/cli`
- Un émulateur Android ou appareil physique

### Installation
```bash
# Cloner ou naviguer vers le dossier du projet
cd ZaptecSolisApp

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### Configuration initiale
1. **Démarrez votre serveur Node.js** sur votre Raspberry Pi
2. **Lancez l'application** mobile
3. **Allez dans Paramètres** (onglet en bas à droite)
4. **Configurez l'adresse du serveur** (ex: `http://192.168.1.100:3000`)
5. **Testez la connexion** avec le bouton \"Tester la connexion\"
6. **Ajustez les paramètres** selon vos préférences

### Déploiement sur Android
```bash
# Générer un APK de développement
npx expo build:android

# Pour un APK de production (nécessite un compte Expo)
npx expo build:android --type app-bundle
```

## 📋 Guide d'utilisation

### Premier démarrage
1. Assurez-vous que votre serveur Node.js est en fonctionnement
2. Connectez-vous au même réseau WiFi que votre Raspberry Pi
3. Configurez l'adresse IP dans les paramètres
4. Testez la connexion pour vérifier la communication

### Utilisation quotidienne
- **Écran d'accueil** : Consultez l'état global du système
- **Écran Solis** : Surveillez la production solaire et la batterie
- **Écran Zaptec** : Contrôlez la charge de votre véhicule
- **Paramètres** : Ajustez la configuration si nécessaire

### Résolution des problèmes courants

**\"Erreur de connexion\" ou \"Impossible de récupérer les données\"**
- Vérifiez que votre serveur Node.js fonctionne
- Confirmez l'adresse IP dans les paramètres
- Assurez-vous d'être sur le même réseau WiFi

**\"Connexion échouée\" lors du test**
- Vérifiez l'URL (doit commencer par http:// ou https://)
- Testez l'accès à l'API depuis un navigateur : `http://VOTRE_IP:3000/health`
- Vérifiez les paramètres firewall de votre Raspberry Pi

**L'application se ferme ou plante**
- Redémarrez l'application
- Vérifiez les logs avec `npx expo start` et consultez la console
- Réinitialisez les paramètres dans l'écran Paramètres

## 🔧 Personnalisation et développement

### Ajouter de nouveaux écrans
1. Créez un nouveau fichier dans `src/screens/`
2. Ajoutez-le à `src/screens/index.ts`
3. Configurez la navigation dans `src/navigation/AppNavigator.tsx`

### Modifier les couleurs et styles
- Éditez `src/constants/index.ts` pour les couleurs globales
- Les styles sont définis dans chaque écran avec StyleSheet

### Ajouter de nouveaux endpoints API
1. Ajoutez les types dans `src/types/`
2. Implémentez les méthodes dans `src/services/apiService.ts`
3. Utilisez les nouvelles méthodes dans vos écrans

### Tests et débogage
```bash
# Démarrer avec les logs détaillés
npx expo start --dev-client

# Ouvrir le débogueur React Native
# Secouez votre appareil ou Ctrl+M sur émulateur
```

## 📚 Ressources et apprentissage

### Documentation officielle
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Concepts clés à comprendre
- **Composants fonctionnels** : Fonctions qui retournent du JSX
- **Hooks** : `useState`, `useEffect` pour gérer l'état et les effets de bord
- **Navigation** : Comment naviguer entre les écrans
- **API REST** : Communication HTTP avec votre serveur
- **Stockage local** : Sauvegarde des paramètres avec AsyncStorage

## 📞 Support

Pour toute question ou problème :
1. Consultez d'abord ce README
2. Vérifiez les logs de l'application
3. Testez la communication avec votre API Node.js
4. Vérifiez que votre système Zaptec-Solis fonctionne correctement

## 🔄 Évolutions futures

Fonctionnalités envisageables :
- **Graphiques** : Courbes de production et consommation
- **Historique** : Conservation des données sur plusieurs jours
- **Notifications** : Alertes sur événements importants
- **Mode sombre** : Thème dark pour utilisation nocturne
- **Widgets** : Affichage sur l'écran d'accueil Android
- **Planification** : Programmation de charges

---

**Note** : Cette application est conçue pour fonctionner avec votre système Zaptec-Solis existant. Assurez-vous que votre serveur Node.js est correctement configuré et accessible sur votre réseau local.