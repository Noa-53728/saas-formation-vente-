import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="card space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-success">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-white">
          Paiement réussi
        </h1>
        <p className="text-white/70">
          Merci pour votre achat. Vous avez maintenant accès à la formation.
          L&apos;accès peut prendre quelques secondes à s&apos;activer.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link className="button-primary" href="/dashboard">
            Aller au tableau de bord
          </Link>
          <Link className="button-secondary" href="/courses">
            Voir les formations
          </Link>
        </div>
      </div>
    </div>
  );
}
