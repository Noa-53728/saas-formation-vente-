-- Suivi des boosts gratuits utilisés par les abonnés Creator (3 par mois).
-- Exécuter dans l'éditeur SQL Supabase.

CREATE TABLE IF NOT EXISTS boost_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boost_usage_user_month
  ON boost_usage (user_id, used_at);

ALTER TABLE boost_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own boost_usage"
  ON boost_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own boost_usage"
  ON boost_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE boost_usage IS 'Un enregistrement par boost gratuit utilisé (plan Creator). Pro n’utilise pas cette table.';
