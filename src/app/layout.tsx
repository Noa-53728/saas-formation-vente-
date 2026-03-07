import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formio | Vendez et achetez vos formations",
  description: "Une plateforme simple pour vendre et acheter des formations vidéo + PDF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
