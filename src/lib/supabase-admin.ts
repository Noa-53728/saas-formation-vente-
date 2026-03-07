import { createClient } from "@supabase/supabase-js";

export const createSupabaseAdminClient = () => {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY est requise pour le client admin (et NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL). Ajoute-la dans .env.local. Récupère la clé « service_role » dans Supabase : Paramètres > API."
    );
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
