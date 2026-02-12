import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface ConversationPreview {
  id: string;
  course_id: string;
  course_title: string;
  partner_id: string;
  partner_name: string;
  last_message: string;
  created_at: string;
}

export default async function MessagesPage() {
  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  // 1) Récupérer toutes les conversations où je suis impliqué (buyer ou seller)
  const { data: conversationsRows, error: convErr } = await supabase
    .from("conversations")
    .select("id, course_id, buyer_id, seller_id")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (convErr) {
    return (
      <div className="card">
        <p className="font-semibold">Erreur chargement des conversations</p>
        <pre className="text-xs whitespace-pre-wrap mt-3">
          {JSON.stringify(convErr, null, 2)}
        </pre>
      </div>
    );
  }

  const conversationsRowsSafe = conversationsRows ?? [];

  // 2) Récupérer les titres de formations et les noms des partenaires
  const courseIdSet = new Set<string>();
  const partnerIdSet = new Set<string>();

  conversationsRowsSafe.forEach((row) => {
    courseIdSet.add(row.course_id);

    const isBuyerMe = row.buyer_id === userId;
    const isSellerMe = row.seller_id === userId;
    if (!isBuyerMe && !isSellerMe) return;

    const partnerId = isBuyerMe ? row.seller_id : row.buyer_id;
    if (partnerId) partnerIdSet.add(partnerId);
  });

  let courseTitleById = new Map<string, string>();
  let nameById = new Map<string, string>();

  if (courseIdSet.size > 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title")
      .in("id", Array.from(courseIdSet));

    if (courses) {
      courseTitleById = new Map(
        courses.map((c: any) => [c.id as string, (c.title as string) ?? ""]),
      );
    }
  }

  if (partnerIdSet.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(partnerIdSet));

    if (profiles) {
      nameById = new Map(
        profiles.map((p: any) => [
          p.id as string,
          (p.full_name as string) ?? "",
        ]),
      );
    }
  }

  // 3) Récupérer le dernier message par conversation
  const conversationIds = conversationsRowsSafe.map((row) => row.id);

  let lastMessageByConversation = new Map<string, { content: string; created_at: string }>();

  if (conversationIds.length > 0) {
    const { data: lastMessages } = await supabase
      .from("messages")
      .select("id, content, created_at, conversation_id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    (lastMessages ?? []).forEach((m: any) => {
      if (!lastMessageByConversation.has(m.conversation_id)) {
        lastMessageByConversation.set(m.conversation_id, {
          content: m.content as string,
          created_at: m.created_at as string,
        });
      }
    });
  }

  // 4) Construire les conversations (1 par cours + partenaire)
  const conversations = new Map<string, ConversationPreview>();

  conversationsRowsSafe.forEach((row: any) => {
    const isBuyerMe = row.buyer_id === userId;
    const isSellerMe = row.seller_id === userId;

    if (!isBuyerMe && !isSellerMe) return;

    const partnerId = isBuyerMe ? row.seller_id : row.buyer_id;
    const partnerName = nameById.get(partnerId) || "Contact";

    const courseTitle = courseTitleById.get(row.course_id) ?? "Formation";
    const key = `${row.course_id}-${partnerId}`;

    if (!conversations.has(key)) {
      const last = lastMessageByConversation.get(row.id) ?? {
        content: "",
        created_at: row.created_at as string,
      };

      conversations.set(key, {
        id: row.id,
        course_id: row.course_id,
        course_title: courseTitle,
        partner_id: partnerId,
        partner_name: partnerName,
        last_message: last.content,
        created_at: last.created_at,
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="text-sm text-white/60">Messagerie</p>
        <h1 className="text-2xl font-semibold mt-2">Conversations</h1>
        <p className="text-sm text-white/60">
          Discutez avec les vendeurs ou vos clients avant d&apos;acheter.
        </p>
      </div>

      {conversations.size === 0 ? (
        <div className="card text-sm text-white/70">
          Aucune conversation pour le moment.
        </div>
      ) : (
        <div className="grid gap-3">
          {[...conversations.values()].map((conversation) => (
            <a
              key={conversation.id}
              href={`/messages/${conversation.course_id}/${conversation.partner_id}`}
              className="block rounded-lg border border-white/10 bg-white/5 p-4 hover:border-accent/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/60">
                    {conversation.course_title}
                  </p>
                  <p className="text-lg font-semibold">
                    {conversation.partner_name}
                  </p>
                  <p className="text-sm text-white/60 line-clamp-1">
                    {conversation.last_message}
                  </p>
                </div>
                <span className="text-xs text-accent">Ouvrir</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}


