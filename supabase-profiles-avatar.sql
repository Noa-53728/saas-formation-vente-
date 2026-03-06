-- Ajouter la colonne avatar_url à la table profiles (photo de profil optionnelle)
-- Exécuter dans l'éditeur SQL Supabase si la colonne n'existe pas encore.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN profiles.avatar_url IS 'URL de la photo de profil (optionnel).';
