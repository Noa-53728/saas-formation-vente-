import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number | null) =>
  typeof priceCents === "number" ? `${(priceCents / 100).toFixed(2)} €` : "-";

const normalizeCourse = (c: any) => {
  if (!c) return null;
  return Array.isArray(c) ? c[0] : c;
};

type AuthoredCourse = {
  id: string;
  title: string;
  price_cents: number | null;
  created_at: string;
  boosted_at: string | null;
  boost_expires_at: string | null;
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_seller")
    .eq("id", userId)
    .maybeSingle();

  const { data: authoredCoursesRaw } = await supabase
    .from("courses")
    .select("id, title, price_cents, created_at, boosted_at, boost_expires_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  const authoredCourses = (authoredCoursesRaw ?? []) as AuthoredCourse[];

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, course:courses(id, title, price_cents)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const now = new Date();
  const isBoostActive = (c: AuthoredCourse) =>
    !!c.boost_expires_at && new Date(c.boost_expires_at) > now;

  const sortedAuthoredCourses = [...authoredCourses].sort((a, b) => {
    const aActive = isBoostActive(a);
    const bActive = isBoostActive(b);
    if (aActive !== bActive) return aActive ? -1 : 1;

    if (aActive && bActive) {
      const aExp = a.boost_expires_at ? new Date(a.boost_expires_at).getTime() : 0;
      const bExp = b.boost_expires_at ? new Date(b.boost_expires_at).getTime() : 0;
      if (aExp !== bExp) return bExp - aExp;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="grid gap-6">
      <div className="card">
        <p className="text-sm text-white/60">Bonjour</p>
        <h1 className="text-3xl font-semibold mt-2">
          {profile?.full_name ?? "Créateur"}
        </h1>
        <p className="text-white/70 mt-2">Voici un aperçu de votre activité.</p>

        <form
          action="/search"
          method="GET"
          className="mt-6 flex flex-col sm:flex-row gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <input
            name="q"
            placeholder="Rechercher une formation..."
            className="flex-1 px-4 py-2 rounded-md bg-white/5 text-white placeholder:text-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <select
            name="category"
            className="px-4 py-2 rounded-md bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue=""
          >
            <option value="" className="bg-[#0b0f1a] text-white">Toutes les catégories</option>
            <option value="business" className="bg-[#0b0f1a] text-white">Business & entrepreneuriat</option>
            <option value="marketing" className="bg-[#0b0f1a] text-white">Marketing digital</option>
            <option value="tech" className="bg-[#0b0f1a] text-white">Tech & Digital</option>
            <option value="education" className="bg-[#0b0f1a] text-white">Éducation</option>
            <option value="dev_perso" className="bg-[#0b0f1a] text-white">Développement personnel</option>
            <option value="sport" className="bg-[#0b0f1a] text-white">Sport & Santé</option>
            <option value="creatif" className="bg-[#0b0f1a] text-white">Créatif</option>
            <option value="autre" className="bg-[#0b0f1a] text-white">Autre</option>
          </select>

          <button className="button-primary" type="submit">Rechercher</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Formations achetées</h2>
            <span className="text-xs rounded-full bg-white/10 px-3 py-1">Accès</span>
          </div>

          {purchases && purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase: any) => {
                const course = normalizeCourse(purchase.course);
                if (!course?.id) return null;

                return (
                  <Link
                    key={purchase.id}
                    href={`/courses/${course.id}`}
                    className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:border-accent/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-white/60">{formatPrice(course.price_cents ?? null)}</p>
                      </div>
                      <span className="text-xs text-accent">Voir</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-white/70 text-sm">Les cours achetés apparaîtront ici.</p>
          )}
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Vos formations</h2>
            <Link className="text-sm text-accent" href="/courses/new">Publier une formation</Link>
          </div>

          {sortedAuthoredCourses.length > 0 ? (
            <div className="space-y-3">
              {sortedAuthoredCourses.map((course) => {
                const active = isBoostActive(course);

                return (
                  <div key={course.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{course.title}</p>
                          {active && (
                            <span className="text-[11px] rounded-full bg-accent/20 border border-accent/30 text-accent px-2 py-0.5">
                              Boost actif
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-white/60 mt-1">
                          {formatPrice(course.price_cents)}
                          {active && course.boost_expires_at && (
                            <span className="text-white/40">
                              {" "}• expire le{" "}{new Date(course.boost_expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/courses/${course.id}/edit`}
                        className="text-xs text-accent whitespace-nowrap"
                      >
                        Gérer
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-white/50">
                        {active
                          ? "Votre formation est actuellement mise en avant."
                          : "Mettez votre formation en haut des résultats (7 jours)."}
                      </p>

                      {!active && (
                        <Link
                          href={`/api/stripe/boost?courseId=${course.id}`}
                          className="text-xs rounded-lg px-3 py-2 bg-accent text-white hover:opacity-90 transition whitespace-nowrap"
                        >
                          Booster 7 jours • 4,99 €
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/70 text-sm">Ajoutez vos formations ici.</p>
          )}
        </div>
      </div>
    </div>
  );
}
