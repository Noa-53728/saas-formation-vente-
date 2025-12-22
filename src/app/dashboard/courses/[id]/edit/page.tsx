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

  // 4️⃣ Formulaire d’édition
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier la formation</h1>
        <p className="text-sm text-white/60 mt-1">
          ID du cours : {course.id}
        </p>
      </div>

      <form
        action={`/api/courses/${course.id}/update`}
        method="POST"
        className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <input
          name="title"
          defaultValue={course.title}
          placeholder="Titre"
          className="input"
          required
        />

        <textarea
          name="description"
          defaultValue={course.description}
          placeholder="Description"
          className="input min-h-[120px]"
          required
        />

        <input
          name="price"
          type="number"
          defaultValue={course.price_cents / 100}
          placeholder="Prix (€)"
          className="input"
          required
        />

        <input
          name="video_url"
          defaultValue={course.video_url ?? ""}
          placeholder="URL vidéo"
          className="input"
        />

        <input
          name="pdf_url"
          defaultValue={course.pdf_url ?? ""}
          placeholder="URL PDF"
          className="input"
        />

        <select
          name="category"
          defaultValue={course.category}
          className="input"
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

        <button type="submit" className="button-primary w-full">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}

