import { redirect } from "next/navigation";
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
    redirect("/auth/login");
  }

  const userId = session.user.id;

  /* 🔎 Charger le cours */
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, author_id")
    .eq("id", params.courseId)
    .maybeSingle();

  const courseTitle = course?.title ?? "Conversation";
  const sellerId = course?.author_id ?? params.partnerId;

  const isSeller = userId === sellerId;
  const buyerId = isSeller ? params.partnerId : userId;

  /* 🔎 Charger ou créer la conversation */
  const { data: existingConversation, error: convErr } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("course_id", params.courseId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (convErr) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-semibold">Erreur de chargement</h1>
        <p className="text-sm text-white/70">
          Impossible d&apos;ouvrir la conversation. Vérifiez que la table
          &quot;conversations&quot; existe dans Supabase avec les colonnes :
          id, course_id, buyer_id, seller_id.
        </p>
        <pre className="text-xs bg-black/30 rounded p-3 border border-red-500/40 text-red-200 overflow-auto">
          {convErr.message}
        </pre>
        <a href="/messages" className="text-sm text-accent hover:underline">
          ← Retour aux conversations
        </a>
      </div>
    );
  }

  let conversationId: string;

  if (existingConversation?.id) {
    conversationId = existingConversation.id;
  } else {
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
      return (
        <div className="card space-y-3">
          <h1 className="text-xl font-semibold">Erreur de création</h1>
          <p className="text-sm text-white/70">
            Impossible de créer la conversation. Vérifiez les politiques RLS sur
            la table &quot;conversations&quot; (insert autorisé pour buyer ou
            seller).
          </p>
          <pre className="text-xs bg-black/30 rounded p-3 border border-red-500/40 text-red-200 overflow-auto">
            {(createConvErr?.message ?? "Erreur inconnue")}
          </pre>
          <a href="/messages" className="text-sm text-accent hover:underline">
            ← Retour aux conversations
          </a>
        </div>
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
