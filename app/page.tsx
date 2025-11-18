export default function Home() {
  return (
    <section className="hero">
      <div className="badge">Étape 1 — Base du projet</div>
      <h1>Vendez et achetez des formations en ligne.</h1>
      <p>
        On démarre la structure Next.js 14 + Supabase. À l’étape suivante, on mettra en place
        l’authentification et le dashboard.
      </p>
      <div className="cta-group">
        <a className="primary" href="/auth/register">
          Créer un compte
        </a>
        <a className="ghost" href="/auth/login">
          Se connecter
        </a>
      </div>
      <ul className="steps">
        <li><strong>Étape 1</strong> — Initialisation du projet, Supabase et variables d’environnement.</li>
        <li><strong>Étape 2</strong> — Authentification et profil.</li>
        <li><strong>Étape 3</strong> — Formations : création et pages publiques.</li>
        <li><strong>Étape 4</strong> — Paiement Stripe + protection du contenu.</li>
        <li><strong>Étape 5</strong> — Messagerie + amélioration du design.</li>
      </ul>
    </section>
  );
}
