import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();

  // 1️⃣ Vérifier la session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect("/auth/login");
  }

  // 2️⃣ Lire les données du formulaire
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const video_url = formData.get("video_url") as string | null;
  const pdf_url = formData.get("pdf_url") as string | null;
  const category = formData.get("category") as string;

  // 3️⃣ Vérifier que le cours appartient à l’utilisateur
  const { data: course } = await supabase
    .from("courses")
    .select("author_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!course || course.author_id !== session.user.id) {
    return NextResponse.redirect("/dashboard");
  }

  // 4️⃣ Mise à jour
  await supabase
    .from("courses")
    .update({
      title,
      description,
      price_cents: price * 100,
      video_url: video_url || null,
      pdf_url: pdf_url || null,
      category,
    })
    .eq("id", params.id);

  // 5️⃣ Redirection après succès
  return NextResponse.redirect(
    new URL(`/dashboard`, req.url)
  );
}
