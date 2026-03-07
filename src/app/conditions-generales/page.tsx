import Link from "next/link";

export const metadata = {
  title: "Conditions générales | Formio",
  description: "Conditions générales d'utilisation de la plateforme Formio.",
};

export default function ConditionsGeneralesPage() {
  return (
    <div className="hero-cosmic">
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <Link
            href="/dashboard/support"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au support
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Conditions générales d&apos;utilisation
          </h1>
          <p className="mt-2 text-white/60">
            Dernière mise à jour : février 2025
          </p>
        </div>

        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Objet</h2>
            <p className="mt-2 leading-relaxed">
              Les présentes conditions générales régissent l&apos;utilisation de la plateforme Formio,
              marketplace de formations en ligne. En créant un compte ou en utilisant le service,
              vous acceptez ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Description du service</h2>
            <p className="mt-2 leading-relaxed">
              Formio permet aux créateurs de publier, vendre et promouvoir des formations (vidéo, PDF, contenus)
              et aux acheteurs d&apos;acquérir un accès à ces formations. Les paiements sont traités par Stripe.
              L&apos;abonnement Creator ou Pro donne accès à des fonctionnalités supplémentaires (statistiques, boosts, badge Pro).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Compte et responsabilités</h2>
            <p className="mt-2 leading-relaxed">
              Vous êtes responsable des informations fournies sur votre compte et du contenu que vous publiez.
              Les formations doivent respecter le droit applicable et ne pas porter atteinte aux tiers.
              Formio se réserve le droit de suspendre ou supprimer un compte en cas de manquement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Paiements et remboursements</h2>
            <p className="mt-2 leading-relaxed">
              Les achats de formations sont conclus entre l&apos;acheteur et le créateur. Les revenus des créateurs
              sont versés selon les modalités configurées (compte bancaire Stripe et/ou PayPal). Les remboursements
              sont gérés au cas par cas ; contactez le support pour toute demande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Modifications</h2>
            <p className="mt-2 leading-relaxed">
              Formio peut modifier ces conditions. Les utilisateurs seront informés des changements importants.
              La poursuite de l&apos;utilisation du service après modification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Contact</h2>
            <p className="mt-2 leading-relaxed">
              Pour toute question relative aux conditions générales : formio.forms@gmail.com.
            </p>
          </section>
        </div>

        <div className="pt-6">
          <Link
            href="/dashboard/support"
            className="inline-flex items-center gap-2 text-white/80 transition hover:text-white"
          >
            ← Retour au support
          </Link>
        </div>
      </div>
    </div>
  );
}
