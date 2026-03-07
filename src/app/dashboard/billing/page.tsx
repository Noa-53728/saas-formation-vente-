import Link from "next/link";
import { redirect } from "next/navigation";
import SubscribeButtons from "./SubscribeButtons";
import ConnectPayoutButton from "./ConnectPayoutButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function updatePaypalEmailAction(formData: FormData) {
  "use server";
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const email = (formData.get("paypal_email") as string)?.trim() || null;
  await supabase
    .from("profiles")
    .update({ paypal_email: email })
    .eq("id", user.id);
  redirect("/dashboard/billing?paypal=updated");
}

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
  searchParams: Promise<{ checkout?: string; connect?: string; paypal?: string }>;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let planId: "free" | "creator" | "pro" = "free";
  let stripeConnectAccountId: string | null = null;
  let paypalEmail: string | null = null;

  if (user) {
    const [{ data: sub }, { data: profile }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan_id, status")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("stripe_connect_account_id, paypal_email")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (sub && ["active", "trialing"].includes(sub.status)) {
      planId = sub.plan_id as "free" | "creator" | "pro";
    }
    stripeConnectAccountId = profile?.stripe_connect_account_id ?? null;
    paypalEmail = profile?.paypal_email ?? null;
  }

  const params = await searchParams;
  const checkoutStatus = params.checkout;
  const connectStatus = params.connect;

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
      {connectStatus === "success" && (
        <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Compte bancaire configuré. Vous recevrez les paiements des ventes sur ce compte.
        </div>
      )}
      {connectStatus === "refresh" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          Le lien a expiré. Cliquez à nouveau sur « Configurer mon compte bancaire » pour continuer.
        </div>
      )}
      {params.paypal === "updated" && (
        <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Adresse PayPal enregistrée.
        </div>
      )}

      {/* Recevoir les paiements : compte bancaire (Stripe) et PayPal */}
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="text-lg font-semibold text-white">
          Recevoir les paiements des ventes
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Choisissez au moins une option : compte bancaire (Stripe) et/ou PayPal.
        </p>

        <div className="mt-6 space-y-6">
          {/* Option 1 : Compte bancaire Stripe */}
          <div>
            <h3 className="text-sm font-medium text-white/90">Compte bancaire (Stripe)</h3>
            {stripeConnectAccountId ? (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3">
                <span className="text-success">✓</span>
                <p className="text-sm text-white/90">
                  Compte bancaire configuré. Les virements vous seront versés selon les délais Stripe.
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <ConnectPayoutButton />
              </div>
            )}
          </div>

          {/* Option 2 : PayPal */}
          <div>
            <h3 className="text-sm font-medium text-white/90">Recevoir sur PayPal</h3>
            <p className="mt-1 text-xs text-white/50">
              Indiquez l’adresse email associée à votre compte PayPal pour recevoir vos revenus.
            </p>
            <form action={updatePaypalEmailAction} className="mt-3 flex flex-wrap items-end gap-3">
              <input
                type="email"
                name="paypal_email"
                defaultValue={paypalEmail ?? ""}
                placeholder="votre@email-paypal.com"
                className="min-w-[220px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Enregistrer
              </button>
            </form>
            {paypalEmail && (
              <p className="mt-2 text-xs text-success">
                PayPal enregistré : {paypalEmail}
              </p>
            )}
          </div>
        </div>
      </div>

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
                <li>• Statistiques détaillées (ventes, revenus)</li>
                <li>• Support prioritaire par email</li>
                <li>• Tableau de bord complet</li>
              </ul>
              <SubscribeButtons showCreator className="mt-4" />
            </div>
            <div className="rounded-xl border-2 border-accent/50 bg-primary p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-accent">Recommandé</p>
              <p className="mt-1 font-semibold text-white">Pro</p>
              <p className="mt-1 text-2xl font-bold text-white">30 €<span className="text-sm font-normal text-white/60">/mois</span></p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>• Tout Creator</li>
                <li>• Boosts illimités (mise en avant formations)</li>
                <li>• Badge Pro sur votre profil</li>
                <li>• Visibilité maximale dans la recherche</li>
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

      {/* Utilité des plans payants */}
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="text-lg font-semibold text-white">
          À quoi servent les plans payants ?
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Le plan <strong className="text-white">Gratuit</strong> vous permet de publier des formations et d’échanger avec les acheteurs. Les plans payants débloquent des outils pour vendre plus et mieux.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-primary p-4">
            <p className="font-semibold text-white">Creator (10 €/mois)</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>• <strong className="text-white/90">Statistiques avancées</strong> : ventes du jour, du mois, revenus, graphiques.</li>
              <li>• <strong className="text-white/90">Formations sans limite</strong> : publiez autant de formations que vous voulez.</li>
              <li>• <strong className="text-white/90">Support dédié</strong> : réponse prioritaire à vos questions.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-accent/20 bg-primary p-4">
            <p className="font-semibold text-white">Pro (30 €/mois)</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>• <strong className="text-white/90">Tout Creator</strong>, plus :</li>
              <li>• <strong className="text-white/90">Boosts illimités</strong> : mettez vos formations en avant autant que vous voulez (7 jours par boost).</li>
              <li>• <strong className="text-white/90">Badge Pro</strong> : rassurez les acheteurs et sortez en tête des résultats.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Facturation */}
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="text-lg font-semibold text-white">
          Questions fréquentes – Facturation
        </h2>
        <ul className="mt-4 space-y-4">
          <li className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
            <p className="font-medium text-white">Comment est facturé mon abonnement ?</p>
            <p className="mt-1 text-sm text-white/70">
              L’abonnement est prélevé chaque mois sur la carte enregistrée lors du checkout Stripe. Vous recevez un email de confirmation à chaque renouvellement.
            </p>
          </li>
          <li className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
            <p className="font-medium text-white">Puis-je annuler ou changer de plan ?</p>
            <p className="mt-1 text-sm text-white/70">
              Oui. Vous pouvez gérer ou annuler votre abonnement depuis votre tableau de bord Stripe (lien envoyé après le premier paiement) ou en nous contactant. Un changement de plan prend effet au prochain cycle.
            </p>
          </li>
          <li className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
            <p className="font-medium text-white">Comment recevoir les revenus des ventes ?</p>
            <p className="mt-1 text-sm text-white/70">
              Vous pouvez configurer un compte bancaire (Stripe) et/ou une adresse PayPal dans la section « Recevoir les paiements des ventes » ci-dessus. Les virements bancaires passent par Stripe ; les versements PayPal peuvent être effectués sur l’adresse enregistrée.
            </p>
          </li>
          <li>
            <p className="font-medium text-white">Une autre question ?</p>
            <p className="mt-1 text-sm text-white/70">
              Consultez le <Link href="/dashboard/support" className="text-accent hover:underline">Support</Link> ou écrivez-nous à formio.forms@gmail.com.
            </p>
          </li>
        </ul>
      </div>

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
