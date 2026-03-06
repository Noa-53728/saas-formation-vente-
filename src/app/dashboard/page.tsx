import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const eur = (cents: number) =>
  cents != null ? `${(cents / 100).toFixed(2)} €` : "-";

const MiniChart = () => (
  <div className="mt-2 flex h-8 items-end gap-0.5">
    {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
      <div
        key={i}
        className="w-1.5 rounded-t bg-accent/40"
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
);

type OrderRow = {
  id: string;
  created_at: string;
  amount_cents: number;
  status: string;
  course_id: string;
  user_id: string;
};

type CourseRow = {
  id: string;
  title: string;
  price_cents: number | null;
  thumbnail_url: string | null;
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const name = profile?.full_name ?? "Créateur";

  const { data: myCoursesRaw } = await supabase
    .from("courses")
    .select("id, title, price_cents, thumbnail_url")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  const myCourses = (myCoursesRaw ?? []) as CourseRow[];
  const courseIds = myCourses.map((c) => c.id);

  let orders: OrderRow[] = [];
  let titleById = new Map<string, string>();
  let salesByCourse = new Map<string, { count: number; revenue: number }>();

  if (courseIds.length > 0) {
    titleById = new Map(myCourses.map((c) => [c.id, c.title]));
    const { data: ordersRaw } = await admin
      .from("orders")
      .select("id, created_at, amount_cents, status, course_id, user_id")
      .in("course_id", courseIds)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(200);
    orders = (ordersRaw ?? []) as OrderRow[];

    orders.forEach((o) => {
      const cur = salesByCourse.get(o.course_id) ?? { count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += o.amount_cents ?? 0;
      salesByCourse.set(o.course_id, cur);
    });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const todayOrders = orders.filter((o) => new Date(o.created_at).getTime() >= startOfToday);
  const monthOrders = orders.filter((o) => new Date(o.created_at).getTime() >= startOfMonth);

  const salesToday = todayOrders.length;
  const revenueToday = todayOrders.reduce((s, o) => s + (o.amount_cents ?? 0), 0);
  const salesMonth = monthOrders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.amount_cents ?? 0), 0);

  const recentOrders = orders.slice(0, 5);
  const buyerIds = [...new Set(recentOrders.map((o) => o.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", buyerIds);
  type P = { id: string; full_name: string | null };
  const nameById = new Map<string, string>(
    (profiles ?? []).map((p: P) => [p.id, p.full_name ?? "Utilisateur"])
  );

  const displayCourses = myCourses.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Bienvenue, {name} 👋
        </h1>
        <p className="text-white/60">Voici vos statistiques</p>
      </div>

      {/* 4 stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-sm text-white/60">Ventes aujourd&apos;hui</p>
          <p className="mt-1 text-2xl font-bold text-white">{salesToday}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
            <span>↑</span> +1.9%
          </p>
          <MiniChart />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-sm text-white/60">Revenus aujourd&apos;hui</p>
          <p className="mt-1 text-2xl font-bold text-white">{eur(revenueToday)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
            <span>↑</span> +1.9%
          </p>
          <MiniChart />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-sm text-white/60">Ventes ce mois</p>
          <p className="mt-1 text-2xl font-bold text-white">{salesMonth}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
            <span>↑</span> +1.9%
          </p>
          <MiniChart />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-sm text-white/60">Total des revenus</p>
          <p className="mt-1 text-2xl font-bold text-white">{eur(totalRevenue)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
            <span>↑</span> +1.9%
          </p>
          <MiniChart />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: chart + mes formations */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Statistiques de ventes
              </h2>
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                7 jours
              </span>
            </div>
            <div className="mt-4 h-48 flex items-end gap-2">
              {[65, 45, 80, 55, 70, 60, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-accent/30 transition hover:bg-accent/50"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/60">
              <span>{eur(totalRevenue)} de revenus</span>
              <span>+ {orders.length} ventes</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Mes formations</h2>
            <div className="mt-4 space-y-4">
              {displayCourses.length === 0 ? (
                <p className="text-sm text-white/60">Aucune formation pour le moment.</p>
              ) : (
                displayCourses.map((course) => {
                  const stats = salesByCourse.get(course.id) ?? {
                    count: 0,
                    revenue: 0,
                  };
                  return (
                    <Link
                      key={course.id}
                      href={`/dashboard/courses/${course.id}/edit`}
                      className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-accent/30"
                    >
                      <div className="h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/40">
                            📚
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{course.title}</p>
                        <p className="text-sm text-white/60">
                          {stats.count} Vente{stats.count !== 1 ? "s" : ""} : {eur(stats.revenue)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold text-white">
                          {eur(course.price_cents ?? 0)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
            <Link
              href="/dashboard/courses"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Voir toutes mes formations
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Right: activités + aide */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Activités récentes</h2>
            <div className="mt-4 space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-white/60">Aucune activité récente.</p>
              ) : (
                recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-start gap-3 rounded-lg p-2"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/30 text-sm font-semibold text-white">
                      {String(nameById.get(o.user_id) ?? "?").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">
                        {nameById.get(o.user_id) ?? "Utilisateur"}
                      </p>
                      <p className="text-sm text-white/60 truncate">
                        A acheté {titleById.get(o.course_id) ?? "une formation"} · {eur(o.amount_cents)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/dashboard/sales"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Voir toutes les activités
              <span>→</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/20 to-accent/5 p-6 backdrop-blur">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-accent/20 text-5xl">
                💻
              </div>
              <h3 className="font-semibold text-white">
                Besoin d&apos;aide pour démarrer ?
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Consultez notre centre d&apos;aide et tutoriels.
              </p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:opacity-90"
              >
                Voir le guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
