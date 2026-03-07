-- Email PayPal du créateur pour recevoir les revenus des ventes (optionnel).
-- Exécuter dans l'éditeur SQL Supabase.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paypal_email text;

COMMENT ON COLUMN profiles.paypal_email IS 'Adresse email PayPal pour recevoir les virements des ventes de formations.';
