import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const createCourse = async (formData: FormData) => {
  "use server";

  const supabase = createSupabaseServerClient();
  const {
    data: { session },
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

  const { error } = await supabase.from("courses").insert({
    title,
    description,
    price_cents: priceCents,
    video_url: videoUrl,
    pdf_url: pdfUrl,
    thumbnail_url: thumbnailUrl || null,
    author_id: session.user.id,
  });

  if (error) {
    throw new Error(`Impossible de créer la formation : ${error.message}`);
  }

  // ✅ REDIRECTION SÛRE
  redirect("/dashboard");
};

export default async function NewCoursePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-accent font-semibold">
          Nouvelle formation
        </p>
        <h1 className="text-3xl font-bold">Publier une formation</h1>
        <p className="text-white/70 text-sm">
          Renseignez les informations principales.
        </p>
      </div>

      <form
        action={createCourse}
        className="space-y-5 bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            required
            placeholder="Titre"
            className="input"
          />
          <input
            name="price"
            type="number"
            required
            placeholder="Prix"
            className="input"
          />
        </div>

        <textarea
          name="description"
          required
          placeholder="Description"
          className="input min-h-[120px]"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="video_url"
            required
            placeholder="URL vidéo"
            className="input"
          />
          <input
            name="pdf_url"
            required
            placeholder="URL PDF"
            className="input"
          />
        </div>

        <input
          name="thumbnail_url"
          placeholder="Thumbnail (optionnel)"
          className="input"
        />

        <button className="button-primary w-full" type="submit">
          Créer la formation
        </button>
      </form>
    </div>
  );
}
