import { notFound, redirect as redirectExternal } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const formatPrice = (priceCents: number) =>
  `${(priceCents / 100).toFixed(2)} €`;

function getEmbedUrl(url: string): { embedUrl: string; type: "youtube" | "vimeo" } | null {
  try {
    const u = new URL(url);
    // YouTube: watch?v=ID ou youtu.be/ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return {
        embedUrl: `https://www.youtube.com/embed/${u.searchParams.get("v")}?rel=0`,
        type: "youtube",
      };
    }
    if (u.hostname === "youtu.be" && u.pathname.slice(1)) {
      return {
        embedUrl: `https://www.youtube.com/embed/${u.pathname.slice(1)}?rel=0`,
        type: "youtube",
      };
    }
    // Vimeo: vimeo.com/123456
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        type: "vimeo",
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function PreviewVideoBlock({ url }: { url: string }) {
  const embed = getEmbedUrl(url);
  if (embed) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/30" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embed.embedUrl}
          title="Vidéo de présentation de la formation"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Regarder la vidéo de présentation
    </a>
  );
}

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
      preview_video_url,
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

  /* 🔎 Auteur (profil + badges Vérifié / Pro) */
  const admin = createSupabaseAdminClient();
  const { data: author } = await admin
    .from("profiles")
    .select("full_name, is_verified, bio")
    .eq("id", course.author_id)
    .maybeSingle();

  const { data: authorSub } = await admin
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", course.author_id)
    .maybeSingle();

  const isAuthorPro =
    authorSub &&
    ["active", "trialing"].includes(authorSub.status) &&
    authorSub.plan_id === "pro";

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

    if (!user) redirect({ href: "/auth/login", locale: await getLocale() });

    const { data: course } = await supabase
      .from("courses")
      .select("id, title, price_cents, author_id")
      .eq("id", courseId)
      .maybeSingle();

    if (!course) {
      throw new Error("Formation introuvable");
    }

    const admin = createSupabaseAdminClient();
    const { data: authorProfile } = await admin
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", course.author_id)
      .maybeSingle();

    const destinationAccountId = authorProfile?.stripe_connect_account_id ?? null;

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
      customer_email: user!.email ?? undefined,
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
        user_id: user!.id,
      },
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      ...(destinationAccountId && {
        payment_intent_data: {
          transfer_data: { destination: destinationAccountId },
        },
      }),
    });

    if (checkoutSession.url) {
      redirectExternal(checkoutSession.url);
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

    const locale = await getLocale();
    if (!user) redirect({ href: "/auth/login", locale });
    if (user!.id === course.author_id) redirect({ href: "/dashboard", locale });
    redirect({ href: `/messages/${course.id}/${course.author_id}`, locale });
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

          {/* Vidéo d'explication (visible avant achat) */}
          {course.preview_video_url && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">
                Vidéo de présentation
              </p>
              <PreviewVideoBlock url={course.preview_video_url} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
              {formatPrice(course.price_cents)}
            </span>

            {author?.full_name && (
              <span className="flex flex-wrap items-center gap-2">
                Par {author.full_name}
                {author.is_verified && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300"
                    title="Vendeur vérifié par Formio"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Vérifié
                  </span>
                )}
                {isAuthorPro && (
                  <span
                    className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent"
                    title="Vendeur Pro"
                  >
                    Pro
                  </span>
                )}
              </span>
            )}

            {author?.bio && (
              <p className="w-full text-sm text-white/60 mt-2 whitespace-pre-line">
                {author.bio}
              </p>
            )}

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
