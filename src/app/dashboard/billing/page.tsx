import Link from "next/link";
import SubscribeButtons from "./SubscribeButtons";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function BillingPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let planId: "free" | "creator" | "pro" = "free";

  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub && ["active", "trialing"].includes(sub.status)) {
      planId = sub.plan_id as "free" | "creator" | "pro";
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Bouton retour */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        ← Retour au dashboard
      </Link>

      {/* Titre */}
      <div>
        <h1 className="text-3xl font-semibold">Abonnement</h1>
        <p className="text-white/60 mt-1">
          Gérez votre plan et vos avantages.
        </p>
      </div>

      {/* Plan actuel */}
      <div className="card">
        <p className="text-sm text-white/60">Plan actuel</p>
        <p className="text-xl font-semibold mt-1">{planId}</p>
      </div>

      {/* Actions selon le plan */}
      {planId === "free" && (
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Passer à un abonnement</h2>
          <SubscribeButtons showCreator showPro />
        </div>
      )}

      {planId === "creator" && (
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Upgrade vers Pro</h2>
          <SubscribeButtons showPro />
        </div>
      )}

      {planId === "pro" && (
        <div className="card">
          <p className="text-white/80">
            Tu es déjà sur le plan maximum.
          </p>
        </div>
      )}
    </div>
  );
}
