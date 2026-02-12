import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { MessageComposer } from "../../components/MessageComposer";
import { ConversationMessages } from "../../components/ConversationMessages";

export default async function ConversationPage({
  params
}: {
  params: { courseId: string; partnerId: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  /* 🔎 Charger le cours (optionnel : peut être masqué par RLS ou supprimé) */
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, author_id")
    .eq("id", params.courseId)
    .maybeSingle();

  const courseTitle = course?.title ?? "Conversation";

  /* 🔎 Nom du partenaire */
  const { data: partner } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", params.partnerId)
    .maybeSingle();

  /* 💬 Récupération DES messages de la conversation */
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, receiver_id")
    .eq("course_id", params.courseId)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${params.partnerId}),
       and(sender_id.eq.${params.partnerId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  /* 👁️ Marquer comme lus les messages reçus */
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("course_id", params.courseId)
    .eq("receiver_id", userId)
    .eq("sender_id", params.partnerId);

  return (
    <div className="space-y-6">
      <div className="card space-y-1">
        <p className="text-xs uppercase tracking-wide text-accent font-semibold">
          Messagerie
        </p>
        <h1 className="text-2xl font-semibold">{courseTitle}</h1>
        <p className="text-sm text-white/60">
          Avec {partner?.full_name ?? "Contact"}
        </p>
      </div>

      <div className="card space-y-4">
        <ConversationMessages
          initialMessages={messages ?? []}
          currentUserId={userId}
          courseId={params.courseId}
          partnerId={params.partnerId}
        />

        <MessageComposer
          courseId={params.courseId}
          receiverId={params.partnerId}
          placeholder="Écrire un message…"
        />
      </div>
    </div>
  );
}
