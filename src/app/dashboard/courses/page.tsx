import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number | null) =>
  typeof priceCents === "number" ? `${(priceCents / 100).toFixed(2)} €` : "-";

type AuthoredCourse = {
  id: string;
  title: string;
  price_cents: number | null;
  created_at: string;
  boosted_at: string | null;
  boost_expires_at: string | null;
};

export default async function DashboardCoursesPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user!.id;

  const { data: authoredCoursesRaw, error } = await supabase
    .from("courses")
    .select("id, title, price_cents, created_at, boosted_at, boost_expires_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="card">Erreur chargement des formations.</div>;
  }

  const authoredCourses = (authoredCoursesRaw ?? []) as AuthoredCourse[];

  const now = new Date();
  const isBoostActive = (c: AuthoredCourse) =>
    !!c.boost_expires_at && new Date(c.boost_expires_at) > now;

  // Boost actifs en haut, puis expiration la plus proche, puis récents
  const sorted = [...authoredCourses].sort((a, b) => {
    const aActive = isBoostActive(a);
    const bActive = isBoostActive(b);
    if (aActive !== bActive) return aActive ? -1 : 1;

    if (aActive && bActive) {
      const aExp = a.boost_expires_at ? new Date(a.boost_expires_at).getTime() : 0;
      const bExp = b.boost_expires_at ? new Date(b.boost_expires_at).getTime() : 0;
      if (aExp !== bExp) return aExp - bExp; // expire le + tôt en haut
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/60">Dashboard</p>
            <h1 className="text-3xl font-semibold mt-2">Mes formations</h1>
            <p className="text-white/70 mt-2">
              Gérez vos formations, vos boosts et vos modifications.
            </p>
          </div>

          <Link className="button-primary whitespace-nowrap" href="/courses/new">
            Publier une formation
          </Link>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Liste</h2>
          <span className="text-xs rounded-full bg-white/10 px-3 py-1">
            {sorted.length} formation{sorted.length > 1 ? "s" : ""}
          </span>
        </div>

        {sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((course) => {
              const active = isBoostActive(course);

              return (
                <div
                  key={course.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
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
                            {" "}
                            • expire le{" "}
                            {new Date(course.boost_expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/courses/${course.id}/edit`}
                      className="text-sm text-accent whitespace-nowrap"
                    >
                      Gérer
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-white/50">
                      {active
                        ? "Votre formation est mise en avant."
                        : "Mettez votre formation en haut des résultats (7 jours)."}
                    </p>

                    {!active ? (
                      <Link
                        href={`/api/stripe/boost?courseId=${course.id}`}
                        className="text-xs rounded-lg px-3 py-2 bg-accent text-white hover:opacity-90 transition whitespace-nowrap"
                      >
                        Booster 7 jours • 4,99 €
                      </Link>
                    ) : (
                      <span className="text-xs text-white/40 whitespace-nowrap">
                        Déjà boostée
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg bg-white/5 border border-white/10 p-6">
            <p className="text-white/70 text-sm">Aucune formation pour l’instant.</p>
            <Link className="text-sm text-accent mt-3 inline-block" href="/courses/new">
              Publier votre première formation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
