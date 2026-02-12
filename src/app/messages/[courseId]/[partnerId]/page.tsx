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

  if (!session) {
    // On laisse le layout global gérer la redirection si besoin,
    // ici on renvoie simplement rien pour éviter une erreur.
    return null;
  }

  const userId = session.user.id;

  /* 🔎 Charger le cours (optionnel : peut être masqué par RLS ou supprimé) */
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, author_id")
    .eq("id", params.courseId)
    .maybeSingle();

  const courseTitle = course?.title ?? "Conversation";
  const sellerId = course?.author_id ?? params.partnerId;

  // Déterminer les rôles dans la conversation
  const isSeller = userId === sellerId;
  const buyerId = isSeller ? params.partnerId : userId;

  /* 🔎 Charger / créer la conversation pour (course, buyer, seller) */
  const { data: existingConversation, error: convErr } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("course_id", params.courseId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (convErr) {
    throw new Error(convErr.message);
  }

  let conversationId = existingConversation?.id as string | undefined;

  if (!conversationId) {
    const { data: newConversation, error: createConvErr } = await supabase
      .from("conversations")
      .insert({
        course_id: params.courseId,
        buyer_id: buyerId,
        seller_id: sellerId,
      })
      .select("id, buyer_id, seller_id")
      .single();

    if (createConvErr || !newConversation) {
      throw new Error(
        createConvErr?.message || "Impossible de créer la conversation",
      );
    }

    conversationId = newConversation.id;
  }

  /* 🔎 Nom du partenaire */
  const partnerId = isSeller ? buyerId : sellerId;

  const { data: partner } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", partnerId)
    .maybeSingle();

  /* 💬 Récupération DES messages de la conversation */
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, conversation_id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  /* 👁️ Marquer comme lus les messages reçus */
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId);

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
          conversationId={conversationId}
        />

        <MessageComposer
          conversationId={conversationId}
          placeholder="Écrire un message…"
        />
      </div>
    </div>
  );
}
