import { getLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function changePasswordAction(formData: FormData) {
  "use server";
  const locale = await getLocale();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect({ href: "/auth/login", locale });
  const password = (formData.get("password") as string)?.trim() ?? "";
  const confirm = (formData.get("confirm") as string)?.trim() ?? "";
  if (!password || password.length < 6) redirect({ href: "/dashboard/settings/security?error=short", locale });
  if (password !== confirm) redirect({ href: "/dashboard/settings/security?error=mismatch", locale });
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect({ href: "/dashboard/settings/security?error=update", locale });
  redirect({ href: "/dashboard/settings/security?updated=1", locale });
}

export default async function SecuritySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect({ href: "/auth/login", locale: await getLocale() });

  const params = await searchParams;
  const showSuccess = params.updated === "1";
  const err = params.error;
  const errorMessage =
    err === "short"
      ? "Le mot de passe doit contenir au moins 6 caractères."
      : err === "mismatch"
        ? "Les deux mots de passe ne correspondent pas."
        : err === "update"
          ? "Impossible de mettre à jour le mot de passe. Réessayez."
          : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Paramètres
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Sécurité</h1>
        <p className="mt-1 text-white/60">
          Mot de passe et sécurisation du compte.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6 max-w-md">
        {showSuccess && (
          <p className="mb-4 text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">
            Mot de passe mis à jour.
          </p>
        )}
        {errorMessage && (
          <p className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        )}

        <form action={changePasswordAction} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Nouveau mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="button-primary">
            Changer le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
