import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Formio | Vendez et achetez vos formations",
  description: "Une plateforme simple pour vendre et acheter des formations vidéo + PDF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
