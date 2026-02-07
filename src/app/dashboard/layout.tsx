import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const name = profile?.full_name ?? "Créateur";

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-2">
        <div className="card sticky top-6 p-4 space-y-4">
          <div>
            <p className="text-xs text-white/50">Connecté</p>
            <p className="font-semibold truncate">{name}</p>
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            <Link className="rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard">
              Vue d’ensemble
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/courses">
              Mes formations
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/sales">
              Ventes
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/messages">
              Messages
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/billing">
              Abonnement
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/settings">
              Paramètres
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <section className="col-span-12 md:col-span-9 lg:col-span-10">
        {children}
      </section>
    </div>
  );
}
