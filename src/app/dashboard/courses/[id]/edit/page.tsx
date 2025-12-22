import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function EditCoursePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .eq("author_id", session.user.id)
    .single();

  if (error || !course) {
    redirect("/dashboard");
  }

  async function updateCourse(formData: FormData) {
    "use server";

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const price = Number(formData.get("price"));
    const category = (formData.get("category") as string)?.trim();
    const videoUrl = (formData.get("video_url") as string)?.trim() || null;
    const pdfUrl = (formData.get("pdf_url") as string)?.trim() || null;
    const thumbnailUrl =
      (formData.get("thumbnail_url") as string)?.trim() || null;

    if (!title || !description || !category || Number.isNaN(price)) {
      throw new Error("Champs obligatoires manquants");
    }

    await supabase
      .from("courses")
      .update({
        title,
        description,
        category,
        price_cents: Math.round(price * 100),
        video_url: videoUrl,
        pdf_url: pdfUrl,
        thumbnail_url: thumbnailUrl,
      })
      .eq("id", params.id)
      .eq("author_id", session.user.id);

    redirect("/dashboard");
  }

  async function deleteCourse() {
    "use server";

    await supabase
      .from("courses")
      .delete()
      .eq("id", params.id)
      .eq("author_id", session.user.id);

    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gérer la formation</h1>
        <p className="text-white/70">
          Modifier ou supprimer votre formation.
        </p>
      </div>

      <form
        action={updateCourse}
        className="space-y-5 bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            defaultValue={course.title}
            className="input"
            placeholder="Titre"
            required
          />
          <input
            name="price"
            type="number"
            defaultValue={course.price_cents / 100}
            className="input"
            placeholder="Prix"
            required
          />
        </div>

        <textarea
          name="description"
          defaultValue={course.description}
          className="input min-h-[120px]"
          placeholder="Description"
          required
        />

        <select
          name="category"
          defaultValue={course.category}
          className="input"
          required
        >
          <option value="">Choisir une catégorie</option>
          <option>Business & Marketing</option>
          <option>Développement personnel</option>
          <option>Sport & Santé</option>
          <option>Finance</option>
          <option>Tech & IA</option>
          <option>Création de contenu</option>
          <option>Éducation</option>
          <option>Autre</option>
        </select>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="video_url"
            defaultValue={course.video_url ?? ""}
            className="input"
            placeholder="URL vidéo (optionnel)"
          />
          <input
            name="pdf_url"
            defaultValue={course.pdf_url ?? ""}
            className="input"
            placeholder="URL PDF (optionnel)"
          />
        </div>

        <input
          name="thumbnail_url"
          defaultValue={course.thumbnail_url ?? ""}
          className="input"
          placeholder="Thumbnail (optionnel)"
        />

        <button type="submit" className="button-primary w-full">
          Enregistrer les modifications
        </button>
      </form>

      <form action={deleteCourse}>
        <button
          type="submit"
          className="w-full border border-red-500/40 text-red-400 rounded-lg py-3 hover:bg-red-500/10"
        >
          Supprimer définitivement la formation
        </button>
      </form>
    </div>
  );
}
