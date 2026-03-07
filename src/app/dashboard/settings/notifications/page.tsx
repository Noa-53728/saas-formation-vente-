import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function updateNotificationsAction(formData: FormData) {
  "use server";

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const notifyMessages = formData.get("notify_messages") === "on";
  const notifySales = formData.get("notify_sales") === "on";
  const notifyReminders = formData.get("notify_reminders") === "on";

  await supabase
    .from("profiles")
    .update({
      notify_messages: notifyMessages,
      notify_sales: notifySales,
      notify_reminders: notifyReminders,
    })
    .eq("id", user.id);

  redirect("/dashboard/settings/notifications?updated=1");
}

export default async function NotificationsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("notify_messages, notify_sales, notify_reminders")
    .eq("id", user.id)
    .maybeSingle();

  const params = await searchParams;
  const showSuccess = params.updated === "1";

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
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Notifications</h1>
        <p className="mt-1 text-white/60">
          Messages, ventes et rappels. Choisissez ce que vous souhaitez recevoir.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        {showSuccess && (
          <p className="mb-4 text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">
            Préférences enregistrées.
          </p>
        )}

        <form action={updateNotificationsAction} className="space-y-4 max-w-md">
          <div className="flex items-center gap-3">
            <input
              id="notify_messages"
              name="notify_messages"
              type="checkbox"
              defaultChecked={profile?.notify_messages ?? true}
              className="rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
            />
            <label htmlFor="notify_messages" className="text-sm text-white/80">
              Nouveaux messages (conversations avec acheteurs ou vendeurs)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="notify_sales"
              name="notify_sales"
              type="checkbox"
              defaultChecked={profile?.notify_sales ?? true}
              className="rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
            />
            <label htmlFor="notify_sales" className="text-sm text-white/80">
              Ventes (achats de vos formations)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="notify_reminders"
              name="notify_reminders"
              type="checkbox"
              defaultChecked={profile?.notify_reminders ?? true}
              className="rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
            />
            <label htmlFor="notify_reminders" className="text-sm text-white/80">
              Rappels (mises à jour, formations à compléter)
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
