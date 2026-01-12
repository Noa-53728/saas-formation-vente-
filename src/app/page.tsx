export default function Home() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 items-center">
      <div className="space-y-6">
        <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/70 border border-white/15">
          Marketplace de formations professionnelles
        </p>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          Vendez et trouvez des formations vidéo + PDF en toute confiance.
        </h1>

        <p className="text-lg text-white/70 leading-relaxed">
          Formio est une plateforme sécurisée qui met en relation créateurs de
          formations et apprenants, avec paiement et accès automatisés.
        </p>

        <div className="flex flex-wrap gap-4">
          <a className="button-primary" href="/auth/register">
            Créer un compte
          </a>
          <a className="button-secondary" href="/auth/login">
            Se connecter
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
          <div className="card">
            <p className="text-2xl font-semibold text-white">Pour les créateurs</p>
            <p className="mt-2">
              Publiez vos formations rapidement, gérez vos ventes et encaissez en
              toute sécurité.
            </p>
          </div>

          <div className="card">
            <p className="text-2xl font-semibold text-white">Pour les apprenants</p>
            <p className="mt-2">
              Échangez avec le vendeur, payez en toute confiance et accédez
              instantanément au contenu.
            </p>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <p className="text-sm text-white/60">Aperçu rapide</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between border border-white/10 rounded-lg p-4">
            <div>
              <p className="font-semibold">Publiez votre formation</p>
              <p className="text-white/60 text-sm">
                Titre, description, prix, vidéo, documents.
              </p>
            </div>
            <span className="text-accent font-semibold">+ 15 min</span>
          </div>

          <div className="flex items-center justify-between border border-white/10 rounded-lg p-4">
            <div>
              <p className="font-semibold">Paiement sécurisé</p>
              <p className="text-white/60 text-sm">
                Checkout fiable avec validation automatique.
              </p>
            </div>
            <span className="text-accent font-semibold">sécurisé</span>
          </div>

          <div className="flex items-center justify-between border border-white/10 rounded-lg p-4">
            <div>
              <p className="font-semibold">Accès immédiat</p>
              <p className="text-white/60 text-sm">
                Le contenu est disponible dès l’achat, sans intervention manuelle.
              </p>
            </div>
            <span className="text-accent font-semibold">automatique</span>
          </div>
        </div>

        <p className="text-white/70 text-sm">
          Formio est conçu pour offrir une expérience simple, fiable et
          professionnelle, aussi bien pour vendre que pour apprendre.
        </p>
      </div>
    </div>
  );
}
