import { createSupabaseServerClient } from "@/lib/supabase-server";

const eur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

type OrderRow = {
  id: string;
  created_at: string;
  amount_cents: number;
  status: string;
  course_id: string;
  buyer_id: string;
  courses?: { id: string; title: string } | null;
};

export default async function SalesPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user!.id;

  // 1) Récupérer les ventes du créateur via jointure courses.author_id
  const { data: ordersRaw, error } = await supabase
    .from("orders")
    .select("id, created_at, amount_cents, status, course_id, buyer_id, courses(title, author_id)")
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="card">Erreur chargement des ventes.</div>;
  }

  // Filtrer côté serveur aurait été mieux, mais on ne peut pas .eq sur la jointure partout selon config.
  const ordersAll = (ordersRaw ?? []) as any[];
  const orders = ordersAll
    .filter((o) => o.courses?.author_id === userId)
    .map((o) => ({
      id: o.id,
      created_at: o.created_at,
      amount_cents: o.amount_cents ?? 0,
      status: o.status,
      course_id: o.course_id,
      buyer_id: o.buyer_id,
      courses: o.courses ? { title: o.courses.title } : null,
    })) as OrderRow[];

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
        <p className="text-white/70 mt-2">Vos revenus et vos ventes récentes.</p>
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
                  <p className="font-medium truncate">{o.courses?.title ?? "Formation"}</p>
                  <p className="text-xs text-white/50">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <p className="font-semibold">{eur(o.amount_cents)}</p>
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
