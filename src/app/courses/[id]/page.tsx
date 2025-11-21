import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const formatPrice = (priceCents: number) => `${(priceCents / 100).toFixed(2)} €`;

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, description, price_cents, video_url, pdf_url, thumbnail_url, author_id, profiles(full_name)")
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
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">{formatPrice(course.price_cents)}</span>
            {course.profiles?.full_name ? <span>Par {course.profiles.full_name}</span> : null}
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
              <a className="button-primary block text-center" href={course.video_url} target="_blank" rel="noreferrer">
                Voir la vidéo
              </a>
              <a className="button-secondary block text-center" href={course.pdf_url} target="_blank" rel="noreferrer">
                Télécharger le PDF
              </a>
              <p className="text-xs text-white/40">Accès car vous êtes l&apos;auteur ou acheteur.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/70">
                Accès verrouillé. Connectez-vous pour acheter cette formation à l&apos;étape Stripe.
              </p>
              {session ? (
                <button className="button-primary w-full" type="button" disabled>
                  Acheter (Stripe arrive à l&apos;étape 4)
                </button>
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
