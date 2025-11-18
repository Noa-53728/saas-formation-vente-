import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Formations en ligne | SaaS Next.js',
  description: 'Plateforme simple pour vendre et acheter des formations vidéo + PDF.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="site-header">
          <div className="container">
            <div className="brand">Formation SaaS</div>
            <nav className="nav">
              <a href="/">Accueil</a>
              <a href="/auth/login">Se connecter</a>
              <a className="primary" href="/auth/register">
                Créer un compte
              </a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">Construit avec Next.js 14, Supabase et Stripe.</div>
        </footer>
      </body>
    </html>
  );
}
