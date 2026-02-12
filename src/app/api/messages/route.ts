import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const conversationId = body?.conversationId as string;
  const content = (body?.content as string)?.trim();

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: "Champs manquants" },
      { status: 400 },
    );
  }

  const userId = sessionData.session.user.id;

  // Vérifier que l'utilisateur est bien participant à la conversation
  const { data: conversation, error: convErr } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id, course_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (convErr) {
    return NextResponse.json(
      { error: convErr.message },
      { status: 400 },
    );
  }

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation introuvable" },
      { status: 404 },
    );
  }

  const isParticipant =
    userId === conversation.buyer_id || userId === conversation.seller_id;

  if (!isParticipant) {
    return NextResponse.json(
      { error: "Conversation non autorisée" },
      { status: 403 },
    );
  }

  const insertPayload: {
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    course_id?: string;
  } = {
    conversation_id: conversationId,
    sender_id: userId,
    content,
    is_read: false,
  };

  // Si la table messages a encore une colonne course_id (FK vers courses), la remplir
  if (conversation.course_id) {
    insertPayload.course_id = conversation.course_id;
  }

  const { error } = await supabase.from("messages").insert(insertPayload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
