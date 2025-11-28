import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const createCourse = async (formData: FormData) => {
  "use server";

  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const price = Number(formData.get("price"));
  const videoUrl = (formData.get("video_url") as string)?.trim();
  const pdfUrl = (formData.get("pdf_url") as string)?.trim();
  const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim();

  if (!title || !description || !videoUrl || !pdfUrl || Number.isNaN(price)) {
    throw new Error("Merci de remplir tous les champs obligatoires.");
  }

  const priceCents = Math.max(0, Math.round(price * 100));

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      description,
      price_cents: priceCents,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      thumbnail_url: thumbnailUrl || null,
      author_id: session.user.id
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Impossible de créer la formation : ${error.message}`);
  }

  redirect(`/courses/${data.id}`);
};

export default async function NewCoursePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-accent font-semibold">Nouvelle formation</p>
        <h1 className="text-3xl font-bold">Publier une formation</h1>
        <p className="text-white/70 text-sm">
          Renseignez les informations principales. Les paiements Stripe seront ajoutés à l&apos;étape suivante.
        </p>
      </div>

      <form action={createCourse} className="space-y-5 bg-white/5 border border-white/10 rounded-xl p-6">
        
        {/* Titre + Prix */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Titre *</span>
            <input
              name="title"
              type="text"
              required
              placeholder="Ex : Devenir expert Next.js"
              className="w-full rounded-lg bg-white text-black p-3 border border-white/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Prix (EUR) *</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="199"
              className="w-full rounded-lg bg-white text-black p-3 border border-white/20"
            />
          </label>
        </div>

        {/* Description */}
        <label className="space-y-2 block">
          <span className="text-sm font-medium">Description *</span>
          <textarea
            name="description"
            required
            placeholder="Décrivez la formation, les modules, les bénéfices..."
            className="w-full min-h-[120px] rounded-lg bg-white text-black p-3 border border-white/20"
          />
        </label>

        {/* Vidéo + PDF */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">URL vidéo (hébergée) *</span>
            <input
              name="video_url"
              type="url"
              required
              placeholder="https://..."
              className="w-full rounded-lg bg-white text-black p-3 border border-white/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">URL PDF (hébergé) *</span>
            <input
              name="pdf_url"
              type="url"
              required
              placeholder="https://..."
              className="w-full rounded-lg bg-white text-black p-3 border border-white/20"
            />
          </label>
        </div>

        {/* Thumbnail */}
        <label className="space-y-2 block">
          <span className="text-sm font-medium">Thumbnail (optionnel)</span>
          <input
            name="thumbnail_url"
            type="url"
            placeholder="https://..."
            className="w-full rounded-lg bg-white text-black p-3 border border-white/20"
          />
        </label>

        {/* Bouton */}
        <div className="flex items-center gap-3">
          <button type="submit" className="button-primary">
            Créer la formation
          </button>
          <p className="text-xs text-white/50">Les fichiers doivent déjà être hébergés (Supabase Storage, autre).</p>
        </div>
      </form>
    </div>
  );
}
