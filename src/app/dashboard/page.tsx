import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_seller")
    .eq("id", session.user.id)
    .maybeSingle();

  return (
    <div className="grid gap-6">
      <div className="card">
        <p className="text-sm text-white/60">Bonjour</p>
        <h1 className="text-3xl font-semibold mt-2">
          {profile?.full_name ?? "Créateur"}
        </h1>
        <p className="text-white/70 mt-2">Voici un aperçu rapide de vos formations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Formations achetées</h2>
            <span className="text-xs rounded-full bg-white/10 px-3 py-1">Accès</span>
          </div>
          <p className="text-white/70 text-sm">
            Les cours achetés apparaîtront ici. Vous pourrez bientôt lire la vidéo et télécharger le PDF.
          </p>
        </div>
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Vos formations</h2>
            <a className="text-sm text-accent" href="/courses/new">
              Publier une formation
            </a>
          </div>
          <p className="text-white/70 text-sm">
            Ajoutez vos formations et suivez vos ventes. Cette section listera vos contenus créés.
          </p>
        </div>
      </div>
    </div>
  );
}
