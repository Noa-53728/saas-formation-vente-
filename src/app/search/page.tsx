import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number | null) =>
  typeof priceCents === "number" ? `${(priceCents / 100).toFixed(2)} €` : "-";

type SearchParams = { q?: string; category?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createSupabaseServerClient();

  const q = (searchParams.q ?? "").trim();
  const category = (searchParams.category ?? "").trim();

  // base query
  let query = supabase
    .from("courses")
    .select("id, title, price_cents, created_at, boosted_at, boost_expires_at, category")
    .limit(50);

  if (q) {
    // recherche sur le titre (tu peux étendre plus tard)
    query = query.ilike("title", `%${q}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  // tri: boost d'abord, puis récent
  query = query
    .order("boost_expires_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const { data: courses, error } = await query;

  if (error) {
    return (
      <main className="card">
        <h1 className="text-xl font-semibold">Recherche</h1>
        <pre className="mt-4 text-sm text-red-300 whitespace-pre-wrap">{error.message}</pre>
      </main>
    );
  }

  const now = new Date();

  return (
    <main className="grid gap-6">
      <div className="card">
        <h1 className="text-2xl font-semibold">Résultats</h1>
        <p className="text-white/70 mt-2">
          {q ? (
            <>
              Recherche : <span className="text-white">{q}</span>
            </>
          ) : (
            "Aucun mot-clé."
          )}
          {category ? (
            <>
              {" "}• Catégorie : <span className="text-white">{category}</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid gap-3">
        {(courses ?? []).length === 0 ? (
          <div className="card">
            <p className="text-white/70">Aucun résultat.</p>
          </div>
        ) : (
          (courses ?? []).map((c) => {
            const boosted =
              !!c.boost_expires_at && new Date(c.boost_expires_at) > now;

            return (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="card hover:border-accent/60 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{c.title}</p>
                      {boosted && (
                        <span className="text-[11px] rounded-full bg-accent/20 border border-accent/30 text-accent px-2 py-0.5">
                          Boost
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      {formatPrice(c.price_cents)}
                      {boosted && c.boost_expires_at && (
                        <span className="text-white/40">
                          {" "}• expire le{" "}
                          {new Date(c.boost_expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>

                  <span className="text-xs text-accent whitespace-nowrap">Voir</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
