import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
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
    redirect({ href: "/auth/login", locale: await getLocale() });
  }

  const userId = session!.user.id;

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

  /* 🔎 Nom du vendeur (auteur de la formation) — admin pour contourner RLS si besoin */
  const admin = createSupabaseAdminClient();
  const { data: sellerProfile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", sellerId)
    .maybeSingle();

  const sellerName = (sellerProfile?.full_name ?? "").trim() || "Vendeur";

  /* 💬 Récupération DES messages de la conversation */
  const { data: messages, error: messagesErr } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, conversation_id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesErr) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-semibold">Erreur chargement des messages</h1>
        <pre className="text-xs bg-black/30 rounded p-3 border border-red-500/40 text-red-200 overflow-auto">
          {messagesErr.message}
        </pre>
        <a href="/messages" className="text-sm text-accent hover:underline">
          ← Retour aux conversations
        </a>
      </div>
    );
  }

  /* 👁️ Marquer comme lus les messages reçus */
  const { error: readErr } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a
          href="/messages"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </a>
      </div>
      <div className="card space-y-1">
        <p className="text-xs uppercase tracking-wide text-accent font-semibold">
          Messagerie
        </p>
        <h1 className="text-2xl font-semibold">{courseTitle}</h1>
        <p className="text-sm text-white/60">
          Avec {sellerName}
        </p>
      </div>

      <div className="card space-y-4">
        {readErr ? (
          <p className="text-xs text-red-300">
            Impossible de marquer comme lus: {readErr.message}
          </p>
        ) : null}
        <ConversationMessages
          initialMessages={messages ?? []}
          currentUserId={userId}
          conversationId={conversationId}
        />

        <MessageComposer
          conversationId={conversationId}
          courseId={params.courseId}
          placeholder="Écrire un message…"
        />
      </div>
    </div>
  );
}
