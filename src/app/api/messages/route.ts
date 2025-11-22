import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const courseId = body?.courseId as string;
  const receiverId = body?.receiverId as string;
  const content = (body?.content as string)?.trim();

  if (!courseId || !receiverId || !content) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("author_id")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const userId = sessionData.session.user.id;

  // Autoriser : tout utilisateur peut écrire au vendeur (author_id) d'un cours.
  // Le vendeur peut répondre à un utilisateur précis (receiverId).
  const isTalkingToAuthor = receiverId === course.author_id;
  const isAuthorReplying = userId === course.author_id;
  if (!isTalkingToAuthor && !isAuthorReplying) {
    return NextResponse.json({ error: "Conversation non autorisée" }, { status: 403 });
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: userId,
    receiver_id: receiverId,
    course_id: courseId,
    content
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
