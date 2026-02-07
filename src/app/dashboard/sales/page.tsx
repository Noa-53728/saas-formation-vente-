import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const eur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

type OrderRow = {
  id: string;
  created_at: string;
  amount_cents: number;
  status: string;
  course_id: string;
  buyer_id?: string | null;
  user_id?: string | null;
};

export default async function SalesPage() {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user!.id;

  // 1) Récupérer les IDs des cours du créateur (source de vérité)
  const { data: myCourses, error: coursesErr } = await admin
    .from("courses")
    .select("id, title")
    .eq("author_id", userId);

  if (coursesErr) {
    return <div className="card">Erreur chargement des cours.</div>;
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

  // 2) Récupérer les ventes dans orders (sans jointure)
  const { data: ordersRaw, error: ordersErr } = await admin
    .from("orders")
    .select("id, created_at, amount_cents, status, course_id, buyer_id, user_id")
    .eq("status", "paid")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false })
    .limit(200);

  if (ordersErr) {
    return <div className="card">Erreur chargement des ventes.</div>;
  }

  const orders = (ordersRaw ?? []) as OrderRow[];

  const totalSales = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.amount_cents ?? 0), 0);

  const now = Date.now();
  const days30 = 30 * 24 * 60 * 60 * 1000;
  const revenue30d = orders
    .filter((o) => now - new Date(o.created_at).getTime() <= days30)
    .reduce((s, o) => s + (o.amount_cents ?? 0), 0);

  const latest = orders.slice(0, 20);

  return (
    <div className="grid gap-6">
      <div className="card">
        <p className="text-sm text-white/60">Dashboard</p>
        <h1 className="text-3xl font-semibold mt-2">Ventes</h1>
        <p className="text-white/70 mt-2">Vos revenus et ventes récentes.</p>
      </div>

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
                    {titleById.get(o.course_id) ?? "Formation"}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <p className="font-semibold">{eur(o.amount_cents ?? 0)}</p>
                  <p className="text-xs text-white/50">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
