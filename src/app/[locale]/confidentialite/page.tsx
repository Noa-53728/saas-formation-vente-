import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Confidentialité | Formio",
  description: "Politique de confidentialité et protection des données personnelles sur Formio.",
};

export default function ConfidentialitePage() {
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
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-white/60">
            Dernière mise à jour : février 2025
          </p>
        </div>

        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Responsable du traitement</h2>
            <p className="mt-2 leading-relaxed">
              Les données collectées sur Formio sont traitées par l&apos;équipe Formio. Vous pouvez nous contacter
              à formio.forms@gmail.com pour toute question relative à vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Données collectées</h2>
            <p className="mt-2 leading-relaxed">
              Nous collectons les données nécessaires au fonctionnement du service : identifiant de compte,
              adresse email, nom ou pseudonyme, photo de profil et bio (optionnels), informations de facturation
              (gérées par Stripe), historique d&apos;achats et de ventes, messages échangés sur la plateforme,
              et préférences de notifications. Les créateurs peuvent en outre renseigner un compte bancaire (Stripe)
              ou une adresse PayPal pour recevoir leurs revenus.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Finalités et bases légales</h2>
            <p className="mt-2 leading-relaxed">
              Les données sont utilisées pour fournir et sécuriser le service, traiter les paiements, gérer
              les abonnements et les ventes, répondre au support et respecter nos obligations légales.
              Le traitement repose sur l&apos;exécution du contrat, votre consentement (notifications, cookies si applicable)
              et le respect de nos obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Hébergement et sous-traitants</h2>
            <p className="mt-2 leading-relaxed">
              Les données sont hébergées et traitées via des prestataires conformes au RGPD (Supabase, Stripe,
              hébergeur de l&apos;application). Les paiements et données bancaires sont gérés par Stripe selon
              sa propre politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Durée de conservation</h2>
            <p className="mt-2 leading-relaxed">
              Les données de compte et d&apos;activité sont conservées tant que le compte est actif, puis selon
              les délais légaux (comptabilité, litiges). Vous pouvez demander la suppression de votre compte
              et de vos données en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Vos droits</h2>
            <p className="mt-2 leading-relaxed">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
              de limitation du traitement et de portabilité de vos données. Vous pouvez exercer ces droits
              en nous écrivant à formio.forms@gmail.com. Vous avez également le droit d&apos;introduire une
              réclamation auprès de la CNIL.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Contact</h2>
            <p className="mt-2 leading-relaxed">
              Pour toute question sur la confidentialité ou pour exercer vos droits : formio.forms@gmail.com.
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
