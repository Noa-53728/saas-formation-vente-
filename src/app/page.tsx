export default function Home() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 items-center">
      <div className="space-y-6">
        <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/70 border border-white/15">
          vendre & acheter des formations de façon simple
        </p>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          Formio vous aide à vendre vos formations vidéo + PDF en quelques minutes.
        </h1>

        <p className="text-lg text-white/70 leading-relaxed">
          Créez une offre, partagez votre lien, encaissez via Stripe et livrez le contenu en toute sécurité.
        </p>

        {/* 🔍 BARRE DE RECHERCHE */}
        <form
          action="/search"
          method="GET"
          className="flex flex-col sm:flex-row gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <input
            name="q"
            placeholder="Rechercher une formation..."
            className="flex-1 px-4 py-2 rounded-md bg-background border border-white/10"
          />

          <select
            name="category"
            className="px-4 py-2 rounded-md bg-background border border-white/10"
          >
            <option value="">Toutes les catégories</option>
            <option value="business">Business & entrepreneuriat</option>
            <option value="marketing">Marketing digital</option>
            <option value="tech">Tech & Digital</option>
            <option value="education">Éducation</option>
            <option value="dev_perso">Développement personnel</option>
            <option value="sport">Sport & Santé</option>
            <option value="creatif">Créatif</option>
            <option value="autre">Autre</option>
          </select>

          <button className="button-primary">
            Rechercher
          </button>
        </form>

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
            <p className="text-2xl font-semibold text-white">Stripe Checkout</p>
            <p className="mt-2">
              Paiements sécurisés et webhooks prêts pour l’auto-livraison.
            </p>
          </div>
          <div className="card">
            <p className="text-2xl font-semibold text-white">Supabase</p>
            <p className="mt-2">
              Auth, stockage et base PostgreSQL pour vos formations.
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
                Titre, description, prix, vidéo, PDF.
              </p>
            </div>
            <span className="text-accent font-semibold">+ 15 min</span>
          </div>

          <div className="flex items-center justify-between border border-white/10 rounded-lg p-4">
            <div>
              <p className="font-semibold">Encaissez avec Stripe</p>
              <p className="text-white/60 text-sm">
                Checkout + webhook pour débloquer l’accès.
              </p>
            </div>
            <span className="text-accent font-semibold">+ 5 min</span>
          </div>

          <div className="flex items-center justify-between border border-white/10 rounded-lg p-4">
            <div>
              <p className="font-semibold">Livrez le contenu</p>
              <p className="text-white/60 text-sm">
                Accès automatique pour les acheteurs.
              </p>
            </div>
            <span className="text-accent font-semibold">automatique</span>
          </div>
        </div>

        <p className="text-white/70 text-sm">
          Étapes suivantes : connectez Supabase pour l’authentification,
          ajoutez vos premières formations et branchez Stripe.
        </p>
      </div>
    </div>
  );
}
