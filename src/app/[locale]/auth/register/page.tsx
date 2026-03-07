"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const fullName = (form.get("fullName") as string)?.trim() ?? "";

    if (!fullName) {
      setError("Le nom d'utilisateur est obligatoire.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        is_seller: false
      });
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto card space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Créer un compte</h1>
        <p className="text-white/70 text-sm mt-2">Publiez ou achetez vos formations en quelques minutes.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="block text-sm text-white/80" htmlFor="fullName">
            Nom d&apos;utilisateur <span className="text-red-400">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            minLength={1}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent focus:outline-none"
            placeholder="Votre nom ou pseudo"
          />
        </div>
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="button-primary w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="text-center text-sm text-white/70">
        Déjà inscrit ? {" "}
        <a href="/auth/login" className="text-accent">
          Se connecter
        </a>
      </p>
    </div>
  );
}
