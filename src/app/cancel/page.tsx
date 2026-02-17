import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="card space-y-4">
        <h1 className="text-2xl font-semibold text-white">
          Paiement annulé
        </h1>
        <p className="text-white/70">
          Vous avez annulé le paiement. Aucun prélèvement n&apos;a été effectué.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link className="button-primary" href="/courses">
            Parcourir les formations
          </Link>
          <Link className="button-secondary" href="/dashboard">
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
