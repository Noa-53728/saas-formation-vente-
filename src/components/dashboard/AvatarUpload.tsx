"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const AVATAR_BUCKET = "avatars";

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
}: {
  userId: string;
  currentAvatarUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Veuillez choisir une image (JPG, PNG, etc.).");
      return;
    }
    setError(null);
    setUploading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadErr) {
        setError(uploadErr.message || "Erreur lors de l’upload.");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: urlData.publicUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Erreur lors de l’enregistrement.");
        setUploading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Une erreur inattendue s’est produite.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-1">
        Photo de profil <span className="text-white/50">(optionnel)</span>
      </label>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-card">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-white/40">
              ?
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {uploading ? "Envoi en cours…" : "Choisir une photo"}
          </button>
          <p className="mt-1 text-xs text-white/50">
            Depuis votre appareil (sans lien). JPG, PNG.
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
