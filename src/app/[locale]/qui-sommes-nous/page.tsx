import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Qui sommes-nous | Formio",
  description:
    "Découvrez Formio : notre mission, notre équipe et pourquoi nous construisons le marketplace de formations professionnelles.",
};

export default function QuiSommesNousPage() {
  return (
    <div className="hero-cosmic">
      <div className="mx-auto max-w-3xl space-y-16">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Qui sommes-nous
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Formio est une plateforme française dédiée à la formation en ligne.
            Nous permettons aux créateurs de publier, vendre et diffuser leurs
            formations (vidéo, PDF, contenus) tout en offrant aux apprenants un
            accès simple, sécurisé et instantané. Notre objectif : rendre la
            vente et l’achat de formations professionnelles aussi fluides que
            possible.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Pourquoi Formio existe
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Nous avons créé Formio parce que les créateurs de formations méritent
            un outil pensé pour eux : un vrai marketplace avec paiement intégré,
            suivi des ventes et accès automatique aux acheteurs, sans bricolage
            entre plusieurs plateformes. Côté apprenants, nous voulons un lieu
            où trouver des formations de qualité, payer en toute confiance et
            accéder à ses achats immédiatement. Formio est là pour faire le lien
            entre ces deux mondes, de façon claire et fiable.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 transition hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
