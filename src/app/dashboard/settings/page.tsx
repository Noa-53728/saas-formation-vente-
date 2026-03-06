import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function updateProfileAction(formData: FormData) {
  "use server";

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const fullName = (formData.get("full_name") as string)?.trim() ?? "";
  const avatarUrl = (formData.get("avatar_url") as string)?.trim() || null;
  const isSeller = formData.get("is_seller") === "on";

  if (!fullName) {
    redirect("/dashboard/settings?error=name");
  }

  await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl,
      is_seller: isSeller,
    })
    .eq("id", user.id);

  redirect("/dashboard/settings?updated=1");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("full_name, is_seller, avatar_url")
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
      <div className="card">
        <p className="text-sm text-white/60">Dashboard</p>
        <h1 className="text-3xl font-semibold mt-2">Paramètres</h1>
        <p className="text-white/70 mt-2">
          Gérez votre profil et vos préférences de compte.
        </p>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-semibold">Profil</h2>

        {showSuccess && (
          <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">
            Profil enregistré.
          </p>
        )}

        {showNameError && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
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
              htmlFor="avatar_url"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Photo de profil <span className="text-white/50">(optionnel)</span>
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              defaultValue={profile?.avatar_url ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
              placeholder="https://exemple.com/ma-photo.jpg"
            />
            {profile?.avatar_url && (
              <p className="mt-2 text-xs text-white/50">
                Photo actuelle :{" "}
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="inline-block h-8 w-8 rounded-full object-cover align-middle"
                />
              </p>
            )}
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

          <button type="submit" className="button-primary">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
