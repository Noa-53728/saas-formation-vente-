import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ConversationPreview = {
  id: string;
  course_id: string;
  course_title: string;
  partner_id: string;
  partner_name: string;
  last_message: string;
  created_at: string;
};

export default async function DashboardMessagesPage() {
  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  // 1) Récupérer les conversations où je suis le vendeur (seller)
  const { data: convRows, error: convErr } = await supabase
    .from("conversations")
    .select("id, course_id, buyer_id, seller_id")
    .eq("seller_id", userId)
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

  // 1b) Récupérer les cours concernés
  const courseIdSet = new Set<string>();
  const partnerIdSet = new Set<string>();

  convRowsSafe.forEach((row) => {
    courseIdSet.add(row.course_id);
    partnerIdSet.add(row.buyer_id); // côté vendeur, partner = buyer
  });

  let titleById = new Map<string, string>();
  if (courseIdSet.size > 0) {
    const { data: myCourses } = await supabase
      .from("courses")
      .select("id, title")
      .in("id", Array.from(courseIdSet));

    if (myCourses) {
      titleById = new Map(
        myCourses.map((c: any) => [c.id as string, (c.title as string) ?? ""]),
      );
    }
  }

  if (courseIdSet.size === 0) {
    return (
      <div className="card">
        <p className="text-sm text-white/60">Messagerie</p>
        <h1 className="text-2xl font-semibold mt-2">Messages</h1>
        <p className="text-sm text-white/60 mt-2">
          Vous n&apos;avez pas encore publié de formations, donc aucun message
          reçu.
        </p>
      </div>
    );
  }

  // 2b) Récupérer les noms des partenaires (buyers)
  const partnerIdArray = Array.from(partnerIdSet);

  let nameById = new Map<string, string>();

  if (partnerIdArray.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", partnerIdArray);

    if (profiles) {
      nameById = new Map(
        profiles.map((p: any) => [
          p.id as string,
          (p.full_name as string) ?? "",
        ]),
      );
    }
  }

  // 3) Récupérer le dernier message pour chaque conversation
  const conversationIds = convRowsSafe.map((c) => c.id);
  let lastMessageByConversation = new Map<
    string,
    { content: string; created_at: string }
  >();

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

  convRowsSafe.forEach((row: any) => {
    const partnerId = row.buyer_id as string;
    const partnerName = nameById.get(partnerId) || "Contact";

    const courseTitle = titleById.get(row.course_id) ?? "Formation";
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
        <p className="text-sm text-white/60">Dashboard</p>
        <h1 className="text-3xl font-semibold mt-2">Messages</h1>
        <p className="text-white/70 mt-2">
          Gérez vos conversations avec les clients intéressés par vos
          formations.
        </p>
      </div>

      {conversations.size === 0 ? (
        <div className="card text-sm text-white/70">
          Aucun message pour le moment.
        </div>
      ) : (
        <div className="grid gap-3">
          {[...conversations.values()].map((conversation) => (
            <Link
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

