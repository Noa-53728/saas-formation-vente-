import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditCoursePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();

  // 1️⃣ Vérifier la session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // 2️⃣ Charger la formation
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!course) {
    redirect("/dashboard");
  }

  // 3️⃣ Vérifier que l'utilisateur est l'auteur
  if (course.author_id !== session.user.id) {
    redirect("/dashboard");
  }

  // 4️⃣ Page
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Modifier la formation
        </h1>
        <p className="text-sm text-white/50 mt-1">
          ID du cours : {course.id}
        </p>
      </div>

      {/* FORM */}
      <form
        action={`/api/courses/${course.id}/update`}
        method="POST"
        className="space-y-5 bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        {/* TITRE */}
        <div>
          <label className="block text-sm text-white/70 mb-1">
            Titre
          </label>
          <input
            name="title"
            defaultValue={course.title}
            required
            className="w-full rounded-lg px-4 py-2
                       bg-[#0b0f1a] text-white
                       border border-white/10
                       placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm text-white/70 mb-1">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={course.description}
            required
            className="w-full min-h-[140px] rounded-lg px-4 py-2
                       bg-[#0b0f1a] text-white
                       border border-white/10
                       placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* PRIX */}
        <div>
          <label className="block text-sm text-white/70 mb-1">
            Prix (€)
          </label>
          <input
            name="price"
            type="number"
            defaultValue={course.price_cents / 100}
            required
            className="w-full rounded-lg px-4 py-2
                       bg-[#0b0f1a] text-white
                       border border-white/10
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* URL VIDÉO */}
        <div>
          <label className="block text-sm text-white/70 mb-1">
            URL vidéo (optionnel)
          </label>
          <input
            name="video_url"
            defaultValue={course.video_url ?? ""}
            className="w-full rounded-lg px-4 py-2
                       bg-[#0b0f1a] text-white
                       border border-white/10
                       placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* URL PDF */}
        <div>
          <label className="block text-sm text-white/70 mb-1">
            URL PDF (optionnel)
          </label>
          <input
            name="pdf_url"
            defaultValue={course.pdf_url ?? ""}
            className="w-full rounded-lg px-4 py-2
                       bg-[#0b0f1a] text-white
                       border border-white/10
                       placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* CATÉGORIE */}
        <div>
          <label className="block text-sm text-white/70 mb-1">
            Catégorie
          </label>
          <select
            name="category"
            defaultValue={course.category}
            className="w-full rounded-lg px-4 py-2
                       bg-[#0b0f1a] text-white
                       border border-white/10
                       focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="business">Business</option>
            <option value="marketing">Marketing</option>
            <option value="tech">Tech</option>
            <option value="education">Éducation</option>
            <option value="dev_perso">Développement personnel</option>
            <option value="sport">Sport & Santé</option>
            <option value="creatif">Créatif</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        {/* BOUTON */}
        <button
          type="submit"
          className="w-full mt-4 rounded-xl py-3 font-medium
                     bg-accent text-white
                     hover:opacity-90 transition"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}

