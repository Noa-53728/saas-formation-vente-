import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formio | Vendez et achetez vos formations",
  description: "Une plateforme simple pour vendre et acheter des formations vidéo + PDF"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/30 border border-accent/60 flex items-center justify-center text-lg font-bold text-white">
                F
              </div>
              <div>
                <p className="text-xl font-semibold">Formio</p>
                <p className="text-sm text-white/60">Formations vidéo + PDF</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <a className="button-secondary" href="/auth/login">
                Se connecter
              </a>
              <a className="button-primary" href="/auth/register">
                Créer un compte
              </a>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
