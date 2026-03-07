-- Vidéo de présentation visible par les visiteurs avant achat (optionnel).
-- Exécuter dans l'éditeur SQL Supabase.

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS preview_video_url text;

COMMENT ON COLUMN courses.preview_video_url IS 'URL d''une vidéo d''explication / teaser visible avant achat (YouTube, Vimeo, etc.).';
