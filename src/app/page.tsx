import Link from "next/link";

const check = (
  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
    ✓
  </span>
);

export default function Home() {
  return (
    <div className="hero-cosmic">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/70 border border-white/15">
            Marketplace de formations professionnelles
          </p>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
            Vendez et trouvez vos formations en ligne en toute simplicité.
          </h1>

          <p className="text-lg text-white/70 leading-relaxed">
            Formio est une plateforme sécurisée qui met en relation créateurs de
            formations et apprenants, avec paiement et accès automatisés.
          </p>

          <ul className="space-y-3 text-white/90">
            <li className="flex items-center gap-3">
              {check}
              <span>Publiez vos formations et commencez à vendre</span>
            </li>
            <li className="flex items-center gap-3">
              {check}
              <span>Gérez vos ventes et consultez vos revenus en un coup d&apos;œil.</span>
            </li>
            <li className="flex items-center gap-3">
              {check}
              <span>Payez en toute sécurité et accédez instantanément aux formations.</span>
            </li>
          </ul>

          <div className="flex flex-wrap gap-4">
            <Link className="button-primary" href="/auth/register">
              Créer un compte
            </Link>
            <Link className="button-secondary" href="/auth/login">
              Se connecter
            </Link>
          </div>

          <p className="text-sm text-white/60">
            Vous avez déjà un compte ?{" "}
            <Link href="/auth/login" className="font-medium text-accent hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Mock dashboard preview */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:p-8">
          <p className="text-sm text-white/50 mb-4">Aperçu tableau de bord</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Ventes aujourd&apos;hui</p>
              <p className="text-xl font-bold text-white">25</p>
              <p className="text-xs text-emerald-400">↑ +1.9%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Revenus aujourd&apos;hui</p>
              <p className="text-xl font-bold text-white">1 250 €</p>
              <p className="text-xs text-emerald-400">↑ +1.9%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Ventes ce mois</p>
              <p className="text-xl font-bold text-white">347</p>
              <p className="text-xs text-emerald-400">↑ +1.9%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Total des revenus</p>
              <p className="text-xl font-bold text-white">12 580 €</p>
              <p className="text-xs text-emerald-400">↑ +1.9%</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50 mb-2">Statistiques de ventes · 7 jours</p>
            <div className="flex h-20 items-end gap-1">
              {[65, 45, 80, 55, 70, 60, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-accent/40"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-white/50">Mes formations</p>
            <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="h-10 w-14 rounded bg-white/10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">Montage vidéo</p>
                <p className="text-xs text-white/50">1 Vente : 120 €</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
