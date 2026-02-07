import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Header() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <header className="flex items-center justify-between mb-12">
      <Link href="/" className="flex items-center">
        <img src="/logo-formio.png" alt="Formio" className="h-10 w-auto" />
      </Link>

      {!isLoggedIn && (
        <div className="flex items-center gap-3 text-sm">
          <Link className="button-secondary" href="/auth/login">Se connecter</Link>
          <Link className="button-primary" href="/auth/register">Créer un compte</Link>
        </div>
      )}
    </header>
  );
}
