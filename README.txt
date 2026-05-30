═══════════════════════════════════════════════════════════════
  Ets Manfara & Fils — PWA Firebase — Guide de déploiement
═══════════════════════════════════════════════════════════════

ÉTAPE 1 — CRÉER LE PROJET FIREBASE
────────────────────────────────────
1. Aller sur https://console.firebase.google.com
2. Cliquer "Créer un projet" → nommer "manfara-pv" → Créer
3. Dans le projet, cliquer sur l'icône </> (Web App) → Enregistrer

ÉTAPE 2 — ACTIVER AUTHENTICATION
───────────────────────────────────
Build > Authentication > Commencer
→ Fournisseur : Email/Mot de passe → Activer → Enregistrer

ÉTAPE 3 — ACTIVER FIRESTORE
──────────────────────────────
Build > Firestore Database > Créer une base de données
→ Choisir "Mode production" → Région : europe-west1 (ou nam5)

ÉTAPE 4 — CONFIGURER LES RÈGLES FIRESTORE
────────────────────────────────────────────
Dans Firestore > Règles, coller :

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Lecture : tout utilisateur authentifié
      match /{collection}/{document} {
        allow read: if request.auth != null;
      }
      // Écriture users : admin seulement (role vérifié)
      match /users/{userId} {
        allow write: if request.auth != null &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      // Autres collections : gérant et admin
      match /{collection}/{document} {
        allow write: if request.auth != null &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin','gerant'];
      }
    }
  }

ÉTAPE 5 — COPIER LA CONFIG DANS index.html
────────────────────────────────────────────
Dans Firebase : Paramètres du projet > Vos apps > Config SDK
Remplacer dans index.html le bloc FIREBASE_CONFIG :

  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSy...",
    authDomain:        "manfara-pv.firebaseapp.com",
    projectId:         "manfara-pv",
    storageBucket:     "manfara-pv.appspot.com",
    messagingSenderId: "123456789",
    appId:             "1:123456789:web:abc123"
  };

ÉTAPE 6 — CRÉER LE PREMIER COMPTE ADMIN
──────────────────────────────────────────
A) Dans Firebase Auth > Utilisateurs > Ajouter un utilisateur
   → Email + mot de passe → Copier l'UID généré

B) Dans Firestore > users > Ajouter un document
   → ID du document = UID copié
   → Champs :
     displayName : "Admin Manfara"   (string)
     email       : "admin@..."       (string)
     role        : "admin"           (string)
     disabled    : false             (boolean)

ÉTAPE 7 — DÉPLOYER
────────────────────
Option A — Netlify Drop (0 compte requis) :
  → https://app.netlify.com/drop
  → Glisser le dossier manfara-firebase/

Option B — Firebase Hosting (recommandé) :
  npm install -g firebase-tools
  firebase login
  firebase init hosting → public: "." → SPA: non
  firebase deploy

COMPTES ET RÔLES
─────────────────
  admin   → accès total + gestion utilisateurs
  gerant  → lecture + écriture toutes collections
  vendeur → lecture seule

FALLBACK OFFLINE
─────────────────
Si Firebase n'est pas configuré (placeholders),
l'app s'ouvre quand même avec les données statiques
issues de la migration Access MDB (3 582 enregistrements).
═══════════════════════════════════════════════════════════════
