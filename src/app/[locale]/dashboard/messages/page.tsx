import { Link, redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ConversationPreview = {
  id: string;
  course_id: string;
  course_title: string;
  partner_id: string;
  partner_name: string;
  last_message: string;
  created_at: string;
  role: "seller" | "buyer"; // moi = vendeur (on me contacte) ou acheteur (j'ai contacté)
};

export default async function DashboardMessagesPage() {
  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    redirect({ href: "/auth/login" });
  }

  const userId = session.user.id;

  // 1) Récupérer TOUTES les conversations où je suis impliqué (vendeur OU acheteur)
  const { data: convRows, error: convErr } = await supabase
    .from("conversations")
    .select("id, course_id, buyer_id, seller_id, created_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (convErr) {
    return (
      <div className="card">
        <p className="font-semibold">Erreur chargement des messages</p>
        <pre className="text-xs whitespace-pre-wrap mt-3">
          {JSON.stringify(convErr, null, 2)}
        </pre>
      </div>
    );
  }

  const convRowsSafe = convRows ?? [];

  const courseIdSet = new Set<string>();
  const partnerIdSet = new Set<string>();

  convRowsSafe.forEach((row: { course_id: string; buyer_id: string; seller_id: string }) => {
    courseIdSet.add(row.course_id);
    const partnerId = row.buyer_id === userId ? row.seller_id : row.buyer_id;
    if (partnerId) partnerIdSet.add(partnerId);
  });

  // 2) Titres des formations (toutes les formations concernées, les miennes ou celles des autres)
  let titleById = new Map<string, string>();
  if (courseIdSet.size > 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title")
      .in("id", Array.from(courseIdSet));

    if (courses) {
      titleById = new Map(
        courses.map((c: { id: string; title: string | null }) => [
          c.id,
          (c.title ?? "") as string,
        ])
      );
    }
  }

  // 3) Noms des partenaires
  let nameById = new Map<string, string>();
  if (partnerIdSet.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(partnerIdSet));

    if (profiles) {
      nameById = new Map(
        profiles.map((p: { id: string; full_name: string | null }) => [
          p.id,
          (p.full_name ?? "") as string,
        ])
      );
    }
  }

  // 4) Dernier message par conversation
  const conversationIds = convRowsSafe.map((c: { id: string }) => c.id);
  const lastMessageByConversation = new Map<
    string,
    { content: string; created_at: string }
  >();

  if (conversationIds.length > 0) {
    const { data: lastMessages } = await supabase
      .from("messages")
      .select("id, content, created_at, conversation_id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    (lastMessages ?? []).forEach((m: { conversation_id: string; content: string; created_at: string }) => {
      if (!lastMessageByConversation.has(m.conversation_id)) {
        lastMessageByConversation.set(m.conversation_id, {
          content: m.content,
          created_at: m.created_at,
        });
      }
    });
  }

  // 5) Construire la liste (vendeur = on me contacte sur ma formation, acheteur = j'ai contacté pour une formation)
  const conversations = new Map<string, ConversationPreview>();

  convRowsSafe.forEach((row: { id: string; course_id: string; buyer_id: string; seller_id: string; created_at: string }) => {
    const isMeSeller = row.seller_id === userId;
    const partnerId = isMeSeller ? row.buyer_id : row.seller_id;
    const partnerName = nameById.get(partnerId) || "Contact";
    const courseTitle = titleById.get(row.course_id) ?? "Formation";
    const key = `${row.course_id}-${partnerId}`;

    if (!conversations.has(key)) {
      const last = lastMessageByConversation.get(row.id) ?? {
        content: "",
        created_at: row.created_at,
      };

      conversations.set(key, {
        id: row.id,
        course_id: row.course_id,
        course_title: courseTitle,
        partner_id: partnerId,
        partner_name: partnerName,
        last_message: last.content,
        created_at: last.created_at,
        role: isMeSeller ? "seller" : "buyer",
      });
    }
  });

  const list = [...conversations.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="text-sm text-white/60">Dashboard</p>
        <h1 className="text-3xl font-semibold mt-2">Messages</h1>
        <p className="text-white/70 mt-2">
          Conversations reçues sur vos formations et conversations avec les
          vendeurs des formations qui vous intéressent.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card text-sm text-white/70">
          <p>Aucun message pour le moment.</p>
          <p className="mt-2 text-white/50">
            Vous verrez ici les messages reçus sur vos formations, ainsi que les
            échanges avec les vendeurs lorsque vous les contactez.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.course_id}/${conversation.partner_id}`}
              className="block rounded-lg border border-white/10 bg-card p-4 hover:border-accent/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        conversation.role === "seller"
                          ? "bg-accent/20 text-accent"
                          : "bg-white/10 text-white/80"
                      }`}
                    >
                      {conversation.role === "seller"
                        ? "Reçu (ma formation)"
                        : "Contact vendeur"}
                    </span>
                    <span className="text-sm text-white/60 truncate">
                      {conversation.course_title}
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {conversation.partner_name}
                  </p>
                  <p className="text-sm text-white/60 line-clamp-1">
                    {conversation.last_message || "—"}
                  </p>
                </div>
                <span className="text-xs text-accent flex-shrink-0">Ouvrir</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
