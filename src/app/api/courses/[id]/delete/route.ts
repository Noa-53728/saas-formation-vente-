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

  // 2️⃣ Vérifier que le cours appartient à l'utilisateur
  const { data: course } = await supabase
    .from("courses")
    .select("author_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!course || course.author_id !== session.user.id) {
    return NextResponse.redirect("/dashboard");
  }

  // 3️⃣ Supprimer le cours
  await supabase
    .from("courses")
    .delete()
    .eq("id", params.id);

  // 4️⃣ Redirection
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
