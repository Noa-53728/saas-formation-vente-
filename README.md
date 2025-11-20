# Formio (Étape 2)

SaaS Next.js 14 (App Router) pour vendre et acheter des formations (vidéo + PDF). Étape 2 : authentification Supabase (login/register), table `profiles`, dashboard protégé et bouton de déconnexion.

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

## 🗄️ Créer la table `profiles` dans Supabase

Dans le dashboard Supabase > SQL > New query, exécutez :

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_seller boolean default false
);
```

Activez la politique d'insertion pour les utilisateurs authentifiés (SQL) :

```sql
alter table public.profiles enable row level security;
create policy "users insert their profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "users view their profile" on public.profiles
  for select using (auth.uid() = id);
create policy "users update their profile" on public.profiles
  for update using (auth.uid() = id);
```

## 🧭 Routes ajoutées à l'étape 2
- `/auth/login` : formulaire de connexion Supabase (email/mot de passe).
- `/auth/register` : création de compte + insertion automatique dans `profiles` (full_name, is_seller=false).
- `/dashboard` : page protégée qui redirige vers `/auth/login` si l'utilisateur n'est pas connecté. Affiche le profil et des sections placeholder (formations achetées / créées).
- Header : si connecté, affichage du lien Dashboard + bouton "Se déconnecter" (server action Supabase).

## ▶️ Lancer en local

```bash
npm install   # installe les dépendances
npm run dev   # http://localhost:3000
```

Connectez les variables d'environnement, puis :
1. Créez un utilisateur via `/auth/register` (ou via Supabase Auth UI si besoin).
2. Vérifiez que le profil est créé dans la table `profiles`.
3. La page `/dashboard` redirige les visiteurs non connectés vers `/auth/login`.

## ✅ Prochaines étapes
- Étape 3 : modèle `courses`, pages `/courses/new` et `/courses/[id]`.
- Étape 4 : Stripe Checkout + webhook + contrôle d’accès contenu.
- Étape 5 : messagerie simple + retouches design + récap déploiement.
