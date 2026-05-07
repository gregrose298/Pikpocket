# 🚀 MonBudget — Guide Déploiement GitHub + Netlify

## Étape 1 — Créer le repo GitHub

1. Allez sur **github.com**
2. Cliquez **"New repository"**
3. Nom : `monbudget`
4. Cochez **"Public"**
5. Cliquez **"Create repository"**

---

## Étape 2 — Uploader les fichiers

Sur la page du repo, cliquez **"uploading an existing file"**

Uploadez le dossier `monbudget-pwa/` avec tous ses fichiers.

Cliquez **"Commit changes"**

---

## Étape 3 — Connecter Netlify

1. **netlify.com** → "Sign up" avec GitHub
2. **"Add new site"** → **"Import from Git"** → GitHub → `monbudget`
3. Settings :
   - Build command : `npm run build`
   - Publish directory : `dist`
4. **"Deploy site"** → 2-3 minutes → en ligne !

---

## Étape 4 — Votre URL

```
https://monbudget-VOTRENOM.netlify.app
```

Personnalisable dans Site Settings → Domain.

---

## 🔄 Mises à jour futures (simple)

1. Claude modifie le code → vous téléchargez `monbudget-v2.jsx`
2. Sur GitHub → `src/App.jsx` → **"Edit"** → collez → **"Commit"**
3. Netlify redéploie automatiquement ✓
4. Tous vos clients voient la mise à jour

---

## 💰 Vendre l'accès

**Gumroad.com** (le plus simple)
- Créez un produit → Prix : Rs 299-499
- Dans "Thank you page" → mettez votre lien Netlify
- Gumroad gère les paiements (5% commission)

**Ou protéger par mot de passe**
- Netlify → Site Settings → Access control → Password protection
- Un mot de passe par client qui paie
