# Formio (Étape 1)

SaaS Next.js 14 (App Router) pour vendre et acheter des formations (vidéo + PDF). Cette première étape installe le squelette Next.js + Tailwind et ajoute Supabase côté client/serveur.

## 📦 Commandes pour créer le projet (déjà appliquées ici)

```bash
# 1) Créer l'app Next.js avec TypeScript, Tailwind, App Router
npx create-next-app@latest formio --typescript --app --eslint --tailwind --src-dir --import-alias "@/*" --use-npm

# 2) Se placer dans le dossier
cd formio
```

> Remarque : si le registre npm est restreint, configurez votre environnement/réseau puis relancez la commande.

## 🔌 Ajouter Supabase

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- `src/lib/supabase-browser.ts` : client Supabase pour les composants Client.
- `src/lib/supabase-server.ts` : client Supabase pour les Server Components / route handlers avec gestion des cookies.

## 🔑 Variables d'environnement

Copiez `.env.example` en `.env.local` et remplissez :

```
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="supabase-service-role-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## ▶️ Lancer en local

```bash
npm install   # installe les dépendances
npm run dev   # http://localhost:3000
```

## ✅ Prochaines étapes
- Étape 2 : auth Supabase (login/register) + table `profiles` + dashboard protégé.
- Étape 3 : modèle `courses`, pages `/courses/new` et `/courses/[id]`.
- Étape 4 : Stripe Checkout + webhook + contrôle d’accès contenu.
- Étape 5 : messagerie simple + retouches design + récap déploiement.
