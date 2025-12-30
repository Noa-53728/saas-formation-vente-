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

  // 🔍 Vérifier si un message existe déjà (conversation existante)
  const { data: existing } = await supabase
    .from("messages")
    .select("id")
    .eq("course_id", courseId)
    .or(
      `and(sender_id.eq.${buyerId},receiver_id.eq.${sellerId}),
       and(sender_id.eq.${sellerId},receiver_id.eq.${buyerId})`
    )
    .limit(1)
    .maybeSingle();

  // 👉 Rediriger directement si existe
  if (existing) {
    return NextResponse.json({
      redirect: `/messages/${courseId}/${sellerId}`,
    });
  }

  // ✉️ Créer le premier message (vide informatif)
  await supabase.from("messages").insert({
    course_id: courseId,
    sender_id: buyerId,
    receiver_id: sellerId,
    content: "Bonjour, j’aimerais avoir plus d’informations sur votre formation."
  });

  return NextResponse.json({
    redirect: `/messages/${courseId}/${sellerId}`,
  });
}
