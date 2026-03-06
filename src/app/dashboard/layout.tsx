import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

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
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const name = profile?.full_name ?? "Créateur";
  const avatarUrl = profile?.avatar_url ?? null;

  let unreadCount = 0;
  const { data: sellerConvs } = await supabase
    .from("conversations")
    .select("id")
    .eq("seller_id", userId);
  const convIds = (sellerConvs ?? []).map((c: { id: string }) => c.id);
  if (convIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .neq("sender_id", userId)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <DashboardSidebar unreadCount={unreadCount} />
      <section className="min-w-0 flex-1">
        <DashboardTopBar
          userName={name}
          userAvatarUrl={avatarUrl}
          notificationCount={unreadCount}
        />
        {children}
      </section>
    </div>
  );
}
