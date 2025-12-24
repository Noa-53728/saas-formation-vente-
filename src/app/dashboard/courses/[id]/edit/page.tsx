import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface PageProps {
  params: { id: string };
}

const formatPrice = (cents: number) =>
  `${(cents / 100).toFixed(2)} €`.replace(".", ",");

const normalizeOne = <T,>(v: T | T[] | null | undefined): T | null => {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
};

export default async function EditCoursePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();

  // 1) session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  // 2) course
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!course) redirect("/dashboard");

  // 3) check author
  if (course.author_id !== session.user.id) redirect("/dashboard");

  // 4) sales (purchases)
  // Si ton tableau purchases a "amount_cents", on l’utilise.
  // Sinon on prend le prix du cours (courses.price_cents) via la relation.
  const { data: salesRows } = await supabase
    .from("purchases")
    .select("id, created_at, amount_cents, course:courses(price_cents)")
    .eq("course_id", course.id)
    .order("created_at", { ascending: false });

  const sales = salesRows ?? [];

  const revenueCents = sales.reduce((acc, s: any) => {
    const courseObj = normalizeOne(s.course);
    const priceFromCourse = courseObj?.price_cents ?? 0;
    const amount = typeof s.amount_cents === "number" ? s.amount_cents : priceFromCourse;
    return acc + (amount ?? 0);
  }, 0);

  const totalSales = sales.length;

  // ventes par jour (7 derniers jours)
  const lastNDays = 7;
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (lastNDays - 1));
  start.setHours(0, 0, 0, 0);

  const perDayMap = new Map<string, number>();
  for (let i = 0; i < lastNDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    perDayMap.set(key, 0);
  }

  for (const s of sales) {
    const d = new Date(s.created_at);
    d.setHours(0, 0, 0, 0);
    if (d >= start) {
      const key = d.toISOString().slice(0, 10);
      perDayMap.set(key, (perDayMap.get(key) ?? 0) + 1);
    }
  }

  const perDay = Array.from(perDayMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">Modifier la formation</h1>
        <p className="text-sm text-white/50 mt-1">ID du cours : {course.id}</p>
      </div>

      {/* STATS */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Stats de vente</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#0b0f1a] border border-white/10 p-4">
            <p className="text-sm text-white/60">Ventes</p>
            <p className="text-2xl font-semibold text-white mt-1">{totalSales}</p>
          </div>

          <div className="rounded-xl bg-[#0b0f1a] border border-white/10 p-4">
            <p className="text-sm text-white/60">Chiffre d’affaires</p>
            <p className="text-2xl font-semibold text-white mt-1">
              {formatPrice(revenueCents)}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#0b0f1a] border border-white/10 p-4">
          <p className="text-sm text-white/60 mb-3">7 derniers jours</p>
          <div className="space-y-2">
            {perDay.map((d) => (
              <div key={d.date} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{d.date}</span>
                <span className="text-sm text-white">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#0b0f1a] border border-white/10 p-4">
          <p className="text-sm text-white/60 mb-3">Dernières ventes</p>
          {sales.length === 0 ? (
            <p className="text-sm text-white/60">Aucune vente pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {sales.slice(0, 5).map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className="text-sm text-white/80">
                    {new Date(s.created_at).toLocaleString("fr-FR")}
                  </span>
                  <span className="text-sm text-white">
                    {formatPrice(
                      typeof s.amount_cents === "number"
                        ? s.amount_cents
                        : (normalizeOne(s.course)?.price_cents ?? 0)
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FORM */}
      <form
        action={`/api/courses/${course.id}/update`}
        method="POST"
        className="space-y-5 bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        {/* TITRE */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Titre</label>
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
          <label className="block text-sm text-white/70 mb-1">Description</label>
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
          <label className="block text-sm text-white/70 mb-1">Prix (€)</label>
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
          <label className="block text-sm text-white/70 mb-1">URL vidéo (optionnel)</label>
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
          <label className="block text-sm text-white/70 mb-1">URL PDF (optionnel)</label>
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
          <label className="block text-sm text-white/70 mb-1">Catégorie</label>
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

      {/* SUPPRESSION (tu l’as déjà) */}
      <form
        action={`/api/courses/${course.id}/delete`}
        method="POST"
        className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
      >
        <p className="text-red-200/90 text-sm mb-4">⚠️ Cette action est irréversible</p>
        <button
          type="submit"
          className="w-full rounded-xl py-3 font-semibold bg-red-600 text-white hover:bg-red-700 transition"
        >
          Supprimer la formation
        </button>
      </form>
    </div>
  );
}

