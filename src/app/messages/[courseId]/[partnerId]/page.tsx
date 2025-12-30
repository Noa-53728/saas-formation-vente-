import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { MessageComposer } from "../../components/MessageComposer";

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

  /* 🔎 Charger le cours */
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, author_id")
    .eq("id", params.courseId)
    .maybeSingle();

  if (!course) notFound();

  /* 🔐 Sécurité : seulement auteur ↔ partenaire */
  if (
    userId !== course.author_id &&
    userId !== params.partnerId
  ) {
    redirect("/messages");
  }

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
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-white/60">
          Avec {partner?.full_name ?? "Contact"}
        </p>
      </div>

      <div className="card space-y-4">
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {!messages || messages.length === 0 ? (
            <p className="text-sm text-white/60">
              Aucun message pour l&apos;instant.
            </p>
          ) : (
            messages.map((message) => {
              const isMe = message.sender_id === userId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg border px-3 py-2 text-sm shadow ${
                      isMe
                        ? "bg-accent text-white border-accent/80"
                        : "bg-white/5 border-white/10 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className="mt-1 text-[11px] opacity-70">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <MessageComposer
          courseId={params.courseId}
          receiverId={params.partnerId}
          placeholder="Écrire un message…"
        />
      </div>
    </div>
  );
}
