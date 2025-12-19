import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number) =>
  `${(priceCents / 100).toFixed(2)} €`;

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();

  /* ✅ SAFE AUTH (NE MODIFIE PAS LES COOKIES) */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  /* 🔎 Récupération de la formation */
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      price_cents,
      video_url,
      pdf_url,
      thumbnail_url,
      author_id,
      author:profiles(full_name)
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !course) notFound();

  /* 🔐 Accès */
  const isOwner = userId === course.author_id;
  let hasAccess = isOwner;

  if (userId && !hasAccess) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", userId)
      .maybeSingle();

    hasAccess = Boolean(purchase);
  }

  /* 💳 STRIPE CHECKOUT */
  const createCheckoutAction = async (formData: FormData) => {
    "use server";

    const courseId = formData.get("courseId") as string;

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const payload = await response.json();

    if (payload?.url) redirect(payload.url);

    throw new Error(
      payload?.error || "Impossible de créer la session Stripe"
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[1.6fr,1fr]">
        {/* INFOS */}
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-accent font-semibold">
            Formation
          </p>

          <h1 className="text-3xl font-bold">{course.title}</h1>

          <p className="text-white/70 whitespace-pre-line">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
              {formatPrice(course.price_cents)}
            </span>

            {Array.isArray(course.author) && course.author.length > 0 && (
              <span>Par {course.author[0].full_name}</span>
            )}

            <span className="text-white/50">ID : {course.id}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-5">
          {course.thumbnail_url && (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full rounded-lg border border-white/10 object-cover"
            />
          )}

          {hasAccess ? (
            <div className="space-y-3">
              <p className="text-sm text-white/70">Contenu disponible</p>

              <a
                href={course.video_url}
                target="_blank"
                rel="noreferrer"
                className="button-primary block text-center"
              >
                Voir la vidéo
              </a>

              <a
                href={course.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="button-secondary block text-center"
              >
                Télécharger le PDF
              </a>

              <p className="text-xs text-white/40">
                Accès autorisé (auteur ou acheteur).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/70">
                Accès verrouillé. Connexion + paiement requis.
              </p>

              {userId ? (
                <form action={createCheckoutAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <button className="button-primary w-full" type="submit">
                    Acheter via Stripe
                  </button>
                </form>
              ) : (
                <Link
                  href="/auth/login"
                  className="button-primary w-full block text-center"
                >
                  Se connecter pour acheter
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

