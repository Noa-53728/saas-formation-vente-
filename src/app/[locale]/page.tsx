import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const check = (
  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
    ✓
  </span>
);

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <div className="hero-cosmic">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-card border border-white/10 px-4 py-2 text-sm text-white/70">
            {t("badge")}
          </p>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
            {t("title")}
          </h1>

          <p className="text-lg text-white/70 leading-relaxed">
            {t("subtitle")}
          </p>

          <ul className="space-y-3 text-white/90">
            <li className="flex items-center gap-3">
              {check}
              <span>{t("feature1")}</span>
            </li>
            <li className="flex items-center gap-3">
              {check}
              <span>{t("feature2")}</span>
            </li>
            <li className="flex items-center gap-3">
              {check}
              <span>{t("feature3")}</span>
            </li>
          </ul>

          <div className="flex flex-wrap gap-4">
            <Link className="button-primary" href="/auth/register">
              {t("createAccount")}
            </Link>
            <Link className="button-secondary" href="/auth/login">
              {t("signIn")}
            </Link>
          </div>

          <p className="text-sm text-white/60">
            {t("alreadyAccount")}{" "}
            <Link href="/auth/login" className="font-medium text-accent hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </div>

        <div className="rounded-2xl bg-card p-6 lg:p-8 border border-white/10">
          <p className="text-sm text-white/50 mb-4">{t("dashboardPreview")}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary p-4 border border-white/10">
              <p className="text-xs text-white/50">{t("salesToday")}</p>
              <p className="text-xl font-bold text-white">25</p>
              <p className="text-xs text-success">↑ +1.9%</p>
            </div>
            <div className="rounded-xl bg-primary p-4 border border-white/10">
              <p className="text-xs text-white/50">{t("revenueToday")}</p>
              <p className="text-xl font-bold text-white">1 250 €</p>
              <p className="text-xs text-success">↑ +1.9%</p>
            </div>
            <div className="rounded-xl bg-primary p-4 border border-white/10">
              <p className="text-xs text-white/50">{t("salesMonth")}</p>
              <p className="text-xl font-bold text-white">347</p>
              <p className="text-xs text-success">↑ +1.9%</p>
            </div>
            <div className="rounded-xl bg-primary p-4 border border-white/10">
              <p className="text-xs text-white/50">{t("totalRevenue")}</p>
              <p className="text-xl font-bold text-white">12 580 €</p>
              <p className="text-xs text-success">↑ +1.9%</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-primary p-4 border border-white/10">
            <p className="text-xs text-white/50 mb-2">{t("salesStats")}</p>
            <div className="flex h-20 items-end gap-1">
              {[65, 45, 80, 55, 70, 60, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-accent"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-white/50">{t("myCourses")}</p>
            <div className="flex gap-2 rounded-lg bg-primary p-2 border border-white/10">
              <div className="h-10 w-14 rounded bg-white/10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">Montage vidéo</p>
                <p className="text-xs text-white/50">1 {t("sale")} : 120 €</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
