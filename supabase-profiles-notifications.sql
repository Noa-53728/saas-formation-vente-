-- Préférences de notifications (email / rappels).
-- Exécuter dans l'éditeur SQL Supabase.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_sales boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_reminders boolean DEFAULT true;

COMMENT ON COLUMN profiles.notify_messages IS 'Recevoir des notifications pour les nouveaux messages.';
COMMENT ON COLUMN profiles.notify_sales IS 'Recevoir des notifications pour les ventes.';
COMMENT ON COLUMN profiles.notify_reminders IS 'Recevoir des rappels (formations, mises à jour).';
