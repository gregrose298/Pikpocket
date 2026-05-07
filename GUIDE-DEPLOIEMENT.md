# 🚀 Guide de déploiement — MonBudget PWA
## De votre ordinateur à une app installable sur mobile en 15 minutes

---

## 📦 Ce que contient ce dossier

```
monbudget-pwa/
├── src/
│   ├── App.jsx          ← L'application complète
│   └── main.jsx         ← Point d'entrée React
├── public/
│   ├── manifest.json    ← Définition PWA (nom, icônes, couleurs)
│   ├── service-worker.js← Mode hors-ligne
│   └── icons/
│       ├── icon-192.png ← Icône mobile
│       └── icon-512.png ← Icône haute résolution
├── index.html           ← Page HTML principale
├── package.json         ← Dépendances
├── vite.config.js       ← Configuration du bundler
└── netlify.toml         ← Configuration Netlify (auto)
```

---

## ✅ ÉTAPE 1 — Installer les outils (une seule fois)

### Installer Node.js
1. Allez sur **https://nodejs.org**
2. Téléchargez la version **LTS** (la recommandée)
3. Installez-la normalement
4. Vérifiez : ouvrez un terminal et tapez `node --version` → doit afficher `v20.x.x`

### Installer Git
1. Allez sur **https://git-scm.com**
2. Téléchargez et installez
3. Vérifiez : tapez `git --version` dans le terminal

---

## ✅ ÉTAPE 2 — Préparer le projet

Ouvrez un terminal (PowerShell sur Windows, Terminal sur Mac) :

```bash
# Aller dans le dossier du projet
cd monbudget-pwa

# Installer les dépendances (à faire une seule fois)
npm install

# Tester en local (optionnel — pour voir l'app sur votre ordi)
npm run dev
# → Ouvrez http://localhost:3000 dans votre navigateur
```

---

## ✅ ÉTAPE 3 — Créer un compte GitHub (gratuit)

1. Allez sur **https://github.com**
2. Cliquez sur **Sign up**
3. Créez un compte avec votre email
4. Vérifiez votre email

---

## ✅ ÉTAPE 4 — Mettre le projet sur GitHub

Dans votre terminal :

```bash
# Dans le dossier monbudget-pwa
git init
git add .
git commit -m "MonBudget PWA - version initiale"

# Créer le dépôt sur GitHub
# → Allez sur github.com → New repository
# → Nommez-le "monbudget"
# → Laissez tout par défaut → Create repository

# Puis copiez les commandes affichées par GitHub, du type :
git remote add origin https://github.com/VOTRE_NOM/monbudget.git
git branch -M main
git push -u origin main
```

---

## ✅ ÉTAPE 5 — Déployer sur Netlify (GRATUIT)

1. Allez sur **https://netlify.com**
2. Cliquez **Sign up** → connectez-vous avec votre compte GitHub
3. Cliquez **Add new site** → **Import an existing project**
4. Choisissez **GitHub** → sélectionnez votre dépôt **monbudget**
5. Les paramètres se remplissent automatiquement grâce au fichier `netlify.toml` :
   - **Build command** : `npm run build` ✓
   - **Publish directory** : `dist` ✓
6. Cliquez **Deploy site**
7. ⏳ Attendez 1-2 minutes…
8. **Votre app est en ligne !** URL du type : `https://monbudget-xxxx.netlify.app`

---

## ✅ ÉTAPE 6 — Personnaliser votre URL (optionnel)

Dans Netlify :
1. **Site configuration** → **Change site name**
2. Changez en `monbudget-mauritius` par exemple
3. → URL : `https://monbudget-mauritius.netlify.app` ✓

---

## 📱 ÉTAPE 7 — Installer sur mobile (à montrer à vos clients)

### Sur Android (Chrome) :
1. Ouvrir l'URL dans Chrome
2. Appuyer sur les **3 points** en haut à droite
3. Appuyer **"Ajouter à l'écran d'accueil"**
4. Confirmer → L'app apparaît comme une vraie app ! ✓

### Sur iPhone (Safari) :
1. Ouvrir l'URL dans **Safari** (pas Chrome)
2. Appuyer sur l'icône **Partager** (carré avec flèche)
3. Appuyer **"Sur l'écran d'accueil"**
4. Confirmer → L'app apparaît sur le bureau ! ✓

---

## 🔄 Comment envoyer une mise à jour

Quand vous modifiez l'app et voulez mettre à jour pour tous vos clients :

```bash
# Modifier vos fichiers...
git add .
git commit -m "Mise à jour - description des changements"
git push
```

→ **Netlify redéploie automatiquement en 1-2 minutes.**
→ Vos clients voient la mise à jour au prochain chargement. Sans rien faire.

---

## 💰 Coûts

| Service    | Gratuit jusqu'à       | Payant si             |
|------------|----------------------|----------------------|
| GitHub     | Illimité             | Fonctionnalités pro  |
| Netlify    | 100GB bande passante/mois | Plus de trafic  |
| Domaine    | Sous-domaine gratuit | Domaine custom (Rs 800/an) |

**Pour 100 clients qui utilisent l'app quotidiennement → GRATUIT**

---

## 🌐 Domaine personnalisé (optionnel — Rs 800/an)

Si vous voulez `www.monbudget.mu` au lieu de `monbudget.netlify.app` :

1. Achetez un domaine sur **https://www.afrihost.com** ou **https://namecheap.com**
2. Dans Netlify → **Domain management** → **Add custom domain**
3. Suivez les instructions DNS (5 minutes)

---

## 💬 Partager à vos clients

Envoyez simplement ce message WhatsApp :

```
Bonjour ! 👋
Voici votre accès à MonBudget :
🔗 https://monbudget-mauritius.netlify.app

Pour installer l'app sur votre téléphone :
📱 Android : Ouvrez le lien → 3 points → "Ajouter à l'écran d'accueil"
🍎 iPhone  : Ouvrez dans Safari → Partager → "Sur l'écran d'accueil"

Vos données sont sauvegardées sur votre téléphone. 🔒
```

---

## ❓ Problèmes fréquents

**"npm : command not found"**
→ Node.js n'est pas installé. Retournez à l'étape 1.

**L'app ne se met pas à jour sur mobile**
→ Fermez complètement l'app et relancez-la.

**"Ajouter à l'écran d'accueil" n'apparaît pas sur iPhone**
→ Vérifiez que vous utilisez Safari (pas Chrome ou Firefox sur iOS).

---

*MonBudget PWA — Guide de déploiement v1.0*
