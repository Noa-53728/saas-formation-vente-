"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type State = "loading" | "logged_out" | "logged_in";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthButtons() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? "logged_in" : "logged_out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "logged_in" : "logged_out");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === "loading" || state === "logged_in") return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <a className="button-secondary" href="/auth/login">
        Se connecter
      </a>
      <a className="button-primary" href="/auth/register">
        Créer un compte
      </a>
    </div>
  );
}
