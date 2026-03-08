export const runtime = "nodejs";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const eur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

const statusLabel = (status: string) => {
  switch (status) {
    case "paid":
      return "Payé";
    case "pending":
      return "En attente";
    case "failed":
      return "Échoué";
    case "refunded":
      return "Remboursé";
    default:
      return status;
  }
};

type OrderRow = {
  id: string;
  created_at: string;
  amount_cents: number;
  status: string;
  course_id: string;
};

export default async function SalesPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return (
      <div className="card">
        Erreur auth: {userErr?.message ?? "no user"}
      </div>
    );
  }

  const userId = user!.id;

  // 0) Abonnement (Pro = accès au graphique)
  let isPro = false;
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (sub && ["active", "trialing"].includes(sub.status) && sub.plan_id === "pro") {
    isPro = true;
  }

  // 1) Cours du créateur
  const { data: myCourses, error: coursesErr } = await admin
    .from("courses")
    .select("id, title, author_id")
    .eq("author_id", userId);

  if (coursesErr) {
    return (
      <div className="card">
        <p className="font-semibold">Erreur chargement des cours</p>
        <pre className="text-xs whitespace-pre-wrap mt-3">
          {JSON.stringify(coursesErr, null, 2)}
        </pre>
      </div>
    );
  }

  const courseIds = (myCourses ?? []).map((c) => c.id);
  const titleById = new Map((myCourses ?? []).map((c) => [c.id, c.title]));

  if (courseIds.length === 0) {
    return (
      <div className="grid gap-6">
        <div className="card">
          <p className="text-sm text-white/60">Dashboard</p>
          <h1 className="text-3xl font-semibold mt-2">Ventes</h1>
          <p className="text-white/70 mt-2">Aucune formation publiée.</p>
        </div>
      </div>
    );
  }

  // 2) Ventes
  const { data: ordersRaw, error: ordersErr } = await admin
    .from("orders")
    .select("id, created_at, amount_cents, status, course_id")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false })
    .limit(200);

  if (ordersErr) {
    return (
      <div className="card">
        <p className="font-semibold">Erreur chargement des ventes</p>
        <pre className="text-xs whitespace-pre-wrap mt-3">
          {JSON.stringify(ordersErr, null, 2)}
        </pre>
      </div>
    );
  }

  const orders = (ordersRaw ?? []) as OrderRow[];
  const paidOrders = orders.filter((o) => o.status === "paid");

  const totalSales = paidOrders.length;
  const totalRevenue = paidOrders.reduce(
    (s, o) => s + (o.amount_cents ?? 0),
    0,
  );

  const now = Date.now();
  const days30 = 30 * 24 * 60 * 60 * 1000;
  const revenue30d = paidOrders
    .filter((o) => now - new Date(o.created_at).getTime() <= days30)
    .reduce((s, o) => s + (o.amount_cents ?? 0), 0);

  const latest = orders.slice(0, 20);

  // Données pour le graphique (7 derniers jours) — Pro uniquement
  const last7Days: { date: string; label: string; sales: number; revenue: number }[] = [];
  if (isPro) {
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayOrders = paidOrders.filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= d.getTime() && t < next.getTime();
      });
      last7Days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
        sales: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + (o.amount_cents ?? 0), 0),
      });
    }
  }

  const maxRevenue = isPro && last7Days.length
    ? Math.max(1, ...last7Days.map((d) => d.revenue))
    : 1;

  return (
    <div className="grid gap-6">
      <div className="card">
        <p className="text-sm text-white/60">Dashboard</p>
        <h1 className="text-3xl font-semibold mt-2">Ventes</h1>
        <p className="text-white/70 mt-2">Vos revenus et ventes récentes.</p>
      </div>

      {!isPro && (
        <div className="rounded-2xl border border-white/10 bg-card/50 p-4">
          <p className="text-sm text-white/70">
            <span className="font-medium text-white">Plan Pro</span> : accédez au graphique des ventes sur 7 jours pour visualiser vos revenus par jour.
            <a href="/dashboard/billing" className="ml-1 text-accent hover:underline">Voir la facturation</a>
          </p>
        </div>
      )}

      {isPro && last7Days.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white">Graphique des ventes (7 jours)</h2>
          <p className="mt-1 text-sm text-white/60">Revenus par jour</p>
          <div className="mt-6 flex items-end gap-2 sm:gap-3" style={{ minHeight: "180px" }}>
            {last7Days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end rounded-t-lg bg-white/5 overflow-hidden" style={{ height: "140px" }}>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-accent/90 to-accent-light transition"
                    style={{
                      height: `${Math.round((day.revenue / maxRevenue) * 100)}%`,
                      minHeight: day.revenue > 0 ? "4px" : "0",
                    }}
                    title={`${day.label}: ${eur(day.revenue)} (${day.sales} vente${day.sales !== 1 ? "s" : ""})`}
                  />
                </div>
                <span className="text-xs text-white/60 text-center">{day.label}</span>
                <span className="text-xs font-medium text-white/80">{eur(day.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-white/60">Ventes totales</p>
          <p className="text-2xl font-semibold mt-2">{totalSales}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/60">Revenus total</p>
          <p className="text-2xl font-semibold mt-2">{eur(totalRevenue)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/60">Revenus (30 jours)</p>
          <p className="text-2xl font-semibold mt-2">{eur(revenue30d)}</p>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dernières ventes</h2>
          <span className="text-xs rounded-full bg-white/10 px-3 py-1">
            {latest.length} affichées
          </span>
        </div>

        {latest.length === 0 ? (
          <p className="text-white/70 text-sm">Aucune vente pour le moment.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {latest.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {titleById.get(o.course_id) ?? o.course_id}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <p className="font-semibold">{eur(o.amount_cents ?? 0)}</p>
                  <p className="text-xs text-white/50">{statusLabel(o.status)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
