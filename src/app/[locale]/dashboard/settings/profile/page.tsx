import { Link, redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AvatarUpload from "@/components/dashboard/AvatarUpload";

async function updateProfileAction(formData: FormData) {
  "use server";

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect({ href: "/auth/login" });

  const fullName = (formData.get("full_name") as string)?.trim() ?? "";
  const bio = (formData.get("bio") as string)?.trim() || null;
  const avatarUrl = (formData.get("avatar_url") as string)?.trim() || null;
  const isSeller = formData.get("is_seller") === "on";

  if (!fullName) {
    redirect({ href: "/dashboard/settings/profile?error=name" });
  }

  await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      bio,
      avatar_url: avatarUrl,
      is_seller: isSeller,
    })
    .eq("id", user.id);

  redirect({ href: "/dashboard/settings/profile?updated=1" });
}

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect({ href: "/auth/login" });

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("full_name, bio, is_seller, avatar_url, is_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) {
    return (
      <div className="card">
        <p className="font-semibold">Erreur chargement du profil</p>
        <pre className="text-xs whitespace-pre-wrap mt-3 text-red-200">
          {profileErr.message}
        </pre>
      </div>
    );
  }

  const params = await searchParams;
  const showSuccess = params.updated === "1";
  const showNameError = params.error === "name";

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
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Profil</h1>
        <p className="mt-1 text-white/60">
          Nom, bio, photo et statut vendeur. Visible sur vos formations.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        {showSuccess && (
          <p className="mb-4 text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">
            Profil enregistré.
          </p>
        )}

        {showNameError && (
          <p className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
            Le nom d&apos;utilisateur est obligatoire.
          </p>
        )}

        <form action={updateProfileAction} className="space-y-4 max-w-md">
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Nom d&apos;utilisateur <span className="text-red-400">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              minLength={1}
              defaultValue={profile?.full_name ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
              placeholder="Votre nom ou pseudo"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Bio <span className="text-white/50">(optionnel)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={500}
              defaultValue={profile?.bio ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-accent resize-y"
              placeholder="Présentez-vous en quelques lignes (formation, expérience…). Visible sur vos fiches formation."
            />
            <p className="mt-1 text-xs text-white/50">Maximum 500 caractères.</p>
          </div>

          <AvatarUpload
            userId={user.id}
            currentAvatarUrl={profile?.avatar_url ?? null}
          />
          <div>
            <label
              htmlFor="avatar_url"
              className="block text-sm font-medium text-white/80 mb-1 mt-4"
            >
              Ou avec un lien <span className="text-white/50">(optionnel)</span>
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              defaultValue={profile?.avatar_url ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
              placeholder="https://exemple.com/ma-photo.jpg"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_seller"
              name="is_seller"
              type="checkbox"
              defaultChecked={profile?.is_seller ?? false}
              className="rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
            />
            <label
              htmlFor="is_seller"
              className="text-sm text-white/80"
            >
              Je suis vendeur (je publie des formations)
            </label>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
            <span className="font-medium text-white/90">Badge vérifié :</span>{" "}
            {profile?.is_verified ? (
              <span className="text-success">Oui — visible par les acheteurs</span>
            ) : (
              <span>Non — attribué par Formio pour renforcer la confiance</span>
            )}
          </div>

          <button type="submit" className="button-primary">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
