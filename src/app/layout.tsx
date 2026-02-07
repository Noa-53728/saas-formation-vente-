import type { Metadata } from "next";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Formio | Vendez et achetez vos formations",
  description: "Une plateforme simple pour vendre et acheter des formations vidéo + PDF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session;

  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <header className="flex items-center justify-between mb-12">
          <a href="/" className="flex items-center">
           <img
              src="/logo-formio.png"
              alt="Formio"
              className="h-10 w-auto"
            />
          </a> 


            {/* 🔐 BOUTONS AUTH — seulement si non connecté */}
            {!isLoggedIn && (
              <div className="flex items-center gap-3 text-sm">
                <a className="button-secondary" href="/auth/login">
                  Se connecter
                </a>
                <a className="button-primary" href="/auth/register">
                  Créer un compte
                </a>
              </div>
            )}
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

