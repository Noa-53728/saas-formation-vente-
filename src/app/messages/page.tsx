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

// 🔥 Normalise sender/receiver (objet OU tableau Supabase)
const normalizeUser = (u: any) => {
  if (!u) return null;
  return Array.isArray(u) ? u[0] : u;
};

export default async function MessagesPage() {
  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    redirect("/auth/login");
  }

  const { data: rows } = await supabase
    .from("messages")
    .select(
      "id, content, created_at, course_id, sender_id, receiver_id, courses(title), sender:profiles!messages_sender_id_fkey(full_name), receiver:profiles!messages_receiver_id_fkey(full_name)"
    )
    .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
    .order("created_at", { ascending: false });

  const conversations = new Map<string, ConversationPreview>();

  rows?.forEach((row: any) => {
    const sender = normalizeUser(row.sender);
    const receiver = normalizeUser(row.receiver);

    const partnerId =
      row.sender_id === session.user.id ? row.receiver_id : row.sender_id;

    const partnerName =
      row.sender_id === session.user.id
        ? receiver?.full_name
        : sender?.full_name;

    // ✅ ICI on gère le fait que "courses" est un tableau
    let courseTitle = "Formation";
    if (Array.isArray(row.courses)) {
      courseTitle = row.courses[0]?.title ?? "Formation";
    } else if (row.courses?.title) {
      courseTitle = row.courses.title;
    }

    const key = `${row.course_id}-${partnerId}`;

    if (!conversations.has(key)) {
      conversations.set(key, {
        id: row.id,
        course_id: row.course_id,
        course_title: courseTitle,
        partner_id: partnerId,
        partner_name: partnerName || "Contact",
        last_message: row.content,
        created_at: row.created_at
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

