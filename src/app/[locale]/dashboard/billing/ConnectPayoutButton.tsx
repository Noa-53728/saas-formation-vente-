"use client";

import { useState } from "react";

export default function ConnectPayoutButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      if (data.url) window.location.href = data.url;
      else throw new Error("URL manquante");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Impossible de lancer la configuration.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-70"
    >
      {loading ? "Redirection..." : "Configurer mon compte bancaire"}
      <span>→</span>
    </button>
  );
}
