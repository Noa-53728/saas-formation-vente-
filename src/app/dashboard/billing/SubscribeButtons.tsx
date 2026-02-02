"use client";

export default function SubscribeButtons() {
  const subscribe = async (planId: "creator" | "pro") => {
    const res = await fetch("/api/stripe/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "checkout failed");
    }

    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={() => subscribe("creator")}>Creator (10$ / mois)</button>
      <button onClick={() => subscribe("pro")}>Pro (30$ / mois)</button>
    </div>
  );
}
