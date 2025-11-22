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

  if (!session) {
    redirect("/auth/login");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, author_id, profiles(full_name)")
    .eq("id", params.courseId)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const userId = session.user.id;
  const { data: partner } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", params.partnerId)
    .maybeSingle();

  const isAuthor = userId === course.author_id;
  const talksToAuthor = params.partnerId === course.author_id;

  if (!isAuthor && !talksToAuthor) {
    redirect("/messages");
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, receiver_id")
    .eq("course_id", params.courseId)
    .order("created_at", { ascending: true });

  const thread = (messages || []).filter(
    (message) =>
      (message.sender_id === userId && message.receiver_id === params.partnerId) ||
      (message.sender_id === params.partnerId && message.receiver_id === userId)
  );

  return (
    <div className="space-y-6">
      <div className="card space-y-1">
        <p className="text-xs uppercase tracking-wide text-accent font-semibold">Messagerie</p>
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-white/60">Avec {partner?.full_name ?? "contact"}</p>
      </div>

      <div className="card space-y-4">
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {thread.length === 0 ? (
            <p className="text-sm text-white/60">Aucun message pour l&apos;instant.</p>
          ) : (
            thread.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg border px-3 py-2 text-sm shadow transition ${
                    message.sender_id === userId
                      ? "bg-accent text-white border-accent/80"
                      : "bg-white/5 border-white/10 text-white"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
                  <p className="mt-1 text-[11px] opacity-70">{new Date(message.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <MessageComposer
          courseId={params.courseId}
          receiverId={userId === course.author_id ? params.partnerId : course.author_id}
          placeholder="Posez une question au vendeur ou répondez à votre client"
        />
      </div>
    </div>
  );
}
