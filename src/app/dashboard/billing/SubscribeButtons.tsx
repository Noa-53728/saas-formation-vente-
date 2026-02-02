"use client";

export default function SubscribeButtons() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={() => alert("creator click")}>Creator – 10$ / mois</button>
      <button onClick={() => alert("pro click")}>Pro – 30$ / mois</button>
    </div>
  );
}

