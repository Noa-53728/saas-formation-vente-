"use client";

type Props = {
  showCreator?: boolean;
  showPro?: boolean;
};

export default function SubscribeButtons({
  showCreator = false,
  showPro = false,
}: Props) {
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
      {showCreator && (
        <button onClick={() => subscribe("creator")}>
          Creator – 10$ / mois
        </button>
      )}

      {showPro && (
        <button onClick={() => subscribe("pro")}>
          Pro – 30$ / mois
        </button>
      )}
    </div>
  );
}


