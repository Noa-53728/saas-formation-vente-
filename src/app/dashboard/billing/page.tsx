import Link from "next/link";
import SubscribeButtons from "./SubscribeButtons";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  creator: "Creator",
  pro: "Pro",
};

const PLAN_DESC: Record<string, string> = {
  free: "Publiez des formations et recevez des messages. Passez à un plan payant pour plus d’avantages.",
  creator: "Formations illimitées, statistiques détaillées et support prioritaire.",
  pro: "Tout Creator + boost illimité, badge Pro et visibilité maximale.",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
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

  const params = await searchParams;
  const checkoutStatus = params.checkout;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Facturation</h1>
        <p className="text-white/60">
          Gérez votre abonnement et vos avantages.
        </p>
      </div>

      {checkoutStatus === "success" && (
        <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Paiement réussi. Votre abonnement est actif.
        </div>
      )}
      {checkoutStatus === "cancel" && (
        <div className="rounded-2xl border border-white/20 bg-card px-4 py-3 text-sm text-white/80">
          Paiement annulé. Vous pouvez choisir un plan plus tard.
        </div>
      )}

      {/* Plan actuel */}
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <p className="text-sm text-white/60">Plan actuel</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-xl px-3 py-1.5 text-lg font-semibold ${
              planId === "pro"
                ? "bg-accent/20 text-accent"
                : planId === "creator"
                  ? "bg-accent/10 text-accent-light"
                  : "bg-white/10 text-white/90"
            }`}
          >
            {PLAN_LABELS[planId] ?? planId}
          </span>
        </div>
        <p className="mt-3 text-sm text-white/70">
          {PLAN_DESC[planId]}
        </p>
      </div>

      {/* Plans disponibles selon la situation */}
      {planId === "free" && (
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="text-lg font-semibold text-white">
            Choisir un plan
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Débloquez plus de fonctionnalités pour vos formations.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-primary p-5">
              <p className="font-semibold text-white">Creator</p>
              <p className="mt-1 text-2xl font-bold text-white">10 €<span className="text-sm font-normal text-white/60">/mois</span></p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>• Formations illimitées</li>
                <li>• Statistiques de ventes</li>
                <li>• Support par email</li>
              </ul>
              <SubscribeButtons showCreator className="mt-4" />
            </div>
            <div className="rounded-xl border-2 border-accent/50 bg-primary p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-accent">Recommandé</p>
              <p className="mt-1 font-semibold text-white">Pro</p>
              <p className="mt-1 text-2xl font-bold text-white">30 €<span className="text-sm font-normal text-white/60">/mois</span></p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>• Tout Creator</li>
                <li>• Boosts illimités</li>
                <li>• Badge Pro + visibilité</li>
              </ul>
              <SubscribeButtons showPro className="mt-4" />
            </div>
          </div>
        </div>
      )}

      {planId === "creator" && (
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="text-lg font-semibold text-white">
            Passer au plan Pro
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Boosts illimités, badge Pro et visibilité maximale.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <p className="text-xl font-bold text-white">30 €<span className="text-sm font-normal text-white/60">/mois</span></p>
            <SubscribeButtons showPro />
          </div>
        </div>
      )}

      {planId === "pro" && (
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-2xl">
              ✓
            </div>
            <h2 className="mt-3 text-lg font-semibold text-white">
              Vous êtes sur le plan maximum
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Profitez de tous les avantages Pro. Une question ? Consultez le support.
            </p>
            <Link
              href="/dashboard/support"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Support
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Lien retour */}
      <div className="pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
