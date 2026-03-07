import Link from "next/link";
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
  const category = (formData.get("category") as string)?.trim();
  const price = Number(formData.get("price"));
  const videoUrl = (formData.get("video_url") as string)?.trim();
  const pdfUrl = (formData.get("pdf_url") as string)?.trim();
  const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim();

  if (!title || !description || !category || Number.isNaN(price)) {
    throw new Error("Merci de remplir les champs obligatoires.");
  }

  const priceCents = Math.max(0, Math.round(price * 100));

  const { error } = await supabase.from("courses").insert({
    title,
    description,
    category,
    price_cents: priceCents,
    video_url: videoUrl || null,
    pdf_url: pdfUrl || null,
    thumbnail_url: thumbnailUrl || null,
    author_id: session.user.id,
  });

  if (error) {
    throw new Error(`Impossible de créer la formation : ${error.message}`);
  }

  redirect("/dashboard/courses?created=1");
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition";

const labelClass = "block text-sm font-medium text-white/80 mb-1.5";

export default async function NewCoursePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Bouton retour */}
      <Link
        href="/dashboard/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Mes formations
      </Link>

      {/* En-tête */}
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Nouvelle formation
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Publier une formation
        </h1>
        <p className="text-white/70">
          Renseignez les informations principales. Les champs marqués d’un
          astérisque sont obligatoires.
        </p>
      </div>

      <form action={createCourse} className="space-y-8">
        {/* Section 1 : Infos principales */}
        <section className="rounded-2xl border border-white/10 bg-card/80 p-6 shadow-lg shadow-black/10 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-white">
              Informations principales
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className={labelClass}>
                Titre <span className="text-accent">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Ex. Maîtrisez Excel en 7 jours"
                className={inputClass}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-white/50">Maximum 200 caractères</p>
            </div>

            <div>
              <label htmlFor="price" className={labelClass}>
                Prix (€) <span className="text-accent">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min={0}
                step={0.01}
                placeholder="0.00"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-white/50">En euros</p>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className={labelClass}>
              Description <span className="text-accent">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder="Décrivez le contenu de votre formation, ce que l’apprenant va acquérir et à qui elle s’adresse."
              className={`${inputClass} min-h-[140px] resize-y`}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-white/50">Maximum 2000 caractères</p>
          </div>

          <div className="mt-6">
            <label htmlFor="category" className={labelClass}>
              Catégorie <span className="text-accent">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              className={`${inputClass} cursor-pointer appearance-none bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="" className="bg-primary text-white">
                Choisir une catégorie
              </option>
              <option value="business" className="bg-primary text-white">
                Business & entrepreneuriat
              </option>
              <option value="marketing" className="bg-primary text-white">
                Marketing digital
              </option>
              <option value="tech" className="bg-primary text-white">
                Tech & Digital
              </option>
              <option value="education" className="bg-primary text-white">
                Éducation
              </option>
              <option value="dev_perso" className="bg-primary text-white">
                Développement personnel
              </option>
              <option value="sport" className="bg-primary text-white">
                Sport & Santé
              </option>
              <option value="creatif" className="bg-primary text-white">
                Créatif
              </option>
              <option value="autre" className="bg-primary text-white">
                Autre
              </option>
            </select>
          </div>
        </section>

        {/* Section 2 : Contenu (optionnel) */}
        <section className="rounded-2xl border border-white/10 bg-card/50 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-white">
              Contenu (optionnel)
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="video_url" className={labelClass}>
                URL vidéo <span className="text-white/50">(optionnel)</span>
              </label>
              <input
                id="video_url"
                name="video_url"
                type="url"
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="pdf_url" className={labelClass}>
                URL PDF <span className="text-white/50">(optionnel)</span>
              </label>
              <input
                id="pdf_url"
                name="pdf_url"
                type="url"
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="thumbnail_url" className={labelClass}>
              Image de couverture (URL){" "}
              <span className="text-white/50">(optionnel)</span>
            </label>
            <input
              id="thumbnail_url"
              name="thumbnail_url"
              type="url"
              placeholder="https://..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/50">
              Une image rend votre formation plus visible sur la marketplace.
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/courses"
            className="order-2 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10 sm:order-1"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="order-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover active:scale-[0.98] sm:order-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Créer la formation
          </button>
        </div>
      </form>
    </div>
  );
}
