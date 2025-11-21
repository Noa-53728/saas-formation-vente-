# Formio (Étape 3)

SaaS Next.js 14 (App Router) pour vendre et acheter des formations (vidéo + PDF). Étape 3 : modèle `courses`, création de formation (/courses/new), page publique de formation (/courses/[id]) et dashboard alimenté par vos données.

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

## 🗄️ Créer les tables dans Supabase

Dans le dashboard Supabase > SQL > New query, exécutez :

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_seller boolean default false
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price_cents integer not null,
  thumbnail_url text,
  video_url text not null,
  pdf_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  stripe_session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

Activez les politiques RLS pour sécuriser les tables :

```sql
alter table public.profiles enable row level security;
create policy "users insert their profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "users view their profile" on public.profiles
  for select using (auth.uid() = id);
create policy "users update their profile" on public.profiles
  for update using (auth.uid() = id);

alter table public.courses enable row level security;
create policy "authors manage their courses" on public.courses
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "courses are readable" on public.courses
  for select using (true);

alter table public.purchases enable row level security;
create policy "user sees own purchases" on public.purchases
  for select using (auth.uid() = user_id);
create policy "user inserts own purchases" on public.purchases
  for insert with check (auth.uid() = user_id);
```

## 🧭 Routes ajoutées à l'étape 3
- `/auth/login` : formulaire de connexion Supabase (email/mot de passe).
- `/auth/register` : création de compte + insertion automatique dans `profiles` (full_name, is_seller=false).
- `/dashboard` : protégé, affiche votre profil + vos formations créées + vos achats avec liens vers les fiches.
- `/courses/new` : protégé, formulaire pour créer une formation (titre, description, prix €, URLs vidéo/PDF, thumbnail optionnel).
- `/courses/[id]` : page publique d'une formation. Si l'utilisateur est l'auteur ou acheteur, il voit les liens vidéo/PDF, sinon un bouton d'achat (placeholder avant Stripe).
- Header : si connecté, affichage du lien Dashboard + bouton "Se déconnecter" (server action Supabase).

## ▶️ Lancer en local

```bash
npm install   # installe les dépendances
npm run dev   # http://localhost:3000
```

Connectez les variables d'environnement, puis :
1. Créez un utilisateur via `/auth/register` (ou via Supabase Auth UI si besoin).
2. Vérifiez que le profil est créé dans la table `profiles`.
3. Créez une formation via `/courses/new` et consultez-la sur `/courses/[id]`.
4. Le dashboard affiche vos achats et vos formations créées (selon les données de Supabase).

## ✅ Prochaines étapes
- Étape 4 : Stripe Checkout + webhook + contrôle d’accès contenu.
- Étape 5 : messagerie simple + retouches design + récap déploiement.
