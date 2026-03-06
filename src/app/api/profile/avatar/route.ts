import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { avatar_url?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const avatarUrl =
    typeof body.avatar_url === "string" ? body.avatar_url.trim() || null : null;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Erreur mise à jour profil" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
