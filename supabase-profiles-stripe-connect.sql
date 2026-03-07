-- Compte Stripe Connect du créateur pour recevoir les paiements des ventes.
-- Exécuter dans l'éditeur SQL Supabase.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_connect_account_id text;

COMMENT ON COLUMN profiles.stripe_connect_account_id IS 'ID du compte Stripe Connect (Express) pour recevoir les virements des ventes de formations.';
