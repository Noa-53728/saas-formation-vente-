-- Badge "Vérifié" pour rassurer les acheteurs.
-- Exécuter dans l'éditeur SQL Supabase.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.is_verified IS 'Compte vérifié par Formio (badge de confiance pour les acheteurs).';
