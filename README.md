# SaaS Formations (Next.js 14 + Supabase + Stripe)

Ce dépôt contient la base du projet (Étape 1) pour la plateforme de vente/achat de formations. On utilise Next.js 14 (App Router), TypeScript, Supabase et Stripe.

## Étape 1 — Initialisation

1. **Créer le projet** (si vous partez de zéro) :
   ```bash
   npx create-next-app@latest saas-formation-vente- --ts --app --tailwind false --eslint
   ```
   Ici, le squelette est déjà commité pour vous.

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Variables d’environnement** : copiez `.env.example` vers `.env.local` et remplissez les valeurs.
   ```bash
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` : dans Supabase > Settings > API.
   - `SUPABASE_SERVICE_ROLE_KEY` : clé service role (à conserver côté serveur uniquement).
   - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : depuis le dashboard Stripe.
   - `APP_URL` : URL locale (`http://localhost:3000`) ou de prod (Vercel).

4. **Lancer en local** :
   ```bash
   npm run dev
   ```
   Puis ouvrez http://localhost:3000.

## Structure actuelle
- `app/` : App Router Next.js
  - `layout.tsx` : layout global + header/footer
  - `page.tsx` : landing légère décrivant les étapes
  - `globals.css` : styles simples
- `lib/supabase/` : helpers client/serveur pour Supabase
- `.env.example` : modèle de variables d’environnement

Les étapes suivantes ajouteront l’authentification, les pages protégées, Stripe et la messagerie.
