import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, sellerId } = await req.json();

  if (!courseId || !sellerId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const buyerId = session.user.id;

  // 🔍 Vérifier si une conversation existe déjà
  const { data: existingConversation, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("course_id", courseId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (convErr) {
    return NextResponse.json({ error: convErr.message }, { status: 400 });
  }

  // 👉 Rediriger directement si existe
  if (existingConversation) {
    return NextResponse.json({
      redirect: `/messages/${courseId}/${sellerId}`,
    });
  }

  // ✉️ Créer la conversation (le premier vrai message sera saisi par l'utilisateur)
  const { error: createConvErr } = await supabase
    .from("conversations")
    .insert({
      course_id: courseId,
      buyer_id: buyerId,
      seller_id: sellerId,
    });

  if (createConvErr) {
    return NextResponse.json({ error: createConvErr.message }, { status: 400 });
  }

  return NextResponse.json({
    redirect: `/messages/${courseId}/${sellerId}`,
  });
}
