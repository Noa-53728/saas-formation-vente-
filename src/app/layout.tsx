import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Formio | Vendez et achetez vos formations",
  description: "Une plateforme simple pour vendre et acheter des formations vidéo + PDF"
};

const signOut = async () => {
  "use server";
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="fr">
      <body className="antialiased bg-gradient-to-br from-[#0b1125] via-[#0b132e] to-[#0b1639] text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-accent/30 border border-accent/60 flex items-center justify-center text-lg font-bold text-white">
                  F
                </div>
                <div>
                  <p className="text-2xl font-semibold">Formio</p>
                  <p className="text-sm text-white/70">Vendez et achetez vos formations</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {session ? (
                  <>
                    <a className="button-secondary" href="/dashboard">
                      Dashboard
                    </a>
                    <a className="button-secondary" href="/messages">
                      Messages
                    </a>
                    <form action={signOut}>
                      <button type="submit" className="button-primary">
                        Se déconnecter
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <a className="button-secondary" href="/auth/login">
                      Se connecter
                    </a>
                    <a className="button-primary" href="/auth/register">
                      Créer un compte
                    </a>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
              <a className="rounded-lg border border-white/10 px-3 py-2 hover:border-accent/60" href="/">
                Accueil
              </a>
              <a className="rounded-lg border border-white/10 px-3 py-2 hover:border-accent/60" href="/courses/new">
                Publier une formation
              </a>
              <a className="rounded-lg border border-white/10 px-3 py-2 hover:border-accent/60" href="/dashboard">
                Vos tableaux de bord
              </a>
              <a className="rounded-lg border border-white/10 px-3 py-2 hover:border-accent/60" href="/messages">
                Messagerie
              </a>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
