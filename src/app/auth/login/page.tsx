"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto card space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="text-white/70 text-sm mt-2">Accédez à votre compte Formio.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="block text-sm text-white/80" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent focus:outline-none"
            placeholder="vous@exemple.com"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-white/80" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="button-primary w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="text-center text-sm text-white/70">
        Pas de compte ? {" "}
        <a href="/auth/register" className="text-accent">
          Créer un compte
        </a>
      </p>
    </div>
  );
}
