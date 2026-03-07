-- Bio (présentation) du profil vendeur.
-- Exécuter dans l'éditeur SQL Supabase.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio text;

COMMENT ON COLUMN profiles.bio IS 'Présentation courte du vendeur (visible sur les fiches formation).';
