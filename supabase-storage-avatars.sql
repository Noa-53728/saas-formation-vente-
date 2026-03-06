-- 1. Créer le bucket "avatars" dans Supabase Dashboard :
--    Storage > New bucket > Nom : avatars > Cocher "Public bucket".
--
-- 2. Exécuter les politiques ci-dessous dans SQL Editor (après création du bucket).

-- Policy : lecture publique
CREATE POLICY "Avatar public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy : upload uniquement dans son propre dossier (auth.uid() = premier segment du path)
CREATE POLICY "User upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "User update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
