# Spotify Clone — React Native

Clone de Spotify en React Native CLI pur (Android), connecté à Supabase.

## Fonctionnalités
- Authentification email/mot de passe + mode sans compte (invité)
- Upload de fichiers audio personnels
- Lecture audio en arrière-plan (notifications, écran verrouillé)
- Playlists, recherche, recommandations basées sur l'historique
- Mode hors-ligne : téléchargement local + SQLite + synchronisation auto

## Stack
- React Native 0.77 CLI (sans Expo)
- Supabase (BDD + Auth + Storage)
- react-native-track-player 4.1
- @op-engineering/op-sqlite
- react-native-fs + @react-native-community/netinfo

## Installation locale

```bash
# 1. Cloner le repo
git clone <URL_DU_REPO>
cd <NOM_DU_REPO>

# 2. Configurer Supabase
cp src/config/env.example.ts src/config/env.ts
# Édite env.ts avec tes clés (Project Settings > API)

# 3. Installer les dépendances (patch Kotlin auto-appliqué)
npm install

# 4. Créer les tables Supabase
# Copie supabase/schema.sql dans SQL Editor > New query > Run

# 5. Lancer (émulateur ou téléphone USB)
npx react-native start        # Terminal 1
npx react-native run-android  # Terminal 2
```

## Build APK via GitHub Actions

Configure ces secrets dans Settings > Secrets > Actions :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Chaque push sur `main` génère un APK téléchargeable dans l'onglet Actions.
