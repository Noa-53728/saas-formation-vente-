import { Link, redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect({ href: "/auth/login" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Paramètres</h1>
        <p className="text-white/60">
          Gérez votre compte, votre profil et vos préférences.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/settings/profile"
          className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-card p-6 transition hover:border-accent/30"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20 text-2xl text-accent">
            👤
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white group-hover:text-accent">
              Profil
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Nom d&apos;utilisateur, bio, photo de profil et statut vendeur. Visible sur vos fiches formation.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Modifier
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/billing"
          className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-card p-6 transition hover:border-accent/30"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20 text-2xl text-accent">
            💳
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white group-hover:text-accent">
              Abonnement & facturation
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Plan actuel, upgrade Creator ou Pro, et gestion du paiement.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Voir
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/settings/notifications"
          className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-card p-6 transition hover:border-accent/30"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20 text-2xl text-accent">
            🔔
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white group-hover:text-accent">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Messages, ventes et rappels. Choisissez ce que vous recevez.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Modifier
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/settings/security"
          className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-card p-6 transition hover:border-accent/30"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20 text-2xl text-accent">
            🔒
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white group-hover:text-accent">
              Sécurité
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Mot de passe et sécurisation du compte.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Modifier
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
