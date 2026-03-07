"use client";

type Props = {
  showCreator?: boolean;
  showPro?: boolean;
  className?: string;
};

const PLANS: { id: "creator" | "pro"; label: string; price: string }[] = [
  { id: "creator", label: "Creator", price: "10 € / mois" },
  { id: "pro", label: "Pro", price: "30 € / mois" },
];

export default function SubscribeButtons({
  showCreator = false,
  showPro = false,
  className = "",
}: Props) {
  const subscribe = async (planId: "creator" | "pro") => {
    const res = await fetch("/api/stripe/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(text || "Erreur lors du paiement.");
      return;
    }

    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const toShow = PLANS.filter(
    (p) => (p.id === "creator" && showCreator) || (p.id === "pro" && showPro)
  );

  if (toShow.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {toShow.map((plan) => (
        <button
          key={plan.id}
          type="button"
          onClick={() => subscribe(plan.id)}
          className="rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-hover"
        >
          Choisir {plan.label}
        </button>
      ))}
    </div>
  );
}
