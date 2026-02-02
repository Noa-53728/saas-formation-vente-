import SubscribeButtons from "./SubscribeButtons";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function BillingPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let planId = "free";

  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub && ["active", "trialing"].includes(sub.status)) {
      planId = sub.plan_id;
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Abonnement</h1>
      <p>
        Plan actuel : <strong>{planId}</strong>
      </p>
      {planId === "free" && <SubscribeButtons />}
    </div>
  );
}


