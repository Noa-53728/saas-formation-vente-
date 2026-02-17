import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number) =>
  `${(priceCents / 100).toFixed(2)} €`;

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();

  /* ✅ SAFE AUTH */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;

  /* 🔎 COURSE (sans jointure implicite Supabase) */
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
      author_id
    `,
    )
    .eq("id", params.id)
    .single();

  if (!course && !error) {
    // L'ID ne correspond à aucune formation existante → vraie 404
    notFound();
  }

  if (error) {
    // Problème RLS / permissions / autre erreur Supabase → afficher l'erreur
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-semibold">
          Erreur de chargement de la formation
        </h1>
        <p className="text-sm text-white/70">
          Impossible d&apos;afficher cette formation pour le moment.
        </p>
        <pre className="mt-3 text-xs whitespace-pre-wrap bg-black/30 rounded p-3 border border-red-500/40 text-red-200">
          {error.message}
        </pre>
      </div>
    );
  }

  /* 🔎 Auteur (requête séparée, pas besoin de relation déclarée) */
  const { data: author } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", course.author_id)
    .maybeSingle();

  /* 🔐 ACCESS */
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

  /* 💳 STRIPE CHECKOUT (SERVER ACTION) — création session Stripe côté serveur pour garder l’auth */
  const createCheckoutAction = async (formData: FormData) => {
    "use server";

    const courseId = formData.get("courseId") as string;
    if (!courseId) {
      throw new Error("Identifiant de formation manquant");
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: course } = await supabase
      .from("courses")
      .select("id, title, price_cents")
      .eq("id", courseId)
      .maybeSingle();

    if (!course) {
      throw new Error("Formation introuvable");
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("Stripe n'est pas configuré (STRIPE_SECRET_KEY manquant)");
    }

    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: course.title },
            unit_amount: course.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "purchase",
        course_id: course.id,
        user_id: user.id,
      },
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
    });

    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    }

    throw new Error("Impossible de créer la session Stripe");
  };

  /* 💬 CONTACT SELLER (SERVER ACTION) */
  const contactSellerAction = async () => {
    "use server";

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    // éviter de "contacter" soi-même
    if (user.id === course.author_id) redirect("/dashboard");

    redirect(`/messages/${course.id}/${course.author_id}`);
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

            {author?.full_name && <span>Par {author.full_name}</span>}

            <span className="text-white/40">ID : {course.id}</span>
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

              {/* 💬 CONTACTER LE VENDEUR (après achat aussi) */}
              {!isOwner && (
                <form action={contactSellerAction}>
                  <button type="submit" className="button-secondary w-full">
                    Contacter le vendeur
                  </button>
                </form>
              )}

              <p className="text-xs text-white/40">
                Accès autorisé (auteur ou acheteur).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/70">
                Accès verrouillé. Paiement requis.
              </p>

              {userId ? (
                <>
                  <form action={createCheckoutAction}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <button type="submit" className="button-primary w-full">
                      Acheter via Stripe
                    </button>
                  </form>

                  {/* 💬 CONTACTER LE VENDEUR (avant achat) */}
                  {!isOwner && (
                    <form action={contactSellerAction}>
                      <button type="submit" className="button-secondary w-full">
                        Contacter le vendeur
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="button-primary w-full block text-center"
                  >
                    Se connecter pour acheter
                  </Link>

                  <Link
                    href="/auth/login"
                    className="button-secondary w-full block text-center"
                  >
                    Se connecter pour contacter le vendeur
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
