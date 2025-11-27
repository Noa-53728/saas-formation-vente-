import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number | null) =>
  typeof priceCents === "number" ? `${(priceCents / 100).toFixed(2)} €` : "-";

// 🔥 Corrige le fait que Supabase peut renvoyer un objet OU un tableau
const normalizeCourse = (c: any) => {
  if (!c) return null;
  return Array.isArray(c) ? c[0] : c;
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_seller")
    .eq("id", session.user.id)
    .maybeSingle();

  const { data: authoredCourses } = await supabase
    .from("courses")
    .select("id, title, price_cents, created_at")
    .eq("author_id", session.user.id)
    .order("created_at", { ascending: false });

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, course:courses(id, title, price_cents)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <div className="card">
        <p className="text-sm text-white/60">Bonjour</p>
        <h1 className="text-3xl font-semibold mt-2">
          {profile?.full_name ?? "Créateur"}
        </h1>
        <p className="text-white/70 mt-2">
          Voici un aperçu rapide de vos formations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* FORMATIONS ACHETÉES */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Formations achetées</h2>
            <span className="text-xs rounded-full bg-white/10 px-3 py-1">Accès</span>
          </div>

          {purchases && purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase) => {
                const course = normalizeCourse(purchase.course);

                return (
                  <a
                    key={purchase.id}
                    className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:border-accent/60"
                    href={`/courses/${course?.id}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{course?.title}</p>
                        <p className="text-xs text-white/60">
                          {formatPrice(course?.price_cents ?? null)}
                        </p>
                      </div>
                      <span className="text-xs text-accent">Voir</span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-white/70 text-sm">
              Les cours achetés apparaîtront ici.
            </p>
          )}
        </div>

        {/* MES FORMATIONS */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Vos formations</h2>
            <a className="text-sm text-accent" href="/courses/new">
              Publier une formation
            </a>
          </div>

          {authoredCourses && authoredCourses.length > 0 ? (
            <div className="space-y-3">
              {authoredCourses.map((course) => (
                <a
                  key={course.id}
                  className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:border-accent/60"
                  href={`/courses/${course.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-white/60">
                        {formatPrice(course.price_cents)}
                      </p>
                    </div>
                    <span className="text-xs text-accent">Gérer</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-sm">Ajoutez vos formations ici.</p>
          )}
        </div>
      </div>
    </div>
  );
}

