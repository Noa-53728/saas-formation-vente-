"use client";

import { useState } from "react";

export default function ManagePlanButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      if (data.url) window.location.href = data.url;
      else throw new Error("URL manquante");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Impossible d'ouvrir le portail.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-70"
    >
      {loading ? "Ouverture..." : "Gérer mon abonnement"}
      <span>→</span>
    </button>
  );
}
