import Link from "next/link";

const faq = [
  {
    q: "Comment publier une formation ?",
    a: "Allez dans « Mes formations » puis cliquez sur « Ajouter une formation ». Renseignez le titre, la description, le prix, une vidéo et un PDF. Une fois enregistrée, votre formation est visible sur la marketplace.",
  },
  {
    q: "Comment sont traités les paiements ?",
    a: "Les achats passent par Stripe. Vous recevez les revenus selon les délais de versement Stripe. Consultez l’onglet « Facturation » pour votre abonnement et l’historique.",
  },
  {
    q: "À quoi servent les plans Creator et Pro ?",
    a: "Creator (10 €/mois) : statistiques détaillées, formations illimitées et support prioritaire. Pro (30 €/mois) : tout Creator + boosts illimités pour mettre vos formations en avant, badge Pro et meilleure visibilité. Détails dans Facturation.",
  },
  {
    q: "Comment gérer les messages des acheteurs ?",
    a: "Tous les échanges apparaissent dans « Messages ». Les acheteurs peuvent vous contacter depuis la fiche de votre formation. Répondez directement dans la conversation.",
  },
  {
    q: "Qu’est-ce que le boost d’une formation ?",
    a: "Le boost met votre formation en avant pendant 7 jours pour plus de visibilité. Utilisez le bouton « Booster 7 jours » sur la fiche de votre formation. Illimité avec le plan Pro.",
  },
  {
    q: "Puis-je annuler mon abonnement ?",
    a: "Oui. Vous pouvez gérer ou annuler votre abonnement depuis le portail Stripe (lien dans l’email de confirmation) ou en nous contactant. L’accès aux avantages reste actif jusqu’à la fin de la période payée.",
  },
  {
    q: "Où voir mes revenus et mes ventes ?",
    a: "Dans « Ventes » vous voyez le détail des commandes et le total des revenus. Sur le tableau de bord, les cartes récapitulent les ventes du jour, du mois et le total.",
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Support</h1>
        <p className="mt-1 text-white/60">
          Centre d&apos;aide et questions fréquentes
        </p>
      </div>

      <div id="guide" className="rounded-2xl border border-white/10 bg-card p-6 scroll-mt-6">
        <h2 className="text-lg font-semibold text-white">Questions fréquentes</h2>
        <ul className="mt-4 space-y-6">
          {faq.map((item, i) => (
            <li key={i} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <p className="font-medium text-white">{item.q}</p>
              <p className="mt-2 text-sm text-white/70">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="font-semibold text-white">Guide de démarrage</h3>
          <p className="mt-2 text-sm text-white/70">
            Découvrez comment configurer votre compte, publier votre première formation et gérer vos ventes.
          </p>
          <Link
            href="#guide"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-hover"
          >
            Voir le guide
            <span>→</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="font-semibold text-white">Nous contacter</h3>
          <p className="mt-2 text-sm text-white/70">
            Une question ou un problème ? Envoyez-nous un message et nous vous répondrons sous 48 h.
          </p>
          <a
            href="mailto:support@formio.app"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            formio.forms@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
