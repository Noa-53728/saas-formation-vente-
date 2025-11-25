import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number) => `${(priceCents / 100).toFixed(2)} €`;

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const createCheckoutAction = async (formData: FormData) => {
    "use server";
    const courseId = formData.get("courseId") as string;
    const supabase = createSupabaseServerClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      redirect("/auth/login");
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ courseId })
    });

    const payload = await response.json();
    if (payload?.url) {
      redirect(payload.url as string);
    }

    throw new Error(payload?.error || "Impossible de créer la session Stripe");
  };

  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // 🔥 Correction ici : author:profiles(full_name)
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, title, description, price_cents, video_url, pdf_url, thumbnail_url, author_id, author:profiles(full_name)"
    )
    .eq("id", params.id)
    .single();

  if (error || !course) {
    notFound();
  }

  const isOwner = session?.user.id === course.author_id;
  let hasAccess = isOwner;

  if (session && !hasAccess) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    hasAccess = Boolean(purchase);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[1.6fr,1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-accent font-semibold">Formation</p>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-white/70 leading-relaxed whitespace-pre-line">{course.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
              {formatPrice(course.price_cents)}
            </span>

            {/* 🔥 Correction ici : course.author.full_name */}
            {course.author?.full_name ? (
              <span>Par {course.author.full_name}</span>
            ) : null}

            <span className="text-white/50">ID : {course.id}</span>
          </div>
        </div>

        <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-5">
          {course.thumbnail_url ? (
            <img
              alt={course.title}
              className="w-full rounded-lg border border-white/10 object-cover"
              src={course.thumbnail_url}
            />
          ) : null}

          {hasAccess ? (
            <div className="space-y-3">
              <p className="text-sm text-white/70">Contenu disponible</p>
              <a
                className="button-primary block text-center"
                href={course.video_url}
                target="_blank"
                rel="noreferrer"
              >
                Voir la vidéo
              </a>
              <a
                className="button-secondary block text-center"
                href={course.pdf_url}
                target="_blank"
                rel="noreferrer"
              >
                Télécharger le PDF
              </a>
              <p className="text-xs text-white/40">
                Accès car vous êtes l&apos;auteur ou acheteur.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/70">
                Accès verrouillé. Connectez-vous puis passez au paiement sécurisé Stripe.
              </p>

              {session ? (
                <form action={createCheckoutAction} className="space-y-2">
                  <input type="hidden" name="courseId" value={course.id} />
                  <button className="button-primary w-full" type="submit">
                    Acheter la formation via Stripe
                  </button>
                  <p className="text-xs text-white/40">
                    Redirection vers Stripe Checkout.
                  </p>
                </form>
              ) : (
                <Link className="button-primary w-full text-center block" href="/auth/login">
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
