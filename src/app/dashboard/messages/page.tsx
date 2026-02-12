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

  // 1) Récupérer les cours dont l'utilisateur est l'auteur
  const { data: myCourses, error: coursesErr } = await supabase
    .from("courses")
    .select("id, title, author_id")
    .eq("author_id", userId);

  if (coursesErr) {
    return (
      <div className="card">
        <p className="font-semibold">Erreur chargement des cours</p>
        <pre className="text-xs whitespace-pre-wrap mt-3">
          {JSON.stringify(coursesErr, null, 2)}
        </pre>
      </div>
    );
  }

  const courseIds = (myCourses ?? []).map((c) => c.id);
  const titleById = new Map((myCourses ?? []).map((c) => [c.id, c.title]));

  if (courseIds.length === 0) {
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

  // 2) Récupérer les messages liés à ces cours
  const { data: rows, error: messagesErr } = await supabase
    .from("messages")
    .select("id, content, created_at, course_id, sender_id, receiver_id")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });

  if (messagesErr) {
    return (
      <div className="card">
        <p className="font-semibold">Erreur chargement des messages</p>
        <pre className="text-xs whitespace-pre-wrap mt-3">
          {JSON.stringify(messagesErr, null, 2)}
        </pre>
      </div>
    );
  }

  const messages = rows ?? [];

  // 2b) Récupérer les noms des partenaires
  const partnerIdSet = new Set<string>();

  messages.forEach((row) => {
    const isSenderMe = row.sender_id === userId;
    const isReceiverMe = row.receiver_id === userId;
    if (!isSenderMe && !isReceiverMe) return;

    const partnerId = isSenderMe ? row.receiver_id : row.sender_id;
    if (partnerId) {
      partnerIdSet.add(partnerId);
    }
  });

  let nameById = new Map<string, string>();

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

  // 3) Construire les conversations (1 par cours + partenaire)
  const conversations = new Map<string, ConversationPreview>();

  messages.forEach((row: any) => {
    // Dans le contexte vendeur, partner = l'autre personne que moi
    const isSenderMe = row.sender_id === userId;
    const isReceiverMe = row.receiver_id === userId;

    // Par sécurité, ignorer les messages où je ne suis ni sender ni receiver
    if (!isSenderMe && !isReceiverMe) return;

    const partnerId = isSenderMe ? row.receiver_id : row.sender_id;
    const partnerName = nameById.get(partnerId) || "Contact";

    const courseTitle = titleById.get(row.course_id) ?? "Formation";
    const key = `${row.course_id}-${partnerId}`;

    if (!conversations.has(key)) {
      conversations.set(key, {
        id: row.id,
        course_id: row.course_id,
        course_title: courseTitle,
        partner_id: partnerId,
        partner_name: partnerName,
        last_message: row.content,
        created_at: row.created_at,
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

